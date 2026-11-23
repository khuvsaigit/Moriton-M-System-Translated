"""Versioned screening capture. Answer submission never grants clinical clearance."""
from __future__ import annotations

from datetime import date
from math import isfinite
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


def _validate_answers(schema: dict, answers: dict) -> None:
    """Validate captured values against the exact published questionnaire version."""
    questions = schema.get("questions")
    if not isinstance(questions, list) or not questions:
        raise ValueError("published screening form has no supported questions")

    by_id: dict[str, dict] = {}
    supported_types = {"text", "textarea", "select", "yes_no", "boolean", "number", "date"}
    for question in questions:
        if not isinstance(question, dict):
            raise ValueError("published screening question must be an object")
        question_id = question.get("id")
        if not isinstance(question_id, str) or not question_id.strip():
            raise ValueError("published screening question needs a non-empty id")
        if question_id in by_id:
            raise ValueError("published screening question ids must be unique")
        question_type = str(question.get("type", "text")).lower()
        if question_type not in supported_types:
            raise ValueError(f"unsupported screening question type: {question_type}")
        by_id[question_id] = question

    unknown = set(answers) - set(by_id)
    if unknown:
        raise ValueError("answers contain question ids that are not in this published version")

    for question_id, question in by_id.items():
        answer = answers.get(question_id)
        question_type = str(question.get("type", "text")).lower()
        if question.get("required") and (question_id not in answers or answer is None or answer == ""):
            raise ValueError(f"answer required for question: {question_id}")
        if question_id not in answers or answer is None or answer == "":
            continue
        if question_type in {"text", "textarea"} and not isinstance(answer, str):
            raise ValueError(f"answer must be text for question: {question_id}")
        if question_type == "number":
            if isinstance(answer, bool):
                raise ValueError(f"answer must be a number for question: {question_id}")
            try:
                numeric = float(answer)
            except (TypeError, ValueError, OverflowError) as exc:
                raise ValueError(f"answer must be a number for question: {question_id}") from exc
            if not isfinite(numeric):
                raise ValueError(f"answer must be a finite number for question: {question_id}")
        if question_type == "date":
            try:
                date.fromisoformat(answer)
            except (TypeError, ValueError) as exc:
                raise ValueError(f"answer must be an ISO date for question: {question_id}") from exc
        if question_type in {"yes_no", "boolean"} and answer not in (True, False, "yes", "no", "true", "false"):
            raise ValueError(f"answer must be yes or no for question: {question_id}")
        if question_type == "select":
            options = question.get("options")
            if not isinstance(options, list):
                raise ValueError(f"published select question needs an options list: {question_id}")
            values = set()
            for option in options:
                if isinstance(option, str):
                    option_value = option
                elif isinstance(option, dict):
                    option_value = option.get("value")
                else:
                    option_value = None
                if isinstance(option_value, str):
                    values.add(option_value)
            if not values or not isinstance(answer, str) or answer not in values:
                raise ValueError(f"answer is not an available option for question: {question_id}")


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
        _validate_answers(version.schema, answers)
        visit = Visit.objects.select_for_update().get(
            pk=visit_id, organization_id=organization_id, branch_id=branch_id,
        )
        latest_revision = ScreeningAnswer.objects.filter(
            visit=visit, form_version=version,
            organization_id=organization_id, branch_id=branch_id,
        ).order_by("-revision").values_list("revision", flat=True).first() or 0
        answer = ScreeningAnswer.objects.create(
            organization_id=organization_id, branch_id=branch_id,
            created_by=actor_id, form_version=version, visit=visit, answers=answers,
            revision=latest_revision + 1, status=ScreeningAnswer.Status.SUBMITTED, submitted_by=actor_id,
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
