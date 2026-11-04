"""Pharmacy records that separate clinical decisions from physical and ERP effects."""
from __future__ import annotations

from datetime import datetime
from decimal import Decimal, InvalidOperation
from uuid import UUID, uuid4

from django.db.models import Sum
from django.utils import timezone

from .models import (
    AuditEvent,
    ChargeSource,
    MedicationAdministration,
    MedicationCorrectionIntent,
    PhysicalMedicationIssue,
    Prescription,
    PrescriptionLine,
    Visit,
)
from .security import scoped_atomic


def _positive_quantity(value: Decimal | str | int) -> Decimal:
    try:
        quantity = Decimal(str(value))
    except (InvalidOperation, ValueError) as exc:
        raise ValueError("quantity must be a decimal number") from exc
    if not quantity.is_finite() or quantity <= 0:
        raise ValueError("quantity must be greater than zero")
    if quantity.as_tuple().exponent < -4 or quantity.adjusted() > 9:
        raise ValueError("quantity supports at most 10 integer digits and 4 decimal places")
    return quantity


def create_draft_prescription(*, visit_id: UUID, organization_id: UUID, branch_id: UUID,
                              actor_id: UUID, medication_name: str, quantity: Decimal | str | int,
                              unit: str, instructions: str = "") -> Prescription:
    """Record a draft; no stock reservation or medication conversion is performed."""
    name, normalized_unit = medication_name.strip(), unit.strip()
    if not name or not normalized_unit:
        raise ValueError("medication name and unit are required")
    prescribed = _positive_quantity(quantity)
    with scoped_atomic(organization_id, branch_id):
        visit = Visit.objects.get(pk=visit_id, organization_id=organization_id, branch_id=branch_id)
        prescription = Prescription.objects.create(
            organization_id=organization_id, branch_id=branch_id,
            created_by=actor_id, visit=visit,
        )
        PrescriptionLine.objects.create(
            organization_id=organization_id, branch_id=branch_id,
            created_by=actor_id, prescription=prescription,
            medication_name=name, prescribed_quantity=prescribed,
            unit=normalized_unit, instructions=instructions.strip(),
        )
        AuditEvent.objects.create(
            organization_id=organization_id, branch_id=branch_id, actor_id=actor_id,
            action="pharmacy.prescription.drafted", aggregate_type="prescription",
            aggregate_id=prescription.id, aggregate_version=prescription.version,
            correlation_id=uuid4(), details={"line_count": 1, "stock_reserved": False},
        )
        return prescription


def verify_prescription(*, prescription_id: UUID, organization_id: UUID, branch_id: UUID,
                        actor_id: UUID, expected_version: int) -> Prescription:
    """Mark a prescription verified after API permission checks; this is not Odoo reserve."""
    with scoped_atomic(organization_id, branch_id):
        prescription = Prescription.objects.select_for_update().get(
            pk=prescription_id, organization_id=organization_id, branch_id=branch_id,
        )
        if prescription.version != expected_version:
            raise ValueError("prescription version conflict")
        if prescription.status != Prescription.Status.DRAFT:
            raise ValueError("only a draft prescription can be verified")
        if not prescription.lines.exists():
            raise ValueError("prescription requires at least one medication line")
        prescription.status = Prescription.Status.VERIFIED
        prescription.verified_by = actor_id
        prescription.verified_at = timezone.now()
        prescription.version += 1
        prescription.save(update_fields=["status", "verified_by", "verified_at", "version", "updated_at"])
        AuditEvent.objects.create(
            organization_id=organization_id, branch_id=branch_id, actor_id=actor_id,
            action="pharmacy.prescription.verified", aggregate_type="prescription",
            aggregate_id=prescription.id, aggregate_version=prescription.version,
            correlation_id=uuid4(), details={"odoo_reservation_created": False},
        )
        return prescription


