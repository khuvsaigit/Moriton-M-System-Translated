"""Provider-neutral server-side session bridge; no local or production login is enabled."""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from uuid import UUID

from django.contrib.auth.models import AnonymousUser
from django.utils.deprecation import MiddlewareMixin
from rest_framework.authentication import BaseAuthentication, SessionAuthentication
from rest_framework.permissions import BasePermission

from .models import ServiceMembership
from .security import AuthorizationContext, authorize, scoped_atomic


@dataclass(frozen=True)
class VerifiedIdentity:
    """Claims created only by a configured identity-provider verifier/callback."""
    actor_id: UUID
    organization_id: UUID
    branch_id: UUID
    role: str
    policy_version: int
    expires_at: datetime


@dataclass(frozen=True)
class MoritonPrincipal:
    id: UUID
    is_authenticated: bool = True


def bind_verified_identity(request, identity: VerifiedIdentity) -> None:
    """Store provider-verified identity server-side after callback signature/nonce validation."""
    if identity.expires_at.tzinfo is None or identity.expires_at <= datetime.now(timezone.utc):
        raise ValueError("identity must have a future timezone-aware expiration")
    request.session.cycle_key()
    request.session["moriton_identity"] = {
        "actor_id": str(identity.actor_id),
        "organization_id": str(identity.organization_id),
        "branch_id": str(identity.branch_id),
        "role": identity.role,
        "policy_version": identity.policy_version,
        "expires_at": identity.expires_at.isoformat(),
    }


class ScopeMiddleware(MiddlewareMixin):
    def process_request(self, request):
        raw = request.session.get("moriton_identity") if hasattr(request, "session") else None
        request.moriton_scope = None
        request.moriton_principal = AnonymousUser()
        if not isinstance(raw, dict):
            return None
        try:
            actor_id = UUID(raw["actor_id"])
            organization_id = UUID(raw["organization_id"])
            branch_id = UUID(raw["branch_id"])
            version = int(raw["policy_version"])
            expires_at = datetime.fromisoformat(raw["expires_at"])
            role = str(raw["role"])
        except (KeyError, TypeError, ValueError):
            request.session.pop("moriton_identity", None)
            return None
        now = datetime.now(timezone.utc)
        if expires_at.tzinfo is None or expires_at <= now:
            request.session.pop("moriton_identity", None)
            return None
        with scoped_atomic(organization_id, branch_id):
            membership = ServiceMembership.objects.filter(
                actor_id=actor_id, organization_id=organization_id,
                branch_id=branch_id, role=role, active=True,
                policy_version=version,
            ).first()
        if membership is None or (membership.valid_until and membership.valid_until <= now):
            return None
        request.moriton_scope = AuthorizationContext(
            actor_id=actor_id, organization_id=organization_id,
            branch_id=branch_id, permissions=frozenset(membership.permissions),
            policy_version=membership.policy_version, active=membership.active,
            expires_at=min(expires_at, membership.valid_until) if membership.valid_until else expires_at,
        )
        request.moriton_principal = MoritonPrincipal(actor_id)
        return None


class MoritonSessionAuthentication(BaseAuthentication):
    def authenticate(self, request):
        scope = getattr(request, "moriton_scope", None)
        if scope is None:
            return None
        # Session-authenticated write requests must pass Django's CSRF check.
        SessionAuthentication().enforce_csrf(request)
        return request.moriton_principal, None

    def authenticate_header(self, request):
        return "Session"


class HasMoritonScope(BasePermission):
    def has_permission(self, request, view):
        return getattr(request, "moriton_scope", None) is not None


class HasHorseRegistryPermission(BasePermission):
    def has_permission(self, request, view):
        scope = getattr(request, "moriton_scope", None)
        if scope is None:
            return False
        action = "registry.create" if request.method == "POST" else "registry.read"
        return authorize(scope, action=action, organization_id=scope.organization_id,
                         branch_id=scope.branch_id, expected_policy_version=scope.policy_version)
