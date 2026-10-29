import csv
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from typing import Any
from rest_framework.exceptions import PermissionDenied, ValidationError
from .adapter import parse_csv

class HealthView(APIView):
    authentication_classes: list[Any] = []
    permission_classes = [AllowAny]
    def get(self, request): return Response({"status": "ok", "service": "integrations", "odoo_writes_enabled": False})

class Call24PreviewView(APIView):
    """Read-only CSV validation; this endpoint never creates a booking or visit."""
    def post(self, request):
        if not getattr(request, "moriton_scope", None):
            raise PermissionDenied("Authorized organization and branch scope required.")
        upload = request.FILES.get("file")
        if upload is None:
            raise ValidationError({"file": ["CSV file is required."]})
        if upload.size > 25 * 1024 * 1024:
            raise ValidationError({"file": ["CSV file exceeds the 25 MiB limit."]})
        try:
            preview = parse_csv(upload)
        except (UnicodeDecodeError, csv.Error) as exc:
            raise ValidationError({"file": ["CSV could not be decoded or parsed."]}) from exc
        return Response(preview.as_dict())
