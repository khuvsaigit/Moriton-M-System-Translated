"""Application services for the R1 registry, reception, visit, and draft-note flow."""
from __future__ import annotations

import hashlib
import json
import unicodedata
from datetime import datetime, timezone
from typing import Any
from uuid import UUID, uuid4

from django.db import IntegrityError, transaction
from django.db.models import Q

from .models import (
    AuditEvent,
    BranchVisitSequence,
    ClinicalNote,
    ClinicalNoteRevision,
    Contact,
    Horse,
    HorseIdentifier,
    HorsePartyRole,
    InboxReceipt,
    ReceptionTask,
    ReceptionTaskHistory,
    Visit,
    VisitAssignment,
)
from .events import append_clinical_event
from .security import scoped_atomic

CALL24_SYSTEM_ACTOR_ID = UUID("00000000-0000-5000-8000-000000000024")


class DomainConflict(ValueError):
    """An optimistic version or unique business identity has conflicted."""


class DuplicateIdentity(DomainConflict):
    def __init__(self, candidates: list[Horse]):
        super().__init__("possible duplicate horses require staff review")
        self.candidates = candidates


class MessageIdentityConflict(DomainConflict):
    """A previously received message ID has a different body."""


def _normalized(value: str) -> str:
    return " ".join(unicodedata.normalize("NFKC", value).casefold().split())


def find_horse_candidates(*, organization_id: UUID, branch_id: UUID,
                          name: str = "", tamga: str = "", identifiers: list[dict] | None = None) -> list[tuple[Horse, list[str]]]:
    """Find review candidates; phone/name similarities never auto-link records."""
    identifiers = identifiers or []
    base = Horse.objects.filter(organization_id=organization_id, branch_id=branch_id, merged_into__isnull=True)
    query = Q(pk__in=[])
    if name.strip():
        query |= Q(name__iexact=name.strip())
    if tamga.strip():
        query |= Q(tamga__iexact=tamga.strip())
    for identifier in identifiers:
        value = str(identifier.get("value", "")).strip()
        kind = str(identifier.get("type", "")).strip()
        issuer = str(identifier.get("issuer", "")).strip()
        if value and kind:
            query |= Q(identifiers__identifier_type__iexact=kind,
                       identifiers__issuer__iexact=issuer, identifiers__value__iexact=value)
    candidates = list(base.filter(query).distinct().order_by("name", "id")[:20]) if (name.strip() or tamga.strip() or identifiers) else []
    result: list[tuple[Horse, list[str]]] = []
    for horse in candidates:
        reasons: list[str] = []
        if name.strip() and _normalized(horse.name) == _normalized(name):
            reasons.append("name_exact")
        if tamga.strip() and _normalized(horse.tamga) == _normalized(tamga):
            reasons.append("tamga_exact")
        for identifier in identifiers:
            matched = horse.identifiers.filter(
                identifier_type__iexact=str(identifier.get("type", "")).strip(),
                issuer__iexact=str(identifier.get("issuer", "")).strip(),
                value__iexact=str(identifier.get("value", "")).strip(),
            ).exists()
            if matched:
                reasons.append("identifier_exact")
                break
        result.append((horse, reasons))
    return result


def search_horses(*, organization_id: UUID, branch_id: UUID, query: str, limit: int = 25) -> list[Horse]:
    """Scoped search over horse names, brands, identifiers, and linked contacts."""
    term = query.strip()[:120]
    horses = Horse.objects.filter(organization_id=organization_id, branch_id=branch_id, merged_into__isnull=True)
    if term:
        horses = horses.filter(
            Q(name__icontains=term) | Q(tamga__icontains=term)
            | Q(identifiers__value__icontains=term)
            | Q(party_roles__contact__display_name__icontains=term)
            | Q(party_roles__contact__normalized_phone__icontains=term)
        ).distinct()
    return list(horses.order_by("name", "id")[:limit])


