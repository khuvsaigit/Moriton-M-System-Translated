import os
from pathlib import Path
import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "unsafe-local-only")
DEBUG = os.getenv("DJANGO_DEBUG", "0") == "1"
ALLOWED_HOSTS = ["localhost", "127.0.0.1", "clinical"]
ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"
INSTALLED_APPS = ["django.contrib.contenttypes", "django.contrib.auth", "django.contrib.sessions", "rest_framework", "registry"]
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "registry.identity.ScopeMiddleware",
]
DATABASES = {"default": dj_database_url.parse(os.getenv("DATABASE_URL", "postgresql://clinical:clinical@localhost:5432/clinical_db"), conn_max_age=60, conn_health_checks=True)}
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
USE_TZ = True
TIME_ZONE = "UTC"
REST_FRAMEWORK = {"DEFAULT_PERMISSION_CLASSES": ["registry.identity.HasMoritonScope"], "DEFAULT_AUTHENTICATION_CLASSES": ["registry.identity.MoritonSessionAuthentication"], "EXCEPTION_HANDLER": "registry.errors.moriton_exception_handler"}
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SECURE = not DEBUG
SESSION_COOKIE_SAMESITE = "Lax"
SESSION_COOKIE_AGE = 3600
MORITON_LOCAL_AUTH_ENABLED = os.getenv("MORITON_LOCAL_AUTH_ENABLED", "0") == "1"
LOCAL_AUTH_ACTOR_ID = os.getenv("LOCAL_AUTH_ACTOR_ID", "")
LOCAL_AUTH_ORGANIZATION_ID = os.getenv("LOCAL_AUTH_ORGANIZATION_ID", "")
LOCAL_AUTH_BRANCH_ID = os.getenv("LOCAL_AUTH_BRANCH_ID", "")
LOCAL_AUTH_ROLE = os.getenv("LOCAL_AUTH_ROLE", "")
LOCAL_AUTH_PERMISSIONS = os.getenv("LOCAL_AUTH_PERMISSIONS", "")
