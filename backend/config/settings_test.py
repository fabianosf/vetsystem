"""
Settings específicos para testes
"""
from .settings import *

# Sobrescrever configuração de banco de dados
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

# Password hashers mais rápidos para testes
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.MD5PasswordHasher',
]

# Desabilitar migrações em testes (acelera muito)
class DisableMigrations:
    def __contains__(self, item):
        return True
    
    def __getitem__(self, item):
        return None

MIGRATION_MODULES = DisableMigrations()

# Desabilitar debug em testes
DEBUG = False

# Media e static simplificados
MEDIA_ROOT = '/tmp/vetsystem_test_media'
STATIC_ROOT = '/tmp/vetsystem_test_static'
