"""Clinical service HTTP API; domain behavior lives in registry.workflows."""
from __future__ import annotations

from uuid import UUID

from django.db import connection
from django.utils.dateparse import parse_datetime
from rest_framework import status
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .errors import api_error
from .models import (
    Appointment, ClinicalNote, Horse, PhysicalMedicationIssue, Practitioner, Prescription,
    PrescriptionLine, ReceptionTask, ScheduleResource, Visit,
)
from .pharmacy import (
    create_charge_source, create_draft_prescription, record_administration,
    record_correction_intent, record_physical_issue, verify_prescription,
)
from .security import authorize, scoped_atomic
from .scheduling import confirm_appointment, mark_appointment_arrived, request_appointment
from .workflows import (
    DomainConflict,
    DuplicateIdentity,
    assign_visit,
    create_horse,
    create_manual_reception_task,
    create_visit,
    find_horse_candidates,
    record_arrival,
    revise_draft_note,
    search_horses,
    transition_reception_task,
    write_draft_note,
)


def _scope(request, action: str):
    scope = getattr(request, "moriton_scope", None)
    if scope is None or not authorize(
        scope, action=action, organization_id=scope.organization_id if scope else UUID(int=0),
        branch_id=scope.branch_id if scope else UUID(int=0),
        expected_policy_version=scope.policy_version if scope else -1,
    ):
        raise PermissionDenied("The active user is not authorized for this action.")
    return scope


def _uuid(value, field: str) -> UUID:
    try:
        return UUID(str(value))
    except (ValueError, TypeError, AttributeError) as exc:
        raise ValidationError({field: ["A valid UUID is required."]}) from exc


def _version(data) -> int:
    try:
        value = int(data.get("expected_version"))
    except (TypeError, ValueError) as exc:
        raise ValidationError({"expected_version": ["A positive integer is required."]}) from exc
    if value < 1:
        raise ValidationError({"expected_version": ["A positive integer is required."]})
    return value


def _horse_json(horse: Horse, reasons: list[str] | None = None) -> dict:
    value = {"id": str(horse.id), "name": horse.name, "tamga": horse.tamga,
             "breed": horse.breed, "version": horse.version}
    if reasons is not None:
        value["candidate_reasons"] = reasons
    return value


def _task_json(task: ReceptionTask) -> dict:
    return {"id": str(task.id), "source": task.source, "source_request_id": task.source_request_id,
            "status": task.status, "customer_name": task.customer_name, "phone": task.phone,
            "summary": task.summary, "identity_status": task.identity_status,
            "source_aggregate_version": task.source_aggregate_version,
            "assigned_to": str(task.assigned_to) if task.assigned_to else None,
            "horse_id": str(task.linked_horse_id) if task.linked_horse_id else None,
            "visit_id": str(task.visit_id) if task.visit_id else None,
            "requested_at": task.requested_at.isoformat() if task.requested_at else None,
            "version": task.version}


def _visit_json(visit: Visit) -> dict:
    assignments = visit.assignments.order_by("-assigned_at")
    latest = assignments.first()
    current_note = visit.notes.order_by("-created_at").first()
    latest_revision = (current_note.revisions.order_by("-revision").first() if current_note else None)
    return {"id": str(visit.id), "horse_id": str(visit.horse_id), "slip_number": visit.slip_number,
            "status": visit.status, "arrived_at": visit.arrived_at.isoformat() if visit.arrived_at else None,
            "arrival_recorded_by": str(visit.arrival_recorded_by) if visit.arrival_recorded_by else None,
            "assigned_practitioner_id": str(latest.practitioner_id) if latest else None,
            "draft_note": ({"id": str(current_note.id), "status": current_note.status,
                            "version": current_note.version, "body": latest_revision.body if latest_revision else ""}
                           if current_note else None),
            "version": visit.version}