def create_horse(*, organization_id: UUID, branch_id: UUID, actor_id: UUID,
                 name: str, breed: str = "", tamga: str = "", identifiers: list[dict] | None = None,
                 birth_year: int | None = None) -> Horse:
    identifiers = identifiers or []
    candidates = find_horse_candidates(organization_id=organization_id, branch_id=branch_id,
                                       name=name, tamga=tamga, identifiers=identifiers)
    if candidates:
        raise DuplicateIdentity([horse for horse, _ in candidates])
    horse = Horse.objects.create(
        organization_id=organization_id, branch_id=branch_id, created_by=actor_id,
        name=name.strip(), breed=breed.strip(), tamga=tamga.strip(), birth_year=birth_year,
    )
    for identifier in identifiers:
        HorseIdentifier.objects.create(
            organization_id=organization_id, branch_id=branch_id, created_by=actor_id,
            horse=horse, identifier_type=str(identifier["type"]).strip(),
            issuer=str(identifier.get("issuer", "")).strip(), value=str(identifier["value"]).strip(),
        )
    AuditEvent.objects.create(
        organization_id=organization_id, branch_id=branch_id, actor_id=actor_id,
        action="horse.created", aggregate_type="horse", aggregate_id=horse.id,
        aggregate_version=horse.version, correlation_id=uuid4(),
        details={"identifier_count": len(identifiers)},
    )
    append_clinical_event(organization_id=organization_id, branch_id=branch_id,
                          actor_id=actor_id, message_type="clinical.horse.registered.v1",
                          aggregate_id=horse.id, aggregate_version=horse.version,
                          correlation_id=uuid4(),
                          payload={"horse_id": str(horse.id), "version": horse.version})
    return horse


def create_contact(*, organization_id: UUID, branch_id: UUID, actor_id: UUID,
                   display_name: str, phone: str = "", email: str = "") -> Contact:
    """Create a contact; phone numbers are searchable attributes, never unique keys."""
    return Contact.objects.create(organization_id=organization_id, branch_id=branch_id,
                                  created_by=actor_id, display_name=display_name.strip(),
                                  normalized_phone=phone.strip(), email=email.strip())


def set_horse_party_role(*, organization_id: UUID, branch_id: UUID, actor_id: UUID,
                         horse: Horse, contact: Contact, role: str,
                         valid_from: datetime, valid_to: datetime | None = None) -> HorsePartyRole:
    if role not in {"owner", "representative", "payer"}:
        raise ValueError("unsupported horse party role")
    if (horse.organization_id, horse.branch_id) != (organization_id, branch_id):
        raise ValueError("horse is outside the active scope")
    if (contact.organization_id, contact.branch_id) != (organization_id, branch_id):
        raise ValueError("contact is outside the active scope")
    if valid_from.tzinfo is None or (valid_to and valid_to.tzinfo is None):
        raise ValueError("party role dates must include a timezone")
    if valid_to and valid_to <= valid_from:
        raise ValueError("party role end must be after start")
    return HorsePartyRole.objects.create(
        organization_id=organization_id, branch_id=branch_id, created_by=actor_id,
        horse=horse, contact=contact, role=role, valid_from=valid_from, valid_to=valid_to,
    )


def _canonical_hash(value: dict) -> str:
    packed = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(packed.encode("utf-8")).hexdigest()


