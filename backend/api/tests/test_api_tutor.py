"""
Testes de API para Tutor
"""
import pytest
from rest_framework import status
from rest_framework.test import APIClient
from django.urls import reverse
from decimal import Decimal

from api.models import Tutor
from api.tests.factories import TutorFactory, AnimalFactory


@pytest.mark.django_db
class TestTutorAPI:
    """Testes da API de Tutores"""
    
    def setup_method(self):
        """Setup para cada teste"""
        self.client = APIClient()
        self.list_url = '/api/tutores/'
        self.detail_url = lambda pk: f'/api/tutores/{pk}/'
    
    def test_list_tutores(self):
        """Testa listagem de tutores"""
        # Criar alguns tutores
        TutorFactory.create_batch(5)
        
        response = self.client.get(self.list_url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 5
    
    def test_create_tutor(self):
        """Testa criação de tutor"""
        data = {
            'name': 'João Silva',
            'email': 'joao@example.com',
            'phone': '(11) 98765-4321',
            'cpf': '123.456.789-01',
            'address': 'Rua A, 123',
            'city': 'São Paulo',
            'state': 'SP',
            'cep': '01234-567'
        }
        
        response = self.client.post(self.list_url, data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['name'] == 'João Silva'
        assert response.data['email'] == 'joao@example.com'
        assert Tutor.objects.count() == 1
    
    def test_retrieve_tutor(self):
        """Testa recuperação de um tutor específico"""
        tutor = TutorFactory()
        
        response = self.client.get(self.detail_url(tutor.id))
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['id'] == tutor.id
        assert response.data['name'] == tutor.name
    
    def test_update_tutor(self):
        """Testa atualização completa de tutor"""
        tutor = TutorFactory(name='Nome Antigo')
        
        data = {
            'name': 'Nome Novo',
            'email': tutor.email,
            'phone': tutor.phone,
            'cpf': tutor.cpf,
            'city': 'Rio de Janeiro',
            'state': 'RJ',
        }
        
        response = self.client.put(
            self.detail_url(tutor.id),
            data,
            format='json'
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['name'] == 'Nome Novo'
        assert response.data['city'] == 'Rio de Janeiro'
        
        tutor.refresh_from_db()
        assert tutor.name == 'Nome Novo'
    
    def test_partial_update_tutor(self):
        """Testa atualização parcial de tutor"""
        tutor = TutorFactory(name='Nome Antigo')
        
        data = {'name': 'Nome Atualizado'}
        
        response = self.client.patch(
            self.detail_url(tutor.id),
            data,
            format='json'
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['name'] == 'Nome Atualizado'
        
        tutor.refresh_from_db()
        assert tutor.name == 'Nome Atualizado'
    
    def test_delete_tutor(self):
        """Testa deleção de tutor"""
        tutor = TutorFactory()
        
        response = self.client.delete(self.detail_url(tutor.id))
        
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert Tutor.objects.count() == 0
    
    def test_create_tutor_email_duplicado(self):
        """Testa criação de tutor com email duplicado"""
        existing_tutor = TutorFactory(email='duplicado@example.com')
        
        data = {
            'name': 'Outro Tutor',
            'email': 'duplicado@example.com',  # Email duplicado
            'phone': '(11) 99999-9999',
            'cpf': '987.654.321-00',
            'city': 'São Paulo',
            'state': 'SP',
        }
        
        response = self.client.post(self.list_url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'email' in response.data
    
    def test_create_tutor_cpf_duplicado(self):
        """Testa criação de tutor com CPF duplicado"""
        existing_tutor = TutorFactory(cpf='12345678901')
        
        data = {
            'name': 'Outro Tutor',
            'email': 'novo@example.com',
            'phone': '(11) 99999-9999',
            'cpf': '12345678901',  # CPF duplicado
            'city': 'São Paulo',
            'state': 'SP',
        }
        
        response = self.client.post(self.list_url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'cpf' in response.data
    
    def test_filter_tutores_by_city(self):
        """Testa filtro de tutores por cidade"""
        TutorFactory(city='São Paulo')
        TutorFactory(city='Rio de Janeiro')
        TutorFactory(city='São Paulo')
        
        response = self.client.get(self.list_url, {'city': 'São Paulo'})
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 2
    
    def test_search_tutores_by_name(self):
        """Testa busca de tutores por nome"""
        TutorFactory(name='João Silva')
        TutorFactory(name='Maria Santos')
        TutorFactory(name='João Pedro')
        
        response = self.client.get(self.list_url, {'search': 'João'})
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 2
    
    def test_tutor_total_animais(self):
        """Testa se total_animais é retornado corretamente"""
        tutor = TutorFactory()
        AnimalFactory.create_batch(3, tutor=tutor)
        
        response = self.client.get(self.detail_url(tutor.id))
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['total_animais'] == 3
