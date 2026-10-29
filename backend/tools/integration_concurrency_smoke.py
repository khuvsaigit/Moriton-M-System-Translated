"""Exercise real PostgreSQL claim fencing with competing integration workers."""
from __future__ import annotations

import os
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from threading import Barrier
from uuid import uuid4


SERVICE_ROOT = Path(__file__).resolve().parents[1] / "services" / "integrations"
sys.path.insert(0, str(SERVICE_ROOT))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
os.environ.setdefault("DATABASE_URL", "postgresql://integrations:integrations@127.0.0.1:5432/integration_db")
os.environ.setdefault("DJANGO_SECRET_KEY", "local-only")

import django  # noqa: E402

django.setup()

from django.db import close_old_connections, connection  # noqa: E402
from ledger.models import ExternalOperation, OperationStream  # noqa: E402
from ledger.security import scoped_atomic  # noqa: E402
from ledger.sequence import accept_operation  # noqa: E402
from ledger.worker import claim_next, complete_claim  # noqa: E402


def main() -> None:
    if connection.vendor != "postgresql":
        raise RuntimeError("This smoke test requires PostgreSQL row locking")

    organization_id, branch_id, aggregate_id = uuid4(), uuid4(), uuid4()
    first = accept_operation(
        organization_id=organization_id, branch_id=branch_id,
        aggregate_kind="smoke", aggregate_id=aggregate_id,
        operation_id=uuid4(), business_key=f"smoke-{uuid4()}",
        action="reserve", payload_hash="a" * 64,
    )
    second = accept_operation(
        organization_id=organization_id, branch_id=branch_id,
        aggregate_kind="smoke", aggregate_id=aggregate_id,
        operation_id=uuid4(), business_key=f"smoke-{uuid4()}",
        action="issue", payload_hash="b" * 64,
    )

    barrier = Barrier(2)

    def compete(worker_id: str):
        close_old_connections()
        barrier.wait()
        try:
            return claim_next(organization_id=organization_id, branch_id=branch_id, worker_id=worker_id)
        finally:
            close_old_connections()

    try:
        with ThreadPoolExecutor(max_workers=2) as pool:
            claims = list(pool.map(compete, ("smoke-worker-a", "smoke-worker-b")))
        winners = [claim for claim in claims if claim is not None]
        assert len(winners) == 1 and winners[0].operation_id == first.id, "workers claimed duplicate or out-of-order work"
        with scoped_atomic(organization_id, branch_id):
            assert ExternalOperation.objects.get(pk=second.pk).state == ExternalOperation.State.PENDING

        winner = winners[0]
        complete_claim(
            operation_id=winner.operation_id, lease_token=winner.lease_token,
            organization_id=organization_id, branch_id=branch_id,
            result_state=ExternalOperation.State.CONFIRMED, remote_id="smoke-confirmed",
        )
        next_claim = claim_next(organization_id=organization_id, branch_id=branch_id, worker_id="smoke-worker-c")
        assert next_claim is not None and next_claim.operation_id == second.id, "successor did not wait for predecessor confirmation"
        print("PostgreSQL concurrent worker claim and predecessor-ordering checks passed.")
    finally:
        with scoped_atomic(organization_id, branch_id):
            ExternalOperation.objects.filter(pk=second.id).delete()
            ExternalOperation.objects.filter(pk=first.id).delete()
            OperationStream.objects.filter(organization_id=organization_id, branch_id=branch_id,
                                           aggregate_kind="smoke", aggregate_id=aggregate_id).delete()
        close_old_connections()


if __name__ == "__main__":
    main()
