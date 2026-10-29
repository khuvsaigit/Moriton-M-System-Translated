import unittest
from datetime import timedelta
from uuid import uuid4

from django.test import TestCase
from django.utils import timezone

from .models import ExternalOperation
from .sequence import accept_operation
from .worker import LostLease, claim_next, complete_claim, expire_ambiguous_claims


class OperationWorkerTests(TestCase):
    def setUp(self):
        self.organization_id = uuid4()
        self.branch_id = uuid4()
        self.aggregate_id = uuid4()

    def add_operation(self, key):
        return accept_operation(
            organization_id=self.organization_id, branch_id=self.branch_id,
            aggregate_kind="prescription", aggregate_id=self.aggregate_id,
            operation_id=uuid4(), business_key=key, action="reserve", payload_hash="a" * 64,
        )

    def test_successor_waits_until_predecessor_confirms(self):
        first = self.add_operation("reserve-1")
        second = self.add_operation("reserve-2")
        claim = claim_next(organization_id=self.organization_id, branch_id=self.branch_id, worker_id="worker-a")
        self.assertEqual(claim.operation_id, first.id)
        self.assertIsNone(claim_next(organization_id=self.organization_id, branch_id=self.branch_id, worker_id="worker-b"))
        complete_claim(operation_id=claim.operation_id, lease_token=claim.lease_token,
                       organization_id=self.organization_id, branch_id=self.branch_id,
                       result_state=ExternalOperation.State.CONFIRMED, remote_id="remote-1")
        next_claim = claim_next(organization_id=self.organization_id, branch_id=self.branch_id, worker_id="worker-b")
        self.assertEqual(next_claim.operation_id, second.id)

    def test_expired_remote_write_becomes_unknown_and_rejects_stale_result(self):
        operation = self.add_operation("reserve-expiring")
        now = timezone.now()
        claim = claim_next(organization_id=self.organization_id, branch_id=self.branch_id,
                           worker_id="worker-a", lease_seconds=1, now=now)
        self.assertEqual(expire_ambiguous_claims(organization_id=self.organization_id,
                         branch_id=self.branch_id, now=now + timedelta(seconds=2)), 1)
        operation.refresh_from_db()
        self.assertEqual(operation.state, ExternalOperation.State.UNKNOWN)
        with self.assertRaises(LostLease):
            complete_claim(operation_id=claim.operation_id, lease_token=claim.lease_token,
                           organization_id=self.organization_id, branch_id=self.branch_id,
                           result_state=ExternalOperation.State.CONFIRMED, now=now + timedelta(seconds=3))
        self.assertIsNone(claim_next(organization_id=self.organization_id,
                                     branch_id=self.branch_id, worker_id="worker-c"))


if __name__ == "__main__":
    unittest.main()