def _prescription_json(prescription: Prescription) -> dict:
    lines = []
    for line in prescription.lines.order_by("created_at", "id"):
        issues = [{"id": str(issue.id), "quantity": str(issue.quantity), "unit": issue.unit,
                   "issued_at": issue.issued_at.isoformat(),
                   "external_posting_state": "NOT_SUBMITTED",
                   "administrations": [{"id": str(row.id), "quantity": str(row.dose_quantity),
                                        "unit": row.unit, "administered_at": row.administered_at.isoformat(),
                                        "outcome": row.outcome}
                                       for row in issue.administrations.order_by("administered_at", "id")]}
                  for issue in line.physical_issues.order_by("issued_at", "id")]
        lines.append({"id": str(line.id), "medication_name": line.medication_name,
                      "prescribed_quantity": str(line.prescribed_quantity), "unit": line.unit,
                      "instructions": line.instructions, "physical_issues": issues})
    return {"id": str(prescription.id), "visit_id": str(prescription.visit_id),
            "status": prescription.status, "version": prescription.version,
            "verified_by": str(prescription.verified_by) if prescription.verified_by else None,
            "verified_at": prescription.verified_at.isoformat() if prescription.verified_at else None,
            "lines": lines}


class PharmacyPrescriptionListView(APIView):
    def get(self, request):
        scope = _scope(request, "pharmacy.read")
        with scoped_atomic(scope.organization_id, scope.branch_id):
            prescriptions = Prescription.objects.filter(
                organization_id=scope.organization_id, branch_id=scope.branch_id,
            ).select_related("visit").order_by("-created_at")[:100]
            items = [_prescription_json(item) for item in prescriptions]
        return Response({"items": items, "next": None})


class VisitPrescriptionCreateView(APIView):
    def post(self, request, visit_id):
        scope = _scope(request, "pharmacy.prescribe")
        try:
            prescription = create_draft_prescription(
                visit_id=visit_id, organization_id=scope.organization_id,
                branch_id=scope.branch_id, actor_id=scope.actor_id,
                medication_name=str(request.data.get("medication_name", "")),
                quantity=request.data.get("quantity", ""), unit=str(request.data.get("unit", "")),
                instructions=str(request.data.get("instructions", "")),
            )
        except Visit.DoesNotExist as exc:
            raise NotFound("Visit not found.") from exc
        except ValueError as exc:
            raise ValidationError({"detail": [str(exc)]}) from exc
        with scoped_atomic(scope.organization_id, scope.branch_id):
            prescription = Prescription.objects.prefetch_related("lines__physical_issues__administrations").get(
                pk=prescription.pk, organization_id=scope.organization_id, branch_id=scope.branch_id,
            )
        return Response(_prescription_json(prescription), status=status.HTTP_201_CREATED)


class PrescriptionVerifyView(APIView):
    def post(self, request, prescription_id):
        scope = _scope(request, "pharmacy.verify")
        try:
            prescription = verify_prescription(
                prescription_id=prescription_id, organization_id=scope.organization_id,
                branch_id=scope.branch_id, actor_id=scope.actor_id,
                expected_version=_version(request.data),
            )
        except Prescription.DoesNotExist as exc:
            raise NotFound("Prescription not found.") from exc
        except ValueError as exc:
            return api_error(request, code="prescription_conflict", message=str(exc), status_code=409)
        with scoped_atomic(scope.organization_id, scope.branch_id):
            prescription = Prescription.objects.prefetch_related("lines__physical_issues__administrations").get(
                pk=prescription.pk, organization_id=scope.organization_id, branch_id=scope.branch_id,
            )
        return Response(_prescription_json(prescription))


class PhysicalIssueCreateView(APIView):
    def post(self, request, line_id):
        scope = _scope(request, "pharmacy.dispense")
        try:
            issue = record_physical_issue(
                line_id=line_id, organization_id=scope.organization_id,
                branch_id=scope.branch_id, actor_id=scope.actor_id,
                quantity=request.data.get("quantity", ""), unit=str(request.data.get("unit", "")),
            )
        except PrescriptionLine.DoesNotExist as exc:
            raise NotFound("Prescription line not found.") from exc
        except ValueError as exc:
            return api_error(request, code="physical_issue_conflict", message=str(exc), status_code=409)
        return Response({"physical_issue_id": str(issue.id), "prescription_line_id": str(issue.prescription_line_id),
                         "quantity": str(issue.quantity), "unit": issue.unit,
                         "external_posting_state": "NOT_SUBMITTED",
                         "stock_posted_to_odoo": False}, status=status.HTTP_201_CREATED)


