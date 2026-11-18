"""Scoped R1-R3 wiring that does not assume client-specific business policies."""
from django.conf import settings
from django.db import IntegrityError
from django.db.models import Q
from rest_framework import serializers
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from .api import _appointment_json, _scope, _uuid, _version
from .errors import api_error
from .models import (
    Appointment, AuditEvent, BranchProfile, Contact, Horse, HorsePartyRole,
    Practitioner, PractitionerQualification, PractitionerShift, ScheduleResource,
)
from .security import scoped_atomic
from .workflows import create_contact, set_horse_party_role


def require_local_prototype():
    """Client-dependent writes remain unavailable in staging/production."""
    if not (settings.DEBUG and settings.MORITON_LOCAL_AUTH_ENABLED):
        raise PermissionDenied("This prototype requires an opted-in local environment; client policy is pending.")


class WindowInput(serializers.Serializer):
    # Require an offset rather than interpreting an unspecified source timezone.
    starts_at = serializers.CharField(max_length=80)
    ends_at = serializers.CharField(max_length=80)

    def validate(self, data):
        from django.utils.dateparse import parse_datetime
        from datetime import timedelta
        for key in ("starts_at", "ends_at"):
            try:
                value = parse_datetime(data[key])
            except (ValueError, OverflowError):
                value = None
            if value is None or value.utcoffset() is None:
                raise serializers.ValidationError({key: "Use an ISO timestamp with an explicit timezone offset."})
            data[key] = value
        if data["ends_at"] <= data["starts_at"]:
            raise serializers.ValidationError("End must be later than start.")
        if data["ends_at"] - data["starts_at"] > timedelta(days=31):
            raise serializers.ValidationError("Read windows are limited to 31 days; narrow the range.")
        return data


def read_window(data):
    value = WindowInput(data=data)
    value.is_valid(raise_exception=True)
    return value.validated_data


class CurrentSessionView(APIView):
    def get(self, request):
        scope = request.moriton_scope
        return Response({"actor_id": str(scope.actor_id), "organization_id": str(scope.organization_id),
                         "branch_id": str(scope.branch_id), "permissions": sorted(scope.permissions),
                         "policy_version": scope.policy_version,
                         "expires_at": scope.expires_at.isoformat() if scope.expires_at else None,
                         "local_prototype": settings.DEBUG and settings.MORITON_LOCAL_AUTH_ENABLED})

    def delete(self, request):
        request.session.flush()
        return Response(status=204)


class BranchInput(serializers.Serializer):
    display_name = serializers.CharField(max_length=160)
    code = serializers.CharField(max_length=32)


def branch_json(row):
    return {"id": str(row.id), "branch_id": str(row.branch_id), "display_name": row.display_name,
            "code": row.code, "version": row.version}


class CurrentBranchView(APIView):
    """Only current-branch metadata; does not create memberships or switch scope."""
    def get(self, request):
        scope = _scope(request, "branch.read")
        with scoped_atomic(scope.organization_id, scope.branch_id):
            row = BranchProfile.objects.filter(organization_id=scope.organization_id,
                                               branch_id=scope.branch_id).first()
            return Response({"branch_id": str(scope.branch_id), "profile": branch_json(row) if row else None})

    def post(self, request):
        scope = _scope(request, "branch.manage")
        require_local_prototype()
        value = BranchInput(data=request.data)
        value.is_valid(raise_exception=True)
        try:
            with scoped_atomic(scope.organization_id, scope.branch_id):
                row = BranchProfile.objects.create(organization_id=scope.organization_id,
                    branch_id=scope.branch_id, created_by=scope.actor_id, **value.validated_data)
                AuditEvent.objects.create(organization_id=scope.organization_id, branch_id=scope.branch_id,
                    actor_id=scope.actor_id, action="branch.profile.created", aggregate_type="branch_profile",
                    aggregate_id=row.id, aggregate_version=row.version, correlation_id=row.id,
                    details=value.validated_data)
        except IntegrityError:
            return api_error(request, code="branch_profile_conflict", message="Profile already exists.", status_code=409)
        return Response(branch_json(row), status=201)

    def patch(self, request):
        scope = _scope(request, "branch.manage")
        require_local_prototype()
        value = BranchInput(data=request.data)
        value.is_valid(raise_exception=True)
        with scoped_atomic(scope.organization_id, scope.branch_id):
            row = BranchProfile.objects.select_for_update().filter(organization_id=scope.organization_id,
                                                                   branch_id=scope.branch_id).first()
            if row is None:
                raise NotFound("Branch profile not found.")
            if row.version != _version(request.data):
                return api_error(request, code="branch_profile_conflict", message="Profile version conflict.", status_code=409)
            before = branch_json(row)
            row.display_name, row.code = value.validated_data["display_name"], value.validated_data["code"]
            row.version += 1
            row.save(update_fields=["display_name", "code", "version", "updated_at"])
            AuditEvent.objects.create(organization_id=scope.organization_id, branch_id=scope.branch_id,
                actor_id=scope.actor_id, action="branch.profile.updated", aggregate_type="branch_profile",
                aggregate_id=row.id, aggregate_version=row.version, correlation_id=row.id,
                details={"before": before, "after": branch_json(row)})
            return Response(branch_json(row))


