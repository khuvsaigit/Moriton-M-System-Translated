from django.urls import path
from call24.api import Call24PreviewView, HealthView

urlpatterns = [path("api/v1/health/live", HealthView.as_view()), path("api/v1/call24/preview", Call24PreviewView.as_view())]