class MedicationAdministrationCreateView(APIView):
    def post(self, request, issue_id):
        scope = _scope(request, "pharmacy.administer")
        try:
            administration = record_administration(
                issue_id=issue_id, organization_id=scope.organization_id,
                branch_id=scope.branch_id, actor_id=scope.actor_id,
                quantity=request.data.get("quantity", ""),
                outcome=str(request.data.get("outcome", "GIVEN")),
                note=str(request.data.get("note", "")),
            )
        except PhysicalMedicationIssue.DoesNotExist as exc:
            raise NotFound("Physical issue not found.") from exc
        except ValueError as exc:
            return api_error(request, code="administration_conflict", message=str(exc), status_code=409)
        return Response({"id": str(administration.id), "physical_issue_id": str(administration.physical_issue_id),
                         "dose_quantity": str(administration.dose_quantity), "unit": administration.unit,
                         "administered_at": administration.administered_at.isoformat(),
                         "stock_movement_created": False}, status=status.HTTP_201_CREATED)


class MedicationCorrectionIntentCreateView(APIView):
    def post(self, request, prescription_id):
        scope = _scope(request, "pharmacy.correction.request")
        original_issue_id = request.data.get("original_issue_id")
        try:
            intent = record_correction_intent(
                prescription_id=prescription_id, organization_id=scope.organization_id,
                branch_id=scope.branch_id, actor_id=scope.actor_id,
                kind=str(request.data.get("kind", "")), reason=str(request.data.get("reason", "")),
                original_issue_id=_uuid(original_issue_id, "original_issue_id") if original_issue_id else None,
                quantity=request.data.get("quantity"), unit=str(request.data.get("unit", "")),
            )
        except Prescription.DoesNotExist as exc:
            raise NotFound("Prescription not found.") from exc
        except (PhysicalMedicationIssue.DoesNotExist, ValueError) as exc:
            raise ValidationError({"detail": [str(exc)]}) from exc
        return Response({"id": str(intent.id), "kind": intent.kind, "state": intent.state,
                         "effect_applied": False, "original_issue_id": str(intent.original_issue_id) if intent.original_issue_id else None},
                        status=status.HTTP_202_ACCEPTED)


class ChargeSourceCreateView(APIView):
    def post(self, request):
        scope = _scope(request, "billing.source.record")
        try:
            source_version = int(request.data.get("source_version"))
        except (TypeError, ValueError) as exc:
            raise ValidationError({"source_version": ["A positive integer is required."]}) from exc
        if source_version < 1:
            raise ValidationError({"source_version": ["A positive integer is required."]})
        source = create_charge_source(
            organization_id=scope.organization_id, branch_id=scope.branch_id,
            actor_id=scope.actor_id,
            source_event_id=_uuid(request.data.get("source_event_id"), "source_event_id"),
            source_version=source_version, charge_type=str(request.data.get("charge_type", "")),
            quantity=request.data.get("quantity", ""), unit_price=request.data.get("unit_price", ""),
            currency=str(request.data.get("currency", "")),
        )
        return Response({"id": str(source.id), "source_event_id": str(source.source_event_id),
                         "source_version": source.source_version, "charge_type": source.charge_type,
                         "billing_state": source.billing_state, "invoice_created": False},
                        status=status.HTTP_201_CREATED)


def _appointment_json(appointment: Appointment) -> dict:
    return {"id": str(appointment.id), "horse_id": str(appointment.horse_id),
            "visit_id": str(appointment.visit_id) if appointment.visit_id else None,
            "status": appointment.status, "starts_at": appointment.starts_at.isoformat(),
            "ends_at": appointment.ends_at.isoformat(),
            "confirmed_at": appointment.confirmed_at.isoformat() if appointment.confirmed_at else None,
            "confirmed_by": str(appointment.confirmed_by) if appointment.confirmed_by else None,
            "arrived_at": appointment.arrived_at.isoformat() if appointment.arrived_at else None,
            "arrival_recorded_by": str(appointment.arrival_recorded_by) if appointment.arrival_recorded_by else None,
            "version": appointment.version,
            "visit_created": False, "clinical_clearance_granted": False}


