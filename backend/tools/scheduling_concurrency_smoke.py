"""Prove that row-locked appointment reservation has one winner on PostgreSQL."""
from __future__ import annotations

import os
import sys
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from pathlib import Path
from threading import Barrier
from uuid import uuid4


SERVICE_ROOT = Path(__file__).resolve().parents[1] / "services" / "clinical"
sys.path.insert(0, str(SERVICE_ROOT))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
os.environ.setdefault("DATABASE_URL", "postgresql://clinical:clinical@127.0.0.1:5432/clinical_db")
os.environ.setdefault("DJANGO_SECRET_KEY", "local-only")

import django  # noqa: E402

django.setup()

from django.db import close_old_connections, connection  # noqa: E402
from registry.models import Appointment, Horse, ScheduleResource  # noqa: E402
from registry.scheduling import request_appointment  # noqa: E402
from registry.security import scoped_atomic  # noqa: E402


def main() -> None:
    if connection.vendor != "postgresql":
        raise RuntimeError("This smoke test requires PostgreSQL row locking")

    organization_id, branch_id, actor_id = uuid4(), uuid4(), uuid4()
    horse_ids = [uuid4(), uuid4()]
    resource_id = uuid4()
    with scoped_atomic(organization_id, branch_id):
        Horse.objects.bulk_create([
            Horse(id=horse_id, organization_id=organization_id, branch_id=branch_id,
                  created_by=actor_id, name=f"Concurrency smoke {index}")
            for index, horse_id in enumerate(horse_ids)
        ])
        ScheduleResource.objects.create(
            id=resource_id, organization_id=organization_id, branch_id=branch_id,
            created_by=actor_id, name="Concurrency smoke resource", resource_type="test",
        )

    barrier = Barrier(2)

    def reserve(horse_id):
        close_old_connections()
        barrier.wait()
        try:
            result = request_appointment(
                organization_id=organization_id, branch_id=branch_id, actor_id=actor_id,
                horse_id=horse_id, starts_at=datetime.fromisoformat("2026-11-04T09:00:00+00:00"),
                ends_at=datetime.fromisoformat("2026-11-04T10:00:00+00:00"),
                resource_id=resource_id,
            )
            return ("created", result.id)
        except ValueError as exc:
            if "conflicts" not in str(exc):
                raise
            return ("conflict", None)
        finally:
            close_old_connections()

    try:
        with ThreadPoolExecutor(max_workers=2) as pool:
            outcomes = list(pool.map(reserve, horse_ids))
        assert sorted(outcome[0] for outcome in outcomes) == ["conflict", "created"], outcomes
        with scoped_atomic(organization_id, branch_id):
            count = Appointment.objects.filter(
                organization_id=organization_id, branch_id=branch_id,
                resource_id=resource_id,
            ).count()
            assert count == 1, f"expected one reservation, got {count}"
        print("PostgreSQL concurrent appointment reservation has one winner.")
    finally:
        with scoped_atomic(organization_id, branch_id):
            Appointment.objects.filter(organization_id=organization_id, branch_id=branch_id).delete()
            ScheduleResource.objects.filter(pk=resource_id).delete()
            Horse.objects.filter(pk__in=horse_ids).delete()
        close_old_connections()


if __name__ == "__main__":
    main()
