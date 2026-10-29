from uuid import UUID, uuid4
from rest_framework.views import exception_handler


def _correlation(request):
    try:
        return str(UUID(request.headers.get("X-Correlation-ID", "")))
    except (ValueError, TypeError, AttributeError):
        return str(uuid4())


def exception_handler_v1(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        return None
    detail = response.data.get("detail", "Request could not be completed") if isinstance(response.data, dict) else "Request could not be completed"
    request = context.get("request")
    response.data = {"correlation_id": _correlation(request) if request else str(uuid4()),
                     "error": {"code": getattr(exc, "default_code", "request_failed"),
                               "message": str(detail), "retryable": response.status_code >= 500}}
    return response