def ingest_call24_request(envelope: dict) -> tuple[ReceptionTask, bool]:
    """Idempotently project a trusted Call 24 event into the Clinical reception queue."""
    required = {"schema_version", "message_id", "message_type", "producer", "destination",
                "organization_id", "branch_id", "aggregate_version", "correlation_id", "payload"}
    if not isinstance(envelope, dict) or required - envelope.keys():
        raise ValueError("event envelope is missing required fields")
    if envelope["schema_version"] != 1 or envelope["message_type"] != "call24.request.received.v1":
        raise ValueError("unsupported Call 24 event type or version")
    if envelope["producer"] != "integrations" or envelope["destination"] != "clinical":
        raise ValueError("Call 24 event producer or destination is invalid")
    try:
        message_id = UUID(str(envelope["message_id"]))
        organization_id = UUID(str(envelope["organization_id"]))
        branch_id = UUID(str(envelope["branch_id"]))
        correlation_id = UUID(str(envelope["correlation_id"]))
    except (ValueError, TypeError, AttributeError) as exc:
        raise ValueError("event identifiers must be UUIDs") from exc
    payload = envelope["payload"]
    if not isinstance(payload, dict) or not str(payload.get("source_request_id", "")).strip():
        raise ValueError("Call 24 source request ID is required")
    if payload.get("matching_status", "unconfirmed") != "unconfirmed":
        raise ValueError("Call 24 identity matching must remain unconfirmed")
    digest = _canonical_hash(envelope)
    source_id = str(payload["source_request_id"]).strip()[:120]

    with scoped_atomic(organization_id, branch_id):
        previous = InboxReceipt.objects.filter(producer="integrations", message_id=message_id).first()
        if previous:
            if previous.payload_hash != digest:
                raise MessageIdentityConflict("message ID was reused with a changed payload")
            task = ReceptionTask.objects.get(
                organization_id=organization_id, branch_id=branch_id,
                source="call24", source_request_id=source_id,
            )
            return task, False
        try:
            with transaction.atomic():
                InboxReceipt.objects.create(
                    producer="integrations", message_id=message_id, payload_hash=digest,
                    organization_id=organization_id, branch_id=branch_id,
                )
        except IntegrityError:
            previous = InboxReceipt.objects.get(producer="integrations", message_id=message_id)
            if previous.payload_hash != digest:
                raise MessageIdentityConflict("message ID was reused with a changed payload")
            task = ReceptionTask.objects.get(
                organization_id=organization_id, branch_id=branch_id,
                source="call24", source_request_id=source_id,
            )
            return task, False

        defaults: dict[str, Any] = {
            "created_by": CALL24_SYSTEM_ACTOR_ID,
            "customer_name": str(payload.get("customer_name") or "")[:200],
            "phone": str(payload.get("phone") or "")[:32],
            "summary": str(payload.get("summary") or ""),
            "requested_at": _parse_event_time(payload.get("received_at")),
            "source_revision": str(payload.get("source_revision") or "")[:64],
            "source_time_local": str(payload.get("source_time_local") or "")[:80],
            "source_call_ids": payload.get("source_call_ids") if isinstance(payload.get("source_call_ids"), list) else [],
            "category_labels": payload.get("category_labels") if isinstance(payload.get("category_labels"), list) else [],
            "complaint": payload.get("complaint") if isinstance(payload.get("complaint"), bool) else None,
            "identity_status": "unconfirmed",
        }
        task, created = ReceptionTask.objects.get_or_create(
            organization_id=organization_id, branch_id=branch_id,
            source="call24", source_request_id=source_id, defaults=defaults,
        )
        if not created:
            new_revision = defaults["source_revision"]
            if new_revision and task.source_revision != new_revision:
                if task.status == ReceptionTask.Status.NEW:
                    for field in ("customer_name", "phone", "summary", "requested_at", "source_time_local",
                                  "source_call_ids", "category_labels", "complaint"):
                        setattr(task, field, defaults[field])
                task.source_revision = new_revision
                task.version += 1
                task.save(update_fields=["customer_name", "phone", "summary", "requested_at", "source_time_local",
                                         "source_call_ids", "category_labels", "complaint",
                                         "source_revision", "version", "updated_at"])
                ReceptionTaskHistory.objects.create(
                    organization_id=organization_id, branch_id=branch_id,
                    task=task, actor_id=None, action="source_revision_received",
                    from_status=task.status, to_status=task.status,
                    details={"source_revision": new_revision},
                )
        if created:
            ReceptionTaskHistory.objects.create(
                organization_id=organization_id, branch_id=branch_id,
                task=task, actor_id=None, action="created_from_call24",
                to_status=task.status,
                details={"source_revision": task.source_revision},
            )
        AuditEvent.objects.create(
            organization_id=organization_id, branch_id=branch_id,
            actor_id=None, action="reception.call24_received", aggregate_type="reception_task",
            aggregate_id=task.id, aggregate_version=task.version, correlation_id=correlation_id,
            details={"source_request_id": source_id, "created": created},
        )
        append_clinical_event(
            organization_id=organization_id, branch_id=branch_id,
            actor_id=CALL24_SYSTEM_ACTOR_ID,
            message_type=("clinical.reception.created.v1" if created
                          else "clinical.reception.source_revision_received.v1"),
            aggregate_id=task.id, aggregate_version=task.version,
            correlation_id=correlation_id,
            payload={"task_id": str(task.id), "source": task.source,
                     "status": task.status, "source_revision": task.source_revision},
        )
        return task, created


def _parse_event_time(value) -> datetime | None:
    if not value:
        return None
    if not isinstance(value, str):
        raise ValueError("received_at must be an ISO timestamp")
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        raise ValueError("received_at must include a timezone")
    return parsed


