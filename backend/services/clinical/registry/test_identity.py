from datetime import datetime, timezone, timedelta
from uuid import uuid4

from django.test import SimpleTestCase
from .identity import VerifiedIdentity, bind_verified_identity
from .service_assertions import InvalidServiceAssertion, validate_claims


class FakeSession(dict):
    def cycle_key(self):
        self.cycled = True


class FakeRequest:
    def __init__(self):
        self.session = FakeSession()


class SessionBridgeTests(SimpleTestCase):
    def test_provider_verified_identity_is_stored_server_side(self):
        request = FakeRequest()
        identity = VerifiedIdentity(uuid4(), uuid4(), uuid4(), "clinician", 4,
                                    datetime.now(timezone.utc) + timedelta(minutes=5))
        bind_verified_identity(request, identity)
        self.assertTrue(request.session.cycled)
        self.assertEqual(request.session["moriton_identity"]["actor_id"], str(identity.actor_id))

    def test_expired_identity_cannot_be_bound(self):
        request = FakeRequest()
        identity = VerifiedIdentity(uuid4(), uuid4(), uuid4(), "clinician", 4,
                                    datetime.now(timezone.utc) - timedelta(seconds=1))
        with self.assertRaises(ValueError):
            bind_verified_identity(request, identity)


class ServiceAssertionTests(SimpleTestCase):
    def claims(self):
        now = int(datetime.now(timezone.utc).timestamp())
        return {"iss": "clinical", "sub": "clinical-service", "aud": "integrations", "iat": now,
                "exp": now + 120, "jti": str(uuid4()), "kid": "key-next", "organization_id": str(uuid4()),
                "branch_id": str(uuid4()), "actor_id": str(uuid4()), "policy_version": 1,
                "permissions": ["operation.enqueue"]}

    def test_claim_validation_requires_signature_and_bounded_audience_and_lifetime(self):
        claims = self.claims()
        validate_claims(claims, signature_verified=True, expected_issuer="clinical", expected_audience="integrations")
        with self.assertRaises(InvalidServiceAssertion):
            validate_claims(claims, signature_verified=False, expected_issuer="clinical", expected_audience="integrations")
        with self.assertRaises(InvalidServiceAssertion):
            validate_claims(claims, signature_verified=True, expected_issuer="clinical", expected_audience="imaging")
