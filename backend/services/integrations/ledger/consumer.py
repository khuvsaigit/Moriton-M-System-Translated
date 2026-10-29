"""Local, database-transactional equivalent of an at-least-once queue consumer."""
from __future__ import annotations

import hashlib
import json
from uuid import UUID

from django.db import IntegrityError, transaction

from .models import IntegrationInboxReceipt
from .security import scoped_atomic


class InvalidEnvelope(ValueError):
    pass


class MessageIdentityConflict(ValueError):
    pass


def validate_envelope(envelope: dict) -> None:
    required = {
        "schema_version", "message_id", "message_type", "producer", "destination",
        "organization_id", "branch_id", "aggregate_id", "aggregate_version",
        "operation_id", "correlation_id", "causation_id", "occurred_at",
        "actor_reference", "policy_version", "payload",
    }
    if not isinstance(envelope, dict) or required - envelope.keys():
        raise InvalidEnvelope("required event envelope fields are missing")
    if envelope["schema_version"] != 1 or not isinstance(envelope["payload"], dict):
        raise InvalidEnvelope("unsupported schema version or non-object payload")
    if not isinstance(envelope["aggregate_version"], int) or envelope["aggregate_version"] < 1:
        raise InvalidEnvelope("aggregate_version must be a positive integer")
    for field in ("message_id", "organization_id", "branch_id", "aggregate_id", "operation_id", "correlation_id"):
        try:
            UUID(str(envelope[field]))
        except (ValueError, TypeError, AttributeError) as exc:
            raise InvalidEnvelope(f"{field} must be a UUID") from exc
    for field in ("message_type", "producer", "destination", "actor_reference", "policy_version", "occurred_at"):
        if not isinstance(envelope[field], str) or not envelope[field].strip():
            raise InvalidEnvelope(f"{field} must be a non-empty string")


def consume_once(*, consumer: str, envelope: dict, handler) -> bool:
    """Apply a local effect once; identical duplicate is a no-op, changed body conflicts."""
    validate_envelope(envelope)
    message_id = UUID(str(envelope["message_id"]))
    organization_id = UUID(str(envelope["organization_id"]))
    branch_id = UUID(str(envelope["branch_id"]))
    payload_hash = hashlib.sha256(json.dumps(envelope, sort_keys=True, separators=(",", ":")).encode()).hexdigest()
    with scoped_atomic(organization_id, branch_id):
        existing = IntegrationInboxReceipt.objects.select_for_update().filter(
            consumer=consumer, message_id=message_id
        ).first()
        if existing:
            if existing.payload_hash != payload_hash:
                raise MessageIdentityConflict("message_id was already received with a different payload")
            return False
        try:
            with transaction.atomic():
                IntegrationInboxReceipt.objects.create(
                    organization_id=organization_id, branch_id=branch_id,
                    consumer=consumer, message_id=message_id, payload_hash=payload_hash,
                )
        except IntegrityError:
            existing = IntegrationInboxReceipt.objects.get(consumer=consumer, message_id=message_id)
            if existing.payload_hash != payload_hash:
                raise MessageIdentityConflict("message_id was already received with a different payload")
            return False
        handler(envelope)
    return True
