"""Scoped screening APIs. Capture never decides clearance or isolation."""
from rest_framework import serializers, status
from rest_framework.exceptions import NotFound
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import OuterRef, Subquery

from .models import ScreeningFormVersion, ScreeningReview, Visit
from .screening import submit_screening_answers
from .security import scoped_atomic
from .release_api import _scope
from .errors import api_error


class ScreeningFormListView(APIView):
    def get(self, request):
        scope = _scope(request, "screening.read")
        with scoped_atomic(scope.organization_id, scope.branch_id):
            latest_published_version = ScreeningFormVersion.objects.filter(
                form_id=OuterRef("form_id"),
                organization_id=scope.organization_id,
                branch_id=scope.branch_id,
                published_at__isnull=False,
            ).order_by("-version").values("version")[:1]
            rows = ScreeningFormVersion.objects.filter(
                organization_id=scope.organization_id,
                branch_id=scope.branch_id,
                form__active=True,
                published_at__isnull=False,
            ).filter(
                version=Subquery(latest_published_version),
            ).select_related("form").order_by("form__name", "-version")
            return Response({"items": [{
                "id": str(row.id), "form_id": str(row.form_id), "name": row.form.name,
                "version": row.version, "schema": row.schema,
                "published_at": row.published_at.isoformat(),
            } for row in rows[:100]]})


class ScreeningAnswerInput(serializers.Serializer):
    form_version_id = serializers.UUIDField()
    visit_id = serializers.UUIDField()
    answers = serializers.DictField()


class ScreeningAnswerCreateView(APIView):
    def post(self, request):
        scope = _scope(request, "screening.submit")
        value = ScreeningAnswerInput(data=request.data)
        value.is_valid(raise_exception=True)
        try:
            answer, review = submit_screening_answers(
                version_id=value.validated_data["form_version_id"],
                visit_id=value.validated_data["visit_id"],
                organization_id=scope.organization_id, branch_id=scope.branch_id,
                actor_id=scope.actor_id, answers=value.validated_data["answers"],
            )
        except ScreeningFormVersion.DoesNotExist as exc:
            raise NotFound("Published screening form version not found.") from exc
        except Visit.DoesNotExist as exc:
            raise NotFound("Visit not found in this branch.") from exc
        except ValueError as exc:
            return api_error(request, code="invalid_screening_answers", message=str(exc), status_code=400)
        return Response({
            "id": str(answer.id), "visit_id": str(answer.visit_id),
            "form_version_id": str(answer.form_version_id), "revision": answer.revision,
            "status": answer.status, "submitted_at": answer.submitted_at.isoformat(),
            "review": {"id": str(review.id), "decision": review.decision},
            "clearance_granted": False,
        }, status=status.HTTP_201_CREATED)


class ScreeningReviewQueueView(APIView):
    def get(self, request):
        scope = _scope(request, "screening.review.read")
        with scoped_atomic(scope.organization_id, scope.branch_id):
            rows = ScreeningReview.objects.filter(
                organization_id=scope.organization_id,
                branch_id=scope.branch_id,
                decision=ScreeningReview.Decision.PENDING,
            ).select_related("answer__visit__horse", "answer__form_version__form").order_by("created_at", "id")[:100]
            return Response({"items": [{
                "id": str(row.id), "answer_id": str(row.answer_id),
                "visit_id": str(row.answer.visit_id), "slip_number": row.answer.visit.slip_number,
                "horse_name": row.answer.visit.horse.name,
                "form_name": row.answer.form_version.form.name,
                "form_version": row.answer.form_version.version,
                "revision": row.answer.revision, "answers": row.answer.answers,
                "submitted_at": row.answer.submitted_at.isoformat(),
                "decision": row.decision,
            } for row in rows]})
