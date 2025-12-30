"""
Testes de API para Consulta
"""
import pytest
from rest_framework import status
from rest_framework.test import APIClient
from datetime import date, time, timedelta
from decimal import Decimal

from api.models import Consulta
from api.tests.factories import (
    ConsultaFactory, AnimalFactory, VeterinarioFactory
)


@pytest.mark.django_db
class TestConsultaAPI:
    """Testes da API de Consultas"""
    
    def setup_method(self):
        """Setup para cada teste"""
        self.client = APIClient()
        self.list_url = '/api/consultas/'
        self.detail_url = lambda pk: f'/api/consultas/{pk}/'
    
    def test_list_consultas(self):
        """Testa listagem de consultas"""
        ConsultaFactory.create_batch(5)
        
        response = self.client.get(self.list_url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 5
    
    def test_create_consulta(self):
        """Testa criação de consulta"""
        animal = AnimalFactory()
        vet = VeterinarioFactory()
        
        data = {
            'animal': animal.id,
            'veterinario': vet.id,
            'data': str(date.today() + timedelta(days=1)),
            'hora': '10:00:00',
            'status': 'AGENDADA',
            'tipo': 'ROTINA',
            'motivo': 'Consulta de rotina',
            'valor': '150.00'
        }
        
        response = self.client.post(self.list_url, data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['status'] == 'AGENDADA'
        assert Consulta.objects.count() == 1
    
    def test_retrieve_consulta(self):
        """Testa recuperação de uma consulta específica"""
        consulta = ConsultaFactory()
        
        response = self.client.get(self.detail_url(consulta.id))
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['id'] == consulta.id
    
    def test_update_consulta_status(self):
        """Testa atualização do status da consulta"""
        consulta = ConsultaFactory(status='AGENDADA')
        
        data = {'status': 'CONFIRMADA'}
        
        response = self.client.patch(
            self.detail_url(consulta.id),
            data,
            format='json'
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'CONFIRMADA'
        
        consulta.refresh_from_db()
        assert consulta.status == 'CONFIRMADA'
    
    def test_delete_consulta(self):
        """Testa deleção de consulta"""
        consulta = ConsultaFactory()
        
        response = self.client.delete(self.detail_url(consulta.id))
        
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert Consulta.objects.count() == 0
    
    def test_filter_consultas_by_status(self):
        """Testa filtro de consultas por status"""
        ConsultaFactory(status='AGENDADA')
        ConsultaFactory(status='CONFIRMADA')
        ConsultaFactory(status='AGENDADA')
        
        response = self.client.get(self.list_url, {'status': 'AGENDADA'})
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 2
    
    def test_filter_consultas_by_veterinario(self):
        """Testa filtro de consultas por veterinário"""
        vet1 = VeterinarioFactory()
        vet2 = VeterinarioFactory()
        
        ConsultaFactory.create_batch(3, veterinario=vet1)
        ConsultaFactory.create_batch(2, veterinario=vet2)
        
        response = self.client.get(self.list_url, {'veterinario': vet1.id})
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 3
    
    def test_filter_consultas_by_data(self):
        """Testa filtro de consultas por data"""
        data_consulta = date.today() + timedelta(days=5)
        
        ConsultaFactory(data=data_consulta)
        ConsultaFactory(data=date.today() + timedelta(days=10))
        
        response = self.client.get(
            self.list_url,
            {'data': str(data_consulta)}
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1
    
    def test_conflito_horario_veterinario(self):
        """Testa que não permite consultas no mesmo horário para o mesmo vet"""
        vet = VeterinarioFactory()
        animal1 = AnimalFactory()
        animal2 = AnimalFactory()
        
        data_consulta = date.today() + timedelta(days=1)
        hora_consulta = time(10, 0)
        
        # Primeira consulta
        ConsultaFactory(
            veterinario=vet,
            data=data_consulta,
            hora=hora_consulta
        )
        
        # Tentar criar segunda consulta no mesmo horário
        data = {
            'animal': animal2.id,
            'veterinario': vet.id,
            'data': str(data_consulta),
            'hora': str(hora_consulta),
            'status': 'AGENDADA',
            'tipo': 'ROTINA',
            'motivo': 'Consulta',
            'valor': '150.00'
        }
        
        response = self.client.post(self.list_url, data, format='json')
        
        # Deve retornar erro
        assert response.status_code == status.HTTP_400_BAD_REQUEST
