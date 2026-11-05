import json
from unittest.mock import MagicMock
from unittest.mock import patch

from django.test import SimpleTestCase

from .transport import ClinicalHttpTransport


class ClinicalHttpTransportTests(SimpleTestCase):
    def test_only_private_clinical_target_and_clinical_ack_are_accepted(self):
        with self.assertRaises(ValueError):
            ClinicalHttpTransport(endpoint="https://example.test/events", token="a" * 32)
        transport = ClinicalHttpTransport(
            endpoint="http://clinical:8000/api/v1/internal/events/call24", token="a" * 32,
        )
        response = MagicMock()
        response.__enter__.return_value = response
        response.read.return_value = json.dumps({"message_id": "m-1", "task_id": "task-1"}).encode()
        with patch("call24.transport.urlopen", return_value=response):
            self.assertEqual(transport.send(
                destination="clinical", message_id="m-1", aggregate_id="a-1", body="{}",
            ), "task-1")
        with self.assertRaises(ValueError):
            transport.send(destination="imaging", message_id="m-1", aggregate_id="a-1", body="{}")

    def test_mismatched_receiver_ack_is_not_acknowledged(self):
        transport = ClinicalHttpTransport(
            endpoint="http://clinical:8000/api/v1/internal/events/call24", token="a" * 32,
        )
        response = MagicMock()
        response.__enter__.return_value = response
        response.read.return_value = b'{"message_id":"other","task_id":"task-1"}'
        with patch("call24.transport.urlopen", return_value=response):
            with self.assertRaises(RuntimeError):
                transport.send(destination="clinical", message_id="m-1", aggregate_id="a-1", body="{}")
