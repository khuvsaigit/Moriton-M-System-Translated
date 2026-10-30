from django.urls import path
from registry.api import (
    ClinicalNoteRevisionView,
    HorseListCreateView,
    HealthView,
    ReceptionTaskActionView,
    ReceptionTaskListCreateView,
    ReadyView,
    VisitArrivalView,
    VisitAssignmentView,
    VisitDraftNoteView,
    VisitListCreateView,
)
from registry.dev_auth import LocalMockSessionView

urlpatterns = [
    path("api/v1/health/live", HealthView.as_view()),
    path("api/v1/health/ready", ReadyView.as_view()),
    path("api/v1/horses", HorseListCreateView.as_view()),
    path("api/v1/reception/tasks", ReceptionTaskListCreateView.as_view()),
    path("api/v1/reception/tasks/<uuid:task_id>/actions", ReceptionTaskActionView.as_view()),
    path("api/v1/visits", VisitListCreateView.as_view()),
    path("api/v1/visits/<uuid:visit_id>/arrival", VisitArrivalView.as_view()),
    path("api/v1/visits/<uuid:visit_id>/assignments", VisitAssignmentView.as_view()),
    path("api/v1/visits/<uuid:visit_id>/draft-notes", VisitDraftNoteView.as_view()),
    path("api/v1/clinical-notes/<uuid:note_id>/revisions", ClinicalNoteRevisionView.as_view()),
    path("api/v1/dev/session", LocalMockSessionView.as_view()),
]
