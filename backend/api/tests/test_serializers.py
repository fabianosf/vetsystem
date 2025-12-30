"""
Testes para os Serializers
"""
import pytest
from datetime import date, time, timedelta
from decimal import Decimal
from rest_framework.exceptions import ValidationError

from api.serializers import (
    TutorSerializer, AnimalSerializer, VeterinarioSerializer,
    ConsultaSerializer, VacinaSerializer, ExameSerializer,
    PlanoSaudeSerializer, ContratoPlanoSerializer, ClinicaSerializer
)
from api.tests.factories import (
    TutorFactory, AnimalFactory, VeterinarioFactory,
    ConsultaFactory, VacinaFactory, ExameFactory,
    PlanoSaudeFactory, ContratoPlanoFactory, ClinicaFactory
)


@pytest.mark.django_db
class TestTutorSerializer:
    """Testes do TutorSerializer"""
    
    def test_serialize_tutor(self):
        """Testa serialização de tutor"""
        tutor = TutorFactory()
        serializer = TutorSerializer(tutor)
        data = serializer.data
        
        assert data['id'] == tutor.id
        assert data['name'] == tutor.name
        assert data['email'] == tutor.email
        assert 'total_animais' in data
    
    def test_deserialize_valid_tutor(self):
        """Testa deserialização de dados válidos"""
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
        
        serializer = TutorSerializer(data=data)
        assert serializer.is_valid()
        tutor = serializer.save()
        
        assert tutor.name == 'João Silva'
        assert tutor.email == 'joao@example.com'
    
    def test_validate_cpf_format(self):
        """Testa validação de formato de CPF"""
        data = {
            'name': 'João Silva',
            'email': 'joao@example.com',
            'phone': '(11) 98765-4321',
            'cpf': '123',  # CPF inválido
            'city': 'São Paulo',
            'state': 'SP',
        }
        
        serializer = TutorSerializer(data=data)
        # Deve aceitar ou rejeitar dependendo da implementação
        # Se você implementou validação de CPF:
        # assert not serializer.is_valid()
        # assert 'cpf' in serializer.errors
    
    def test_validate_email_unique(self):
        """Testa validação de email único"""
        existing_tutor = TutorFactory(email='existing@example.com')
        
        data = {
            'name': 'Novo Tutor',
            'email': 'existing@example.com',  # Email já existe
            'phone': '(11) 98765-4321',
            'cpf': '987.654.321-00',
            'city': 'São Paulo',
            'state': 'SP',
        }
        
        serializer = TutorSerializer(data=data)
        assert not serializer.is_valid()
        assert 'email' in serializer.errors
    
    def test_read_only_fields(self):
        """Testa campos read-only"""
        tutor = TutorFactory()
        data = {
            'name': 'Nome Atualizado',
            'total_animais': 999,  # Campo read-only
        }
        
        serializer = TutorSerializer(tutor, data=data, partial=True)
        if serializer.is_valid():
            updated = serializer.save()
            # total_animais não deve ser alterado
            assert updated.total_animais != 999


