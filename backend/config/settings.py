from pathlib import Path
from datetime import timedelta
import os
import sys

import warnings
warnings.filterwarnings('ignore', category=UserWarning, module='drf_yasg')

# Build paths
BASE_DIR = Path(__file__).resolve().parent.parent

# SECRET_KEY SEGURA
SECRET_KEY = 'o-hi_3zjktov5apa_10r5*0s2)77gehl52zm81g(7x&^i)xblq'

# DEBUG - Mudar para False em produção
DEBUG = True


ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0']

# ==================== CUSTOM USER MODEL ====================
AUTH_USER_MODEL = 'accounts.User'

# ==================== INSTALLED APPS ====================
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'rest_framework.authtoken',
    'corsheaders',
    'django_filters',
    'drf_spectacular',
    
    # Local apps
    'accounts',
    'api',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# ==================== DATABASE ====================
TESTING = 'test' in sys.argv or 'pytest' in sys.modules

if TESTING:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': ':memory:',
            'ATOMIC_REQUESTS': True,
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': 'vetsystem_db',
            'USER': 'fabianosf',
            'PASSWORD': '123',
            'HOST': 'localhost',
            'PORT': '5432',
        }
    }

# ==================== PASSWORD VALIDATION ====================
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', 'OPTIONS': {'min_length': 8}},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

if TESTING:
    PASSWORD_HASHERS = ['django.contrib.auth.hashers.MD5PasswordHasher']

# ==================== INTERNATIONALIZATION ====================
LANGUAGE_CODE = 'pt-br'
TIME_ZONE = 'America/Sao_Paulo'
USE_I18N = True
USE_TZ = True

# ==================== STATIC & MEDIA ====================
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ==================== REST FRAMEWORK ====================
REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour'
    },
    'TEST_REQUEST_DEFAULT_FORMAT': 'json',
}

# ==================== JWT SETTINGS ====================
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
    'JTI_CLAIM': 'jti',
}

# ==================== CORS SETTINGS ====================
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'accept', 'accept-encoding', 'authorization', 'content-type',
    'dnt', 'origin', 'user-agent', 'x-csrftoken', 'x-requested-with',
]

# ==================== SECURITY SETTINGS ====================
# Em desenvolvimento, algumas proteções são desabilitadas
if DEBUG:
    SECURE_SSL_REDIRECT = False
    SESSION_COOKIE_SECURE = False
    CSRF_COOKIE_SECURE = False
else:
    # PRODUÇÃO - Ativar TODAS as proteções
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True

# Proteções sempre ativas
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
CSRF_COOKIE_HTTPONLY = True
SESSION_COOKIE_HTTPONLY = True

# ==================== DRF SPECTACULAR ====================
SPECTACULAR_SETTINGS = {
    'TITLE': 'VetSystem API',
    'DESCRIPTION': 'API completa para gestão de clínica veterinária com autenticação JWT',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True,
    'SCHEMA_PATH_PREFIX': '/api/',
    'SWAGGER_UI_SETTINGS': {
        'deepLinking': True,
        'persistAuthorization': True,
        'displayOperationId': True,
    },
}

# ==================== LOGGING ====================
LOGS_DIR = BASE_DIR / 'logs'
LOGS_DIR.mkdir(exist_ok=True)

if not TESTING:
    LOGGING = {
        'version': 1,
        'disable_existing_loggers': False,
        'formatters': {
            'verbose': {
                'format': '{levelname} {asctime} {module} {message}',
                'style': '{',
            },
        },
        'handlers': {
            'file': {
                'level': 'INFO',
                'class': 'logging.FileHandler',
                'filename': LOGS_DIR / 'vetsystem.log',
                'formatter': 'verbose',
            },
            'security': {
                'level': 'WARNING',
                'class': 'logging.FileHandler',
                'filename': LOGS_DIR / 'security.log',
                'formatter': 'verbose',
            },
        },
        'loggers': {
            'django': {
                'handlers': ['file'],
                'level': 'INFO',
                'propagate': True,
            },
            'django.security': {
                'handlers': ['security'],
                'level': 'WARNING',
                'propagate': False,
            },
        },
    }
else:
    LOGGING = {
        'version': 1,
        'disable_existing_loggers': True,
        'handlers': {'null': {'class': 'logging.NullHandler'}},
        'root': {'handlers': ['null']},
    }

# ==================== TESTING SETTINGS ====================
if TESTING:
    MEDIA_ROOT = '/tmp/vetsystem_test_media'
    STATIC_ROOT = '/tmp/vetsystem_test_static'
    REST_FRAMEWORK['DEFAULT_THROTTLE_CLASSES'] = []
    REST_FRAMEWORK['DEFAULT_THROTTLE_RATES'] = {}



# ============================================================
# CONFIGURAÇÕES DE SEGURANÇA PARA PRODUÇÃO
# ============================================================

# Em produção, mude DEBUG para False
if not DEBUG:
    # HTTPS/SSL
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    
    # Security Headers
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
    
    # HSTS (HTTP Strict Transport Security)
    SECURE_HSTS_SECONDS = 31536000  # 1 ano
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
else:
    # Em desenvolvimento, não force HTTPS
    SECURE_SSL_REDIRECT = False
    SESSION_COOKIE_SECURE = False
    CSRF_COOKIE_SECURE = False
    SECURE_HSTS_SECONDS = 0



# ============================================================
# SEGURANÇA PARA PRODUÇÃO
# ============================================================
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True

# ==============================================================================
# CONFIGURAÇÕES DE EMAIL
# ==============================================================================

# Email Backend (use console para desenvolvimento, SMTP para produção)
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'  # Dev: emails no console
# EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'  # Produção: SMTP real

# Configurações SMTP (Gmail exemplo - para produção)
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'seu-email@gmail.com'  # Mudar para seu email
EMAIL_HOST_PASSWORD = 'sua-senha-app'     # Senha de aplicativo do Gmail
DEFAULT_FROM_EMAIL = 'VetSystem <noreply@vetsystem.com>'

# ==============================================================================
# CELERY - TAREFAS ASSÍNCRONAS
# ==============================================================================

CELERY_BROKER_URL = 'redis://localhost:6379/0'
CELERY_RESULT_BACKEND = 'redis://localhost:6379/0'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'America/Sao_Paulo'

# Celery Beat - Tarefas Agendadas
CELERY_BEAT_SCHEDULE = {
    'enviar-lembretes-diarios': {
        'task': 'api.tasks.enviar_lembretes_consultas',
        'schedule': 86400.0,  # A cada 24 horas
    },
    'verificar-vacinas-vencendo': {
        'task': 'api.tasks.verificar_vacinas_vencendo',
        'schedule': 86400.0,  # A cada 24 horas
    },
}

# Configuração REST Framework - Permitir acesso público
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
}

# Django REST Framework - Acesso público para desenvolvimento
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 100,
}


# Email Configuration
from decouple import config

EMAIL_BACKEND = config('EMAIL_BACKEND', default='django.core.mail.backends.console.EmailBackend')
EMAIL_HOST = config('EMAIL_HOST', default='smtp.gmail.com')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_USE_TLS = config('EMAIL_USE_TLS', default=True, cast=bool)
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='noreply@vetsystem.com')

# Twilio Configuration
TWILIO_ACCOUNT_SID = config('TWILIO_ACCOUNT_SID', default='')
TWILIO_AUTH_TOKEN = config('TWILIO_AUTH_TOKEN', default='')
TWILIO_WHATSAPP_NUMBER = config('TWILIO_WHATSAPP_NUMBER', default='')
