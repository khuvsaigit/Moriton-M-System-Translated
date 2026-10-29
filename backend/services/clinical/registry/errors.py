from uuid import UUID, uuid4

from rest_framework.views import exception_handler
from rest_framework.response import Response


def correlation_id(request):
    supplied = request.headers.get("X-Correlation-ID", "")
    try:
        return str(UUID(supplied))
    except (ValueError, TypeError, AttributeError):
        return str(uuid4())


def api_error(request, *, code, message, status_code, retryable=False, details=None):
    body = {"correlation_id": correlation_id(request),
            "error": {"code": code, "message": message, "retryable": retryable}}
    if details:
        body["error"]["details"] = details
    return Response(body, status=status_code)


def moriton_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        return None
    request = context.get("request")
    detail = response.data.get("detail", "Request could not be completed") if isinstance(response.data, dict) else "Request could not be completed"
    response.data = {
        "correlation_id": correlation_id(request) if request else str(uuid4()),
        "error": {
            "code": getattr(exc, "default_code", "request_failed"),
            "message": str(detail),
            "retryable": response.status_code >= 500,
        },
    }
    return response
