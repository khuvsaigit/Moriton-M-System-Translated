"""Destination-specific Clinical message consumer dispatch."""
from __future__ import annotations

from .workflows import ingest_call24_request


class UnsupportedMessage(ValueError):
    pass


def consume_event(envelope: dict) -> tuple[str, bool]:
    """Consume a decoded queue message without querying another service database."""
    if not isinstance(envelope, dict):
        raise ValueError("message body must be a JSON object")
    message_type = envelope.get("message_type")
    if message_type == "call24.request.received.v1":
        task, created = ingest_call24_request(envelope)
        return str(task.id), created
    raise UnsupportedMessage(f"unsupported Clinical destination event: {message_type!r}")
