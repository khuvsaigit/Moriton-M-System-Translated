from django.test import TestCase, override_settings
from rest_framework.test import APIClient


class LocalSessionBridgeTests(TestCase):
    @override_settings(
        DEBUG=True, MORITON_LOCAL_AUTH_ENABLED=True,
        LOCAL_AUTH_ACTOR_ID="11111111-1111-4111-8111-111111111111",
        LOCAL_AUTH_ORGANIZATION_ID="22222222-2222-4222-8222-222222222222",
        LOCAL_AUTH_BRANCH_ID="33333333-3333-4333-8333-333333333333",
        LOCAL_AUTH_ROLE="local-clinician",
        LOCAL_AUTH_PERMISSIONS="registry.read,registry.create",
    )
    def test_opted_in_mock_session_uses_server_configured_scope(self):
        client = APIClient()
        response = client.post("/api/v1/dev/session", {}, format="json")
        self.assertEqual(response.status_code, 200)
        response = client.get("/api/v1/horses")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["items"], [])
        logout = client.delete("/api/v1/dev/session")
        self.assertEqual(logout.status_code, 204)
        self.assertEqual(client.get("/api/v1/horses").status_code, 401)

    @override_settings(DEBUG=True, MORITON_LOCAL_AUTH_ENABLED=False)
    def test_mock_session_route_is_disabled_by_default(self):
        self.assertEqual(APIClient().post("/api/v1/dev/session", {}, format="json").status_code, 404)
