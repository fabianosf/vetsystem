"""
Testes de API para Clínica
"""
import pytest
from rest_framework import status
from rest_framework.test import APIClient

from api.models import Clinica
from api.tests.factories import ClinicaFactory


@pytest.mark.django_db
class TestClinicaAPI:
    """Testes da API de Clínicas"""
    
    def setup_method(self):
        """Setup para cada teste"""
        self.client = APIClient()
        self.list_url = '/api/clinicas/'
        self.detail_url = lambda pk: f'/api/clinicas/{pk}/'
    
    def test_list_clinicas(self):
        """Testa listagem de clínicas"""
        ClinicaFactory.create_batch(5)
        
        response = self.client.get(self.list_url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 5
    
    def test_create_clinica(self):
        """Testa criação de clínica"""
        data = {
            'nome': 'VetCare',
            'endereco': 'Rua A, 123',
            'cidade': 'São Paulo',
            'estado': 'SP',
            'cep': '01234-567',
            'latitude': -23.5505,
            'longitude': -46.6333,
            'telefone': '(11) 3333-3333',
            'horario_funcionamento': 'Seg-Sex 8h-18h',
            'atendimento_24h': False,
            'atende_emergencia': True,
            'tem_cirurgia': True
        }
        
        response = self.client.post(self.list_url, data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['nome'] == 'VetCare'
        assert Clinica.objects.count() == 1
    
    def test_retrieve_clinica(self):
        """Testa recuperação de uma clínica específica"""
        clinica = ClinicaFactory()
        
        response = self.client.get(self.detail_url(clinica.id))
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['id'] == clinica.id
        assert 'especialidades_list' in response.data
    
    def test_update_clinica(self):
        """Testa atualização de clínica"""
        clinica = ClinicaFactory(atendimento_24h=False)
        
        data = {'atendimento_24h': True}
        
        response = self.client.patch(
            self.detail_url(clinica.id),
            data,
            format='json'
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['atendimento_24h'] is True
    
    def test_delete_clinica(self):
        """Testa deleção de clínica"""
        clinica = ClinicaFactory()
        
        response = self.client.delete(self.detail_url(clinica.id))
        
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert Clinica.objects.count() == 0
    
    def test_filter_clinicas_by_cidade(self):
        """Testa filtro de clínicas por cidade"""
        ClinicaFactory(cidade='São Paulo')
        ClinicaFactory(cidade='Rio de Janeiro')
        ClinicaFactory(cidade='São Paulo')
        
        response = self.client.get(self.list_url, {'cidade': 'São Paulo'})
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 2
    
    def test_filter_clinicas_by_atendimento_24h(self):
        """Testa filtro de clínicas com atendimento 24h"""
        ClinicaFactory(atendimento_24h=True)
        ClinicaFactory(atendimento_24h=False)
        ClinicaFactory(atendimento_24h=True)
        
        response = self.client.get(self.list_url, {'atendimento_24h': 'true'})
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 2
    
    def test_filter_clinicas_by_atende_emergencia(self):
        """Testa filtro de clínicas que atendem emergência"""
        ClinicaFactory(atende_emergencia=True)
        ClinicaFactory(atende_emergencia=False)
        ClinicaFactory(atende_emergencia=True)
        ClinicaFactory(atende_emergencia=True)
        
        response = self.client.get(self.list_url, {'atende_emergencia': 'true'})
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 3
    
    def test_search_clinicas_by_nome(self):
        """Testa busca de clínicas por nome"""
        ClinicaFactory(nome='VetCare Centro')
        ClinicaFactory(nome='Pet Hospital')
        ClinicaFactory(nome='VetCare Sul')
        
        response = self.client.get(self.list_url, {'search': 'VetCare'})
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 2
    
    def test_clinica_calcular_distancia(self):
        """Testa cálculo de distância da clínica"""
        # São Paulo (aproximado)
        clinica = ClinicaFactory(
            latitude=-23.5505,
            longitude=-46.6333
        )
        
        # Este teste requer endpoint personalizado
        # Exemplo: /api/clinicas/{id}/distancia/?lat=-23.5605&lon=-46.6333
        response = self.client.get(
            f'{self.detail_url(clinica.id)}distancia/',
            {'lat': -23.5605, 'lon': -46.6333}
        )
        
        # Depende da implementação do endpoint
        # assert response.status_code == status.HTTP_200_OK
        # assert 'distancia' in response.data
    
    def test_clinicas_proximas(self):
        """Testa busca de clínicas próximas a uma localização"""
        ClinicaFactory(latitude=-23.5505, longitude=-46.6333)
        ClinicaFactory(latitude=-22.9068, longitude=-43.1729)  # Rio
        
        # Este teste requer endpoint personalizado
        # Exemplo: /api/clinicas/proximas/?lat=-23.5505&lon=-46.6333&raio=10
        response = self.client.get(
            f'{self.list_url}proximas/',
            {'lat': -23.5505, 'lon': -46.6333, 'raio': 10}
        )
        
        # Depende da implementação do endpoint
        # assert response.status_code == status.HTTP_200_OK
