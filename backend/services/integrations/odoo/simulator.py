"""Deterministic fake remote store for duplicate and lost-response fault tests only."""
from __future__ import annotations

from copy import deepcopy
from threading import Lock
from uuid import uuid4


class MockOdooRemoteStore:
    """Model remote idempotency behavior; it is not evidence about a real Odoo tenant."""

    def __init__(self):
        self._lock = Lock()
        self._records: dict[str, dict] = {}
        self.write_count = 0

    def execute(self, *, operation_key: str, action: str,
                lose_response_after_commit: bool = False) -> dict:
        if not operation_key.strip() or not action.strip():
            raise ValueError("operation key and action are required")
        with self._lock:
            record = self._records.get(operation_key)
            if record is None:
                record = {
                    "remote_id": f"MOCK-{uuid4()}",
                    "action": action,
                    "operation_key": operation_key,
                }
                self._records[operation_key] = record
                self.write_count += 1
            elif record["action"] != action:
                raise ValueError("operation key was reused for a different action")
            committed_result = deepcopy(record)
        if lose_response_after_commit:
            raise TimeoutError("simulated response loss after remote commit")
        return committed_result

    def find_by_operation_key(self, operation_key: str) -> dict | None:
        """Recovery lookup used before any replay after a simulated timeout."""
        with self._lock:
            record = self._records.get(operation_key)
            return deepcopy(record) if record else None

    def execute_concurrent(self, *, operation_key: str, action: str, copies: int) -> list[dict]:
        if copies < 1:
            raise ValueError("copies must be positive")
        from concurrent.futures import ThreadPoolExecutor

        with ThreadPoolExecutor(max_workers=copies) as pool:
            futures = [pool.submit(self.execute, operation_key=operation_key, action=action)
                       for _ in range(copies)]
            return [future.result() for future in futures]
