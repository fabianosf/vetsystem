"""
Testes de API para Veterinário
"""
import pytest
from rest_framework import status
from rest_framework.test import APIClient

from api.models import Veterinario
from api.tests.factories import VeterinarioFactory


@pytest.mark.django_db
class TestVeterinarioAPI:
    """Testes da API de Veterinários"""
    
    def setup_method(self):
        """Setup para cada teste"""
        self.client = APIClient()
        self.list_url = '/api/veterinarios/'
        self.detail_url = lambda pk: f'/api/veterinarios/{pk}/'
    
    def test_list_veterinarios(self):
        """Testa listagem de veterinários"""
        VeterinarioFactory.create_batch(5)
        
        response = self.client.get(self.list_url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 5
    
    def test_create_veterinario(self):
        """Testa criação de veterinário"""
        data = {
            'name': 'Dr. Carlos Silva',
            'email': 'carlos@vet.com',
            'phone': '(11) 99999-9999',
            'crmv': 'SP-12345',
            'specialties': 'Cardiologia, Cirurgia',
            'status': 'ATIVO',
            'work_start_hour': '08:00:00',
            'work_end_hour': '18:00:00'
        }
        
        response = self.client.post(self.list_url, data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['name'] == 'Dr. Carlos Silva'
        assert response.data['crmv'] == 'SP-12345'
        assert Veterinario.objects.count() == 1
    
    def test_retrieve_veterinario(self):
        """Testa recuperação de um veterinário específico"""
        vet = VeterinarioFactory()
        
        response = self.client.get(self.detail_url(vet.id))
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['id'] == vet.id
        assert response.data['name'] == vet.name
    
    def test_update_veterinario_status(self):
        """Testa atualização de status do veterinário"""
        vet = VeterinarioFactory(status='ATIVO')
        
        data = {
            'name': vet.name,
            'email': vet.email,
            'phone': vet.phone,
            'crmv': vet.crmv,
            'specialties': vet.specialties,
            'status': 'FERIAS',  # Mudando status
            'work_start_hour': '08:00:00',
            'work_end_hour': '18:00:00'
        }
        
        response = self.client.put(
            self.detail_url(vet.id),
            data,
            format='json'
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'FERIAS'
    
    def test_delete_veterinario(self):
        """Testa deleção de veterinário"""
        vet = VeterinarioFactory()
        
        response = self.client.delete(self.detail_url(vet.id))
        
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert Veterinario.objects.count() == 0
    
    def test_filter_veterinarios_by_status(self):
        """Testa filtro de veterinários por status"""
        VeterinarioFactory(status='ATIVO')
        VeterinarioFactory(status='FERIAS')
        VeterinarioFactory(status='ATIVO')
        
        response = self.client.get(self.list_url, {'status': 'ATIVO'})
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 2
    
    def test_search_veterinarios_by_name(self):
        """Testa busca de veterinários por nome"""
        VeterinarioFactory(name='Dr. Carlos')
        VeterinarioFactory(name='Dra. Maria')
        VeterinarioFactory(name='Dr. Carlos Jr')
        
        response = self.client.get(self.list_url, {'search': 'Carlos'})
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 2
    
    def test_create_veterinario_crmv_duplicado(self):
        """Testa criação de veterinário com CRMV duplicado"""
        existing_vet = VeterinarioFactory(crmv='SP-99999')
        
        data = {
            'name': 'Outro Veterinário',
            'email': 'outro@vet.com',
            'phone': '(11) 88888-8888',
            'crmv': 'SP-99999',  # CRMV duplicado
            'specialties': 'Dermatologia',
            'status': 'ATIVO',
            'work_start_hour': '08:00:00',
            'work_end_hour': '18:00:00'
        }
        
        response = self.client.post(self.list_url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'crmv' in response.data
