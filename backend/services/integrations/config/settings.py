import os
import dj_database_url

SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "unsafe-local-only")
DEBUG = os.getenv("DJANGO_DEBUG", "0") == "1"
ALLOWED_HOSTS = ["localhost", "127.0.0.1", "integrations"]
ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"
INSTALLED_APPS = ["django.contrib.contenttypes", "django.contrib.auth", "rest_framework", "call24", "ledger"]
MIDDLEWARE = ["django.middleware.security.SecurityMiddleware", "django.middleware.common.CommonMiddleware"]
DATABASES = {"default": dj_database_url.parse(os.getenv("DATABASE_URL", "postgresql://integrations:integrations@localhost:5432/integration_db"), conn_max_age=60, conn_health_checks=True)}
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
USE_TZ = True
TIME_ZONE = "UTC"
REST_FRAMEWORK = {"DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.IsAuthenticated"], "DEFAULT_AUTHENTICATION_CLASSES": [], "EXCEPTION_HANDLER": "config.errors.exception_handler_v1"}
ODOO_WRITES_ENABLED = os.getenv("ODOO_WRITES_ENABLED", "0") == "1"
CALL24_CSV_IMPORT_ENABLED = os.getenv("CALL24_CSV_IMPORT_ENABLED", "0") == "1"
CALL24_CLINICAL_EVENT_URL = os.getenv("CALL24_CLINICAL_EVENT_URL", "http://clinical:8000/api/v1/internal/events/call24")
LOCAL_CALL24_BRIDGE_TOKEN = os.getenv("LOCAL_CALL24_BRIDGE_TOKEN", "")
