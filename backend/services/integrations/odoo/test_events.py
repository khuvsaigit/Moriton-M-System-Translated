from uuid import uuid4

from django.test import TestCase

from ledger.models import ExternalOperation
from ledger.sequence import accept_operation
from ledger.worker import claim_next

from .events import MockOdooPort, MockOutcome, apply_mock_result, build_operation_request


class MockOdooEventTests(TestCase):
    def setUp(self):
        self.organization_id = uuid4()
        self.branch_id = uuid4()
        self.aggregate_id = uuid4()

    def operation_claim_request(self, action="reserve"):
        operation = accept_operation(
            organization_id=self.organization_id, branch_id=self.branch_id,
            aggregate_kind="prescription", aggregate_id=self.aggregate_id,
            operation_id=uuid4(), business_key=f"synthetic-{uuid4()}",
            action=action, payload_hash="a" * 64,
        )
        claim = claim_next(organization_id=self.organization_id, branch_id=self.branch_id,
                           worker_id="mock-odoo-worker")
        operation.refresh_from_db()
        return operation, claim, build_operation_request(
            operation=operation, claim=claim,
            organization_id=self.organization_id, branch_id=self.branch_id,
        )

    def test_unknown_remote_result_stays_unknown_and_duplicate_result_is_a_noop(self):
        operation, _, request = self.operation_claim_request()
        port = MockOdooPort(MockOutcome(state=ExternalOperation.State.UNKNOWN))
        result = port.execute(request)
        self.assertEqual(result["message_type"], "odoo.operation.result.v1")
        self.assertTrue(apply_mock_result(result))
        self.assertFalse(apply_mock_result(result))
        operation.refresh_from_db()
        self.assertEqual(operation.state, ExternalOperation.State.UNKNOWN)
        self.assertEqual(operation.remote_id, "")

    def test_confirmed_mock_result_updates_projection_with_remote_reference(self):
        operation, _, request = self.operation_claim_request(action="dispense")
        result = MockOdooPort(MockOutcome(
            state=ExternalOperation.State.CONFIRMED,
            remote_model="stock.picking", remote_id="MOCK-PICK-1",
            evidence={"synthetic": True},
        )).execute(request)
        self.assertTrue(apply_mock_result(result))
        operation.refresh_from_db()
        self.assertEqual(operation.state, ExternalOperation.State.CONFIRMED)
        self.assertEqual(operation.remote_model, "stock.picking")
        self.assertEqual(operation.remote_id, "MOCK-PICK-1")
        self.assertTrue(operation.remote_evidence["synthetic"])
