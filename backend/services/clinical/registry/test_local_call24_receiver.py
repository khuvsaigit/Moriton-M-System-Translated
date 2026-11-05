from uuid import uuid4

from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from .models import InboxReceipt, ReceptionTask


@override_settings(DEBUG=True, LOCAL_CALL24_BRIDGE_ENABLED=True,
                   LOCAL_CALL24_BRIDGE_TOKEN="test-local-bridge-token-long-enough")
class LocalCall24ReceiverTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.message_id = uuid4()
        self.aggregate_id = uuid4()
        self.envelope = {
            "schema_version": 1,
            "message_id": str(self.message_id),
            "message_type": "call24.request.received.v1",
            "producer": "integrations",
            "destination": "clinical",
            "organization_id": str(uuid4()),
            "branch_id": str(uuid4()),
            "aggregate_id": str(self.aggregate_id),
            "aggregate_version": 1,
            "operation_id": str(uuid4()),
            "correlation_id": str(uuid4()),
            "causation_id": None,
            "occurred_at": "2026-11-05T00:00:00+00:00",
            "actor_reference": "call24-local-import",
            "policy_version": "call24-csv-mapping-v1",
            "payload": {
                "source_request_id": "SYNTHETIC-TASK-1", "source_call_ids": ["SYNTHETIC-CALL-1"],
                "status": "answered", "received_at": None,
                "source_time_local": "2026-09-04T10:15:00", "category_labels": ["Үзлэг"],
                "customer_name": "Synthetic contact", "phone": None,
                "summary": "Synthetic test only", "source_revision": "a" * 64,
                "complaint": None, "matching_status": "unconfirmed",
            },
        }

    def deliver(self, envelope=None, token="test-local-bridge-token-long-enough"):
        event = envelope or self.envelope
        return self.client.post(
            "/api/v1/internal/events/call24", event, format="json",
            HTTP_X_MORITON_LOCAL_BRIDGE_TOKEN=token,
            HTTP_X_MORITON_MESSAGE_ID=str(event["message_id"]),
            HTTP_X_MORITON_AGGREGATE_ID=str(event["aggregate_id"]),
        )

    def test_event_creates_reception_task_and_duplicate_delivery_is_idempotent(self):
        first = self.deliver()
        second = self.deliver()
        self.assertEqual(first.status_code, 200)
        self.assertTrue(first.data["created"])
        self.assertEqual(second.status_code, 200)
        self.assertFalse(second.data["created"])
        self.assertEqual(ReceptionTask.objects.filter(source="call24").count(), 1)
        self.assertEqual(InboxReceipt.objects.filter(producer="integrations").count(), 1)

    def test_reused_message_id_with_changed_payload_is_conflict(self):
        self.assertEqual(self.deliver().status_code, 200)
        changed = {**self.envelope, "payload": {**self.envelope["payload"], "summary": "changed"}}
        self.assertEqual(self.deliver(changed).status_code, 409)

    def test_wrong_bridge_token_and_mismatched_transport_headers_are_rejected(self):
        self.assertEqual(self.deliver(token="wrong-token").status_code, 403)
        response = self.client.post(
            "/api/v1/internal/events/call24", self.envelope, format="json",
            HTTP_X_MORITON_LOCAL_BRIDGE_TOKEN="test-local-bridge-token-long-enough",
            HTTP_X_MORITON_MESSAGE_ID=str(uuid4()),
            HTTP_X_MORITON_AGGREGATE_ID=str(self.aggregate_id),
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(ReceptionTask.objects.count(), 0)
