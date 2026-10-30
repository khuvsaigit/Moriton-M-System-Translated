"""Versioned, privacy-minimizing Clinical domain event envelopes."""
from __future__ import annotations

from uuid import UUID, uuid4

from django.utils import timezone

from .models import OutboxEvent


def append_clinical_event(*, organization_id: UUID, branch_id: UUID, actor_id: UUID,
                          message_type: str, aggregate_id: UUID, aggregate_version: int,
                          correlation_id: UUID, payload: dict) -> OutboxEvent:
    event_id = uuid4()
    envelope = {
        "schema_version": 1,
        "message_id": str(event_id),
        "message_type": message_type,
        "producer": "clinical",
        "destination": "integrations",
        "organization_id": str(organization_id),
        "branch_id": str(branch_id),
        "aggregate_id": str(aggregate_id),
        "aggregate_version": aggregate_version,
        "operation_id": str(uuid4()),
        "correlation_id": str(correlation_id),
        "causation_id": None,
        "occurred_at": timezone.now().isoformat(),
        "actor_reference": str(actor_id),
        "policy_version": "clinical-local-v1",
        "payload": payload,
    }
    return OutboxEvent.objects.create(
        id=event_id, organization_id=organization_id, branch_id=branch_id,
        message_type=message_type, schema_version=1, aggregate_id=aggregate_id,
        aggregate_version=aggregate_version, correlation_id=correlation_id,
        payload=envelope,
    )
