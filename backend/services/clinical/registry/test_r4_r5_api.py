from datetime import timedelta
from uuid import uuid4

from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework.test import APIClient

from .models import Appointment, AuditEvent, ClinicalNoteRevision, Horse, ScreeningAnswer, ScreeningReview, ServiceMembership, Visit
from .screening import create_screening_form, create_screening_form_version, publish_screening_form_version


@override_settings(DEBUG=True, MORITON_LOCAL_AUTH_ENABLED=True)
class R4R5ApiTests(TestCase):
    def setUp(self):
        self.organization_id = uuid4()
        self.branch_id = uuid4()
        self.actor_id = uuid4()
        self.horse = Horse.objects.create(
            organization_id=self.organization_id, branch_id=self.branch_id,
            created_by=self.actor_id, name="R4/R5 Synthetic Horse",
        )
        self.visit = Visit.objects.create(
            organization_id=self.organization_id, branch_id=self.branch_id,
            created_by=self.actor_id, horse=self.horse, slip_number="R4-R5-SYN-1",
        )
        self.membership = ServiceMembership.objects.create(
            organization_id=self.organization_id, branch_id=self.branch_id,
            actor_id=self.actor_id, role="clinician",
            permissions=["registry.create", "visit.read", "visit.create", "visit.arrive",
                         "appointment.request", "appointment.confirm", "appointment.arrive",
                         "demo.resource.create", "screening.read", "screening.submit", "screening.review.read",
                         "clinical_note.draft.write", "audit.read"],
            active=True, policy_version=1,
        )
        self.client = self.client_for(self.actor_id)
        schema = {"questions": [
            {"id": "symptoms", "type": "textarea", "required": True},
            {"id": "temperature", "type": "number"},
            {"id": "urgent", "type": "yes_no", "required": True},
            {"id": "category", "type": "select", "options": [
                {"value": "respiratory", "label": "Respiratory"}, "other",
            ]},
            {"id": "observed_on", "type": "date"},
        ]}
        self.form, self.form_v1 = create_screening_form(
            organization_id=self.organization_id, branch_id=self.branch_id,
            actor_id=self.actor_id, name="Synthetic screening", schema=schema,
        )
        publish_screening_form_version(
            version_id=self.form_v1.id, organization_id=self.organization_id,
            branch_id=self.branch_id, actor_id=self.actor_id,
        )

    def client_for(self, actor_id):
        client = APIClient()
        session = client.session
        session["moriton_identity"] = {
            "actor_id": str(actor_id), "organization_id": str(self.organization_id),
            "branch_id": str(self.branch_id), "role": "clinician", "policy_version": 1,
            "expires_at": (timezone.now() + timedelta(minutes=10)).isoformat(),
        }
        session.save()
        return client

    def test_published_screening_capture_review_and_audit_flow(self):
        listed = self.client.get("/api/v1/screening/forms")
        self.assertEqual(listed.status_code, 200, listed.data)
        self.assertEqual([row["id"] for row in listed.data["items"]], [str(self.form_v1.id)])

        answers = {
            "symptoms": "Cough for two days", "temperature": "38.1", "urgent": "yes",
            "category": "respiratory", "observed_on": "2026-11-23",
        }
        submitted = self.client.post("/api/v1/screening/answers", {
            "form_version_id": str(self.form_v1.id), "visit_id": str(self.visit.id), "answers": answers,
        }, format="json")
        self.assertEqual(submitted.status_code, 201, submitted.data)
        self.assertEqual(submitted.data["revision"], 1)
        self.assertEqual(submitted.data["review"]["decision"], ScreeningReview.Decision.PENDING)
        self.assertFalse(submitted.data["clearance_granted"])

        queue = self.client.get("/api/v1/screening/reviews")
        self.assertEqual(queue.status_code, 200, queue.data)
        self.assertEqual(len(queue.data["items"]), 1)
        self.assertEqual(queue.data["items"][0]["answers"], answers)
        self.assertEqual(queue.data["items"][0]["slip_number"], self.visit.slip_number)
        self.assertTrue(AuditEvent.objects.filter(
            action="screening.answers_submitted", aggregate_id=submitted.data["id"],
        ).exists())

        # A repeated capture creates a new immutable revision, not an edit to the submitted record.
        again = self.client.post("/api/v1/screening/answers", {
            "form_version_id": str(self.form_v1.id), "visit_id": str(self.visit.id), "answers": answers,
        }, format="json")
        self.assertEqual(again.status_code, 201, again.data)
        self.assertEqual(again.data["revision"], 2)
        self.assertEqual(ScreeningAnswer.objects.filter(visit=self.visit, form_version=self.form_v1).count(), 2)
        self.assertEqual(ScreeningReview.objects.filter(answer__visit=self.visit).count(), 2)

    def test_unauthenticated_review_queue_stays_json_for_browser_accept_header(self):
        response = APIClient().get(
            "/api/v1/screening/reviews", HTTP_ACCEPT="text/html,application/xhtml+xml",
        )
        self.assertEqual(response.status_code, 406, response.content)
        self.assertEqual(response["Content-Type"], "application/json")
        self.assertEqual(response.data["error"]["code"], "not_acceptable")

    def test_submission_rejects_missing_unknown_and_malformed_answers(self):
        cases = [
            ({"urgent": "yes"}, "answer required"),
            ({"symptoms": "ok", "urgent": "yes", "surprise": "x"}, "not in this published version"),
            ({"symptoms": "ok", "urgent": "yes", "temperature": "hot"}, "must be a number"),
            ({"symptoms": "ok", "urgent": "yes", "category": "not-listed"}, "not an available option"),
            ({"symptoms": "ok", "urgent": "yes", "observed_on": "23/11/2026"}, "ISO date"),
        ]
        for answers, expected in cases:
            with self.subTest(answers=answers):
                response = self.client.post("/api/v1/screening/answers", {
                    "form_version_id": str(self.form_v1.id), "visit_id": str(self.visit.id), "answers": answers,
                }, format="json")
                self.assertEqual(response.status_code, 400, response.data)
                self.assertIn(expected, str(response.data))
        self.assertEqual(ScreeningAnswer.objects.count(), 0)
        self.assertEqual(ScreeningReview.objects.count(), 0)

    def test_unpublished_versions_foreign_branch_visits_and_missing_permission_are_denied(self):
        v2 = create_screening_form_version(
            form_id=self.form.id, organization_id=self.organization_id, branch_id=self.branch_id,
            actor_id=self.actor_id, schema={"questions": [{"id": "new_question", "required": True}]},
        )
        unpublished = self.client.post("/api/v1/screening/answers", {
            "form_version_id": str(v2.id), "visit_id": str(self.visit.id),
            "answers": {"new_question": "answer"},
        }, format="json")
        self.assertEqual(unpublished.status_code, 404, unpublished.data)

        other_branch = uuid4()
        other_horse = Horse.objects.create(
            organization_id=self.organization_id, branch_id=other_branch,
            created_by=self.actor_id, name="Other branch synthetic horse",
        )
        other_visit = Visit.objects.create(
            organization_id=self.organization_id, branch_id=other_branch,
            created_by=self.actor_id, horse=other_horse, slip_number="OTHER-BRANCH",
        )
        foreign = self.client.post("/api/v1/screening/answers", {
            "form_version_id": str(self.form_v1.id), "visit_id": str(other_visit.id),
            "answers": {"symptoms": "ok", "urgent": "no"},
        }, format="json")
        self.assertEqual(foreign.status_code, 404, foreign.data)

        denied_actor = uuid4()
        ServiceMembership.objects.create(
            organization_id=self.organization_id, branch_id=self.branch_id,
            actor_id=denied_actor, role="clinician", permissions=["screening.read", "visit.read"],
            active=True, policy_version=1,
        )
        denied_client = self.client_for(denied_actor)
        denied = denied_client.post("/api/v1/screening/answers", {
            "form_version_id": str(self.form_v1.id), "visit_id": str(self.visit.id),
            "answers": {"symptoms": "ok", "urgent": "no"},
        }, format="json")
        self.assertEqual(denied.status_code, 403, denied.data)
        self.assertEqual(ScreeningAnswer.objects.count(), 0)

    def test_r5_draft_note_create_revise_and_visit_projection(self):
        created = self.client.post(f"/api/v1/visits/{self.visit.id}/draft-notes", {
            "note_type": "general", "body": "Initial examination findings",
        }, format="json")
        self.assertEqual(created.status_code, 201, created.data)
        self.assertEqual(created.data["status"], "DRAFT")

        revised = self.client.post(f"/api/v1/clinical-notes/{created.data['id']}/revisions", {
            "expected_version": 1, "body": "Corrected draft findings",
        }, format="json")
        self.assertEqual(revised.status_code, 200, revised.data)
        self.assertEqual(revised.data["version"], 2)
        self.assertEqual(revised.data["status"], "DRAFT")

        visits = self.client.get("/api/v1/visits")
        self.assertEqual(visits.status_code, 200, visits.data)
        visit_row = next(row for row in visits.data["items"] if row["id"] == str(self.visit.id))
        self.assertEqual(visit_row["draft_note"]["body"], "Corrected draft findings")
        self.assertEqual(visit_row["draft_note"]["version"], 2)
        self.assertEqual(AuditEvent.objects.filter(aggregate_id=created.data["id"]).count(), 2)

        stale = self.client.post(f"/api/v1/clinical-notes/{created.data['id']}/revisions", {
            "expected_version": 1, "body": "Stale edit",
        }, format="json")
        self.assertEqual(stale.status_code, 409, stale.data)

        malformed = self.client.post(f"/api/v1/clinical-notes/{created.data['id']}/revisions", {
            "expected_version": 2, "body": {"unexpected": "object"},
        }, format="json")
        self.assertEqual(malformed.status_code, 400, malformed.data)
        oversized = self.client.post(f"/api/v1/clinical-notes/{created.data['id']}/revisions", {
            "expected_version": 2, "body": "x" * 20001,
        }, format="json")
        self.assertEqual(oversized.status_code, 400, oversized.data)

    def test_full_r1_to_r5_synthetic_api_journey(self):
        # R1 session scope is provided by this test's server-side membership/session.
        # R2 creates the horse and visit; R3 keeps appointment arrival separate from visit arrival.
        horse = self.client.post("/api/v1/horses", {
            "name": "Full journey synthetic horse", "tamga": "R1-R5-SYN-001",
            "identifiers": [{"type": "test-id", "value": "R1-R5-SYN-001"}],
        }, format="json")
        self.assertEqual(horse.status_code, 201, horse.data)
        visit = self.client.post("/api/v1/visits", {"horse_id": horse.data["id"]}, format="json")
        self.assertEqual(visit.status_code, 201, visit.data)

        resource = self.client.post("/api/v1/dev/scheduling-resources", {
            "name": "Synthetic examination room", "resource_type": "room",
        }, format="json")
        self.assertEqual(resource.status_code, 201, resource.data)
        starts = timezone.now() + timedelta(days=1)
        appointment = self.client.post("/api/v1/appointments", {
            "horse_id": horse.data["id"], "resource_id": resource.data["id"], "starts_at": starts.isoformat(),
            "ends_at": (starts + timedelta(hours=1)).isoformat(),
        }, format="json")
        self.assertEqual(appointment.status_code, 201, appointment.data)
        self.assertEqual(appointment.data["status"], Appointment.Status.REQUESTED)
        confirmed = self.client.post(f"/api/v1/appointments/{appointment.data['id']}/actions", {
            "action": "confirm", "expected_version": 1,
        }, format="json")
        self.assertEqual(confirmed.status_code, 200, confirmed.data)
        arrived_appointment = self.client.post(f"/api/v1/appointments/{appointment.data['id']}/actions", {
            "action": "arrive", "expected_version": 2,
        }, format="json")
        self.assertEqual(arrived_appointment.status_code, 200, arrived_appointment.data)
        self.assertIsNone(arrived_appointment.data["visit_id"])
        arrived_visit = self.client.post(f"/api/v1/visits/{visit.data['id']}/arrival", {
            "expected_version": 1,
        }, format="json")
        self.assertEqual(arrived_visit.status_code, 200, arrived_visit.data)

        screening = self.client.post("/api/v1/screening/answers", {
            "form_version_id": str(self.form_v1.id), "visit_id": visit.data["id"],
            "answers": {"symptoms": "Synthetic observation", "urgent": "no"},
        }, format="json")
        self.assertEqual(screening.status_code, 201, screening.data)
        self.assertEqual(screening.data["review"]["decision"], ScreeningReview.Decision.PENDING)
        self.assertFalse(screening.data["clearance_granted"])

        draft = self.client.post(f"/api/v1/visits/{visit.data['id']}/draft-notes", {
            "note_type": "general", "body": "Synthetic examination note",
        }, format="json")
        self.assertEqual(draft.status_code, 201, draft.data)
        revised = self.client.post(f"/api/v1/clinical-notes/{draft.data['id']}/revisions", {
            "expected_version": 1, "body": "Synthetic revised examination note",
        }, format="json")
        self.assertEqual(revised.status_code, 200, revised.data)
        self.assertEqual(ClinicalNoteRevision.objects.filter(note_id=draft.data["id"]).count(), 2)

        review_queue = self.client.get("/api/v1/screening/reviews")
        self.assertEqual(review_queue.status_code, 200, review_queue.data)
        self.assertTrue(any(row["visit_id"] == visit.data["id"] for row in review_queue.data["items"]))
