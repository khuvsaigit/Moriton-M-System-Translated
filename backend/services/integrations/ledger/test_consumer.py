from uuid import uuid4

from django.test import TestCase

from .consumer import InvalidEnvelope, MessageIdentityConflict, consume_once


def envelope():
    return {
        "schema_version": 1, "message_id": str(uuid4()),
        "message_type": "call24.request.received.v1", "producer": "integrations",
        "destination": "clinical", "organization_id": str(uuid4()), "branch_id": str(uuid4()),
        "aggregate_id": str(uuid4()), "aggregate_version": 1, "operation_id": str(uuid4()),
        "correlation_id": str(uuid4()), "causation_id": None,
        "occurred_at": "2026-10-29T00:00:00Z", "actor_reference": "csv-import",
        "policy_version": "local-v1", "payload": {"source_request_id": "request-1"},
    }


class ConsumerReceiptTests(TestCase):
    def test_duplicate_message_has_one_local_effect(self):
        message = envelope()
        calls = []
        def handler(value):
            calls.append(value["message_id"])
        self.assertTrue(consume_once(consumer="clinical-intake", envelope=message, handler=handler))
        self.assertFalse(consume_once(consumer="clinical-intake", envelope=message, handler=handler))
        self.assertEqual(calls, [message["message_id"]])

    def test_same_message_id_with_different_body_is_a_conflict(self):
        message = envelope()
        consume_once(consumer="clinical-intake", envelope=message, handler=lambda value: None)
        changed = {**message, "payload": {"source_request_id": "changed"}}
        with self.assertRaises(MessageIdentityConflict):
            consume_once(consumer="clinical-intake", envelope=changed, handler=lambda value: None)

    def test_missing_or_invalid_envelope_is_rejected(self):
        with self.assertRaises(InvalidEnvelope):
            consume_once(consumer="clinical-intake", envelope={"schema_version": 1}, handler=lambda value: None)
        message = envelope()
        message["message_id"] = "bad-id"
        with self.assertRaises(InvalidEnvelope):
            consume_once(consumer="clinical-intake", envelope=message, handler=lambda value: None)

    def test_failed_handler_rolls_back_receipt(self):
        message = envelope()
        def fail(_):
            raise RuntimeError("handler error")
        with self.assertRaises(RuntimeError):
            consume_once(consumer="clinical-intake", envelope=message, handler=fail)
        self.assertTrue(consume_once(consumer="clinical-intake", envelope=message, handler=lambda value: None))
