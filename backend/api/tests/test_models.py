"""
Testes para os Models
"""
import pytest
from datetime import date, time, timedelta
from decimal import Decimal
from django.db import IntegrityError
from django.core.exceptions import ValidationError

from api.models import (
    Tutor, Animal, Veterinario, Consulta,
    Vacina, Exame, PlanoSaude, ContratoPlano, Clinica
)
from api.tests.factories import (
    TutorFactory, AnimalFactory, VeterinarioFactory,
    ConsultaFactory, VacinaFactory, ExameFactory,
    PlanoSaudeFactory, ContratoPlanoFactory, ClinicaFactory
)


@pytest.mark.django_db
class TestTutorModel:
    """Testes do model Tutor"""
    
    def test_create_tutor(self):
        """Testa criação de tutor"""
        tutor = TutorFactory()
        assert tutor.id is not None
        assert tutor.is_active is True
        assert tutor.created_at is not None
    
    def test_tutor_str(self):
        """Testa representação string do tutor"""
        tutor = TutorFactory(name='João Silva', cpf='12345678901')
        assert str(tutor) == 'João Silva - 12345678901'
    
    def test_tutor_email_unique(self):
        """Testa unicidade do email"""
        email = 'unique@test.com'
        TutorFactory(email=email)
        
        with pytest.raises(IntegrityError):
            TutorFactory(email=email)
    
    def test_tutor_cpf_unique(self):
        """Testa unicidade do CPF"""
        cpf = '12345678901'
        TutorFactory(cpf=cpf)
        
        with pytest.raises(IntegrityError):
            TutorFactory(cpf=cpf)
    
    def test_total_animais_property(self):
        """Testa propriedade total_animais"""
        tutor = TutorFactory()
        assert tutor.total_animais == 0
        
        AnimalFactory(tutor=tutor)
        AnimalFactory(tutor=tutor)
        assert tutor.total_animais == 2


@pytest.mark.django_db
class TestAnimalModel:
    """Testes do model Animal"""
    
    def test_create_animal(self):
        """Testa criação de animal"""
        animal = AnimalFactory()
        assert animal.id is not None
        assert animal.tutor is not None
    
    def test_animal_str(self):
        """Testa representação string do animal"""
        tutor = TutorFactory(name='Maria')
        animal = AnimalFactory(name='Rex', species='CACHORRO', tutor=tutor)
        assert 'Rex' in str(animal)
        assert 'CACHORRO' in str(animal)
        assert 'Maria' in str(animal)
    
    def test_microchip_unique(self):
        """Testa unicidade do microchip"""
        microchip = 'BR123456789'
        AnimalFactory(microchip=microchip)
        
        with pytest.raises(IntegrityError):
            AnimalFactory(microchip=microchip)
    
    def test_species_choices(self):
        """Testa choices de espécie"""
        animal = AnimalFactory(species='CACHORRO')
        assert animal.get_species_display() == 'Cachorro'
    
    def test_gender_choices(self):
        """Testa choices de gênero"""
        animal = AnimalFactory(gender='M')
        assert animal.get_gender_display() == 'Macho'


@pytest.mark.django_db
class TestVeterinarioModel:
    """Testes do model Veterinário"""
    
    def test_create_veterinario(self):
        """Testa criação de veterinário"""
        vet = VeterinarioFactory()
        assert vet.id is not None
        assert vet.status == 'ATIVO'
    
    def test_veterinario_str(self):
        """Testa representação string"""
        vet = VeterinarioFactory(name='Carlos', crmv='SP-12345')
        assert str(vet) == 'Dr(a). Carlos - CRMV: SP-12345'
    
    def test_crmv_unique(self):
        """Testa unicidade do CRMV"""
        crmv = 'SP-99999'
        VeterinarioFactory(crmv=crmv)
        
        with pytest.raises(IntegrityError):
            VeterinarioFactory(crmv=crmv)
    
    def test_especialidades_list_property(self):
        """Testa propriedade especialidades_list"""
        vet = VeterinarioFactory(specialties='Cardiologia, Dermatologia, Cirurgia')
        especialidades = vet.especialidades_list
        assert len(especialidades) == 3
        assert 'Cardiologia' in especialidades


@pytest.mark.django_db
class TestConsultaModel:
    """Testes do model Consulta"""
    
    def test_create_consulta(self):
        """Testa criação de consulta"""
        consulta = ConsultaFactory()
        assert consulta.id is not None
        assert consulta.status == 'AGENDADA'
    
    def test_consulta_str(self):
        """Testa representação string"""
        animal = AnimalFactory(name='Bob')
        consulta = ConsultaFactory(
            animal=animal,
            data=date(2025, 1, 15),
            hora=time(10, 0)
        )
        assert 'Bob' in str(consulta)
        assert '2025-01-15' in str(consulta)
    
    def test_unique_together_veterinario_data_hora(self):
        """Testa constraint de horário único por veterinário"""
        vet = VeterinarioFactory()
        data_consulta = date.today() + timedelta(days=1)
        hora_consulta = time(10, 0)
        
        ConsultaFactory(
            veterinario=vet,
            data=data_consulta,
            hora=hora_consulta
        )
        
        with pytest.raises(IntegrityError):
            ConsultaFactory(
                veterinario=vet,
                data=data_consulta,
                hora=hora_consulta
            )
    
    def test_status_choices(self):
        """Testa choices de status"""
        consulta = ConsultaFactory(status='CONFIRMADA')
        assert consulta.get_status_display() == 'Confirmada'
    
    def test_tipo_choices(self):
        """Testa choices de tipo"""
        consulta = ConsultaFactory(tipo='EMERGENCIA')
        assert consulta.get_tipo_display() == 'Emergência'


