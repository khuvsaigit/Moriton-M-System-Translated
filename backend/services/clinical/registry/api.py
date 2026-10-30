"""Clinical service HTTP API; domain behavior lives in registry.workflows."""
from __future__ import annotations

from uuid import UUID

from django.db import connection
from rest_framework import status
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .errors import api_error
from .models import ClinicalNote, Horse, ReceptionTask, Visit
from .security import authorize, scoped_atomic
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
