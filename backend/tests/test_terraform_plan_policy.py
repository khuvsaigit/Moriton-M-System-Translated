import unittest

from tools.terraform_plan_policy import PolicyError, check_plan


class TerraformPlanPolicyTests(unittest.TestCase):
    def setUp(self):
        self.plan = {"resource_changes": [
            {"address": "aws_sqs_queue.events", "type": "aws_sqs_queue", "change": {"actions": ["create"]}},
            {"address": "aws_sqs_queue.readonly", "type": "aws_sqs_queue", "change": {"actions": ["no-op"]}},
        ]}
        self.manifest = {"approval_status": "APPROVED", "allowed_resource_types": ["aws_sqs_queue"],
                         "max_resource_changes": {"aws_sqs_queue": 1}}

    def test_accepts_approved_allowlisted_plan_within_ceiling(self):
        self.assertEqual(check_plan(self.plan, self.manifest), ["aws_sqs_queue: 1/1 changes"])

    def test_fails_closed_while_client_approval_is_pending(self):
        self.manifest["approval_status"] = "PENDING"
        with self.assertRaisesRegex(PolicyError, "must be APPROVED"):
            check_plan(self.plan, self.manifest)

    def test_rejects_unlisted_resources_and_destructive_changes(self):
        self.plan["resource_changes"][0]["type"] = "aws_lambda_function"
        with self.assertRaisesRegex(PolicyError, "not allowlisted"):
            check_plan(self.plan, self.manifest)
        self.plan["resource_changes"][0]["type"] = "aws_sqs_queue"
        self.plan["resource_changes"][0]["change"]["actions"] = ["delete"]
        with self.assertRaisesRegex(PolicyError, "destructive"):
            check_plan(self.plan, self.manifest)


if __name__ == "__main__":
    unittest.main()