def transition_reception_task(*, task_id: UUID, organization_id: UUID, branch_id: UUID,
                              actor_id: UUID, action: str, expected_version: int,
                              assigned_to: UUID | None = None, horse_id: UUID | None = None,
                              reason: str = "") -> ReceptionTask:
    allowed = {"assign", "link", "resolve"}
    if action not in allowed:
        raise ValueError("unsupported reception action")
    with scoped_atomic(organization_id, branch_id):
        task = ReceptionTask.objects.select_for_update().filter(
            id=task_id, organization_id=organization_id, branch_id=branch_id,
        ).first()
        if task is None:
            raise ReceptionTask.DoesNotExist
        if task.version != expected_version:
            raise DomainConflict("reception task changed; refresh and retry")
        old_status = task.status
        details: dict[str, str] = {}
        if action == "assign":
            if task.status == ReceptionTask.Status.RESOLVED:
                raise DomainConflict("resolved reception tasks cannot be reassigned")
            if assigned_to is None:
                raise ValueError("assigned_to is required")
            task.assigned_to = assigned_to
            task.status = ReceptionTask.Status.ASSIGNED
            details["assigned_to"] = str(assigned_to)
        elif action == "link":
            if task.status == ReceptionTask.Status.RESOLVED:
                raise DomainConflict("resolved reception tasks cannot be relinked")
            if horse_id is None:
                raise ValueError("horse_id is required")
            horse = Horse.objects.filter(id=horse_id, organization_id=organization_id,
                                         branch_id=branch_id, merged_into__isnull=True).first()
            if horse is None:
                raise ValueError("horse is not available in the active scope")
            if task.linked_horse_id and task.linked_horse_id != horse.id:
                raise DomainConflict("a linked horse cannot be silently replaced")
            task.linked_horse = horse
            task.identity_status = "staff_linked"
            task.status = ReceptionTask.Status.LINKED
            details["horse_id"] = str(horse.id)
        else:
            if task.status == ReceptionTask.Status.RESOLVED:
                raise DomainConflict("reception task is already resolved")
            if not task.linked_horse_id and not reason.strip():
                raise ValueError("resolve requires a linked horse or a resolution reason")
            task.status = ReceptionTask.Status.RESOLVED
            task.resolved_at = datetime.now(timezone.utc)
            details["reason"] = reason.strip()[:240]
        task.version += 1
        task.save(update_fields=["assigned_to", "linked_horse", "identity_status", "status",
                                 "resolved_at", "version", "updated_at"])
        ReceptionTaskHistory.objects.create(
            organization_id=organization_id, branch_id=branch_id,
            task=task, actor_id=actor_id, action=action,
            from_status=old_status, to_status=task.status, details=details,
        )
        AuditEvent.objects.create(
            organization_id=organization_id, branch_id=branch_id, actor_id=actor_id,
            action=f"reception.{action}", aggregate_type="reception_task", aggregate_id=task.id,
            aggregate_version=task.version, correlation_id=uuid4(), details=details,
        )
        append_clinical_event(organization_id=organization_id, branch_id=branch_id,
                              actor_id=actor_id, message_type="clinical.reception.task_changed.v1",
                              aggregate_id=task.id, aggregate_version=task.version,
                              correlation_id=uuid4(),
                              payload={"task_id": str(task.id), "source": task.source,
                                       "status": task.status})
        return task


def create_manual_reception_task(*, organization_id: UUID, branch_id: UUID, actor_id: UUID,
                                customer_name: str = "", phone: str = "", summary: str = "") -> ReceptionTask:
    with scoped_atomic(organization_id, branch_id):
        task = ReceptionTask.objects.create(
            organization_id=organization_id, branch_id=branch_id, created_by=actor_id,
            source="manual", customer_name=customer_name.strip()[:200],
            phone=phone.strip()[:32], summary=summary.strip(),
        )
        ReceptionTaskHistory.objects.create(
            organization_id=organization_id, branch_id=branch_id,
            task=task, actor_id=actor_id, action="created_manual", to_status=task.status,
        )
        AuditEvent.objects.create(
            organization_id=organization_id, branch_id=branch_id, actor_id=actor_id,
            action="reception.manual_created", aggregate_type="reception_task", aggregate_id=task.id,
            aggregate_version=task.version, correlation_id=uuid4(), details={},
        )
        append_clinical_event(organization_id=organization_id, branch_id=branch_id,
                              actor_id=actor_id, message_type="clinical.reception.created.v1",
                              aggregate_id=task.id, aggregate_version=task.version,
                              correlation_id=uuid4(),
                              payload={"task_id": str(task.id), "source": task.source,
                                       "status": task.status})
        return task


