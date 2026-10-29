from django.urls import path
from imaging.api import HealthView, StudyDetailView

urlpatterns = [path("api/v1/health/live", HealthView.as_view()), path("api/v1/studies/<uuid:study_id>", StudyDetailView.as_view())]
