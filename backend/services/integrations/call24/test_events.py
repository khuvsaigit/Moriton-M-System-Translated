import io
import json
from datetime import timedelta
from uuid import uuid4

from django.test import TestCase
from django.utils import timezone

from ledger.models import Call24RequestProjection, IntegrationOutboxEvent
from ledger.outbox import acknowledge_published, claim_event, publish_one

from .adapter import parse_csv
from .events import enqueue_call24_preview


CSV = """task_id,Дугаар,Харилцагч,Төлөв,Огноо,subtask_id,Дуудлага төрөл,Дуудлага төлөв,Хариулсан хүн,Хүлээсэн (сек),Яриа (сек),Дуудлага огноо,Ангилал 1,Гомдол эсэх
T-1,1001,Synthetic,open,10/30/2026 10:00,,,,,,,,Consultation,Үгүй
,,,,,C-1,Incoming,answered,Test Operator,3,30,10/30/2026 10:05,,
"""


class Call24EventTests(TestCase):
    def setUp(self):
        self.organization_id = uuid4()
        self.branch_id = uuid4()
        self.correlation_id = uuid4()

    def test_repeat_import_is_idempotent_and_source_revision_emits_new_version(self):
        first = parse_csv(io.StringIO(CSV))
        self.assertEqual(enqueue_call24_preview(first, organization_id=self.organization_id,
                                                branch_id=self.branch_id,
                                                correlation_id=self.correlation_id), 1)
        self.assertEqual(enqueue_call24_preview(first, organization_id=self.organization_id,
                                                branch_id=self.branch_id,
                                                correlation_id=self.correlation_id), 0)
        changed = parse_csv(io.StringIO(CSV.replace("C-1", "C-2")))
        self.assertNotEqual(first.requests[0].source_revision, changed.requests[0].source_revision)
        self.assertEqual(enqueue_call24_preview(changed, organization_id=self.organization_id,
                                                branch_id=self.branch_id,
                                                correlation_id=uuid4()), 1)
        projection = Call24RequestProjection.objects.get(
            organization_id=self.organization_id, branch_id=self.branch_id, source_request_id="T-1")
        self.assertEqual(projection.aggregate_version, 2)
        self.assertEqual(IntegrationOutboxEvent.objects.count(), 2)
        payload = IntegrationOutboxEvent.objects.order_by("aggregate_version").first().payload
        self.assertIsNone(payload["payload"]["received_at"])
        self.assertEqual(payload["payload"]["source_time_local"], "2026-10-30T10:00:00")
        self.assertEqual(payload["payload"]["matching_status"], "unconfirmed")
        self.assertEqual(payload["payload"]["source_call_ids"], ["C-1"])

    def test_outbox_retries_after_send_ack_gap_with_same_event_identity(self):
        event_id = uuid4()
        aggregate_id = uuid4()
        envelope = {"message_id": str(event_id), "destination": "clinical", "aggregate_id": str(aggregate_id)}
        IntegrationOutboxEvent.objects.create(
            id=event_id, organization_id=self.organization_id, branch_id=self.branch_id,
            message_type="synthetic.test", schema_version=1, aggregate_id=aggregate_id,
            aggregate_version=1, correlation_id=self.correlation_id, payload=envelope,
        )

        class AcceptedThenLost:
            def __init__(self):
                self.sent = []

            def send(self, *, destination, message_id, aggregate_id, body):
                self.sent.append((destination, message_id, aggregate_id, body))
                raise TimeoutError("simulated lost response after remote acceptance")

        transport = AcceptedThenLost()
        now = timezone.now()
        with self.assertRaises(TimeoutError):
            publish_one(organization_id=self.organization_id, branch_id=self.branch_id,
                        worker_id="worker-a", transport=transport, lease_seconds=30, now=now)
        row = IntegrationOutboxEvent.objects.get(pk=event_id)
        self.assertIsNone(row.published_at)
        self.assertEqual(row.attempt_count, 1)

        retry_time = now + timedelta(seconds=31)
        class SuccessfulRetry:
            def __init__(self):
                self.message_id = None

            def send(self, *, destination, message_id, aggregate_id, body):
                self.message_id = message_id
                self.body = body
                return "local-queue-message"

        retry = SuccessfulRetry()
        published_id = publish_one(organization_id=self.organization_id, branch_id=self.branch_id,
                                   worker_id="worker-b", transport=retry,
                                   lease_seconds=30, now=retry_time)
        self.assertEqual(published_id, event_id)
        self.assertEqual(retry.message_id, str(event_id))
        self.assertEqual(json.loads(retry.body)["message_id"], str(event_id))
        row.refresh_from_db()
        self.assertIsNotNone(row.published_at)
        self.assertEqual(row.attempt_count, 2)

    def test_outbox_does_not_claim_a_later_revision_until_predecessor_is_acknowledged(self):
        aggregate_id = uuid4()
        first_id, second_id = uuid4(), uuid4()
        for message_id, version in ((first_id, 1), (second_id, 2)):
            IntegrationOutboxEvent.objects.create(
                id=message_id, organization_id=self.organization_id,
                branch_id=self.branch_id, message_type="call24.request.received.v1",
                schema_version=1, aggregate_id=aggregate_id, aggregate_version=version,
                correlation_id=self.correlation_id,
                payload={"message_id": str(message_id), "destination": "clinical"},
            )

        first = claim_event(organization_id=self.organization_id,
                            branch_id=self.branch_id, worker_id="worker-a",
                            destination="clinical")
        self.assertEqual(first.event_id, first_id)
        blocked = claim_event(organization_id=self.organization_id,
                              branch_id=self.branch_id, worker_id="worker-b",
                              destination="clinical")
        self.assertIsNone(blocked)
        acknowledge_published(event_id=first.event_id,
                              organization_id=self.organization_id,
                              branch_id=self.branch_id, lease_token=first.token)
        second = claim_event(organization_id=self.organization_id,
                             branch_id=self.branch_id, worker_id="worker-b",
                             destination="clinical")
        self.assertEqual(second.event_id, second_id)
