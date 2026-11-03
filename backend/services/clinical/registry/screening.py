"""Versioned screening capture. Answer submission never grants clinical clearance."""
from __future__ import annotations

from uuid import UUID

from django.utils import timezone

from .models import (
    AuditEvent,
    ScreeningAnswer,
    ScreeningForm,
    ScreeningFormVersion,
    ScreeningReview,
    Visit,
)
from .security import scoped_atomic


def create_screening_form(*, organization_id: UUID, branch_id: UUID, actor_id: UUID,
                          name: str, schema: dict) -> tuple[ScreeningForm, ScreeningFormVersion]:
    if not name.strip() or not isinstance(schema, dict):
        raise ValueError("a form name and object schema are required")
    with scoped_atomic(organization_id, branch_id):
        form = ScreeningForm.objects.create(
            organization_id=organization_id, branch_id=branch_id,
            created_by=actor_id, name=name.strip(),
        )
        version = ScreeningFormVersion.objects.create(
            organization_id=organization_id, branch_id=branch_id,
            created_by=actor_id, form=form, version=1, schema=schema,
        )
        return form, version


def create_screening_form_version(*, form_id: UUID, organization_id: UUID,
                                  branch_id: UUID, actor_id: UUID,
                                  schema: dict) -> ScreeningFormVersion:
    if not isinstance(schema, dict):
        raise ValueError("form schema must be an object")
    with scoped_atomic(organization_id, branch_id):
        form = ScreeningForm.objects.select_for_update().get(
            pk=form_id, organization_id=organization_id, branch_id=branch_id, active=True,
        )
        latest = form.versions.order_by("-version").first()
        next_version = latest.version + 1 if latest else 1
        return ScreeningFormVersion.objects.create(
            organization_id=organization_id, branch_id=branch_id,
            created_by=actor_id, form=form, version=next_version, schema=schema,
        )


def publish_screening_form_version(*, version_id: UUID, organization_id: UUID,
                                   branch_id: UUID, actor_id: UUID) -> ScreeningFormVersion:
    with scoped_atomic(organization_id, branch_id):
        version = ScreeningFormVersion.objects.select_for_update().get(
            pk=version_id, organization_id=organization_id, branch_id=branch_id,
            form__active=True,
        )
        if version.published_at is not None:
            raise ValueError("published form versions are immutable")
        version.published_at = timezone.now()
        version.published_by = actor_id
        version.save(update_fields=["published_at", "published_by"])
        AuditEvent.objects.create(
            organization_id=organization_id, branch_id=branch_id, actor_id=actor_id,
            action="screening.form_version_published", aggregate_type="screening_form",
            aggregate_id=version.form_id, aggregate_version=version.version,
            correlation_id=version.id,
            details={"form_version_id": str(version.id)},
        )
        return version


def submit_screening_answers(*, version_id: UUID, visit_id: UUID,
                             organization_id: UUID, branch_id: UUID,
                             actor_id: UUID, answers: dict) -> tuple[ScreeningAnswer, ScreeningReview]:
    if not isinstance(answers, dict):
        raise ValueError("screening answers must be an object")
    with scoped_atomic(organization_id, branch_id):
        version = ScreeningFormVersion.objects.get(
            pk=version_id, organization_id=organization_id, branch_id=branch_id,
            published_at__isnull=False, form__active=True,
        )
        visit = Visit.objects.get(pk=visit_id, organization_id=organization_id, branch_id=branch_id)
        answer = ScreeningAnswer.objects.create(
            organization_id=organization_id, branch_id=branch_id,
            created_by=actor_id, form_version=version, visit=visit, answers=answers,
            status=ScreeningAnswer.Status.SUBMITTED, submitted_by=actor_id,
            submitted_at=timezone.now(),
        )
        review = ScreeningReview.objects.create(
            organization_id=organization_id, branch_id=branch_id,
            created_by=actor_id, answer=answer, decision=ScreeningReview.Decision.PENDING,
        )
        AuditEvent.objects.create(
            organization_id=organization_id, branch_id=branch_id, actor_id=actor_id,
            action="screening.answers_submitted", aggregate_type="screening_answer",
            aggregate_id=answer.id, aggregate_version=answer.revision,
            correlation_id=answer.id,
            details={"visit_id": str(visit.id), "form_version_id": str(version.id),
                     "review_id": str(review.id), "clearance_granted": False},
        )
        return answer, review