def record_physical_issue(*, line_id: UUID, organization_id: UUID, branch_id: UUID,
                          actor_id: UUID, quantity: Decimal | str | int, unit: str,
                          issued_at: datetime | None = None) -> PhysicalMedicationIssue:
    """Record only the physical quantity actually handed out, as an immutable issue fact."""
    amount = _positive_quantity(quantity)
    timestamp = issued_at or timezone.now()
    if timestamp.tzinfo is None:
        raise ValueError("issue time must include a timezone")
    with scoped_atomic(organization_id, branch_id):
        line = PrescriptionLine.objects.get(
            pk=line_id, organization_id=organization_id, branch_id=branch_id,
        )
        prescription = Prescription.objects.select_for_update().get(
            pk=line.prescription_id, organization_id=organization_id, branch_id=branch_id,
        )
        line = PrescriptionLine.objects.select_for_update().get(
            pk=line.id, organization_id=organization_id, branch_id=branch_id,
        )
        if prescription.status != Prescription.Status.VERIFIED:
            raise ValueError("physical issue requires a verified prescription")
        if unit.strip() != line.unit:
            raise ValueError("issue unit must match the prescribed unit; conversions are not configured")
        already_issued = line.physical_issues.aggregate(total=Sum("quantity"))["total"] or Decimal("0")
        if already_issued + amount > line.prescribed_quantity:
            raise ValueError("physical issue exceeds the unissued prescribed quantity")
        issue = PhysicalMedicationIssue.objects.create(
            organization_id=organization_id, branch_id=branch_id, created_by=actor_id,
            prescription_line=line, quantity=amount, unit=line.unit,
            issued_at=timestamp,
        )
        AuditEvent.objects.create(
            organization_id=organization_id, branch_id=branch_id, actor_id=actor_id,
            action="pharmacy.physical_issue.recorded", aggregate_type="physical_issue",
            aggregate_id=issue.id, aggregate_version=issue.version, correlation_id=issue.id,
            details={"prescription_line_id": str(line.id), "quantity": str(amount),
                     "unit": line.unit, "external_posting_state": "NOT_SUBMITTED"},
        )
        return issue


def record_administration(*, issue_id: UUID, organization_id: UUID, branch_id: UUID,
                          actor_id: UUID, quantity: Decimal | str | int,
                          administered_at: datetime | None = None, outcome: str = "GIVEN",
                          note: str = "") -> MedicationAdministration:
    """Record clinical administration; it intentionally performs no stock operation."""
    amount = _positive_quantity(quantity)
    timestamp = administered_at or timezone.now()
    if timestamp.tzinfo is None:
        raise ValueError("administration time must include a timezone")
    with scoped_atomic(organization_id, branch_id):
        issue = PhysicalMedicationIssue.objects.select_for_update().get(
            pk=issue_id, organization_id=organization_id, branch_id=branch_id,
        )
        already_administered = issue.administrations.aggregate(total=Sum("dose_quantity"))["total"] or Decimal("0")
        if already_administered + amount > issue.quantity:
            raise ValueError("administration exceeds the physically issued quantity")
        administration = MedicationAdministration.objects.create(
            organization_id=organization_id, branch_id=branch_id, created_by=actor_id,
            physical_issue=issue, dose_quantity=amount, unit=issue.unit,
            administered_at=timestamp, performer_id=actor_id,
            outcome=outcome.strip() or "GIVEN", note=note.strip(),
        )
        AuditEvent.objects.create(
            organization_id=organization_id, branch_id=branch_id, actor_id=actor_id,
            action="pharmacy.medication.administered", aggregate_type="physical_issue",
            aggregate_id=issue.id, aggregate_version=administration.version,
            correlation_id=administration.id,
            details={"administration_id": str(administration.id), "quantity": str(amount),
                     "unit": issue.unit, "stock_movement_created": False},
        )
        return administration


