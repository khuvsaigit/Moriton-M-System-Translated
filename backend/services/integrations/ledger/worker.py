"""Leased ledger executor with fencing and ambiguity-safe expiry handling."""
from __future__ import annotations

from dataclasses import dataclass
from datetime import timedelta
from uuid import UUID, uuid4

from django.db.models import F, Q
from django.utils import timezone

from .models import ExternalOperation
from .security import scoped_atomic


class LostLease(RuntimeError):
    pass


@dataclass(frozen=True)
class Claim:
    operation_id: UUID
    lease_token: UUID
    version: int
    lease_until: object


def claim_next(*, organization_id, branch_id, worker_id: str, lease_seconds: int = 60, now=None) -> Claim | None:
    """Claim only the next pending operation; use SKIP LOCKED on PostgreSQL."""
    if not worker_id.strip() or lease_seconds < 1:
        raise ValueError("worker id and positive lease duration are required")
    now = now or timezone.now()
    with scoped_atomic(organization_id, branch_id):
        eligible = (Q(predecessor__isnull=True) |
                    Q(predecessor__state=ExternalOperation.State.CONFIRMED))
        query = (ExternalOperation.objects.select_related("predecessor")
                 .select_for_update(skip_locked=True, of=("self",))
                 .filter(eligible, organization_id=organization_id, branch_id=branch_id,
                         state=ExternalOperation.State.PENDING,
                         attempt_count__lt=F("max_attempts"))
                 .filter(Q(next_attempt_at__isnull=True) | Q(next_attempt_at__lte=now))
                 .order_by("created_at", "stream_id", "sequence"))
        op = query.first()
        if op is None:
            return None
        token = uuid4()
        until = now + timedelta(seconds=lease_seconds)
        updated = ExternalOperation.objects.filter(
            pk=op.pk, organization_id=organization_id, branch_id=branch_id,
            state=ExternalOperation.State.PENDING, version=op.version,
        ).update(state=ExternalOperation.State.IN_PROGRESS, lease_owner=worker_id,
                 lease_token=token, lease_until=until, attempt_count=F("attempt_count") + 1,
                 version=F("version") + 1, updated_at=now)
        if updated != 1:
            return None
        return Claim(op.pk, token, op.version + 1, until)


def complete_claim(*, operation_id: UUID, lease_token: UUID, result_state: str,
                   organization_id, branch_id, remote_model: str = "", remote_id: str = "", evidence=None, now=None) -> None:
    """Persist a result only while its fencing token and lease are current."""
    allowed = {ExternalOperation.State.CONFIRMED, ExternalOperation.State.REJECTED,
               ExternalOperation.State.UNKNOWN}
    if result_state not in allowed:
        raise ValueError("result state must be CONFIRMED, REJECTED, or UNKNOWN")
    now = now or timezone.now()
    with scoped_atomic(organization_id, branch_id):
        op = ExternalOperation.objects.select_for_update().filter(
            pk=operation_id, organization_id=organization_id, branch_id=branch_id,
        ).first()
        if (op is None or op.state != ExternalOperation.State.IN_PROGRESS
                or op.lease_token != lease_token or op.lease_until is None or op.lease_until <= now):
            raise LostLease("result rejected because the operation lease is stale or expired")
        op.state = result_state
        op.remote_model = remote_model
        op.remote_id = remote_id
        op.remote_evidence = evidence or {}
        if result_state == ExternalOperation.State.UNKNOWN:
            op.unknown_since = now
        op.lease_owner = ""
        op.lease_token = None
        op.lease_until = None
        op.last_error_code = "remote_outcome_unknown" if result_state == ExternalOperation.State.UNKNOWN else ""
        op.version += 1
        op.updated_at = now
        op.save(update_fields=["state", "remote_model", "remote_id", "remote_evidence", "unknown_since",
                               "lease_owner", "lease_token", "lease_until", "last_error_code", "version", "updated_at"])


def expire_ambiguous_claims(*, organization_id, branch_id, now=None) -> int:
    """Expired in-flight writes become UNKNOWN; they are never auto-replayed."""
    now = now or timezone.now()
    with scoped_atomic(organization_id, branch_id):
        return ExternalOperation.objects.filter(
            organization_id=organization_id, branch_id=branch_id,
            state=ExternalOperation.State.IN_PROGRESS, lease_until__lte=now,
        ).update(state=ExternalOperation.State.UNKNOWN, unknown_since=now,
                 lease_owner="", lease_token=None, lease_until=None,
                 last_error_code="lease_expired_outcome_unknown", version=F("version") + 1,
                 updated_at=now)
