"""Clinical outbox delivery through a configured JSON message transport."""
from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import timedelta
from typing import Protocol
from uuid import UUID, uuid4

from django.db.models import Q
from django.utils import timezone

from .models import OutboxEvent
from .security import scoped_atomic


class JsonEventTransport(Protocol):
    def send(self, *, destination: str, message_id: str, aggregate_id: str, body: str) -> str: ...


class SqsJsonTransport:
    """SQS sender for pre-provisioned queues; no resource creation or implicit credentials."""

    def __init__(self, sqs_client, queue_urls: dict[str, str]):
        self._client = sqs_client
        self._queue_urls = queue_urls

    def send(self, *, destination: str, message_id: str, aggregate_id: str, body: str) -> str:
        queue_url = self._queue_urls.get(destination)
        if not queue_url:
            raise ValueError(f"no configured queue URL for destination {destination!r}")
        request = {"QueueUrl": queue_url, "MessageBody": body}
        if queue_url.endswith(".fifo"):
            request["MessageGroupId"] = aggregate_id
            request["MessageDeduplicationId"] = message_id
        response = self._client.send_message(**request)
        return str(response.get("MessageId", ""))


@dataclass(frozen=True)
class LeasedEvent:
    event_id: UUID
    token: UUID
    destination: str
    aggregate_id: UUID
    body: str


def claim_event(*, organization_id: UUID, branch_id: UUID, worker_id: str,
                lease_seconds: int = 60, now=None) -> LeasedEvent | None:
    if not worker_id.strip() or lease_seconds < 1:
        raise ValueError("worker id and positive lease duration are required")
    now = now or timezone.now()
    with scoped_atomic(organization_id, branch_id):
        event = (OutboxEvent.objects.select_for_update(skip_locked=True, of=("self",))
                 .filter(organization_id=organization_id, branch_id=branch_id, published_at__isnull=True)
                 .filter(Q(lease_until__isnull=True) | Q(lease_until__lte=now))
                 .order_by("occurred_at", "id").first())
        if event is None:
            return None
        token = uuid4()
        event.lease_token = token
        event.lease_until = now + timedelta(seconds=lease_seconds)
        event.attempt_count += 1
        event.save(update_fields=["lease_token", "lease_until", "attempt_count"])
        envelope = event.payload
        destination = str(envelope.get("destination", ""))
        if not destination:
            raise ValueError("outbox event is missing its destination")
        return LeasedEvent(event.id, token, destination, event.aggregate_id,
                           json.dumps(envelope, ensure_ascii=False, sort_keys=True, separators=(",", ":")))


def acknowledge_published(*, event_id: UUID, organization_id: UUID, branch_id: UUID,
                          lease_token: UUID, now=None) -> None:
    now = now or timezone.now()
    with scoped_atomic(organization_id, branch_id):
        event = OutboxEvent.objects.select_for_update().filter(
            id=event_id, organization_id=organization_id, branch_id=branch_id,
        ).first()
        if (event is None or event.published_at is not None or event.lease_token != lease_token
                or event.lease_until is None or event.lease_until <= now):
            raise RuntimeError("outbox result rejected because its lease is stale")
        event.published_at = now
        event.lease_token = None
        event.lease_until = None
        event.save(update_fields=["published_at", "lease_token", "lease_until"])


def publish_one(*, organization_id: UUID, branch_id: UUID, worker_id: str,
                transport: JsonEventTransport, lease_seconds: int = 60, now=None) -> UUID | None:
    leased = claim_event(organization_id=organization_id, branch_id=branch_id,
                         worker_id=worker_id, lease_seconds=lease_seconds, now=now)
    if leased is None:
        return None
    transport.send(destination=leased.destination, message_id=str(leased.event_id),
                   aggregate_id=str(leased.aggregate_id), body=leased.body)
    acknowledge_published(event_id=leased.event_id, organization_id=organization_id,
                          branch_id=branch_id, lease_token=leased.token, now=now)
    return leased.event_id