def create_visit(*, organization_id: UUID, branch_id: UUID, actor_id: UUID,
                 horse_id: UUID, reception_task_id: UUID | None = None) -> Visit:
    with scoped_atomic(organization_id, branch_id):
        horse = Horse.objects.filter(id=horse_id, organization_id=organization_id,
                                     branch_id=branch_id, merged_into__isnull=True).first()
        if horse is None:
            raise ValueError("horse is not available in the active scope")
        task = None
        if reception_task_id:
            task = ReceptionTask.objects.select_for_update().filter(
                id=reception_task_id, organization_id=organization_id, branch_id=branch_id,
            ).first()
            if task is None or task.linked_horse_id != horse.id:
                raise ValueError("reception task must be linked to the selected horse")
            if task.visit_id:
                return task.visit
        sequence, _ = BranchVisitSequence.objects.get_or_create(
            organization_id=organization_id, branch_id=branch_id,
        )
        sequence = BranchVisitSequence.objects.select_for_update().get(pk=sequence.pk)
        number = sequence.next_number
        sequence.next_number += 1
        sequence.save(update_fields=["next_number"])
        visit = Visit.objects.create(
            organization_id=organization_id, branch_id=branch_id, created_by=actor_id,
            horse=horse, slip_number=f"{number:06d}", status=Visit.Status.REGISTERED,
        )
        if task:
            task.visit = visit
            task.version += 1
            task.save(update_fields=["visit", "version", "updated_at"])
            ReceptionTaskHistory.objects.create(
                organization_id=organization_id, branch_id=branch_id, task=task,
                actor_id=actor_id, action="visit_registered", from_status=task.status,
                to_status=task.status, details={"visit_id": str(visit.id), "slip_number": visit.slip_number},
            )
        AuditEvent.objects.create(
            organization_id=organization_id, branch_id=branch_id, actor_id=actor_id,
            action="visit.registered", aggregate_type="visit", aggregate_id=visit.id,
            aggregate_version=visit.version, correlation_id=uuid4(),
            details={"horse_id": str(horse.id), "slip_number": visit.slip_number},
        )
        append_clinical_event(organization_id=organization_id, branch_id=branch_id,
                              actor_id=actor_id, message_type="clinical.visit.registered.v1",
                              aggregate_id=visit.id, aggregate_version=visit.version,
                              correlation_id=uuid4(),
                              payload={"visit_id": str(visit.id), "horse_id": str(horse.id),
                                       "slip_number": visit.slip_number, "status": visit.status})
        return visit


def record_arrival(*, visit_id: UUID, organization_id: UUID, branch_id: UUID,
                   actor_id: UUID, expected_version: int) -> Visit:
    with scoped_atomic(organization_id, branch_id):
        visit = Visit.objects.select_for_update().filter(
            id=visit_id, organization_id=organization_id, branch_id=branch_id,
        ).first()
        if visit is None:
            raise Visit.DoesNotExist
        if visit.version != expected_version:
            raise DomainConflict("visit changed; refresh and retry")
        if visit.arrived_at is None:
            if visit.status != Visit.Status.REGISTERED:
                raise DomainConflict("only a registered visit can record arrival")
            visit.arrived_at = datetime.now(timezone.utc)
            visit.arrival_recorded_by = actor_id
            visit.status = Visit.Status.ARRIVED
            visit.version += 1
            visit.save(update_fields=["arrived_at", "arrival_recorded_by", "status", "version", "updated_at"])
            AuditEvent.objects.create(
                organization_id=organization_id, branch_id=branch_id, actor_id=actor_id,
                action="visit.arrived", aggregate_type="visit", aggregate_id=visit.id,
                aggregate_version=visit.version, correlation_id=uuid4(),
                details={"slip_number": visit.slip_number},
            )
            append_clinical_event(organization_id=organization_id, branch_id=branch_id,
                                  actor_id=actor_id, message_type="clinical.visit.arrived.v1",
                                  aggregate_id=visit.id, aggregate_version=visit.version,
                                  correlation_id=uuid4(),
                                  payload={"visit_id": str(visit.id), "status": visit.status,
                                           "arrived_at": visit.arrived_at.isoformat()})
        return visit


