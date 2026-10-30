"""Read-only Call 24 CSV adapter. It previews normalized events; it never books visits."""
from __future__ import annotations
import csv
import hashlib
import json
from dataclasses import asdict, dataclass, field
from datetime import datetime
from pathlib import Path
from typing import TextIO

@dataclass
class CallRecord:
    source_call_id: str
    task_id: str
    task_number: str
    direction: str
    call_status: str
    answered_by: str
    call_at: str | None
    wait_seconds: int | None
    talk_seconds: int | None

@dataclass
class Call24Request:
    source_request_id: str
    task_number: str
    customer_name: str | None
    phone: str | None
    status: str
    created_at: str | None
    categories: list[str]
    summary: str | None
    complaint: bool | None
    source_revision: str
    identity_status: str = "unconfirmed"
    calls: list[CallRecord] = field(default_factory=list)

@dataclass
class ImportIssue:
    row_number: int
    code: str
    message: str

@dataclass
class ImportPreview:
    source_sha256: str
    requests: list[Call24Request]
    unmatched_calls: list[CallRecord]
    issues: list[ImportIssue]
    rows_total: int
    source_rows: list[dict[str, str]] = field(default_factory=list, repr=False)

    def as_dict(self): return {"source_sha256": self.source_sha256, "rows_total": self.rows_total,
        "requests": [asdict(r) for r in self.requests], "unmatched_calls": [asdict(c) for c in self.unmatched_calls],
        "issues": [asdict(i) for i in self.issues]}

def _text(row: dict[str, str], key: str) -> str | None:
    v = (row.get(key) or "").strip()
    return v or None

def _int(value: str | None, row_no: int, field_name: str, issues: list[ImportIssue]) -> int | None:
    if not value: return None
    try:
        n = int(value)
        if n < 0: raise ValueError()
        return n
    except ValueError:
        issues.append(ImportIssue(row_no, "invalid_duration", f"{field_name} must be a non-negative integer"))
        return None

def _iso(value: str | None, row_no: int, issues: list[ImportIssue]) -> str | None:
    if not value: return None
    for fmt in ("%m/%d/%Y %H:%M", "%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S"):
        # The export carries no zone. Preserve local wall time rather than inventing UTC.
        try: return datetime.strptime(value, fmt).isoformat()
        except ValueError: pass
    issues.append(ImportIssue(row_no, "invalid_datetime", f"Unsupported Call 24 datetime: {value}"))
    return None

def _boolean(value: str | None, row_no: int, issues: list[ImportIssue]) -> bool | None:
    if value is None:
        return None
    normalized = value.strip().lower()
    if normalized in {"1", "true", "yes", "y", "тийм"}:
        return True
    if normalized in {"0", "false", "no", "n", "үгүй"}:
        return False
    issues.append(ImportIssue(row_no, "invalid_boolean", "Complaint flag has an unrecognized value"))
    return None

def parse_csv(source: str | Path | TextIO) -> ImportPreview:
    """Parse exported Call 24 report. Parent tasks and child calls remain separate.

    A request row has task_id. A call row has subtask_id and may contain its parent
    task_id. Repeated task_id rows merge calls while preserving source revision.
    """
    close = False
    if hasattr(source, "read"):
        stream = source
        content = stream.read()
        if isinstance(content, bytes): content = content.decode("utf-8-sig")
        source_hash = hashlib.sha256(content.encode("utf-8-sig")).hexdigest()
        import io
        stream = io.StringIO(content)
    else:
        raw = Path(source).read_bytes()
        source_hash = hashlib.sha256(raw).hexdigest()
        stream = Path(source).open("r", encoding="utf-8-sig", newline="")
        close = True
    issues: list[ImportIssue] = []
    requests: dict[str, Call24Request] = {}
    unmatched: list[CallRecord] = []
    try:
        reader = csv.DictReader(stream)
        required = {"task_id", "Дугаар", "Төлөв", "Огноо", "subtask_id", "Дуудлага төрөл", "Дуудлага огноо"}
        if not reader.fieldnames or not required.issubset(set(reader.fieldnames)):
            return ImportPreview(source_hash, [], [], [ImportIssue(1, "missing_columns", "CSV does not match the supplied Call 24 export columns")], 0)
        row_count = 0
        source_rows: list[dict[str, str]] = []
        current_task_id: str | None = None
        for row_no, row in enumerate(reader, start=2):
            row_count += 1
            source_rows.append({str(k): (v or "") for k, v in row.items() if k is not None})
            # task fields and call fields coexist in one row or separate rows
            task_id = _text(row, "task_id")
            subtask_id = _text(row, "subtask_id")
            task_number = _text(row, "Дугаар") or ""
            if task_id:
                current_task_id = task_id
                cats: list[str] = []
                for category_number in range(1, 4):
                    category = _text(row, f"Ангилал {category_number}")
                    if category is not None:
                        cats.append(category)
                candidate = Call24Request(task_id, task_number, _text(row, "Харилцагч"), _text(row, "Холбогдогч талын нэр, утас"),
                    _text(row, "Төлөв") or "unknown", _iso(_text(row, "Огноо"), row_no, issues), cats,
                    _text(row, "Resolve тэмдэглэл"), _boolean(_text(row, "Гомдол эсэх"), row_no, issues), "")
                candidate.source_revision = hashlib.sha256(json.dumps({k: row.get(k, "") for k in sorted(row)}, ensure_ascii=False, sort_keys=True).encode()).hexdigest()
                existing = requests.get(task_id)
                if existing:
                    # Latest non-empty exported row fields are retained; each distinct task identity remains one reception request.
                    for attr in ("task_number", "customer_name", "phone", "status", "created_at", "summary"):
                        val = getattr(candidate, attr)
                        if val: setattr(existing, attr, val)
                    existing.categories = list(dict.fromkeys(existing.categories + candidate.categories))
                    existing.source_revision = hashlib.sha256((existing.source_revision + candidate.source_revision).encode()).hexdigest()
                else: requests[task_id] = candidate
            if subtask_id:
                # Exported child rows leave task_id blank. In this report layout
                # they follow their parent task and precede the next task row.
                parent_id = task_id or current_task_id or ""
                c = CallRecord(subtask_id, parent_id, task_number, _text(row, "Дуудлага төрөл") or "unknown",
                    _text(row, "Дуудлага төлөв") or "unknown", _text(row, "Хариулсан хүн") or "",
                    _iso(_text(row, "Дуудлага огноо"), row_no, issues), _int(_text(row, "Хүлээсэн (сек)"), row_no, "Хүлээсэн (сек)", issues),
                    _int(_text(row, "Яриа (сек)"), row_no, "Яриа (сек)", issues))
                parent = requests.get(parent_id)
                if parent:
                    if all(old.source_call_id != subtask_id for old in parent.calls): parent.calls.append(c)
                else: unmatched.append(c)
        # Second pass links call rows appearing before their parent task row.
        call_ids = set()
        for req in requests.values():
            for c in req.calls: call_ids.add(c.source_call_id)
        still_unmatched = []
        for call in unmatched:
            parent = requests.get(call.task_id)
            if parent:
                if call.source_call_id not in call_ids: parent.calls.append(call); call_ids.add(call.source_call_id)
            else: still_unmatched.append(call)
        for request in requests.values():
            normalized = asdict(request)
            normalized.pop("source_revision", None)
            request.source_revision = hashlib.sha256(
                json.dumps(normalized, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
            ).hexdigest()
        return ImportPreview(source_hash, list(requests.values()), still_unmatched, issues, row_count, source_rows)
    finally:
        if close: stream.close()
