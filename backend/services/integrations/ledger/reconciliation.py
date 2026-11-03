"""Explicit reconciliation transitions; ambiguous external writes are never replayed here."""
from __future__ import annotations

from uuid import UUID

from django.utils import timezone

from .models import ExternalOperation, IntegrationAuditEvent
from .security import scoped_atomic


class ReconciliationConflict(ValueError):
    pass


def begin_reconciliation(*, operation_id: UUID, organization_id: UUID, branch_id: UUID,
                         actor_id: UUID, expected_version: int) -> ExternalOperation:
    with scoped_atomic(organization_id, branch_id):
        operation = ExternalOperation.objects.select_for_update().get(
            pk=operation_id, organization_id=organization_id, branch_id=branch_id,
        )
        if operation.version != expected_version or operation.state != ExternalOperation.State.UNKNOWN:
            raise ReconciliationConflict("only the current UNKNOWN operation can enter reconciliation")
        operation.state = ExternalOperation.State.RECONCILING
        operation.version += 1
        operation.save(update_fields=["state", "version", "updated_at"])
        IntegrationAuditEvent.objects.create(
            organization_id=organization_id, branch_id=branch_id, actor_id=actor_id,
            action="integration.reconciliation_started", aggregate_type="external_operation",
            aggregate_id=operation.id, aggregate_version=operation.version,
            correlation_id=operation.operation_id,
            details={"from_state": ExternalOperation.State.UNKNOWN, "to_state": operation.state},
        )
        return operation


def finish_reconciliation(*, operation_id: UUID, organization_id: UUID, branch_id: UUID,
                          actor_id: UUID, expected_version: int, result_state: str,
                          reason: str, remote_model: str = "", remote_id: str = "",
                          evidence: dict | None = None) -> ExternalOperation:
    allowed = {ExternalOperation.State.CONFIRMED, ExternalOperation.State.REJECTED,
               ExternalOperation.State.MANUAL_REVIEW}
    if result_state not in allowed:
        raise ValueError("reconciliation result must be CONFIRMED, REJECTED, or MANUAL_REVIEW")
    evidence = evidence or {}
    if not reason.strip():
        raise ValueError("a reconciliation reason is required")
    if result_state == ExternalOperation.State.CONFIRMED and not (remote_model.strip() and remote_id.strip() and evidence):
        raise ValueError("confirmation requires a remote reference and supporting evidence")
    with scoped_atomic(organization_id, branch_id):
        operation = ExternalOperation.objects.select_for_update().get(
            pk=operation_id, organization_id=organization_id, branch_id=branch_id,
        )
        if operation.version != expected_version or operation.state != ExternalOperation.State.RECONCILING:
            raise ReconciliationConflict("only the current RECONCILING operation can be resolved")
        old_state = operation.state
        operation.state = result_state
        operation.remote_model = remote_model if result_state == ExternalOperation.State.CONFIRMED else ""
        operation.remote_id = remote_id if result_state == ExternalOperation.State.CONFIRMED else ""
        operation.remote_evidence = evidence
        operation.last_error_code = "" if result_state == ExternalOperation.State.CONFIRMED else reason[:120]
        operation.version += 1
        operation.updated_at = timezone.now()
        operation.save(update_fields=["state", "remote_model", "remote_id", "remote_evidence",
                                      "last_error_code", "version", "updated_at"])
        IntegrationAuditEvent.objects.create(
            organization_id=organization_id, branch_id=branch_id, actor_id=actor_id,
            action="integration.reconciliation_resolved", aggregate_type="external_operation",
            aggregate_id=operation.id, aggregate_version=operation.version,
            correlation_id=operation.operation_id,
            details={"from_state": old_state, "to_state": result_state,
                     "reason": reason[:500], "remote_model": operation.remote_model,
                     "remote_id": operation.remote_id, "evidence": evidence},
        )
        return operation
