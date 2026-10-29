import unittest
from datetime import datetime, timezone, timedelta
from uuid import uuid4

from .security import AuthorizationContext, authorize, queued_command_decision


class AuthorizationTests(unittest.TestCase):
    def setUp(self):
        self.org = uuid4()
        self.branch = uuid4()
        self.actor = uuid4()
        self.context = AuthorizationContext(
            actor_id=self.actor, organization_id=self.org, branch_id=self.branch,
            permissions=frozenset({"pharmacy.issue"}), policy_version=3,
        )

    def test_authorization_is_bound_to_scope_action_and_policy_version(self):
        self.assertTrue(authorize(self.context, action="pharmacy.issue", organization_id=self.org,
                                  branch_id=self.branch, expected_policy_version=3))
        self.assertFalse(authorize(self.context, action="pharmacy.issue", organization_id=self.org,
                                   branch_id=uuid4(), expected_policy_version=3))
        self.assertFalse(authorize(self.context, action="pharmacy.issue", organization_id=self.org,
                                   branch_id=self.branch, expected_policy_version=4))
        self.assertFalse(authorize(None, action="pharmacy.issue", organization_id=self.org,
                                   branch_id=self.branch, expected_policy_version=3))

    def test_expired_or_revoked_queued_command_is_held_but_physical_fact_is_recorded(self):
        revoked = AuthorizationContext(**{**self.context.__dict__, "active": False})
        args = dict(submitted_policy_version=3, current_context=revoked, action="pharmacy.issue",
                    organization_id=self.org, branch_id=self.branch)
        self.assertEqual(queued_command_decision(**args), "AUTH_REVALIDATION_PENDING")
        self.assertEqual(queued_command_decision(**args, physical_fact_recorded=True), "RECORD_FACT_AND_RECONCILE")

    def test_expired_context_is_denied(self):
        expired = AuthorizationContext(**{**self.context.__dict__, "expires_at": datetime.now(timezone.utc)-timedelta(seconds=1)})
        self.assertFalse(authorize(expired, action="pharmacy.issue", organization_id=self.org,
                                   branch_id=self.branch, expected_policy_version=3))
