"""
Configurações globais para pytest
"""
import pytest
from django.conf import settings
from django.core.management import call_command
from rest_framework.test import APIClient
from django.contrib.auth.models import User


@pytest.fixture(scope='session')
def django_db_setup(django_db_setup, django_db_blocker):
    """
    Configuração do banco de dados para testes
    Cria todas as tabelas necessárias
    """
    with django_db_blocker.unblock():
        # Força uso de SQLite em memória
        settings.DATABASES['default'] = {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': ':memory:',
            'ATOMIC_REQUESTS': True,
        }
        
        # Criar todas as tabelas
        call_command('migrate', '--run-syncdb', verbosity=0)


@pytest.fixture
def api_client():
    """
    Cliente API para testes
    """
    return APIClient()


@pytest.fixture
def authenticated_client(api_client, user):
    """
    Cliente API autenticado
    """
    api_client.force_authenticate(user=user)
    return api_client


@pytest.fixture
def user(db):
    """
    Usuário de teste
    """
    return User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='testpass123'
    )


@pytest.fixture
def admin_user(db):
    """
    Usuário admin de teste
    """
    return User.objects.create_superuser(
        username='admin',
        email='admin@example.com',
        password='adminpass123'
    )