def record_correction_intent(*, prescription_id: UUID, organization_id: UUID, branch_id: UUID,
                             actor_id: UUID, kind: str, reason: str,
                             original_issue_id: UUID | None = None,
                             quantity: Decimal | str | int | None = None,
                             unit: str = "") -> MedicationCorrectionIntent:
    """Capture a correction request without changing an issued fact or posting to Odoo."""
    try:
        intent_kind = MedicationCorrectionIntent.Kind(kind)
    except ValueError as exc:
        raise ValueError("unsupported medication correction intent") from exc
    if not reason.strip():
        raise ValueError("a correction reason is required")
    amount = _positive_quantity(quantity) if quantity is not None else None
    with scoped_atomic(organization_id, branch_id):
        prescription = Prescription.objects.get(
            pk=prescription_id, organization_id=organization_id, branch_id=branch_id,
        )
        issue = None
        if original_issue_id:
            issue = PhysicalMedicationIssue.objects.get(
                pk=original_issue_id, organization_id=organization_id, branch_id=branch_id,
            )
            if issue.prescription_line.prescription_id != prescription.id:
                raise ValueError("original issue must belong to the prescription")
        if intent_kind in {MedicationCorrectionIntent.Kind.RETURN, MedicationCorrectionIntent.Kind.WASTE} and issue is None:
            raise ValueError("return and waste intents must reference the original physical issue")
        intent = MedicationCorrectionIntent.objects.create(
            organization_id=organization_id, branch_id=branch_id, created_by=actor_id,
            kind=intent_kind, prescription=prescription, original_issue=issue,
            quantity=amount, unit=unit.strip(), reason=reason.strip(), state="PENDING_POLICY",
        )
        AuditEvent.objects.create(
            organization_id=organization_id, branch_id=branch_id, actor_id=actor_id,
            action="pharmacy.correction.requested", aggregate_type="prescription",
            aggregate_id=prescription.id, aggregate_version=prescription.version,
            correlation_id=intent.id,
            details={"intent_id": str(intent.id), "kind": intent.kind,
                     "original_issue_id": str(issue.id) if issue else None,
                     "effect_applied": False},
        )
        return intent


def create_charge_source(*, organization_id: UUID, branch_id: UUID, actor_id: UUID,
                         source_event_id: UUID, source_version: int, charge_type: str,
                         quantity: Decimal | str | int, unit_price: Decimal | str | int,
                         currency: str) -> ChargeSource:
    """Persist billable-source identity and provenance without selecting a billing trigger."""
    amount = _positive_quantity(quantity)
    try:
        price = Decimal(str(unit_price))
    except (InvalidOperation, ValueError) as exc:
        raise ValueError("unit price must be a decimal number") from exc
    normalized_currency = currency.strip().upper()
    if (not price.is_finite() or price < 0 or price.as_tuple().exponent < -4 or price.adjusted() > 9
            or not charge_type.strip() or len(normalized_currency) != 3 or source_version < 1):
        raise ValueError("charge type, nonnegative price, currency and positive source version are required")
    with scoped_atomic(organization_id, branch_id):
        source, created = ChargeSource.objects.get_or_create(
            organization_id=organization_id, branch_id=branch_id,
            source_event_id=source_event_id, source_version=source_version,
            charge_type=charge_type.strip(),
            defaults={"created_by": actor_id, "quantity": amount, "unit_price": price,
                      "currency": normalized_currency, "billing_state": "POLICY_PENDING"},
        )
        if not created and (source.quantity != amount or source.unit_price != price or source.currency != normalized_currency):
            raise ValueError("charge source identity was reused with different values")
        if created:
            AuditEvent.objects.create(
                organization_id=organization_id, branch_id=branch_id, actor_id=actor_id,
                action="billing.charge_source.created", aggregate_type="charge_source",
                aggregate_id=source.id, aggregate_version=source.version,
                correlation_id=source.id,
                details={"source_event_id": str(source_event_id), "source_version": source_version,
                         "billing_state": source.billing_state, "invoice_created": False},
            )
        return source
