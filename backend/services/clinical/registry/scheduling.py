"""Rule-neutral roster and appointment foundations for the R2 scheduling work."""
from __future__ import annotations

from datetime import datetime
from uuid import UUID

from django.db.models import Q

from .models import (
    Appointment,
    AuditEvent,
    Horse,
    Practitioner,
    PractitionerQualification,
    PractitionerShift,
    ScheduleResource,
)
from .security import scoped_atomic


def _check_window(starts_at: datetime, ends_at: datetime) -> None:
    if starts_at.tzinfo is None or ends_at.tzinfo is None:
        raise ValueError("appointment and roster times must include a timezone")
    if ends_at <= starts_at:
        raise ValueError("end time must be after start time")


def eligible_practitioners(*, organization_id: UUID, branch_id: UUID,
                            starts_at: datetime, ends_at: datetime,
                            required_qualifications: set[str] | None = None) -> list[Practitioner]:
    """Return active practitioners with a covering shift and required current qualifications.

    Qualification codes are data supplied by the organization. This function does not
    infer clinical eligibility or define which qualifications a particular service needs.
    """
    _check_window(starts_at, ends_at)
    required = {code.strip() for code in (required_qualifications or set()) if code.strip()}
    practitioner_ids = PractitionerShift.objects.filter(
        organization_id=organization_id, branch_id=branch_id,
        status="SCHEDULED", starts_at__lte=starts_at, ends_at__gte=ends_at,
    ).values_list("practitioner_id", flat=True)
    candidates = Practitioner.objects.filter(
        id__in=practitioner_ids, organization_id=organization_id,
        branch_id=branch_id, active=True,
    ).order_by("display_name", "id")
    eligible: list[Practitioner] = []
    for practitioner in candidates:
        codes = set(PractitionerQualification.objects.filter(
            organization_id=organization_id, branch_id=branch_id,
            practitioner=practitioner, valid_from__lte=starts_at,
        ).filter(Q(valid_until__isnull=True) | Q(valid_until__gte=ends_at))
                  .values_list("code", flat=True))
        if required.issubset(codes):
            eligible.append(practitioner)
    return eligible


def request_appointment(*, organization_id: UUID, branch_id: UUID, actor_id: UUID,
                        horse_id: UUID, starts_at: datetime, ends_at: datetime,
                        practitioner_id: UUID | None = None,
                        resource_id: UUID | None = None) -> Appointment:
    """Create a requested slot while serializing conflicts on the selected resources.

    Confirmation and clinical booking policy are deliberately separate. A requested
    appointment blocks double booking but does not assert that screening or clearance passed.
    """
    _check_window(starts_at, ends_at)
    if practitioner_id is None and resource_id is None:
        raise ValueError("an appointment must reserve a practitioner or a resource")
    with scoped_atomic(organization_id, branch_id):
        horse = Horse.objects.get(pk=horse_id, organization_id=organization_id, branch_id=branch_id)
        resource = None
        practitioner = None
        if resource_id:
            resource = ScheduleResource.objects.select_for_update().get(
                pk=resource_id, organization_id=organization_id, branch_id=branch_id, active=True,
            )
        if practitioner_id:
            practitioner = Practitioner.objects.select_for_update().get(
                pk=practitioner_id, organization_id=organization_id, branch_id=branch_id, active=True,
            )
        conflicts = Appointment.objects.filter(
            organization_id=organization_id, branch_id=branch_id,
            status__in=[Appointment.Status.REQUESTED, Appointment.Status.CONFIRMED],
            starts_at__lt=ends_at, ends_at__gt=starts_at,
        )
        conflict_scope = Q(pk__in=[])
        if practitioner:
            conflict_scope |= Q(practitioner=practitioner)
        if resource:
            conflict_scope |= Q(resource=resource)
        if conflicts.filter(conflict_scope).exists():
            raise ValueError("appointment conflicts with an existing reservation")
        appointment = Appointment.objects.create(
            organization_id=organization_id, branch_id=branch_id, created_by=actor_id,
            horse=horse, practitioner=practitioner, resource=resource,
            starts_at=starts_at, ends_at=ends_at, status=Appointment.Status.REQUESTED,
        )
        AuditEvent.objects.create(
            organization_id=organization_id, branch_id=branch_id, actor_id=actor_id,
            action="appointment.requested", aggregate_type="appointment",
            aggregate_id=appointment.id, aggregate_version=appointment.version,
            correlation_id=appointment.id,
            details={"horse_id": str(horse.id), "starts_at": starts_at.isoformat(),
                     "ends_at": ends_at.isoformat()},
        )
        return appointment


def cancel_appointment(*, appointment_id: UUID, organization_id: UUID, branch_id: UUID,
                       actor_id: UUID, expected_version: int) -> Appointment:
    with scoped_atomic(organization_id, branch_id):
        appointment = Appointment.objects.select_for_update().get(
            pk=appointment_id, organization_id=organization_id, branch_id=branch_id,
        )
        if appointment.version != expected_version:
            raise ValueError("appointment version conflict")
        if appointment.status not in {Appointment.Status.REQUESTED, Appointment.Status.CONFIRMED}:
            raise ValueError("only requested or confirmed appointments can be cancelled")
        old_status = appointment.status
        appointment.status = Appointment.Status.CANCELLED
        appointment.version += 1
        appointment.save(update_fields=["status", "version", "updated_at"])
        AuditEvent.objects.create(
            organization_id=organization_id, branch_id=branch_id, actor_id=actor_id,
            action="appointment.cancelled", aggregate_type="appointment",
            aggregate_id=appointment.id, aggregate_version=appointment.version,
            correlation_id=appointment.id,
            details={"previous_status": old_status, "expected_version": expected_version},
        )
        return appointment