class ContactInput(serializers.Serializer):
    display_name = serializers.CharField(max_length=200)
    phone = serializers.CharField(max_length=32, allow_blank=True, default="")
    email = serializers.EmailField(allow_blank=True, default="")


def contact_json(row):
    return {"id": str(row.id), "display_name": row.display_name,
            "phone": row.normalized_phone, "email": row.email, "version": row.version}


class ContactListView(APIView):
    def get(self, request):
        scope = _scope(request, "contact.read")
        query = request.query_params.get("q", "").strip()[:120]
        with scoped_atomic(scope.organization_id, scope.branch_id):
            rows = Contact.objects.filter(organization_id=scope.organization_id, branch_id=scope.branch_id)
            if query:
                rows = rows.filter(Q(display_name__icontains=query) | Q(normalized_phone__icontains=query))
            return Response({"items": [contact_json(row) for row in rows.order_by("display_name", "id")[:100]],
                             "matching_requires_staff_review": True})

    def post(self, request):
        scope = _scope(request, "contact.create")
        require_local_prototype()
        value = ContactInput(data=request.data)
        value.is_valid(raise_exception=True)
        with scoped_atomic(scope.organization_id, scope.branch_id):
            row = create_contact(organization_id=scope.organization_id, branch_id=scope.branch_id,
                                 actor_id=scope.actor_id, **value.validated_data)
            AuditEvent.objects.create(organization_id=scope.organization_id, branch_id=scope.branch_id,
                actor_id=scope.actor_id, action="contact.created", aggregate_type="contact",
                aggregate_id=row.id, aggregate_version=row.version, correlation_id=row.id,
                details={"display_name": row.display_name})
            return Response(contact_json(row), status=201)


class PartyInput(serializers.Serializer):
    contact_id = serializers.UUIDField()
    role = serializers.ChoiceField(choices=["owner", "representative", "payer"])
    valid_from = serializers.CharField(max_length=80)
    valid_to = serializers.CharField(max_length=80, allow_null=True, required=False)


class HorsePartiesView(APIView):
    def get(self, request, horse_id):
        scope = _scope(request, "contact.read")
        with scoped_atomic(scope.organization_id, scope.branch_id):
            if not Horse.objects.filter(pk=horse_id, organization_id=scope.organization_id,
                                        branch_id=scope.branch_id).exists():
                raise NotFound("Horse not found.")
            rows = HorsePartyRole.objects.filter(horse_id=horse_id, organization_id=scope.organization_id,
                                                 branch_id=scope.branch_id).select_related("contact")
            return Response({"items": [{"id": str(row.id), "role": row.role,
                "contact": contact_json(row.contact), "valid_from": row.valid_from.isoformat(),
                "valid_to": row.valid_to.isoformat() if row.valid_to else None}
                for row in rows.order_by("valid_from", "id")[:100]]})

    def post(self, request, horse_id):
        scope = _scope(request, "party.create")
        require_local_prototype()
        value = PartyInput(data=request.data)
        value.is_valid(raise_exception=True)
        from django.utils.dateparse import parse_datetime
        dates = {}
        for key in ("valid_from", "valid_to"):
            raw = value.validated_data.get(key)
            try:
                parsed = parse_datetime(raw) if raw else None
            except (ValueError, OverflowError):
                parsed = None
            if (key == "valid_from" or raw) and (parsed is None or parsed.utcoffset() is None):
                raise ValidationError({key: "Use an ISO timestamp with an explicit timezone offset."})
            dates[key] = parsed
        with scoped_atomic(scope.organization_id, scope.branch_id):
            horse = Horse.objects.filter(pk=horse_id, organization_id=scope.organization_id,
                                         branch_id=scope.branch_id).first()
            contact = Contact.objects.filter(pk=value.validated_data["contact_id"],
                organization_id=scope.organization_id, branch_id=scope.branch_id).first()
            if horse is None or contact is None:
                raise NotFound("Horse or contact not found in this branch.")
            try:
                row = set_horse_party_role(organization_id=scope.organization_id, branch_id=scope.branch_id,
                    actor_id=scope.actor_id, horse=horse, contact=contact,
                    role=value.validated_data["role"], **dates)
            except ValueError as exc:
                raise ValidationError({"detail": str(exc)}) from exc
            AuditEvent.objects.create(organization_id=scope.organization_id, branch_id=scope.branch_id,
                actor_id=scope.actor_id, action="horse.party.recorded", aggregate_type="horse",
                aggregate_id=horse.id, aggregate_version=horse.version, correlation_id=row.id,
                details={"party_role_id": str(row.id), "contact_id": str(contact.id), "role": row.role,
                         "valid_from": row.valid_from.isoformat(),
                         "valid_to": row.valid_to.isoformat() if row.valid_to else None})
            return Response({"id": str(row.id), "role": row.role, "horse_id": str(horse.id),
                             "contact_id": str(contact.id)}, status=201)