def assign_visit(*, visit_id: UUID, organization_id: UUID, branch_id: UUID,
                 actor_id: UUID, practitioner_id: UUID, reason: str = "") -> VisitAssignment:
    with scoped_atomic(organization_id, branch_id):
        visit = Visit.objects.select_for_update().filter(
            id=visit_id, organization_id=organization_id, branch_id=branch_id,
        ).first()
        if visit is None:
            raise Visit.DoesNotExist
        assignment = VisitAssignment.objects.create(
            organization_id=organization_id, branch_id=branch_id, visit=visit,
            practitioner_id=practitioner_id, assigned_by=actor_id, reason=reason.strip()[:240],
        )
        visit.version += 1
        visit.status = Visit.Status.IN_PROGRESS
        visit.save(update_fields=["version", "status", "updated_at"])
        AuditEvent.objects.create(
            organization_id=organization_id, branch_id=branch_id, actor_id=actor_id,
            action="visit.assigned", aggregate_type="visit", aggregate_id=visit.id,
            aggregate_version=visit.version, correlation_id=uuid4(),
            details={"practitioner_id": str(practitioner_id), "assignment_id": str(assignment.id)},
        )
        append_clinical_event(organization_id=organization_id, branch_id=branch_id,
                              actor_id=actor_id, message_type="clinical.visit.assigned.v1",
                              aggregate_id=visit.id, aggregate_version=visit.version,
                              correlation_id=uuid4(),
                              payload={"visit_id": str(visit.id),
                                       "practitioner_id": str(practitioner_id),
                                       "assignment_id": str(assignment.id)})
        return assignment


def write_draft_note(*, visit_id: UUID, organization_id: UUID, branch_id: UUID,
                     actor_id: UUID, body: str, note_type: str = "general") -> ClinicalNote:
    if not body.strip():
        raise ValueError("draft note body is required")
    with scoped_atomic(organization_id, branch_id):
        visit = Visit.objects.select_for_update().filter(
            id=visit_id, organization_id=organization_id, branch_id=branch_id,
        ).first()
        if visit is None:
            raise Visit.DoesNotExist
        note = ClinicalNote.objects.create(
            organization_id=organization_id, branch_id=branch_id, visit=visit,
            note_type=note_type.strip()[:32] or "general", created_by=actor_id,
        )
        ClinicalNoteRevision.objects.create(
            organization_id=organization_id, branch_id=branch_id,
            note=note, revision=1, body=body, author_id=actor_id,
        )
        AuditEvent.objects.create(
            organization_id=organization_id, branch_id=branch_id, actor_id=actor_id,
            action="clinical_note.draft_created", aggregate_type="clinical_note", aggregate_id=note.id,
            aggregate_version=note.version, correlation_id=uuid4(),
            details={"visit_id": str(visit.id), "status": note.status},
        )
        append_clinical_event(organization_id=organization_id, branch_id=branch_id,
                              actor_id=actor_id, message_type="clinical.note.draft_saved.v1",
                              aggregate_id=note.id, aggregate_version=note.version,
                              correlation_id=uuid4(),
                              payload={"note_id": str(note.id), "visit_id": str(visit.id),
                                       "status": note.status, "revision": note.version})
        return note


def revise_draft_note(*, note_id: UUID, organization_id: UUID, branch_id: UUID,
                      actor_id: UUID, expected_version: int, body: str) -> ClinicalNote:
    if not body.strip():
        raise ValueError("draft note body is required")
    with scoped_atomic(organization_id, branch_id):
        note = ClinicalNote.objects.select_for_update().filter(
            id=note_id, organization_id=organization_id, branch_id=branch_id,
        ).first()
        if note is None:
            raise ClinicalNote.DoesNotExist
        if note.version != expected_version:
            raise DomainConflict("draft note changed; refresh and retry")
        if note.status != ClinicalNote.Status.DRAFT:
            raise DomainConflict("only draft notes can be revised")
        note.version += 1
        note.save(update_fields=["version", "updated_at"])
        ClinicalNoteRevision.objects.create(
            organization_id=organization_id, branch_id=branch_id,
            note=note, revision=note.version, body=body, author_id=actor_id,
        )
        AuditEvent.objects.create(
            organization_id=organization_id, branch_id=branch_id, actor_id=actor_id,
            action="clinical_note.draft_revised", aggregate_type="clinical_note", aggregate_id=note.id,
            aggregate_version=note.version, correlation_id=uuid4(), details={"status": note.status},
        )
        append_clinical_event(organization_id=organization_id, branch_id=branch_id,
                              actor_id=actor_id, message_type="clinical.note.draft_saved.v1",
                              aggregate_id=note.id, aggregate_version=note.version,
                              correlation_id=uuid4(),
                              payload={"note_id": str(note.id), "visit_id": str(note.visit_id),
                                       "status": note.status, "revision": note.version})
        return note