class AppointmentActionView(APIView):
    actions = {"confirm": ("appointment.confirm", confirm_appointment),
               "arrive": ("appointment.arrive", mark_appointment_arrived)}

    def post(self, request, appointment_id):
        action = str(request.data.get("action", ""))
        configured = self.actions.get(action)
        if configured is None:
            raise ValidationError({"action": ["Use confirm or arrive."]})
        permission, transition = configured
        scope = _scope(request, permission)
        try:
            appointment = transition(
                appointment_id=appointment_id, organization_id=scope.organization_id,
                branch_id=scope.branch_id, actor_id=scope.actor_id,
                expected_version=_version(request.data),
            )
        except Appointment.DoesNotExist as exc:
            raise NotFound("Appointment not found.") from exc
        except ValueError as exc:
            return api_error(request, code="appointment_conflict", message=str(exc), status_code=409)
        return Response(_appointment_json(appointment))


class AppointmentRequestView(APIView):
    def post(self, request):
        scope = _scope(request, "appointment.request")
        starts_at = parse_datetime(str(request.data.get("starts_at", "")))
        ends_at = parse_datetime(str(request.data.get("ends_at", "")))
        if starts_at is None or ends_at is None:
            raise ValidationError({"starts_at": ["Timezone-aware ISO 8601 timestamps are required."],
                                   "ends_at": ["Timezone-aware ISO 8601 timestamps are required."]})
        if starts_at.utcoffset() is None or ends_at.utcoffset() is None:
            raise ValidationError({"starts_at": ["Timestamp must include a timezone offset."],
                                   "ends_at": ["Timestamp must include a timezone offset."]})
        try:
            appointment = request_appointment(
                organization_id=scope.organization_id, branch_id=scope.branch_id,
                actor_id=scope.actor_id, horse_id=_uuid(request.data.get("horse_id"), "horse_id"),
                starts_at=starts_at, ends_at=ends_at,
                practitioner_id=_uuid(request.data["practitioner_id"], "practitioner_id") if request.data.get("practitioner_id") else None,
                resource_id=_uuid(request.data["resource_id"], "resource_id") if request.data.get("resource_id") else None,
            )
        except (Horse.DoesNotExist, Practitioner.DoesNotExist, ScheduleResource.DoesNotExist) as exc:
            raise NotFound("Horse, practitioner or resource not found in this organization and branch.") from exc
        except ValueError as exc:
            return api_error(request, code="appointment_conflict", message=str(exc), status_code=409)
        return Response(_appointment_json(appointment), status=status.HTTP_201_CREATED)


class HealthView(APIView):
    authentication_classes: list = []
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"status": "ok", "service": "clinical"})


class ReadyView(APIView):
    authentication_classes: list = []
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            connection.ensure_connection()
        except Exception:
            return api_error(request, code="database_unavailable", message="Clinical database is unavailable", status_code=503, retryable=True)
        return Response({"status": "ready", "service": "clinical"})


