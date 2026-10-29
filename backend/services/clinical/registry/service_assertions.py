"""Claim validator to call only after an approved cryptographic verifier succeeds."""
from datetime import datetime, timezone
from uuid import UUID


class InvalidServiceAssertion(ValueError):
    pass


def validate_claims(claims: dict, *, signature_verified: bool, expected_issuer: str,
                    expected_audience: str, now: datetime | None = None,
                    max_lifetime_seconds: int = 300) -> None:
    if not signature_verified:
        raise InvalidServiceAssertion("signature verification is required")
    required = {"iss", "sub", "aud", "iat", "exp", "jti", "kid", "organization_id",
                "branch_id", "actor_id", "policy_version", "permissions"}
    if not isinstance(claims, dict) or required - claims.keys():
        raise InvalidServiceAssertion("required assertion claims are missing")
    if claims["iss"] != expected_issuer or claims["aud"] != expected_audience:
        raise InvalidServiceAssertion("issuer or audience mismatch")
    try:
        UUID(claims["jti"])
        UUID(claims["organization_id"])
        UUID(claims["branch_id"])
        UUID(claims["actor_id"])
        issued_at = int(claims["iat"])
        expires_at = int(claims["exp"])
    except (ValueError, TypeError, KeyError) as exc:
        raise InvalidServiceAssertion("UUID and timestamp claim format is invalid") from exc
    now = now or datetime.now(timezone.utc)
    current = int(now.timestamp())
    if expires_at <= current or issued_at > current + 30 or expires_at <= issued_at:
        raise InvalidServiceAssertion("assertion is expired or has invalid issue time")
    if expires_at - issued_at > max_lifetime_seconds:
        raise InvalidServiceAssertion("assertion lifetime exceeds policy")
    if not isinstance(claims["kid"], str) or not claims["kid"]:
        raise InvalidServiceAssertion("key identifier is required for key rotation")
    if not isinstance(claims["policy_version"], int) or claims["policy_version"] < 1:
        raise InvalidServiceAssertion("policy_version must be positive")
    if not isinstance(claims["permissions"], list) or not all(isinstance(p, str) for p in claims["permissions"]):
        raise InvalidServiceAssertion("permissions must be a string list")
