"""Import a reviewed Call24 CSV and optionally deliver its events to local Clinical."""
from __future__ import annotations

import json
from pathlib import Path
from uuid import UUID

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from call24.adapter import parse_csv
from call24.events import InvalidCall24Batch, enqueue_call24_preview
from call24.import_service import persist_csv_preview
from call24.transport import ClinicalHttpTransport
from ledger.models import Call24ImportBatch
from ledger.outbox import publish_one
from ledger.security import scoped_atomic


class Command(BaseCommand):
    help = "Persist a Call24 CSV and optionally deliver its reception events to local Clinical."

    def add_arguments(self, parser):
        parser.add_argument("csv_file", type=Path)
        parser.add_argument("--organization-id", required=True)
        parser.add_argument("--branch-id", required=True)
        parser.add_argument("--publish", action="store_true", help="Deliver queued events to local Clinical now.")
        parser.add_argument("--worker-id", default="call24-local-import")

    def handle(self, *args, **options):
        if not settings.DEBUG or not settings.CALL24_CSV_IMPORT_ENABLED:
            raise CommandError("Call24 CSV import is disabled outside the explicitly enabled local development service.")
        try:
            organization_id = UUID(options["organization_id"])
            branch_id = UUID(options["branch_id"])
        except (ValueError, TypeError) as exc:
            raise CommandError("organization-id and branch-id must be UUIDs") from exc
        path: Path = options["csv_file"]
        if not path.is_file():
            raise CommandError("CSV file does not exist in the integrations container")

        preview = parse_csv(path)
        batch, _ = persist_csv_preview(path, organization_id=organization_id,
                                       branch_id=branch_id, file_name=path.name)
        if preview.issues or preview.unmatched_calls:
            self._set_batch_status(batch, organization_id, branch_id, "REVIEW_REQUIRED")
            raise CommandError(
                f"Batch {batch.id} was retained for review; {len(preview.issues)} row issue(s), "
                f"{len(preview.unmatched_calls)} unmatched call(s); no events were queued."
            )
        try:
            queued = enqueue_call24_preview(preview, organization_id=organization_id,
                                            branch_id=branch_id, correlation_id=batch.id)
        except InvalidCall24Batch as exc:
            self._set_batch_status(batch, organization_id, branch_id, "REVIEW_REQUIRED")
            raise CommandError(str(exc)) from exc

        self._set_batch_status(batch, organization_id, branch_id, "QUEUED")
        published = 0
        if options["publish"]:
            transport = ClinicalHttpTransport(
                endpoint=settings.CALL24_CLINICAL_EVENT_URL,
                token=settings.LOCAL_CALL24_BRIDGE_TOKEN,
            )
            while publish_one(
                organization_id=organization_id,
                branch_id=branch_id,
                worker_id=options["worker_id"],
                transport=transport,
                destination="clinical",
            ) is not None:
                published += 1
            self._set_batch_status(batch, organization_id, branch_id, "DELIVERED")

        self.stdout.write(json.dumps({
            "batch_id": str(batch.id),
            "source_sha256": preview.source_sha256,
            "rows": preview.rows_total,
            "requests": len(preview.requests),
            "child_calls": sum(len(request.calls) for request in preview.requests),
            "issues": len(preview.issues),
            "unmatched_calls": len(preview.unmatched_calls),
            "events_newly_queued": queued,
            "events_published": published,
            "status": "DELIVERED" if options["publish"] else "QUEUED",
        }, ensure_ascii=False))

    @staticmethod
    def _set_batch_status(batch: Call24ImportBatch, organization_id: UUID,
                          branch_id: UUID, value: str) -> None:
        with scoped_atomic(organization_id, branch_id):
            batch.status = value
            batch.save(update_fields=["status"])
