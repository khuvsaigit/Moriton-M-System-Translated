"""Explicit durable storage for reviewed Call 24 CSV previews."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
from uuid import UUID

from django.utils import timezone

from .adapter import parse_csv
from ledger.models import Call24ImportBatch, Call24ImportRow
from ledger.security import scoped_atomic


def persist_csv_preview(source: str | Path, *, organization_id: UUID,
                        branch_id: UUID, file_name: str) -> tuple[Call24ImportBatch, bool]:
    """Persist raw row provenance in a tenant scope. Repeated bytes return the existing batch."""
    preview = parse_csv(source)
    with scoped_atomic(organization_id, branch_id):
        batch, created = Call24ImportBatch.objects.get_or_create(
            organization_id=organization_id,
            branch_id=branch_id,
            source_sha256=preview.source_sha256,
            defaults={"file_name": Path(file_name).name, "rows_total": preview.rows_total,
                      "rows_valid": preview.rows_total - len({i.row_number for i in preview.issues}),
                      "rows_invalid": len({i.row_number for i in preview.issues}),
                      "status": "PREVIEWED", "created_at": timezone.now()},
        )
        if not created:
            return batch, False
        issues_by_row: dict[int, list] = {}
        for issue in preview.issues:
            issues_by_row.setdefault(issue.row_number, []).append(issue)
        for offset, payload in enumerate(preview.source_rows, start=2):
            kind = "request" if (payload.get("task_id") or "").strip() else "call"
            identity = (payload.get("task_id") or payload.get("subtask_id") or "").strip()
            packed = json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
            issues = issues_by_row.get(offset, [])
            Call24ImportRow.objects.create(
                batch=batch, organization_id=organization_id, branch_id=branch_id,
                row_number=offset, row_kind=kind, source_identity=identity,
                payload_hash=hashlib.sha256(packed.encode("utf-8")).hexdigest(),
                status="INVALID" if issues else "VALID",
                error_code=issues[0].code if issues else "",
                error_detail="; ".join(issue.message for issue in issues),
                payload=payload,
            )
        return batch, True
