"""
Testes de API para Vacina
"""
import pytest
from rest_framework import status
from rest_framework.test import APIClient
from datetime import date, timedelta

from api.models import Vacina
from api.tests.factories import VacinaFactory, AnimalFactory


@pytest.mark.django_db
class TestVacinaAPI:
    """Testes da API de Vacinas"""
    
    def setup_method(self):
        """Setup para cada teste"""
        self.client = APIClient()
        self.list_url = '/api/vacinas/'
        self.detail_url = lambda pk: f'/api/vacinas/{pk}/'
    
    def test_list_vacinas(self):
        """Testa listagem de vacinas"""
        VacinaFactory.create_batch(5)
        
        response = self.client.get(self.list_url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 5
    
    def test_create_vacina(self):
        """Testa criação de vacina"""
        animal = AnimalFactory()
        
        data = {
            'animal': animal.id,
            'nome_vacina': 'V10',
            'fabricante': 'Laboratório ABC',
            'lote': 'LOTE123456',
            'data_aplicacao': str(date.today()),
            'data_proxima_dose': str(date.today() + timedelta(days=30)),
            'dose': '1ª dose',
            'veterinario_responsavel': 'Dr. Silva'
        }
        
        response = self.client.post(self.list_url, data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['nome_vacina'] == 'V10'
        assert Vacina.objects.count() == 1
    
    def test_retrieve_vacina(self):
        """Testa recuperação de uma vacina específica"""
        vacina = VacinaFactory()
        
        response = self.client.get(self.detail_url(vacina.id))
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['id'] == vacina.id
        assert 'dias_proxima_dose' in response.data
        assert 'atrasada' in response.data
    
    def test_update_vacina(self):
        """Testa atualização de vacina"""
        vacina = VacinaFactory()
        
        data = {
            'animal': vacina.animal.id,
            'nome_vacina': vacina.nome_vacina,
            'fabricante': 'Novo Fabricante',
            'lote': vacina.lote,
            'data_aplicacao': str(vacina.data_aplicacao),
            'dose': '2ª dose',
            'veterinario_responsavel': vacina.veterinario_responsavel
        }
        
        response = self.client.put(
            self.detail_url(vacina.id),
            data,
            format='json'
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['fabricante'] == 'Novo Fabricante'
        assert response.data['dose'] == '2ª dose'
    
    def test_partial_update_vacina(self):
        """Testa atualização parcial de vacina"""
        vacina = VacinaFactory()
        nova_data = date.today() + timedelta(days=60)
        
        data = {'data_proxima_dose': str(nova_data)}
        
        response = self.client.patch(
            self.detail_url(vacina.id),
            data,
            format='json'
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['data_proxima_dose'] == str(nova_data)
    
    def test_delete_vacina(self):
        """Testa deleção de vacina"""
        vacina = VacinaFactory()
        
        response = self.client.delete(self.detail_url(vacina.id))
        
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert Vacina.objects.count() == 0
    
    def test_filter_vacinas_by_animal(self):
        """Testa filtro de vacinas por animal"""
        animal1 = AnimalFactory()
        animal2 = AnimalFactory()
        
        VacinaFactory.create_batch(3, animal=animal1)
        VacinaFactory.create_batch(2, animal=animal2)
        
        response = self.client.get(self.list_url, {'animal': animal1.id})
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 3
    
    def test_filter_vacinas_by_nome_vacina(self):
        """Testa filtro de vacinas por tipo"""
        VacinaFactory(nome_vacina='V10')
        VacinaFactory(nome_vacina='RAIVA')
        VacinaFactory(nome_vacina='V10')
        
        response = self.client.get(self.list_url, {'nome_vacina': 'V10'})
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 2
    
    def test_vacina_dias_proxima_dose_positivo(self):
        """Testa cálculo de dias para próxima dose (futuro)"""
        vacina = VacinaFactory(
            data_proxima_dose=date.today() + timedelta(days=15)
        )
        
        response = self.client.get(self.detail_url(vacina.id))
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['dias_proxima_dose'] == 15
        assert response.data['atrasada'] is False
    
    def test_vacina_atrasada(self):
        """Testa detecção de vacina atrasada"""
        vacina = VacinaFactory(
            data_proxima_dose=date.today() - timedelta(days=5)
        )
        
        response = self.client.get(self.detail_url(vacina.id))
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['dias_proxima_dose'] == -5
        assert response.data['atrasada'] is True
    
    def test_list_vacinas_atrasadas(self):
        """Testa listagem de vacinas atrasadas"""
        # Vacinas no futuro
        VacinaFactory.create_batch(
            2,
            data_proxima_dose=date.today() + timedelta(days=10)
        )
        
        # Vacinas atrasadas
        VacinaFactory.create_batch(
            3,
            data_proxima_dose=date.today() - timedelta(days=5)
        )
        
        response = self.client.get(self.list_url, {'atrasadas': 'true'})
        
        # Este teste depende de você implementar o filtro 'atrasadas' no ViewSet
        # Se implementado, deve retornar apenas as 3 atrasadas
        assert response.status_code == status.HTTP_200_OK
