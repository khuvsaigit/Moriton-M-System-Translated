"""Transactional per-aggregate operation sequence allocation for the Integrations DB."""
from .models import OperationStream, ExternalOperation
from .security import scoped_atomic

def accept_operation(*, organization_id, branch_id, aggregate_kind, aggregate_id,
                     operation_id, business_key, action, payload_hash, expected_revision=1):
    """Persist immutable sequence and predecessor before publishing to a queue.

    Caller must write inbox receipt/audit/outbox in this same DB transaction.
    This function only allocates local order; it does not prove remote idempotency.
    """
    with scoped_atomic(organization_id, branch_id):
        stream, _ = OperationStream.objects.get_or_create(
            organization_id=organization_id, branch_id=branch_id,
            aggregate_kind=aggregate_kind, aggregate_id=aggregate_id,
        )
        stream = OperationStream.objects.select_for_update().get(pk=stream.pk)
        prior = ExternalOperation.objects.filter(stream=stream).order_by("-sequence").first()
        op = ExternalOperation.objects.create(
            stream=stream, organization_id=organization_id, branch_id=branch_id,
            sequence=stream.next_sequence,
            predecessor=prior, operation_id=operation_id,
            business_key=business_key, action=action,
            payload_hash=payload_hash, expected_revision=expected_revision,
        )
        stream.next_sequence += 1
        stream.save(update_fields=["next_sequence"])
        return op

def eligible_for_execution(op: ExternalOperation) -> bool:
    """UNKNOWN blocks successors; only confirmed predecessor unblocks by default."""
    if op.state != ExternalOperation.State.PENDING:
        return False
    if op.predecessor_id is None:
        return True
    predecessor_state = op.predecessor.state
    if predecessor_state in {ExternalOperation.State.UNKNOWN, ExternalOperation.State.RECONCILING,
                             ExternalOperation.State.MANUAL_REVIEW, ExternalOperation.State.IN_PROGRESS,
                             ExternalOperation.State.AUTH_REVALIDATION_PENDING}:
        return False
    # Action-specific terminal-rejection rules must be added from approved business policy.
    return predecessor_state == ExternalOperation.State.CONFIRMED
