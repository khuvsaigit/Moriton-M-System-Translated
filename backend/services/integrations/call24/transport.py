"""Development HTTP transport from the integrations outbox to Clinical's inbox."""
from __future__ import annotations

import json
from urllib.error import HTTPError
from urllib.request import Request, urlopen


class ClinicalHttpTransport:
    """POST one serialized event to the configured local Clinical receiver."""

    def __init__(self, *, endpoint: str, token: str, timeout_seconds: float = 10):
        if not endpoint.startswith("http://clinical:"):
            raise ValueError("local Call24 delivery must use the private Compose Clinical address")
        if len(token) < 24:
            raise ValueError("local Call24 bridge token must contain at least 24 characters")
        self.endpoint = endpoint
        self.token = token
        self.timeout_seconds = timeout_seconds

    def send(self, *, destination: str, message_id: str, aggregate_id: str, body: str) -> str:
        if destination != "clinical":
            raise ValueError(f"unsupported local Call24 destination: {destination!r}")
        request = Request(
            self.endpoint,
            data=body.encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "X-Moriton-Local-Bridge-Token": self.token,
                "X-Moriton-Message-Id": message_id,
                "X-Moriton-Aggregate-Id": aggregate_id,
            },
            method="POST",
        )
        try:
            with urlopen(request, timeout=self.timeout_seconds) as response:
                result = json.loads(response.read().decode("utf-8"))
        except HTTPError as exc:
            # A non-2xx response is not acknowledged; outbox lease expiry owns retry.
            raise RuntimeError(f"Clinical receiver returned HTTP {exc.code}") from exc
        except (TimeoutError, OSError) as exc:
            # The receiver may have committed before the response was lost. The exact
            # message ID is resent after lease expiry and Clinical deduplicates it.
            raise TimeoutError("Clinical delivery outcome is unknown; retain the outbox event") from exc
        if result.get("message_id") != message_id or not result.get("task_id"):
            raise RuntimeError("Clinical receiver response does not confirm this Call24 event")
        return str(result["task_id"])
