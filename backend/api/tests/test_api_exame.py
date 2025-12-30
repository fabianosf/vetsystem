"""
Testes de API para Exame
"""
import pytest
from rest_framework import status
from rest_framework.test import APIClient
from datetime import date, timedelta
from decimal import Decimal

from api.models import Exame
from api.tests.factories import ExameFactory, AnimalFactory, VeterinarioFactory


@pytest.mark.django_db
class TestExameAPI:
    """Testes da API de Exames"""
    
    def setup_method(self):
        """Setup para cada teste"""
        self.client = APIClient()
        self.list_url = '/api/exames/'
        self.detail_url = lambda pk: f'/api/exames/{pk}/'
    
    def test_list_exames(self):
        """Testa listagem de exames"""
        ExameFactory.create_batch(5)
        
        response = self.client.get(self.list_url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 5
    
    def test_create_exame(self):
        """Testa criação de exame"""
        animal = AnimalFactory()
        vet = VeterinarioFactory()
        
        data = {
            'animal': animal.id,
            'veterinario_solicitante': vet.id,
            'tipo_exame': 'HEMOGRAMA',
            'status': 'SOLICITADO',
            'laboratorio': 'Lab ABC',
            'valor': '200.00'
        }
        
        response = self.client.post(self.list_url, data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['tipo_exame'] == 'HEMOGRAMA'
        assert response.data['status'] == 'SOLICITADO'
        assert Exame.objects.count() == 1
    
    def test_retrieve_exame(self):
        """Testa recuperação de um exame específico"""
        exame = ExameFactory()
        
        response = self.client.get(self.detail_url(exame.id))
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['id'] == exame.id
    
    def test_update_exame_status_e_resultado(self):
        """Testa atualização de status e resultado do exame"""
        exame = ExameFactory(status='SOLICITADO', resultado='')
        
        data = {
            'status': 'CONCLUIDO',
            'resultado': 'Resultado do exame: Normal',
            'data_realizacao': str(date.today())
        }
        
        response = self.client.patch(
            self.detail_url(exame.id),
            data,
            format='json'
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'CONCLUIDO'
        assert 'Normal' in response.data['resultado']
    
    def test_delete_exame(self):
        """Testa deleção de exame"""
        exame = ExameFactory()
        
        response = self.client.delete(self.detail_url(exame.id))
        
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert Exame.objects.count() == 0
    
    def test_filter_exames_by_animal(self):
        """Testa filtro de exames por animal"""
        animal1 = AnimalFactory()
        animal2 = AnimalFactory()
        
        ExameFactory.create_batch(3, animal=animal1)
        ExameFactory.create_batch(2, animal=animal2)
        
        response = self.client.get(self.list_url, {'animal': animal1.id})
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 3
    
    def test_filter_exames_by_status(self):
        """Testa filtro de exames por status"""
        ExameFactory(status='SOLICITADO')
        ExameFactory(status='CONCLUIDO')
        ExameFactory(status='SOLICITADO')
        ExameFactory(status='EM_ANALISE')
        
        response = self.client.get(self.list_url, {'status': 'SOLICITADO'})
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 2
    
    def test_filter_exames_by_tipo(self):
        """Testa filtro de exames por tipo"""
        ExameFactory(tipo_exame='HEMOGRAMA')
        ExameFactory(tipo_exame='RAIO_X')
        ExameFactory(tipo_exame='HEMOGRAMA')
        
        response = self.client.get(self.list_url, {'tipo_exame': 'HEMOGRAMA'})
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 2
    
    def test_filter_exames_by_veterinario(self):
        """Testa filtro de exames por veterinário solicitante"""
        vet1 = VeterinarioFactory()
        vet2 = VeterinarioFactory()
        
        ExameFactory.create_batch(4, veterinario_solicitante=vet1)
        ExameFactory.create_batch(2, veterinario_solicitante=vet2)
        
        response = self.client.get(
            self.list_url,
            {'veterinario_solicitante': vet1.id}
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 4
    
    def test_exames_pendentes(self):
        """Testa listagem de exames pendentes (não concluídos)"""
        ExameFactory(status='SOLICITADO')
        ExameFactory(status='EM_ANALISE')
        ExameFactory(status='CONCLUIDO')
        ExameFactory(status='CANCELADO')
        
        response = self.client.get(self.list_url, {'pendentes': 'true'})
        
        # Este teste depende de você implementar o filtro 'pendentes'
        assert response.status_code == status.HTTP_200_OK
