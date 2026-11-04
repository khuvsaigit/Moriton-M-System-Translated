from uuid import uuid4

from django.test import TestCase

from .models import (
    AuditEvent, ChargeSource, Horse, MedicationAdministration,
    PhysicalMedicationIssue, Prescription, Visit,
)
from .pharmacy import (
    create_charge_source, create_draft_prescription, record_administration,
    record_correction_intent, record_physical_issue, verify_prescription,
)


class R3PharmacyFoundationTests(TestCase):
    def setUp(self):
        self.organization_id = uuid4()
        self.branch_id = uuid4()
        self.actor_id = uuid4()
        horse = Horse.objects.create(
            organization_id=self.organization_id, branch_id=self.branch_id,
            created_by=self.actor_id, name="Synthetic Pharmacy Horse",
        )
        self.visit = Visit.objects.create(
            organization_id=self.organization_id, branch_id=self.branch_id,
            created_by=self.actor_id, horse=horse, slip_number="R3-TEST-1",
        )

    def create_verified(self, quantity="10.0000", unit="mL"):
        prescription = create_draft_prescription(
            visit_id=self.visit.id, organization_id=self.organization_id,
            branch_id=self.branch_id, actor_id=self.actor_id,
            medication_name="Synthetic medication", quantity=quantity, unit=unit,
        )
        line = prescription.lines.get()
        verified = verify_prescription(
            prescription_id=prescription.id, organization_id=self.organization_id,
            branch_id=self.branch_id, actor_id=self.actor_id, expected_version=1,
        )
        return verified, line

    def test_partial_physical_issues_are_immutable_and_cannot_exceed_prescription(self):
        prescription, line = self.create_verified()
        first = record_physical_issue(
            line_id=line.id, organization_id=self.organization_id, branch_id=self.branch_id,
            actor_id=self.actor_id, quantity="4.0000", unit="mL",
        )
        second = record_physical_issue(
            line_id=line.id, organization_id=self.organization_id, branch_id=self.branch_id,
            actor_id=self.actor_id, quantity="6.0000", unit="mL",
        )
        self.assertNotEqual(first.id, second.id)
        with self.assertRaisesRegex(ValueError, "exceeds"):
            record_physical_issue(
                line_id=line.id, organization_id=self.organization_id, branch_id=self.branch_id,
                actor_id=self.actor_id, quantity="0.0001", unit="mL",
            )
        self.assertEqual(Prescription.objects.get(pk=prescription.id).status, Prescription.Status.VERIFIED)
        self.assertEqual(PhysicalMedicationIssue.objects.count(), 2)

    def test_issue_requires_verification_and_exact_configured_unit(self):
        draft = create_draft_prescription(
            visit_id=self.visit.id, organization_id=self.organization_id,
            branch_id=self.branch_id, actor_id=self.actor_id,
            medication_name="Synthetic medication", quantity="2", unit="tablet",
        )
        line = draft.lines.get()
        with self.assertRaisesRegex(ValueError, "verified"):
            record_physical_issue(
                line_id=line.id, organization_id=self.organization_id, branch_id=self.branch_id,
                actor_id=self.actor_id, quantity="1", unit="tablet",
            )
        verify_prescription(
            prescription_id=draft.id, organization_id=self.organization_id,
            branch_id=self.branch_id, actor_id=self.actor_id, expected_version=1,
        )
        with self.assertRaisesRegex(ValueError, "conversions"):
            record_physical_issue(
                line_id=line.id, organization_id=self.organization_id, branch_id=self.branch_id,
                actor_id=self.actor_id, quantity="1", unit="mL",
            )

    def test_administration_is_separate_from_stock_issue_and_bounded_by_issued_quantity(self):
        _, line = self.create_verified(quantity="5")
        issue = record_physical_issue(
            line_id=line.id, organization_id=self.organization_id, branch_id=self.branch_id,
            actor_id=self.actor_id, quantity="3", unit="mL",
        )
        admin = record_administration(
            issue_id=issue.id, organization_id=self.organization_id, branch_id=self.branch_id,
            actor_id=self.actor_id, quantity="2", outcome="GIVEN",
        )
        self.assertEqual(admin.physical_issue_id, issue.id)
        self.assertEqual(admin.performer_id, self.actor_id)
        self.assertEqual(PhysicalMedicationIssue.objects.count(), 1)
        self.assertEqual(MedicationAdministration.objects.count(), 1)
        audit = AuditEvent.objects.get(action="pharmacy.medication.administered")
        self.assertFalse(audit.details["stock_movement_created"])
        with self.assertRaisesRegex(ValueError, "exceeds"):
            record_administration(
                issue_id=issue.id, organization_id=self.organization_id,
                branch_id=self.branch_id, actor_id=self.actor_id, quantity="2",
            )

    def test_correction_is_an_intent_and_keeps_original_issue(self):
        prescription, line = self.create_verified(quantity="5")
        issue = record_physical_issue(
            line_id=line.id, organization_id=self.organization_id, branch_id=self.branch_id,
            actor_id=self.actor_id, quantity="5", unit="mL",
        )
        intent = record_correction_intent(
            prescription_id=prescription.id, organization_id=self.organization_id,
            branch_id=self.branch_id, actor_id=self.actor_id, kind="RETURN",
            original_issue_id=issue.id, quantity="1", unit="mL", reason="Synthetic test",
        )
        self.assertEqual(intent.state, "PENDING_POLICY")
        self.assertEqual(intent.original_issue_id, issue.id)
        self.assertEqual(PhysicalMedicationIssue.objects.count(), 1)

    def test_charge_source_is_idempotent_and_rejects_changed_payload(self):
        source_id = uuid4()
        args = dict(
            organization_id=self.organization_id, branch_id=self.branch_id,
            actor_id=self.actor_id, source_event_id=source_id, source_version=1,
            charge_type="medication_dispensed", quantity="2", unit_price="10.00", currency="MNT",
        )
        first = create_charge_source(**args)
        duplicate = create_charge_source(**args)
        self.assertEqual(first.id, duplicate.id)
        self.assertEqual(duplicate.billing_state, "POLICY_PENDING")
        self.assertFalse(duplicate.invoice_line_ref)
        with self.assertRaisesRegex(ValueError, "different values"):
            create_charge_source(**{**args, "quantity": "3"})
        self.assertEqual(ChargeSource.objects.count(), 1)