class AuditListView(APIView):
    def get(self, request):
        scope = _scope(request, "audit.read")
        try:
            limit = int(request.query_params.get("limit", 50))
        except (ValueError, TypeError) as exc:
            raise ValidationError({"limit": "Use an integer between 1 and 100."}) from exc
        if not 1 <= limit <= 100:
            raise ValidationError({"limit": "Use an integer between 1 and 100."})
        with scoped_atomic(scope.organization_id, scope.branch_id):
            base = AuditEvent.objects.filter(organization_id=scope.organization_id, branch_id=scope.branch_id)
            rows = base
            for key in ("aggregate_type", "action"):
                if request.query_params.get(key):
                    rows = rows.filter(**{key: request.query_params[key]})
            if request.query_params.get("aggregate_id"):
                rows = rows.filter(aggregate_id=_uuid(request.query_params["aggregate_id"], "aggregate_id"))
            if request.query_params.get("cursor"):
                anchor = base.filter(pk=_uuid(request.query_params["cursor"], "cursor")).first()
                if anchor is None:
                    raise NotFound("Audit cursor not found in this branch.")
                rows = rows.filter(Q(occurred_at__lt=anchor.occurred_at) |
                    Q(occurred_at=anchor.occurred_at, id__lt=anchor.id))
            page = list(rows.order_by("-occurred_at", "-id")[:limit + 1])
            return Response({"items": [{"id": str(row.id), "action": row.action,
                "aggregate_type": row.aggregate_type, "aggregate_id": str(row.aggregate_id),
                "aggregate_version": row.aggregate_version, "actor_id": str(row.actor_id) if row.actor_id else None,
                "occurred_at": row.occurred_at.isoformat(), "details": row.details} for row in page[:limit]],
                "next_cursor": str(page[limit - 1].id) if len(page) > limit else None})


class AppointmentListView(APIView):
    def get(self, request):
        scope = _scope(request, "appointment.read")
        window = read_window(request.query_params)
        with scoped_atomic(scope.organization_id, scope.branch_id):
            rows = Appointment.objects.filter(organization_id=scope.organization_id, branch_id=scope.branch_id,
                starts_at__lt=window["ends_at"], ends_at__gt=window["starts_at"])
            return Response({"items": [_appointment_json(row) for row in rows.order_by("starts_at", "id")[:200]],
                             "limit": 200})


class RosterReadView(APIView):
    def get(self, request):
        scope = _scope(request, "roster.read")
        window = read_window(request.query_params)
        scope_filter = {"organization_id": scope.organization_id, "branch_id": scope.branch_id}
        with scoped_atomic(scope.organization_id, scope.branch_id):
            people = list(Practitioner.objects.filter(**scope_filter).order_by("display_name", "id")[:100])
            ids = [person.id for person in people]
            shifts = PractitionerShift.objects.filter(**scope_filter, practitioner_id__in=ids,
                starts_at__lt=window["ends_at"], ends_at__gt=window["starts_at"])
            quals = PractitionerQualification.objects.filter(**scope_filter, practitioner_id__in=ids)
            resources = ScheduleResource.objects.filter(**scope_filter).order_by("name", "id")[:100]
            return Response({"practitioners": [{"id": str(row.id), "display_name": row.display_name,
                "active": row.active} for row in people],
                "shifts": [{"id": str(row.id), "practitioner_id": str(row.practitioner_id),
                    "starts_at": row.starts_at.isoformat(), "ends_at": row.ends_at.isoformat(),
                    "status": row.status} for row in shifts.order_by("starts_at", "id")[:500]],
                "qualifications": [{"practitioner_id": str(row.practitioner_id), "code": row.code,
                    "valid_from": row.valid_from.isoformat(),
                    "valid_until": row.valid_until.isoformat() if row.valid_until else None}
                    for row in quals.order_by("practitioner_id", "code", "id")[:500]],
                "resources": [{"id": str(row.id), "name": row.name, "active": row.active}
                    for row in resources],
                "limits": {"practitioners": 100, "shifts": 500, "qualifications": 500, "resources": 100},
                "client_rules_pending": True})
