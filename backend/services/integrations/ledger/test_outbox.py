from django.test import SimpleTestCase

from .outbox import SqsJsonTransport


class SqsJsonTransportTests(SimpleTestCase):
    def test_fifo_message_group_is_aggregate_and_deduplication_id_is_stable_event_id(self):
        class SqsStub:
            def send_message(self, **kwargs):
                self.request = kwargs
                return {"MessageId": "queue-message-1"}

        client = SqsStub()
        transport = SqsJsonTransport(client, {"clinical": "https://sqs.local/clinical.fifo"})
        result = transport.send(
            destination="clinical", message_id="stable-event-id",
            aggregate_id="stable-aggregate-id", body="{}",
        )
        self.assertEqual(result, "queue-message-1")
        self.assertEqual(client.request["MessageGroupId"], "stable-aggregate-id")
        self.assertEqual(client.request["MessageDeduplicationId"], "stable-event-id")

    def test_missing_destination_fails_closed_and_standard_queue_has_no_fifo_fields(self):
        class SqsStub:
            def send_message(self, **kwargs):
                self.request = kwargs
                return {"MessageId": "queue-message-2"}

        client = SqsStub()
        transport = SqsJsonTransport(client, {"clinical": "https://sqs.local/clinical"})
        with self.assertRaisesRegex(ValueError, "no approved queue URL"):
            transport.send(destination="unknown", message_id="m", aggregate_id="a", body="{}")
        transport.send(destination="clinical", message_id="m", aggregate_id="a", body="{}")
        self.assertNotIn("MessageGroupId", client.request)
        self.assertNotIn("MessageDeduplicationId", client.request)