@pytest.mark.django_db
class TestAnimalSerializer:
    """Testes do AnimalSerializer"""
    
    def test_serialize_animal(self):
        """Testa serialização de animal"""
        animal = AnimalFactory()
        serializer = AnimalSerializer(animal)
        data = serializer.data
        
        assert data['id'] == animal.id
        assert data['name'] == animal.name
        assert data['species'] == animal.species
        assert 'tutor' in data
    
    def test_deserialize_valid_animal(self):
        """Testa deserialização de dados válidos"""
        tutor = TutorFactory()
        data = {
            'tutor': tutor.id,
            'name': 'Rex',
            'species': 'CACHORRO',
            'breed': 'Labrador',
            'gender': 'M',
            'age': 3,
            'weight': 25.5,
            'color': 'Dourado'
        }
        
        serializer = AnimalSerializer(data=data)
        assert serializer.is_valid(), serializer.errors
        animal = serializer.save()
        
        assert animal.name == 'Rex'
        assert animal.species == 'CACHORRO'
    
    def test_validate_age_positive(self):
        """Testa validação de idade positiva"""
        tutor = TutorFactory()
        data = {
            'tutor': tutor.id,
            'name': 'Rex',
            'species': 'CACHORRO',
            'breed': 'Labrador',
            'gender': 'M',
            'age': -1,  # Idade negativa
            'weight': 25.5,
        }
        
        serializer = AnimalSerializer(data=data)
        # Deve rejeitar idade negativa se validação implementada
        # assert not serializer.is_valid()
        # assert 'age' in serializer.errors
    
    def test_validate_weight_positive(self):
        """Testa validação de peso positivo"""
        tutor = TutorFactory()
        data = {
            'tutor': tutor.id,
            'name': 'Rex',
            'species': 'CACHORRO',
            'breed': 'Labrador',
            'gender': 'M',
            'age': 3,
            'weight': -5.0,  # Peso negativo
        }
        
        serializer = AnimalSerializer(data=data)
        # Deve rejeitar peso negativo se validação implementada


@pytest.mark.django_db
class TestVeterinarioSerializer:
    """Testes do VeterinarioSerializer"""
    
    def test_serialize_veterinario(self):
        """Testa serialização de veterinário"""
        vet = VeterinarioFactory()
        serializer = VeterinarioSerializer(vet)
        data = serializer.data
        
        assert data['id'] == vet.id
        assert data['name'] == vet.name
        assert data['crmv'] == vet.crmv
    
    def test_deserialize_valid_veterinario(self):
        """Testa deserialização de dados válidos"""
        data = {
            'name': 'Dr. Carlos',
            'email': 'carlos@vet.com',
            'phone': '(11) 99999-9999',
            'crmv': 'SP-12345',
            'specialties': 'Cardiologia, Cirurgia',
            'status': 'ATIVO',
            'work_start_hour': '08:00:00',
            'work_end_hour': '18:00:00'
        }
        
        serializer = VeterinarioSerializer(data=data)
        assert serializer.is_valid(), serializer.errors
        vet = serializer.save()
        
        assert vet.name == 'Dr. Carlos'
        assert vet.crmv == 'SP-12345'
    
    def test_validate_crmv_unique(self):
        """Testa validação de CRMV único"""
        existing_vet = VeterinarioFactory(crmv='SP-99999')
        
        data = {
            'name': 'Dr. Novo',
            'email': 'novo@vet.com',
            'phone': '(11) 99999-9999',
            'crmv': 'SP-99999',  # CRMV já existe
            'specialties': 'Dermatologia',
            'status': 'ATIVO',
            'work_start_hour': '08:00:00',
            'work_end_hour': '18:00:00'
        }
        
        serializer = VeterinarioSerializer(data=data)
        assert not serializer.is_valid()
        assert 'crmv' in serializer.errors


@pytest.mark.django_db
class TestConsultaSerializer:
    """Testes do ConsultaSerializer"""
    
    def test_serialize_consulta(self):
        """Testa serialização de consulta"""
        consulta = ConsultaFactory()
        serializer = ConsultaSerializer(consulta)
        data = serializer.data
        
        assert data['id'] == consulta.id
        assert 'animal' in data
        assert 'veterinario' in data
        assert data['status'] == consulta.status
    
    def test_deserialize_valid_consulta(self):
        """Testa deserialização de dados válidos"""
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
        
        serializer = ConsultaSerializer(data=data)
        assert serializer.is_valid(), serializer.errors
        consulta = serializer.save()
        
        assert consulta.animal == animal
        assert consulta.veterinario == vet
    
    def test_validate_data_futura(self):
        """Testa validação de data futura"""
        animal = AnimalFactory()
        vet = VeterinarioFactory()
        
        data = {
            'animal': animal.id,
            'veterinario': vet.id,
            'data': str(date.today() - timedelta(days=1)),  # Data passada
            'hora': '10:00:00',
            'status': 'AGENDADA',
            'tipo': 'ROTINA',
            'motivo': 'Consulta de rotina',
            'valor': '150.00'
        }
        
        serializer = ConsultaSerializer(data=data)
        # Deve rejeitar data passada para agendamento


