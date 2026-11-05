from datetime import datetime, timedelta, timezone
from uuid import UUID
from typing import Any

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.db.models import F
from django.http import Http404
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .identity import VerifiedIdentity, bind_verified_identity
from .models import AuditEvent, ScheduleResource, ServiceMembership
from .security import authorize, scoped_atomic


@method_decorator(ensure_csrf_cookie, name="dispatch")
class LocalCsrfView(APIView):
    """Issue a CSRF cookie for the local-only preview; never available outside DEBUG."""
    authentication_classes: list[Any] = []
    permission_classes = [AllowAny]

    def get(self, request):
        if not settings.DEBUG or not settings.MORITON_LOCAL_AUTH_ENABLED:
            raise Http404
        from django.middleware.csrf import get_token

        return JsonResponse({"csrf_token": get_token(request)})


@method_decorator(csrf_protect, name="dispatch")
class LocalMockSessionView(APIView):
    """Opt-in local-only mock login, configured only from environment, never request fields."""
    authentication_classes: list[Any] = []
    permission_classes = [AllowAny]

    def post(self, request):
        if not settings.DEBUG or not settings.MORITON_LOCAL_AUTH_ENABLED:
            raise Http404
        try:
            actor_id = UUID(settings.LOCAL_AUTH_ACTOR_ID)
            organization_id = UUID(settings.LOCAL_AUTH_ORGANIZATION_ID)
            branch_id = UUID(settings.LOCAL_AUTH_BRANCH_ID)
            role = settings.LOCAL_AUTH_ROLE
        except (AttributeError, ValueError) as exc:
            raise ImproperlyConfigured("Configure valid LOCAL_AUTH_* values for the local mock provider") from exc
        permissions = [p.strip() for p in settings.LOCAL_AUTH_PERMISSIONS.split(",") if p.strip()]
        if not role or not permissions:
            raise ImproperlyConfigured("Local mock role and permissions must be configured")
        with scoped_atomic(organization_id, branch_id):
            membership, created = ServiceMembership.objects.get_or_create(
                actor_id=actor_id, organization_id=organization_id,
                branch_id=branch_id, role=role,
                defaults={"permissions": permissions, "policy_version": 1, "active": True},
            )
            if not created and (membership.permissions != permissions or not membership.active):
                ServiceMembership.objects.filter(pk=membership.pk).update(
                    permissions=permissions, active=True, policy_version=F("policy_version") + 1,
                )
                membership.refresh_from_db()
        bind_verified_identity(request, VerifiedIdentity(
            actor_id=actor_id, organization_id=organization_id, branch_id=branch_id,
            role=role, policy_version=membership.policy_version,
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=10),
        ))
        return Response({"status": "local_session_created", "expires_in_seconds": 600})

    def delete(self, request):
        if not settings.DEBUG or not settings.MORITON_LOCAL_AUTH_ENABLED:
            raise Http404
        request.session.flush()
        return Response(status=204)


class LocalDemoScheduleResourceView(APIView):
    """Local-only fixture resource endpoint so the dashboard demo is usable on an empty DB."""

    def _local_scope(self, request, action):
        if not settings.DEBUG or not settings.MORITON_LOCAL_AUTH_ENABLED:
            raise Http404
        scope = getattr(request, "moriton_scope", None)
        if not authorize(
            scope, action=action,
            organization_id=scope.organization_id if scope else UUID(int=0),
            branch_id=scope.branch_id if scope else UUID(int=0),
            expected_policy_version=scope.policy_version if scope else -1,
        ):
            raise PermissionDenied("Local demo resource access is not authorized.")
        return scope

    def get(self, request):
        scope = self._local_scope(request, "demo.resource.read")
        with scoped_atomic(scope.organization_id, scope.branch_id):
            rows = ScheduleResource.objects.filter(
                organization_id=scope.organization_id, branch_id=scope.branch_id, active=True,
            ).order_by("name", "id")
            items = [{"id": str(row.id), "name": row.name, "resource_type": row.resource_type}
                     for row in rows[:100]]
        return Response({"items": items})

    def post(self, request):
        scope = self._local_scope(request, "demo.resource.create")
        name = str(request.data.get("name", "")).strip()
        resource_type = str(request.data.get("resource_type", "room")).strip()
        if not name or len(name) > 160 or not resource_type or len(resource_type) > 40:
            raise ValidationError({"name": ["A resource name and valid resource type are required."]})
        with scoped_atomic(scope.organization_id, scope.branch_id):
            resource = ScheduleResource.objects.create(
                organization_id=scope.organization_id, branch_id=scope.branch_id,
                created_by=scope.actor_id, name=name, resource_type=resource_type,
            )
            AuditEvent.objects.create(
                organization_id=scope.organization_id, branch_id=scope.branch_id,
                actor_id=scope.actor_id, action="demo.schedule_resource.created",
                aggregate_type="schedule_resource", aggregate_id=resource.id,
                aggregate_version=resource.version, correlation_id=resource.id,
                details={"resource_type": resource.resource_type, "local_demo_only": True},
            )
        return Response({"id": str(resource.id), "name": resource.name,
                         "resource_type": resource.resource_type}, status=201)
