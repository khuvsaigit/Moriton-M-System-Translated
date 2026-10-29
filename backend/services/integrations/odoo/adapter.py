"""Odoo port with no concrete writer until tenant-specific API proof is approved."""
from dataclasses import dataclass

@dataclass(frozen=True)
class RemoteOutcome:
    state: str
    remote_model: str = ""
    remote_id: str = ""
    evidence: dict | None = None

class OdooPort:
    def reserve(self, operation) -> RemoteOutcome:
        raise RuntimeError("Odoo writes are gated: verify Online entitlement, method and reconciliation evidence first")
    def dispense(self, operation) -> RemoteOutcome:
        raise RuntimeError("Odoo writes are gated: verify Online entitlement, method and reconciliation evidence first")
    def reconcile(self, operation) -> RemoteOutcome:
        # An empty remote search is not proof that a timed-out operation did not commit.
        raise RuntimeError("No approved Odoo lookup contract configured; keep operation UNKNOWN/MANUAL_REVIEW")
