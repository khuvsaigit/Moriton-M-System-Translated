"""Create durable Clinical destination events from a validated Call 24 CSV preview."""
from __future__ import annotations

from datetime import datetime
from pathlib import Path
from uuid import UUID, uuid5

from django.utils import timezone

from ledger.models import (
    Call24RequestProjection,
    IntegrationAuditEvent,
    IntegrationOutboxEvent,
)
from ledger.security import scoped_atomic

from .adapter import ImportPreview, parse_csv
from .import_service import persist_csv_preview


class InvalidCall24Batch(ValueError):
    pass


def _aware_received_at(value: str | None) -> str | None:
    if not value:
        return None
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    return parsed.isoformat() if parsed.tzinfo is not None else None


def _enqueue_one(*, request, organization_id: UUID, branch_id: UUID,
                 correlation_id: UUID) -> tuple[IntegrationOutboxEvent, bool]:
    source_id = request.source_request_id.strip()
    if not source_id:
        raise InvalidCall24Batch("each request must have a stable source_request_id")
    namespace = uuid5(organization_id, f"moriton:call24:{branch_id}")
    aggregate_id = uuid5(namespace, f"request:{source_id}")
    projection, created = Call24RequestProjection.objects.get_or_create(
        organization_id=organization_id,
        branch_id=branch_id,
        source_request_id=source_id,
        defaults={"source_revision": request.source_revision, "aggregate_id": aggregate_id,
                  "aggregate_version": 1},
    )
    if not created:
        projection = Call24RequestProjection.objects.select_for_update().get(pk=projection.pk)
        if projection.source_revision == request.source_revision:
            event_id = uuid5(projection.aggregate_id,
                             f"revision:{projection.aggregate_version}:{projection.source_revision}")
            return IntegrationOutboxEvent.objects.get(id=event_id), False
        projection.source_revision = request.source_revision
        projection.aggregate_version += 1
        projection.save(update_fields=["source_revision", "aggregate_version", "updated_at"])

    message_id = uuid5(projection.aggregate_id,
                       f"revision:{projection.aggregate_version}:{projection.source_revision}")
    operation_id = uuid5(projection.aggregate_id, f"ingest:{projection.aggregate_version}")
    event = {
        "schema_version": 1,
        "message_id": str(message_id),
        "message_type": "call24.request.received.v1",
        "producer": "integrations",
        "destination": "clinical",
        "organization_id": str(organization_id),
        "branch_id": str(branch_id),
        "aggregate_id": str(projection.aggregate_id),
        "aggregate_version": projection.aggregate_version,
        "operation_id": str(operation_id),
        "correlation_id": str(correlation_id),
        "causation_id": None,
        "occurred_at": timezone.now().isoformat(),
        "actor_reference": "call24-csv-import-adapter",
        "policy_version": "call24-csv-mapping-v1",
        "payload": {
            "source_request_id": source_id,
            "source_call_ids": [call.source_call_id for call in request.calls],
            "status": request.status,
            "received_at": _aware_received_at(request.created_at),
            "source_time_local": request.created_at,
            "category_labels": request.categories,
            "customer_name": request.customer_name,
            "phone": request.phone,
            "summary": request.summary,
            "source_revision": request.source_revision,
            "complaint": request.complaint,
            "matching_status": "unconfirmed",
        },
    }
    envelope, event_created = IntegrationOutboxEvent.objects.get_or_create(
        id=message_id,
        defaults={
            "organization_id": organization_id, "branch_id": branch_id,
            "message_type": "call24.request.received.v1", "schema_version": 1,
            "aggregate_id": projection.aggregate_id,
            "aggregate_version": projection.aggregate_version,
            "correlation_id": correlation_id, "payload": event,
        },
    )
    if not event_created and envelope.payload != event:
        raise InvalidCall24Batch("deterministic Call 24 message ID conflicts with existing contents")
    if event_created:
        IntegrationAuditEvent.objects.create(
            organization_id=organization_id, branch_id=branch_id,
            actor_id=None, action="call24.request_enqueued", aggregate_type="call24_request",
            aggregate_id=projection.aggregate_id, aggregate_version=projection.aggregate_version,
            correlation_id=correlation_id,
            details={"source_request_id": source_id, "message_id": str(message_id)},
        )
    return envelope, event_created


def enqueue_call24_preview(preview: ImportPreview, *, organization_id: UUID,
                           branch_id: UUID, correlation_id: UUID) -> int:
    """Persist event intents atomically; bad or ambiguous rows do not reach Clinical."""
    if preview.issues or preview.unmatched_calls:
        raise InvalidCall24Batch("CSV batch contains validation issues or unmatched calls")
    count = 0
    with scoped_atomic(organization_id, branch_id):
        for request in preview.requests:
            _, created = _enqueue_one(request=request, organization_id=organization_id,
                                      branch_id=branch_id, correlation_id=correlation_id)
            count += int(created)
    return count


def ingest_call24_csv(source: str | Path, *, organization_id: UUID,
                      branch_id: UUID, file_name: str) -> tuple[UUID, int]:
    """Persist raw import provenance and then enqueue deduplicated Clinical events."""
    batch, _ = persist_csv_preview(source, organization_id=organization_id,
                                   branch_id=branch_id, file_name=file_name)
    preview = parse_csv(source)
    queued = enqueue_call24_preview(preview, organization_id=organization_id,
                                    branch_id=branch_id, correlation_id=batch.id)
    return batch.id, queued
