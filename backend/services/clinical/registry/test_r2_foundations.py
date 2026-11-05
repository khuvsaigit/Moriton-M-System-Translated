from datetime import datetime, timedelta, timezone
from uuid import uuid4

from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from .models import (
    Appointment,
    AuditEvent,
    Horse,
    Practitioner,
    PractitionerQualification,
    PractitionerShift,
    ScheduleResource,
    ScreeningAnswer,
    ScreeningFormVersion,
    ScreeningReview,
    ServiceMembership,
    Visit,
)
from .scheduling import (
    cancel_appointment, confirm_appointment, eligible_practitioners,
    mark_appointment_arrived, request_appointment,
)
from .screening import (
    create_screening_form,
    create_screening_form_version,
    publish_screening_form_version,
    submit_screening_answers,
)


class R2FoundationsTests(TestCase):
    def setUp(self):
        self.organization_id = uuid4()
        self.branch_id = uuid4()
        self.actor_id = uuid4()
        self.starts_at = datetime(2026, 11, 4, 9, tzinfo=timezone.utc)
        self.ends_at = self.starts_at + timedelta(hours=1)
        self.horse = Horse.objects.create(
            organization_id=self.organization_id, branch_id=self.branch_id,
            created_by=self.actor_id, name="Synthetic R2 Horse",
        )

    def test_practitioner_eligibility_uses_active_qualifications_and_covering_shift(self):
        practitioner = Practitioner.objects.create(
            organization_id=self.organization_id, branch_id=self.branch_id,
            created_by=self.actor_id, display_name="Synthetic Practitioner",
        )
        PractitionerShift.objects.create(
            organization_id=self.organization_id, branch_id=self.branch_id,
            created_by=self.actor_id, practitioner=practitioner,
            starts_at=self.starts_at - timedelta(minutes=30),
            ends_at=self.ends_at + timedelta(minutes=30),
        )
        PractitionerQualification.objects.create(
            organization_id=self.organization_id, branch_id=self.branch_id,
            created_by=self.actor_id, practitioner=practitioner, code="approved-by-organization",
            valid_from=self.starts_at - timedelta(days=1), valid_until=self.ends_at + timedelta(days=1),
        )
        self.assertEqual(eligible_practitioners(
            organization_id=self.organization_id, branch_id=self.branch_id,
            starts_at=self.starts_at, ends_at=self.ends_at,
            required_qualifications={"approved-by-organization"},
        ), [practitioner])
        self.assertEqual(eligible_practitioners(
            organization_id=self.organization_id, branch_id=self.branch_id,
            starts_at=self.starts_at, ends_at=self.ends_at,
            required_qualifications={"unconfigured-qualification"},
        ), [])

    def test_appointment_reservation_prevents_overlap_and_cancel_releases_slot(self):
        practitioner = Practitioner.objects.create(
            organization_id=self.organization_id, branch_id=self.branch_id,
            created_by=self.actor_id, display_name="Synthetic Practitioner",
        )
        resource = ScheduleResource.objects.create(
            organization_id=self.organization_id, branch_id=self.branch_id,
            created_by=self.actor_id, name="Synthetic room", resource_type="room",
        )
        first = request_appointment(
            organization_id=self.organization_id, branch_id=self.branch_id,
            actor_id=self.actor_id, horse_id=self.horse.id,
            starts_at=self.starts_at, ends_at=self.ends_at,
            practitioner_id=practitioner.id, resource_id=resource.id,
        )
        self.assertEqual(first.status, Appointment.Status.REQUESTED)
        with self.assertRaisesRegex(ValueError, "conflicts"):
            request_appointment(
                organization_id=self.organization_id, branch_id=self.branch_id,
                actor_id=uuid4(), horse_id=self.horse.id,
                starts_at=self.starts_at + timedelta(minutes=15),
                ends_at=self.ends_at + timedelta(minutes=15),
                resource_id=resource.id,
            )
        cancel_appointment(
            appointment_id=first.id, organization_id=self.organization_id,
            branch_id=self.branch_id, actor_id=self.actor_id, expected_version=1,
        )
        replacement = request_appointment(
            organization_id=self.organization_id, branch_id=self.branch_id,
            actor_id=self.actor_id, horse_id=self.horse.id,
            starts_at=self.starts_at, ends_at=self.ends_at,
            resource_id=resource.id,
        )
        self.assertEqual(replacement.status, Appointment.Status.REQUESTED)

    def test_booking_confirmation_and_physical_arrival_are_separate_audited_actions(self):
        resource = ScheduleResource.objects.create(
            organization_id=self.organization_id, branch_id=self.branch_id,
            created_by=self.actor_id, name="Confirm room", resource_type="room",
        )
        appointment = request_appointment(
            organization_id=self.organization_id, branch_id=self.branch_id,
            actor_id=self.actor_id, horse_id=self.horse.id,
            starts_at=self.starts_at, ends_at=self.ends_at, resource_id=resource.id,
        )
        with self.assertRaisesRegex(ValueError, "confirmed appointment"):
            mark_appointment_arrived(
                appointment_id=appointment.id, organization_id=self.organization_id,
                branch_id=self.branch_id, actor_id=self.actor_id, expected_version=1,
            )
        confirmed = confirm_appointment(
            appointment_id=appointment.id, organization_id=self.organization_id,
            branch_id=self.branch_id, actor_id=self.actor_id, expected_version=1,
        )
        self.assertEqual(confirmed.status, Appointment.Status.CONFIRMED)
        self.assertIsNotNone(confirmed.confirmed_at)
        self.assertEqual(confirmed.confirmed_by, self.actor_id)
        arrived = mark_appointment_arrived(
            appointment_id=appointment.id, organization_id=self.organization_id,
            branch_id=self.branch_id, actor_id=self.actor_id, expected_version=2,
        )
        self.assertEqual(arrived.status, Appointment.Status.ARRIVED)
        self.assertIsNotNone(arrived.arrived_at)
        self.assertEqual(arrived.arrival_recorded_by, self.actor_id)
        self.assertEqual(arrived.visit_id, None)
        self.assertEqual(arrived.version, 3)
        self.assertEqual(AuditEvent.objects.filter(aggregate_id=appointment.id).count(), 3)
        with self.assertRaisesRegex(ValueError, "version conflict"):
            confirm_appointment(
                appointment_id=appointment.id, organization_id=self.organization_id,
                branch_id=self.branch_id, actor_id=self.actor_id, expected_version=2,
            )

    def test_screening_versions_are_pinned_and_submission_does_not_clear(self):
        visit = Visit.objects.create(
            organization_id=self.organization_id, branch_id=self.branch_id,
            created_by=self.actor_id, horse=self.horse, slip_number="R2-SYN-1",
        )
        form, version1 = create_screening_form(
            organization_id=self.organization_id, branch_id=self.branch_id,
            actor_id=self.actor_id, name="Synthetic form", schema={"questions": []},
        )
        publish_screening_form_version(
            version_id=version1.id, organization_id=self.organization_id,
            branch_id=self.branch_id, actor_id=self.actor_id,
        )
        with self.assertRaisesRegex(ValueError, "immutable"):
            publish_screening_form_version(
                version_id=version1.id, organization_id=self.organization_id,
                branch_id=self.branch_id, actor_id=self.actor_id,
            )
        version2 = create_screening_form_version(
            form_id=form.id, organization_id=self.organization_id,
            branch_id=self.branch_id, actor_id=self.actor_id,
            schema={"questions": [{"id": "q1"}]},
        )
        self.assertEqual(version2.version, 2)
        answer, review = submit_screening_answers(
            version_id=version1.id, visit_id=visit.id,
            organization_id=self.organization_id, branch_id=self.branch_id,
            actor_id=self.actor_id, answers={"q1": "synthetic"},
        )
        self.assertEqual(answer.status, ScreeningAnswer.Status.SUBMITTED)
        self.assertEqual(answer.form_version_id, version1.id)
        self.assertEqual(review.decision, ScreeningReview.Decision.PENDING)
        self.assertFalse(review.reviewer_id)
        saved_v1 = ScreeningFormVersion.objects.get(pk=version1.id)
        self.assertIsNotNone(saved_v1.published_at)
        self.assertEqual(saved_v1.schema, {"questions": []})

    @override_settings(DEBUG=True, MORITON_LOCAL_AUTH_ENABLED=True)
    def test_appointment_http_actions_keep_booking_and_arrival_distinct(self):
        permissions = ["appointment.request", "appointment.confirm", "appointment.arrive", "demo.resource.create"]
        ServiceMembership.objects.create(
            organization_id=self.organization_id, branch_id=self.branch_id,
            actor_id=self.actor_id, role="scheduler", permissions=permissions,
            active=True, policy_version=1,
        )
        client = APIClient()
        session = client.session
        from datetime import timedelta
        from django.utils import timezone as django_timezone
        session["moriton_identity"] = {
            "actor_id": str(self.actor_id), "organization_id": str(self.organization_id),
            "branch_id": str(self.branch_id), "role": "scheduler", "policy_version": 1,
            "expires_at": (django_timezone.now() + timedelta(minutes=10)).isoformat(),
        }
        session.save()
        resource_response = client.post("/api/v1/dev/scheduling-resources", {
            "name": "Synthetic API demo room", "resource_type": "room",
        }, format="json")
        self.assertEqual(resource_response.status_code, 201, resource_response.data)
        response = client.post("/api/v1/appointments", {
            "horse_id": str(self.horse.id), "resource_id": resource_response.data["id"],
            "starts_at": self.starts_at.isoformat(), "ends_at": self.ends_at.isoformat(),
        }, format="json")
        self.assertEqual(response.status_code, 201, response.data)
        appointment_id = response.data["id"]
        self.assertEqual(response.data["status"], Appointment.Status.REQUESTED)
        self.assertFalse(response.data["visit_created"])
        confirmed = client.post(f"/api/v1/appointments/{appointment_id}/actions", {
            "action": "confirm", "expected_version": 1,
        }, format="json")
        self.assertEqual(confirmed.status_code, 200, confirmed.data)
        self.assertEqual(confirmed.data["status"], Appointment.Status.CONFIRMED)
        arrived = client.post(f"/api/v1/appointments/{appointment_id}/actions", {
            "action": "arrive", "expected_version": 2,
        }, format="json")
        self.assertEqual(arrived.status_code, 200, arrived.data)
        self.assertEqual(arrived.data["status"], Appointment.Status.ARRIVED)
        self.assertIsNone(arrived.data["visit_id"])
        self.assertFalse(arrived.data["clinical_clearance_granted"])
