import os
import dj_database_url

SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "unsafe-local-only")
DEBUG = os.getenv("DJANGO_DEBUG", "0") == "1"
ALLOWED_HOSTS = ["localhost", "127.0.0.1", "imaging"]
ROOT_URLCONF = "config.urls"
INSTALLED_APPS = ["django.contrib.contenttypes", "django.contrib.auth", "imaging"]
MIDDLEWARE = ["django.middleware.security.SecurityMiddleware", "django.middleware.common.CommonMiddleware"]
DATABASES = {"default": dj_database_url.parse(os.getenv("DATABASE_URL", "postgresql://imaging:imaging@localhost:5432/imaging_db"), conn_max_age=60, conn_health_checks=True)}
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
USE_TZ = True
TIME_ZONE = "UTC"
REST_FRAMEWORK = {"DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.IsAuthenticated"], "DEFAULT_AUTHENTICATION_CLASSES": [], "EXCEPTION_HANDLER": "config.errors.exception_handler_v1"}