class HorseListCreateView(APIView):
    def get(self, request):
        scope = _scope(request, "registry.read")
        try:
            limit = min(max(int(request.query_params.get("limit", 25)), 1), 100)
        except ValueError as exc:
            raise ValidationError({"limit": ["Must be an integer between 1 and 100."]}) from exc
        query = request.query_params.get("q", "").strip()[:120]
        with scoped_atomic(scope.organization_id, scope.branch_id):
            horses = search_horses(organization_id=scope.organization_id,
                                   branch_id=scope.branch_id, query=query, limit=limit)
            items = [_horse_json(horse) for horse in horses]
        return Response({"items": items, "next": None})

    def post(self, request):
        scope = _scope(request, "registry.create")
        data = request.data
        name = str(data.get("name", "")).strip()
        if not name:
            raise ValidationError({"name": ["This field is required."]})
        identifiers = data.get("identifiers", [])
        if not isinstance(identifiers, list) or any(not isinstance(row, dict) for row in identifiers):
            raise ValidationError({"identifiers": ["Must be a list of identifier objects."]})
        for row in identifiers:
            if not str(row.get("type", "")).strip() or not str(row.get("value", "")).strip():
                raise ValidationError({"identifiers": ["Each identifier requires type and value."]})
        birth_year = data.get("birth_year")
        if birth_year is not None:
            try:
                birth_year = int(birth_year)
            except (TypeError, ValueError) as exc:
                raise ValidationError({"birth_year": ["Must be a year."]}) from exc
        with scoped_atomic(scope.organization_id, scope.branch_id):
            try:
                horse = create_horse(
                    organization_id=scope.organization_id, branch_id=scope.branch_id,
                    actor_id=scope.actor_id, name=name,
                    breed=str(data.get("breed", "")), tamga=str(data.get("tamga", "")),
                    identifiers=identifiers, birth_year=birth_year,
                )
            except DuplicateIdentity:
                candidates = find_horse_candidates(organization_id=scope.organization_id,
                                                   branch_id=scope.branch_id, name=name,
                                                   tamga=str(data.get("tamga", "")), identifiers=identifiers)
                return Response({"error": {"code": "duplicate_candidate",
                                            "message": "Possible duplicates require staff review.",
                                            "candidates": [_horse_json(horse, reasons) for horse, reasons in candidates]}},
                                status=status.HTTP_409_CONFLICT)
        return Response(_horse_json(horse), status=status.HTTP_201_CREATED)


class ReceptionTaskListCreateView(APIView):
    def get(self, request):
        scope = _scope(request, "reception.read")
        with scoped_atomic(scope.organization_id, scope.branch_id):
            tasks = ReceptionTask.objects.filter(
                organization_id=scope.organization_id, branch_id=scope.branch_id,
            ).order_by("-created_at")[:100]
            items = [_task_json(task) for task in tasks]
        return Response({"items": items, "next": None})

    def post(self, request):
        scope = _scope(request, "reception.create")
        data = request.data
        with scoped_atomic(scope.organization_id, scope.branch_id):
            task = create_manual_reception_task(
                organization_id=scope.organization_id, branch_id=scope.branch_id,
                actor_id=scope.actor_id, customer_name=str(data.get("customer_name", "")),
                phone=str(data.get("phone", "")), summary=str(data.get("summary", "")),
            )
        return Response(_task_json(task), status=status.HTTP_201_CREATED)


class ReceptionTaskActionView(APIView):
    ACTION_PERMISSIONS = {"assign": "reception.assign", "link": "reception.link", "resolve": "reception.resolve"}

    def post(self, request, task_id):
        data = request.data
        action = str(data.get("action", ""))
        permission = self.ACTION_PERMISSIONS.get(action)
        if permission is None:
            raise ValidationError({"action": ["Action must be assign, link, or resolve."]})
        scope = _scope(request, permission)
        assigned_to = _uuid(data.get("assigned_to"), "assigned_to") if action == "assign" else None
        horse_id = _uuid(data.get("horse_id"), "horse_id") if action == "link" else None
        try:
            with scoped_atomic(scope.organization_id, scope.branch_id):
                task = transition_reception_task(
                    task_id=task_id, organization_id=scope.organization_id,
                    branch_id=scope.branch_id, actor_id=scope.actor_id,
                    action=action, expected_version=_version(data), assigned_to=assigned_to,
                    horse_id=horse_id, reason=str(data.get("reason", "")),
                )
        except ReceptionTask.DoesNotExist as exc:
            raise NotFound("Reception task not found.") from exc
        except DomainConflict as exc:
            return api_error(request, code="state_conflict", message=str(exc), status_code=409)
        except ValueError as exc:
            raise ValidationError({"detail": [str(exc)]}) from exc
        return Response(_task_json(task))


