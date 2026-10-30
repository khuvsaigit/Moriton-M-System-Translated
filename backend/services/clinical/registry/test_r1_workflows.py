from datetime import datetime, timezone
from uuid import uuid4

from django.test import TestCase
from rest_framework.test import APIClient

from .models import (
    AuditEvent,
    ClinicalNoteRevision,
    Contact,
    ReceptionTask,
    ReceptionTaskHistory,
    ServiceMembership,
    Visit,
    VisitAssignment,
)
from .consumer import consume_event
from .workflows import (
    DomainConflict,
    DuplicateIdentity,
    create_horse,
    ingest_call24_request,
    set_horse_party_role,
    transition_reception_task,
)


class RegistryWorkflowTests(TestCase):
    def setUp(self):
        self.organization_id = uuid4()
        self.branch_id = uuid4()
        self.actor_id = uuid4()

    def create_horse(self, **overrides):
        values = {"organization_id": self.organization_id, "branch_id": self.branch_id,
                  "actor_id": self.actor_id, "name": "Silver Star", "tamga": "S-19"}
        values.update(overrides)
        return create_horse(**values)

    def test_duplicate_candidates_require_human_review_and_phone_is_not_identity(self):
        horse = self.create_horse(identifiers=[{"type": "microchip", "value": "chip-1"}])
        with self.assertRaises(DuplicateIdentity) as caught:
            self.create_horse(identifiers=[{"type": "microchip", "value": "chip-1"}])
        self.assertEqual([item.id for item in caught.exception.candidates], [horse.id])

        contact_a = Contact.objects.create(organization_id=self.organization_id, branch_id=self.branch_id,
                                           created_by=self.actor_id, display_name="Owner A", normalized_phone="00123")
        contact_b = Contact.objects.create(organization_id=self.organization_id, branch_id=self.branch_id,
                                           created_by=self.actor_id, display_name="Owner B", normalized_phone="00123")
        self.assertNotEqual(contact_a.id, contact_b.id)

    def test_party_role_requires_same_scope_and_valid_time_window(self):
        horse = self.create_horse()
        contact = Contact.objects.create(organization_id=self.organization_id, branch_id=self.branch_id,
                                         created_by=self.actor_id, display_name="Owner")
        valid_from = datetime(2026, 10, 1, tzinfo=timezone.utc)
        role = set_horse_party_role(organization_id=self.organization_id, branch_id=self.branch_id,
                                    actor_id=self.actor_id, horse=horse, contact=contact,
                                    role="owner", valid_from=valid_from)
        self.assertIsNone(role.valid_to)
        foreign = Contact.objects.create(organization_id=self.organization_id, branch_id=uuid4(),
                                         created_by=self.actor_id, display_name="Other branch")
        with self.assertRaises(ValueError):
            set_horse_party_role(organization_id=self.organization_id, branch_id=self.branch_id,
                                 actor_id=self.actor_id, horse=horse, contact=foreign,
                                 role="owner", valid_from=valid_from)

    def test_call24_projection_is_idempotent_and_keeps_time_zone_unconfirmed(self):
        message_id = uuid4()
        envelope = {
            "schema_version": 1, "message_id": str(message_id),
            "message_type": "call24.request.received.v1", "producer": "integrations",
            "destination": "clinical", "organization_id": str(self.organization_id),
            "branch_id": str(self.branch_id), "aggregate_id": str(uuid4()),
            "aggregate_version": 1, "operation_id": str(uuid4()),
            "correlation_id": str(uuid4()), "causation_id": None,
            "occurred_at": "2026-10-30T10:00:00+00:00", "actor_reference": "call24-csv-import-adapter",
            "policy_version": "call24-csv-mapping-v1",
            "payload": {"source_request_id": "TASK-1", "source_call_ids": ["CALL-1"],
                        "status": "open", "received_at": None, "source_time_local": "2026-10-30T10:00:00",
                        "category_labels": ["Үзлэг"], "customer_name": "Synthetic owner",
                        "phone": "00123", "summary": "Synthetic request", "complaint": None,
                        "source_revision": "a" * 64, "matching_status": "unconfirmed"},
        }
        task, created = ingest_call24_request(envelope)
        self.assertTrue(created)
        self.assertEqual(task.status, ReceptionTask.Status.NEW)
        self.assertEqual(task.requested_at, None)
        self.assertEqual(task.source_time_local, "2026-10-30T10:00:00")
        self.assertEqual(task.identity_status, "unconfirmed")
        repeated, created_again = ingest_call24_request(envelope)
        self.assertFalse(created_again)
        self.assertEqual(repeated.id, task.id)
        envelope["payload"]["summary"] = "Changed body using same message ID"
        with self.assertRaises(ValueError):
            ingest_call24_request(envelope)

    def test_reception_actions_use_optimistic_versions_and_keep_history(self):
        horse = self.create_horse()
        task = ReceptionTask.objects.create(
            organization_id=self.organization_id, branch_id=self.branch_id,
            created_by=self.actor_id, source="manual", customer_name="Synthetic",
        )
        assigned_to = uuid4()
        task = transition_reception_task(task_id=task.id, organization_id=self.organization_id,
                                         branch_id=self.branch_id, actor_id=self.actor_id,
                                         action="assign", expected_version=1, assigned_to=assigned_to)
        self.assertEqual(task.status, ReceptionTask.Status.ASSIGNED)
        with self.assertRaises(DomainConflict):
            transition_reception_task(task_id=task.id, organization_id=self.organization_id,
                                      branch_id=self.branch_id, actor_id=self.actor_id,
                                      action="link", expected_version=1, horse_id=horse.id)
        task = transition_reception_task(task_id=task.id, organization_id=self.organization_id,
                                         branch_id=self.branch_id, actor_id=self.actor_id,
                                         action="link", expected_version=2, horse_id=horse.id)
        self.assertEqual(task.linked_horse_id, horse.id)
        self.assertEqual(ReceptionTaskHistory.objects.filter(task=task).count(), 2)
        self.assertEqual(AuditEvent.objects.filter(aggregate_id=task.id).count(), 2)