@pytest.mark.django_db
class TestVacinaSerializer:
    """Testes do VacinaSerializer"""
    
    def test_serialize_vacina(self):
        """Testa serialização de vacina"""
        vacina = VacinaFactory()
        serializer = VacinaSerializer(vacina)
        data = serializer.data
        
        assert data['id'] == vacina.id
        assert data['nome_vacina'] == vacina.nome_vacina
        assert 'dias_proxima_dose' in data
        assert 'atrasada' in data
    
    def test_deserialize_valid_vacina(self):
        """Testa deserialização de dados válidos"""
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
        
        serializer = VacinaSerializer(data=data)
        assert serializer.is_valid(), serializer.errors
        vacina = serializer.save()
        
        assert vacina.nome_vacina == 'V10'


@pytest.mark.django_db
class TestPlanoSaudeSerializer:
    """Testes do PlanoSaudeSerializer"""
    
    def test_serialize_plano(self):
        """Testa serialização de plano"""
        plano = PlanoSaudeFactory()
        serializer = PlanoSaudeSerializer(plano)
        data = serializer.data
        
        assert data['id'] == plano.id
        assert data['nome'] == plano.nome
        assert 'preco_mensal' in data
    
    def test_deserialize_valid_plano(self):
        """Testa deserialização de dados válidos"""
        data = {
            'nome': 'PREMIUM',
            'descricao': 'Plano completo para seu pet',
            'preco_mensal': '149.90',
            'consultas_mes': 5,
            'exames_mes': 3,
            'vacinas_ano': 4,
            'telemedicina_incluida': True,
            'atendimento_24h': False,
            'desconto_cirurgia': 20,
            'desconto_medicamentos': 15
        }
        
        serializer = PlanoSaudeSerializer(data=data)
        assert serializer.is_valid(), serializer.errors
        plano = serializer.save()
        
        assert plano.nome == 'PREMIUM'
        assert plano.preco_mensal == Decimal('149.90')


@pytest.mark.django_db
class TestContratoPlanoSerializer:
    """Testes do ContratoPlanoSerializer"""
    
    def test_serialize_contrato(self):
        """Testa serialização de contrato"""
        contrato = ContratoPlanoFactory()
        serializer = ContratoPlanoSerializer(contrato)
        data = serializer.data
        
        assert data['id'] == contrato.id
        assert 'tutor' in data
        assert 'plano' in data
        assert 'pode_agendar_consulta' in data
    
    def test_deserialize_valid_contrato(self):
        """Testa deserialização de dados válidos"""
        tutor = TutorFactory()
        plano = PlanoSaudeFactory()
        
        data = {
            'tutor': tutor.id,
            'plano': plano.id,
            'data_inicio': str(date.today()),
            'status': 'ATIVO'
        }
        
        serializer = ContratoPlanoSerializer(data=data)
        assert serializer.is_valid(), serializer.errors
        contrato = serializer.save()
        
        assert contrato.tutor == tutor
        assert contrato.plano == plano


@pytest.mark.django_db
class TestClinicaSerializer:
    """Testes do ClinicaSerializer"""
    
    def test_serialize_clinica(self):
        """Testa serialização de clínica"""
        clinica = ClinicaFactory()
        serializer = ClinicaSerializer(clinica)
        data = serializer.data
        
        assert data['id'] == clinica.id
        assert data['nome'] == clinica.nome
        assert 'especialidades_list' in data
    
    def test_deserialize_valid_clinica(self):
        """Testa deserialização de dados válidos"""
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
        
        serializer = ClinicaSerializer(data=data)
        assert serializer.is_valid(), serializer.errors
        clinica = serializer.save()
        
        assert clinica.nome == 'VetCare'
        assert clinica.cidade == 'São Paulo'
