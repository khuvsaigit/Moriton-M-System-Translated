from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny
from django.db.models import Q
from django.db import connection
from typing import Any
from .models import Horse, HorseIdentifier
from .security import scoped_atomic
from .errors import api_error
from .identity import HasHorseRegistryPermission

class HealthView(APIView):
    authentication_classes: list[Any] = []
    permission_classes = [AllowAny]
    def get(self, request): return Response({"status": "ok", "service": "clinical"})

class ReadyView(APIView):
    authentication_classes: list[Any] = []
    permission_classes = [AllowAny]
    def get(self, request):
        try:
            connection.ensure_connection()
        except Exception:
            return api_error(request, code="database_unavailable", message="Clinical database is unavailable", status_code=503, retryable=True)
        return Response({"status": "ready", "service": "clinical"})

class HorseListCreateView(APIView):
    """Registry API; requests require an active bridge-supplied membership scope."""
    permission_classes = [HasHorseRegistryPermission]
    def get(self, request):
        scope = getattr(request, "moriton_scope", None)
        if not scope: return api_error(request, code="scope_required", message="Organization and branch scope required", status_code=403)
        limit = min(max(int(request.query_params.get("limit", 25)), 1), 100)
        q = request.query_params.get("q", "").strip()[:120]
        with scoped_atomic(scope.organization_id, scope.branch_id):
            qs = Horse.objects.filter(organization_id=scope.organization_id, branch_id=scope.branch_id)
            if q: qs = qs.filter(Q(name__icontains=q) | Q(tamga__icontains=q) | Q(identifiers__value__icontains=q)).distinct()
            items = [{"id": str(h.id), "name": h.name, "tamga": h.tamga, "version": h.version} for h in qs.order_by("name")[:limit]]
        return Response({"items": items, "next": None})

    def post(self, request):
        scope = getattr(request, "moriton_scope", None)
        if not scope: return api_error(request, code="scope_required", message="Organization and branch scope required", status_code=403)
        data = request.data
        name = str(data.get("name", "")).strip()
        if not name: raise ValidationError({"name": ["This field is required."]})
        actor = getattr(scope, "actor_id", None)
        if not actor: return api_error(request, code="actor_required", message="Actor evidence required", status_code=403)
        with scoped_atomic(scope.organization_id, scope.branch_id):
            matches = Horse.objects.filter(organization_id=scope.organization_id, branch_id=scope.branch_id, name__iexact=name)
            if data.get("tamga"): matches = matches.filter(tamga__iexact=str(data["tamga"]).strip())
            if matches.exists():
                return Response({"error": {"code": "duplicate_candidate", "message": "A possible existing horse requires staff review"}}, status=status.HTTP_409_CONFLICT)
            horse = Horse.objects.create(organization_id=scope.organization_id, branch_id=scope.branch_id, created_by=actor, name=name, tamga=str(data.get("tamga", "")).strip(), breed=str(data.get("breed", "")).strip())
            for ident in data.get("identifiers", []):
                HorseIdentifier.objects.create(organization_id=scope.organization_id, branch_id=scope.branch_id, created_by=actor, horse=horse, identifier_type=ident["type"], issuer=ident.get("issuer", ""), value=ident["value"].strip())
        return Response({"id": str(horse.id), "name": horse.name, "version": horse.version}, status=201)