class R1VerticalSliceApiTests(TestCase):
    def setUp(self):
        self.organization_id = uuid4()
        self.branch_id = uuid4()
        self.actor_id = uuid4()
        self.permissions = [
            "registry.read", "registry.create", "reception.read", "reception.create",
            "reception.assign", "reception.link", "reception.resolve", "visit.read",
            "visit.create", "visit.arrive", "visit.assign", "clinical_note.draft.write",
        ]
        ServiceMembership.objects.create(
            organization_id=self.organization_id, branch_id=self.branch_id,
            actor_id=self.actor_id, role="operator", permissions=self.permissions,
            active=True, policy_version=1,
        )
        self.client = APIClient()
        session = self.client.session
        from datetime import timedelta
        from django.utils import timezone
        session["moriton_identity"] = {
            "actor_id": str(self.actor_id), "organization_id": str(self.organization_id),
            "branch_id": str(self.branch_id), "role": "operator", "policy_version": 1,
            "expires_at": (timezone.now() + timedelta(minutes=10)).isoformat(),
        }
        session.save()

    def test_manual_reception_queue_api(self):
        response = self.client.post("/api/v1/reception/tasks", {
            "customer_name": "Synthetic manual intake", "phone": "00123", "summary": "Manual request",
        }, format="json")
        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(response.data["status"], ReceptionTask.Status.NEW)
        self.assertEqual(self.client.get("/api/v1/reception/tasks").status_code, 200)

    def test_synthetic_reception_to_visit_assignment_and_draft_note_flow(self):
        horse_response = self.client.post("/api/v1/horses", {
            "name": "Synthetic Horse", "tamga": "SYN-001",
            "identifiers": [{"type": "local_test", "value": "synthetic-id-1"}],
        }, format="json")
        self.assertEqual(horse_response.status_code, 201, horse_response.data)
        horse_id = horse_response.data["id"]

        duplicate = self.client.post("/api/v1/horses", {"name": "Synthetic Horse", "tamga": "SYN-001"}, format="json")
        self.assertEqual(duplicate.status_code, 409)
        self.assertEqual(duplicate.data["error"]["code"], "duplicate_candidate")

        event = {
            "schema_version": 1, "message_id": str(uuid4()),
            "message_type": "call24.request.received.v1", "producer": "integrations",
            "destination": "clinical", "organization_id": str(self.organization_id),
            "branch_id": str(self.branch_id), "aggregate_id": str(uuid4()),
            "aggregate_version": 1, "operation_id": str(uuid4()),
            "correlation_id": str(uuid4()), "causation_id": None,
            "occurred_at": "2026-10-30T10:00:00+00:00", "actor_reference": "call24-csv-import-adapter",
            "policy_version": "call24-csv-mapping-v1",
            "payload": {"source_request_id": "SYNTHETIC-TASK-1", "source_call_ids": ["SYNTHETIC-CALL-1"],
                        "status": "open", "received_at": None, "source_time_local": "2026-10-30T10:00:00",
                        "category_labels": ["Synthetic consultation"], "customer_name": "Synthetic owner",
                        "phone": "00123", "summary": "Synthetic test intake", "complaint": None,
                        "source_revision": "b" * 64, "matching_status": "unconfirmed"},
        }
        task_id, created = consume_event(event)
        self.assertTrue(created)
        task = ReceptionTask.objects.get(pk=task_id)
        self.assertEqual(task.phone, "00123")
        self.assertEqual(task.identity_status, "unconfirmed")

        assigned = self.client.post(f"/api/v1/reception/tasks/{task_id}/actions", {
            "action": "assign", "assigned_to": str(uuid4()), "expected_version": 1,
        }, format="json")
        self.assertEqual(assigned.status_code, 200, assigned.data)
        self.assertEqual(assigned.data["status"], ReceptionTask.Status.ASSIGNED)

        linked = self.client.post(f"/api/v1/reception/tasks/{task_id}/actions", {
            "action": "link", "horse_id": horse_id, "expected_version": 2,
        }, format="json")
        self.assertEqual(linked.status_code, 200, linked.data)
        self.assertEqual(linked.data["identity_status"], "staff_linked")

        visit_response = self.client.post("/api/v1/visits", {
            "horse_id": horse_id, "reception_task_id": task_id,
        }, format="json")
        self.assertEqual(visit_response.status_code, 201, visit_response.data)
        visit_id = visit_response.data["id"]
        self.assertNotEqual(visit_id, horse_id)
        self.assertEqual(visit_response.data["status"], Visit.Status.REGISTERED)

        arrival = self.client.post(f"/api/v1/visits/{visit_id}/arrival", {"expected_version": 1}, format="json")
        self.assertEqual(arrival.status_code, 200, arrival.data)
        self.assertEqual(arrival.data["status"], Visit.Status.ARRIVED)

        assignment = self.client.post(f"/api/v1/visits/{visit_id}/assignments", {
            "practitioner_id": str(uuid4()), "reason": "Synthetic assignment",
        }, format="json")
        self.assertEqual(assignment.status_code, 201, assignment.data)
        self.assertEqual(VisitAssignment.objects.filter(visit_id=visit_id).count(), 1)

        note_response = self.client.post(f"/api/v1/visits/{visit_id}/draft-notes", {
            "body": "Synthetic draft note", "note_type": "general",
        }, format="json")
        self.assertEqual(note_response.status_code, 201, note_response.data)
        note_id = note_response.data["id"]
        revised = self.client.post(f"/api/v1/clinical-notes/{note_id}/revisions", {
            "expected_version": 1, "body": "Revised synthetic draft",
        }, format="json")
        self.assertEqual(revised.status_code, 200, revised.data)
        self.assertEqual(revised.data["status"], "DRAFT")
        self.assertEqual(ClinicalNoteRevision.objects.filter(note_id=note_id).count(), 2)
        self.assertGreaterEqual(AuditEvent.objects.count(), 7)
