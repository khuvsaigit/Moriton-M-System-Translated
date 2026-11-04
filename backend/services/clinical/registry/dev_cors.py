"""CORS for the explicitly configured local development frontend only."""
from django.conf import settings
from django.http import HttpResponse


class LocalFrontendCorsMiddleware:
    """Allow the local preview page to call Clinical with its session cookie."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        origin = request.headers.get("Origin", "")
        allowed = (
            settings.DEBUG
            and settings.MORITON_LOCAL_AUTH_ENABLED
            and origin == settings.MORITON_FRONTEND_ORIGIN
        )
        if request.method == "OPTIONS" and allowed:
            response = HttpResponse(status=204)
        else:
            response = self.get_response(request)
        if allowed:
            response["Access-Control-Allow-Origin"] = origin
            response["Access-Control-Allow-Credentials"] = "true"
            response["Access-Control-Allow-Methods"] = "GET, POST, DELETE, OPTIONS"
            response["Access-Control-Allow-Headers"] = "Content-Type, X-CSRFToken"
            response["Access-Control-Max-Age"] = "600"
            response["Vary"] = "Origin"
        return response