@pytest.mark.django_db
class TestVacinaModel:
    """Testes do model Vacina"""
    
    def test_create_vacina(self):
        """Testa criação de vacina"""
        vacina = VacinaFactory()
        assert vacina.id is not None
    
    def test_dias_proxima_dose_property(self):
        """Testa propriedade dias_proxima_dose"""
        vacina = VacinaFactory(
            data_proxima_dose=date.today() + timedelta(days=10)
        )
        assert vacina.dias_proxima_dose == 10
    
    def test_atrasada_property(self):
        """Testa propriedade atrasada"""
        # Vacina com reforço no futuro
        vacina_ok = VacinaFactory(
            data_proxima_dose=date.today() + timedelta(days=10)
        )
        assert vacina_ok.atrasada is False
        
        # Vacina atrasada
        vacina_atrasada = VacinaFactory(
            data_proxima_dose=date.today() - timedelta(days=10)
        )
        assert vacina_atrasada.atrasada is True


@pytest.mark.django_db
class TestExameModel:
    """Testes do model Exame"""
    
    def test_create_exame(self):
        """Testa criação de exame"""
        exame = ExameFactory()
        assert exame.id is not None
        assert exame.status == 'SOLICITADO'
    
    def test_exame_str(self):
        """Testa representação string"""
        animal = AnimalFactory(name='Luna')
        exame = ExameFactory(
            animal=animal,
            tipo_exame='HEMOGRAMA',
            data_solicitacao=date(2025, 1, 15)
        )
        assert 'HEMOGRAMA' in str(exame)
        assert 'Luna' in str(exame)


@pytest.mark.django_db
class TestPlanoSaudeModel:
    """Testes do model PlanoSaude"""
    
    def test_create_plano(self):
        """Testa criação de plano"""
        plano = PlanoSaudeFactory()
        assert plano.id is not None
        assert plano.is_active is True
    
    def test_plano_str(self):
        """Testa representação string"""
        plano = PlanoSaudeFactory(nome='PREMIUM', preco_mensal=Decimal('149.90'))
        assert 'PREMIUM' in str(plano)
        assert '149.90' in str(plano)
    
    def test_consultas_ilimitadas_property(self):
        """Testa propriedade consultas_ilimitadas"""
        plano_limitado = PlanoSaudeFactory(consultas_mes=5)
        assert plano_limitado.consultas_ilimitadas is False
        
        plano_ilimitado = PlanoSaudeFactory(consultas_mes=None)
        assert plano_ilimitado.consultas_ilimitadas is True


@pytest.mark.django_db
class TestContratoPlanoModel:
    """Testes do model ContratoPlano"""
    
    def test_create_contrato(self):
        """Testa criação de contrato"""
        contrato = ContratoPlanoFactory()
        assert contrato.id is not None
        assert contrato.status == 'ATIVO'
    
    def test_pode_agendar_consulta_property(self):
        """Testa propriedade pode_agendar_consulta"""
        # Plano com limite
        plano = PlanoSaudeFactory(consultas_mes=3)
        contrato = ContratoPlanoFactory(
            plano=plano,
            consultas_utilizadas_mes=2
        )
        assert contrato.pode_agendar_consulta is True
        
        # Limite atingido
        contrato.consultas_utilizadas_mes = 3
        assert contrato.pode_agendar_consulta is False
        
        # Plano ilimitado
        plano_ilimitado = PlanoSaudeFactory(consultas_mes=None)
        contrato_ilimitado = ContratoPlanoFactory(
            plano=plano_ilimitado,
            consultas_utilizadas_mes=100
        )
        assert contrato_ilimitado.pode_agendar_consulta is True


@pytest.mark.django_db
class TestClinicaModel:
    """Testes do model Clínica"""
    
    def test_create_clinica(self):
        """Testa criação de clínica"""
        clinica = ClinicaFactory()
        assert clinica.id is not None
        assert clinica.is_active is True
    
    def test_clinica_str(self):
        """Testa representação string"""
        clinica = ClinicaFactory(nome='VetCare', cidade='São Paulo', estado='SP')
        assert str(clinica) == 'VetCare - São Paulo/SP'
    
    def test_calcular_distancia(self):
        """Testa cálculo de distância"""
        # Clínica em São Paulo (aproximadamente)
        clinica = ClinicaFactory(latitude=-23.5505, longitude=-46.6333)
        
        # Distância para outra coordenada próxima
        # Aproximadamente 1km de distância
        distancia = clinica.calcular_distancia(-23.5605, -46.6333)
        
        # Verificar se calculou alguma distância (não zero)
        assert distancia > 0
        assert distancia < 20  # Deve ser menos de 20km
    
    def test_especialidades_list_property(self):
        """Testa propriedade especialidades_list"""
        clinica = ClinicaFactory(especialidades='Cirurgia, Cardiologia, Dermatologia')
        especialidades = clinica.especialidades_list
        assert len(especialidades) == 3
        assert 'Cirurgia' in especialidades