class VisitListCreateView(APIView):
    def get(self, request):
        scope = _scope(request, "visit.read")
        with scoped_atomic(scope.organization_id, scope.branch_id):
            visits = Visit.objects.filter(organization_id=scope.organization_id,
                                          branch_id=scope.branch_id).order_by("-created_at")[:100]
            items = [_visit_json(visit) for visit in visits]
        return Response({"items": items, "next": None})

    def post(self, request):
        scope = _scope(request, "visit.create")
        horse_id = _uuid(request.data.get("horse_id"), "horse_id")
        task_id = _uuid(request.data.get("reception_task_id"), "reception_task_id") if request.data.get("reception_task_id") else None
        try:
            visit = create_visit(organization_id=scope.organization_id, branch_id=scope.branch_id,
                                 actor_id=scope.actor_id, horse_id=horse_id,
                                 reception_task_id=task_id)
        except ValueError as exc:
            raise ValidationError({"detail": [str(exc)]}) from exc
        return Response(_visit_json(visit), status=status.HTTP_201_CREATED)


class VisitArrivalView(APIView):
    def post(self, request, visit_id):
        scope = _scope(request, "visit.arrive")
        try:
            visit = record_arrival(
                visit_id=visit_id, organization_id=scope.organization_id,
                branch_id=scope.branch_id, actor_id=scope.actor_id,
                expected_version=_version(request.data),
            )
        except Visit.DoesNotExist as exc:
            raise NotFound("Visit not found.") from exc
        except DomainConflict as exc:
            return api_error(request, code="state_conflict", message=str(exc), status_code=409)
        return Response(_visit_json(visit))


class VisitAssignmentView(APIView):
    def post(self, request, visit_id):
        scope = _scope(request, "visit.assign")
        practitioner_id = _uuid(request.data.get("practitioner_id"), "practitioner_id")
        try:
            assignment = assign_visit(
                visit_id=visit_id, organization_id=scope.organization_id,
                branch_id=scope.branch_id, actor_id=scope.actor_id,
                practitioner_id=practitioner_id, reason=str(request.data.get("reason", "")),
            )
        except Visit.DoesNotExist as exc:
            raise NotFound("Visit not found.") from exc
        return Response({"id": str(assignment.id), "visit_id": str(assignment.visit_id),
                         "practitioner_id": str(assignment.practitioner_id),
                         "assigned_at": assignment.assigned_at.isoformat()}, status=status.HTTP_201_CREATED)


class VisitDraftNoteView(APIView):
    def post(self, request, visit_id):
        scope = _scope(request, "clinical_note.draft.write")
        try:
            note = write_draft_note(
                visit_id=visit_id, organization_id=scope.organization_id,
                branch_id=scope.branch_id, actor_id=scope.actor_id,
                body=str(request.data.get("body", "")),
                note_type=str(request.data.get("note_type", "general")),
            )
        except Visit.DoesNotExist as exc:
            raise NotFound("Visit not found.") from exc
        except ValueError as exc:
            raise ValidationError({"body": [str(exc)]}) from exc
        revision = note.revisions.get(revision=note.version)
        return Response({"id": str(note.id), "visit_id": str(note.visit_id), "status": note.status,
                         "version": note.version, "body": revision.body}, status=status.HTTP_201_CREATED)


class ClinicalNoteRevisionView(APIView):
    def post(self, request, note_id):
        scope = _scope(request, "clinical_note.draft.write")
        try:
            note = revise_draft_note(
                note_id=note_id, organization_id=scope.organization_id,
                branch_id=scope.branch_id, actor_id=scope.actor_id,
                expected_version=_version(request.data), body=str(request.data.get("body", "")),
            )
        except ClinicalNote.DoesNotExist as exc:
            raise NotFound("Clinical note not found.") from exc
        except DomainConflict as exc:
            return api_error(request, code="state_conflict", message=str(exc), status_code=409)
        except ValueError as exc:
            raise ValidationError({"body": [str(exc)]}) from exc
        revision = note.revisions.get(revision=note.version)
        return Response({"id": str(note.id), "status": note.status,
                         "version": note.version, "body": revision.body})
