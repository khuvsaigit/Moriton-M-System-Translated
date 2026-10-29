from django.urls import path
from registry.api import HorseListCreateView, HealthView, ReadyView
from registry.dev_auth import LocalMockSessionView

urlpatterns = [path("api/v1/health/live", HealthView.as_view()), path("api/v1/health/ready", ReadyView.as_view()), path("api/v1/horses", HorseListCreateView.as_view()), path("api/v1/dev/session", LocalMockSessionView.as_view())]
