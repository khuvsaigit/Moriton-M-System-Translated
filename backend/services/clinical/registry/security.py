"""Local authorization rules and transaction-scoped PostgreSQL tenant context."""
from __future__ import annotations

from contextlib import contextmanager
from dataclasses import dataclass
from datetime import datetime, timezone
from uuid import UUID

from django.db import connection, transaction


@dataclass(frozen=True)
class AuthorizationContext:
    actor_id: UUID
    organization_id: UUID
    branch_id: UUID
    permissions: frozenset[str]
    policy_version: int
    active: bool = True
    expires_at: datetime | None = None


def authorize(context: AuthorizationContext | None, *, action: str,
               organization_id: UUID, branch_id: UUID,
               expected_policy_version: int, now: datetime | None = None) -> bool:
    """Fail-closed scope, permission, expiry and policy-version check."""
    if context is None or not context.active:
        return False
    now = now or datetime.now(timezone.utc)
    if context.expires_at is not None and context.expires_at <= now:
        return False
    return (
        context.organization_id == organization_id
        and context.branch_id == branch_id
        and action in context.permissions
        and context.policy_version == expected_policy_version
    )


def queued_command_decision(*, submitted_policy_version: int,
                            current_context: AuthorizationContext | None,
                            action: str, organization_id: UUID, branch_id: UUID,
                            physical_fact_recorded: bool = False) -> str:
    """Commands are reauthorized at execution; recorded physical facts survive revocation."""
    allowed = authorize(
        current_context, action=action, organization_id=organization_id,
        branch_id=branch_id,
        expected_policy_version=submitted_policy_version,
    )
    if allowed:
        return "AUTHORIZED"
    return "RECORD_FACT_AND_RECONCILE" if physical_fact_recorded else "AUTH_REVALIDATION_PENDING"


@contextmanager
def scoped_atomic(organization_id: UUID, branch_id: UUID):
    """Set transaction-local RLS values; missing scope is never accepted."""
    if not organization_id or not branch_id:
        raise ValueError("organization and branch scope are required")
    with transaction.atomic():
        if connection.vendor == "postgresql":
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT set_config('moriton.organization_id', %s, true), "
                    "set_config('moriton.branch_id', %s, true)",
                    [str(organization_id), str(branch_id)],
                )
        yield
