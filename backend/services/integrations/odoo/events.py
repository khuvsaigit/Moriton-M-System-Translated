"""Mock-only Odoo request/result messages; no code here performs Odoo I/O."""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any
from uuid import UUID, uuid4

from django.utils import timezone as django_timezone

from ledger.consumer import consume_once
from ledger.models import ExternalOperation
from ledger.worker import Claim, complete_claim


@dataclass(frozen=True)
class MockOutcome:
    state: str
    remote_model: str = ""
    remote_id: str = ""
    evidence: dict[str, Any] | None = None


class MockOdooPort:
    """Explicit test adapter returning configured outcomes without a network client."""

    def __init__(self, outcome: MockOutcome):
        if outcome.state not in {ExternalOperation.State.CONFIRMED,
                                 ExternalOperation.State.REJECTED,
                                 ExternalOperation.State.UNKNOWN}:
            raise ValueError("mock result must be CONFIRMED, REJECTED, or UNKNOWN")
        self.outcome = outcome

    def execute(self, request: dict) -> dict:
        if request.get("message_type") != "odoo.operation.requested.v1":
            raise ValueError("unsupported mock Odoo request")
        operation_id = UUID(str(request["operation_id"]))
        payload = request["payload"]
        return {
            "schema_version": 1,
            "message_id": str(uuid4()),
            "message_type": "odoo.operation.result.v1",
            "producer": "odoo-mock",
            "destination": "integrations",
            "organization_id": request["organization_id"],
            "branch_id": request["branch_id"],
            "aggregate_id": request["aggregate_id"],
            "aggregate_version": request["aggregate_version"],
            "operation_id": str(operation_id),
            "correlation_id": request["correlation_id"],
            "causation_id": request["message_id"],
            "occurred_at": django_timezone.now().isoformat(),
            "actor_reference": "odoo-mock-adapter",
            "policy_version": "mock-v1",
            "payload": {
                "operation_id": str(operation_id),
                "ledger_operation_id": payload["ledger_operation_id"],
                "lease_token": payload["lease_token"],
                "result_state": self.outcome.state,
                "remote_model": self.outcome.remote_model,
                "remote_id": self.outcome.remote_id,
                "evidence": self.outcome.evidence or {},
            },
        }


def build_operation_request(*, operation: ExternalOperation, claim: Claim,
                            organization_id: UUID, branch_id: UUID) -> dict:
    """Create an in-memory mock request envelope for tests/local demonstration."""
    if operation.id != claim.operation_id or operation.lease_token != claim.lease_token:
        raise ValueError("operation must be held by the supplied current lease")
    return {
        "schema_version": 1,
        "message_id": str(uuid4()),
        "message_type": "odoo.operation.requested.v1",
        "producer": "integrations",
        "destination": "odoo-mock",
        "organization_id": str(organization_id),
        "branch_id": str(branch_id),
        "aggregate_id": str(operation.stream.aggregate_id),
        "aggregate_version": operation.sequence,
            "operation_id": str(operation.operation_id),
        "correlation_id": str(uuid4()),
        "causation_id": None,
        "occurred_at": datetime.now(timezone.utc).isoformat(),
        "actor_reference": "integration-worker",
        "policy_version": "mock-v1",
        "payload": {
            "lease_token": str(claim.lease_token),
            "ledger_operation_id": str(operation.id),
            "action": operation.action,
            "business_key": operation.business_key,
            "payload_hash": operation.payload_hash,
            "expected_revision": operation.expected_revision,
        },
    }


def apply_mock_result(envelope: dict) -> bool:
    """Consume one mock result and project its state using the worker fencing token."""
    if envelope.get("message_type") != "odoo.operation.result.v1":
        raise ValueError("unsupported mock Odoo result")
    payload = envelope.get("payload")
    if not isinstance(payload, dict):
        raise ValueError("mock result payload must be an object")
    organization_id = UUID(str(envelope["organization_id"]))
    branch_id = UUID(str(envelope["branch_id"]))
    operation_id = UUID(str(payload["ledger_operation_id"]))
    lease_token = UUID(str(payload["lease_token"]))

    def apply(_message):
        complete_claim(
            operation_id=operation_id, lease_token=lease_token,
            organization_id=organization_id, branch_id=branch_id,
            result_state=str(payload["result_state"]),
            remote_model=str(payload.get("remote_model", "")),
            remote_id=str(payload.get("remote_id", "")),
            evidence=payload.get("evidence") or {},
        )

    return consume_once(consumer="mock-odoo-result", envelope=envelope, handler=apply)
