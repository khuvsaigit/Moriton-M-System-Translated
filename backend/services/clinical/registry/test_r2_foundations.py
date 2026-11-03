from datetime import datetime, timedelta, timezone
from uuid import uuid4

from django.test import TestCase

from .models import (
    Appointment,
    Horse,
    Practitioner,
    PractitionerQualification,
    PractitionerShift,
    ScheduleResource,
    ScreeningAnswer,
    ScreeningFormVersion,
    ScreeningReview,
    Visit,
)
from .scheduling import cancel_appointment, eligible_practitioners, request_appointment
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
