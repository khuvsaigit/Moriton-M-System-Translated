from datetime import datetime, timedelta, timezone
from uuid import UUID
from typing import Any

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.http import Http404
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .identity import VerifiedIdentity, bind_verified_identity
from .models import ServiceMembership
from .security import scoped_atomic


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
            membership, _ = ServiceMembership.objects.get_or_create(
                actor_id=actor_id, organization_id=organization_id,
                branch_id=branch_id, role=role,
                defaults={"permissions": permissions, "policy_version": 1, "active": True},
            )
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
