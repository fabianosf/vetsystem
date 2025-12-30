"""
Testes de API para Plano de Saúde
"""
import pytest
from rest_framework import status
from rest_framework.test import APIClient
from datetime import date, timedelta
from decimal import Decimal

from api.models import PlanoSaude, ContratoPlano
from api.tests.factories import (
    PlanoSaudeFactory, ContratoPlanoFactory, TutorFactory
)


@pytest.mark.django_db
class TestPlanoSaudeAPI:
    """Testes da API de Planos de Saúde"""
    
    def setup_method(self):
        """Setup para cada teste"""
        self.client = APIClient()
        self.list_url = '/api/planos-saude/'
        self.detail_url = lambda pk: f'/api/planos-saude/{pk}/'
    
    def test_list_planos(self):
        """Testa listagem de planos"""
        PlanoSaudeFactory.create_batch(3)
        
        response = self.client.get(self.list_url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 3
    
    def test_create_plano(self):
        """Testa criação de plano"""
        data = {
            'nome': 'PREMIUM',
            'descricao': 'Plano completo para seu pet',
            'preco_mensal': '149.90',
            'consultas_mes': 5,
            'exames_mes': 3,
            'vacinas_ano': 4,
            'telemedicina_incluida': True,
            'atendimento_24h': False,
            'internacao_incluida': True,
            'emergencia_prioritaria': True,
            'desconto_cirurgia': 20,
            'desconto_medicamentos': 15
        }
        
        response = self.client.post(self.list_url, data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['nome'] == 'PREMIUM'
        assert Decimal(response.data['preco_mensal']) == Decimal('149.90')
        assert PlanoSaude.objects.count() == 1
    
    def test_retrieve_plano(self):
        """Testa recuperação de um plano específico"""
        plano = PlanoSaudeFactory()
        
        response = self.client.get(self.detail_url(plano.id))
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['id'] == plano.id
        assert 'consultas_ilimitadas' in response.data
        assert 'exames_ilimitados' in response.data
        assert 'vacinas_ilimitadas' in response.data
    
    def test_update_plano_preco(self):
        """Testa atualização de preço do plano"""
        plano = PlanoSaudeFactory(preco_mensal=Decimal('100.00'))
        
        data = {'preco_mensal': '129.90'}
        
        response = self.client.patch(
            self.detail_url(plano.id),
            data,
            format='json'
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert Decimal(response.data['preco_mensal']) == Decimal('129.90')
    
    def test_delete_plano(self):
        """Testa deleção de plano"""
        plano = PlanoSaudeFactory()
        
        response = self.client.delete(self.detail_url(plano.id))
        
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert PlanoSaude.objects.count() == 0
    
    def test_filter_planos_by_nome(self):
        """Testa filtro de planos por nome"""
        PlanoSaudeFactory(nome='BASICO')
        PlanoSaudeFactory(nome='PREMIUM')
        PlanoSaudeFactory(nome='VIP')
        
        response = self.client.get(self.list_url, {'nome': 'PREMIUM'})
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1
        assert response.data['results'][0]['nome'] == 'PREMIUM'
    
    def test_plano_consultas_ilimitadas(self):
        """Testa plano com consultas ilimitadas"""
        plano = PlanoSaudeFactory(consultas_mes=None)
        
        response = self.client.get(self.detail_url(plano.id))
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['consultas_ilimitadas'] is True


@pytest.mark.django_db
class TestContratoPlanoAPI:
    """Testes da API de Contratos de Plano"""
    
    def setup_method(self):
        """Setup para cada teste"""
        self.client = APIClient()
        self.list_url = '/api/contratos-plano/'
        self.detail_url = lambda pk: f'/api/contratos-plano/{pk}/'
    
    def test_list_contratos(self):
        """Testa listagem de contratos"""
        ContratoPlanoFactory.create_batch(5)
        
        response = self.client.get(self.list_url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 5
    
    def test_create_contrato(self):
        """Testa criação de contrato"""
        tutor = TutorFactory()
        plano = PlanoSaudeFactory()
        
        data = {
            'tutor': tutor.id,
            'plano': plano.id,
            'data_inicio': str(date.today()),
            'status': 'ATIVO'
        }
        
        response = self.client.post(self.list_url, data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['status'] == 'ATIVO'
        assert ContratoPlano.objects.count() == 1
    
    def test_retrieve_contrato(self):
        """Testa recuperação de um contrato específico"""
        contrato = ContratoPlanoFactory()
        
        response = self.client.get(self.detail_url(contrato.id))
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['id'] == contrato.id
        assert 'pode_agendar_consulta' in response.data
        assert 'pode_fazer_exame' in response.data
        assert 'pode_vacinar' in response.data
    
    def test_update_contrato_status(self):
        """Testa atualização de status do contrato"""
        contrato = ContratoPlanoFactory(status='ATIVO')
        
        data = {'status': 'CANCELADO'}
        
        response = self.client.patch(
            self.detail_url(contrato.id),
            data,
            format='json'
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'CANCELADO'
    
    def test_incrementar_consultas_utilizadas(self):
        """Testa incremento de consultas utilizadas"""
        contrato = ContratoPlanoFactory(consultas_utilizadas_mes=0)
        
        data = {'consultas_utilizadas_mes': 1}
        
        response = self.client.patch(
            self.detail_url(contrato.id),
            data,
            format='json'
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['consultas_utilizadas_mes'] == 1
    
    def test_filter_contratos_by_tutor(self):
        """Testa filtro de contratos por tutor"""
        tutor1 = TutorFactory()
        tutor2 = TutorFactory()
        
        ContratoPlanoFactory.create_batch(3, tutor=tutor1)
        ContratoPlanoFactory.create_batch(2, tutor=tutor2)
        
        response = self.client.get(self.list_url, {'tutor': tutor1.id})
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 3
    
    def test_filter_contratos_by_status(self):
        """Testa filtro de contratos por status"""
        ContratoPlanoFactory(status='ATIVO')
        ContratoPlanoFactory(status='CANCELADO')
        ContratoPlanoFactory(status='ATIVO')
        
        response = self.client.get(self.list_url, {'status': 'ATIVO'})
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 2
    
    def test_pode_agendar_consulta_com_limite(self):
        """Testa verificação de limite de consultas"""
        plano = PlanoSaudeFactory(consultas_mes=3)
        contrato = ContratoPlanoFactory(
            plano=plano,
            consultas_utilizadas_mes=2
        )
        
        response = self.client.get(self.detail_url(contrato.id))
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['pode_agendar_consulta'] is True
    
    def test_nao_pode_agendar_consulta_limite_atingido(self):
        """Testa quando limite de consultas foi atingido"""
        plano = PlanoSaudeFactory(consultas_mes=3)
        contrato = ContratoPlanoFactory(
            plano=plano,
            consultas_utilizadas_mes=3
        )
        
        response = self.client.get(self.detail_url(contrato.id))
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['pode_agendar_consulta'] is False
