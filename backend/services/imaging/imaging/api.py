from rest_framework.permissions import AllowAny
from typing import Any
from django.http import Http404
from rest_framework.exceptions import PermissionDenied
from .models import ImagingStudy
from django.db import transaction, connection
from rest_framework.response import Response
from rest_framework.views import APIView

class HealthView(APIView):
    authentication_classes: list[Any] = []
    permission_classes = [AllowAny]
    def get(self, request): return Response({"status": "ok", "service": "imaging"})

class StudyDetailView(APIView):
    def get(self, request, study_id):
        scope = getattr(request, "moriton_scope", None)
        if not scope:
            raise PermissionDenied("Authorized organization and branch scope required.")
        with transaction.atomic():
            if connection.vendor == "postgresql":
                with connection.cursor() as cursor:
                    cursor.execute("SELECT set_config('moriton.organization_id', %s, true), set_config('moriton.branch_id', %s, true)",
                                   [str(scope.organization_id), str(scope.branch_id)])
            study = ImagingStudy.objects.filter(id=study_id, organization_id=scope.organization_id,
                                                branch_id=scope.branch_id).first()
            if study is None:
                raise Http404("Study not found")
            return Response({"id": str(study.id), "horse_id": str(study.horse_id),
                             "visit_id": str(study.visit_id) if study.visit_id else None,
                             "study_instance_uid": study.study_instance_uid,
                             "modality": study.modality, "status": study.status,
                             "version": study.version})
