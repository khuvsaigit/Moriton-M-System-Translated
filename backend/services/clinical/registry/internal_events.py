"""Explicitly development-only receiver for local cross-service event delivery."""
from __future__ import annotations

import hmac
from uuid import UUID

from django.conf import settings
from django.http import Http404
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .consumer import consume_event
from .workflows import MessageIdentityConflict


class LocalCall24EventView(APIView):
    """Bridge the local Integration outbox to the Clinical durable inbox."""

    authentication_classes: list = []
    permission_classes = [AllowAny]

    def post(self, request):
        if not settings.DEBUG or not settings.LOCAL_CALL24_BRIDGE_ENABLED:
            raise Http404
        expected = settings.LOCAL_CALL24_BRIDGE_TOKEN
        supplied = request.headers.get("X-Moriton-Local-Bridge-Token", "")
        if len(expected) < 24 or not hmac.compare_digest(expected, supplied):
            return Response({"detail": "Local event bridge authentication failed."}, status=403)
        if request.META.get("CONTENT_LENGTH", "").isdigit() and int(request.META["CONTENT_LENGTH"]) > 128 * 1024:
            return Response({"detail": "Event exceeds the local bridge size limit."}, status=413)
        envelope = request.data
        if not isinstance(envelope, dict) or envelope.get("message_type") != "call24.request.received.v1":
            return Response({"detail": "Only Call24 reception events are accepted by this endpoint."}, status=400)
        try:
            message_id = UUID(str(envelope.get("message_id", "")))
            aggregate_id = UUID(str(envelope.get("aggregate_id", "")))
        except (ValueError, TypeError, AttributeError):
            return Response({"detail": "Event identifiers must be UUIDs."}, status=400)
        if (request.headers.get("X-Moriton-Message-Id") != str(message_id)
                or request.headers.get("X-Moriton-Aggregate-Id") != str(aggregate_id)):
            return Response({"detail": "Transport headers do not match the event envelope."}, status=400)
        try:
            task_id, created = consume_event(envelope)
        except MessageIdentityConflict as exc:
            return Response({"detail": str(exc)}, status=409)
        except (KeyError, TypeError, ValueError) as exc:
            return Response({"detail": str(exc)}, status=400)
        return Response({"message_id": str(message_id), "task_id": task_id, "created": created})
