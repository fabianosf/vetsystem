"""
Factories para criar objetos de teste facilmente
"""
import factory
from factory.django import DjangoModelFactory
from faker import Faker
from datetime import date, time, timedelta
from decimal import Decimal
import random

from api.models import (
    Tutor, Animal, Veterinario, Consulta,
    Vacina, Exame, PlanoSaude, ContratoPlano, Clinica
)

fake = Faker('pt_BR')

# Lista de estados brasileiros
ESTADOS_BR = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
              'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
              'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO']


class TutorFactory(DjangoModelFactory):
    class Meta:
        model = Tutor
    
    name = factory.Faker('name', locale='pt_BR')
    email = factory.Sequence(lambda n: f'tutor{n}@example.com')
    phone = factory.Faker('phone_number', locale='pt_BR')
    cpf = factory.Sequence(lambda n: f'{n:011d}')
    address = factory.Faker('street_address', locale='pt_BR')
    city = factory.Faker('city', locale='pt_BR')
    state = factory.LazyFunction(lambda: random.choice(ESTADOS_BR))
    cep = factory.Faker('postcode', locale='pt_BR')
    is_active = True


class AnimalFactory(DjangoModelFactory):
    class Meta:
        model = Animal
    
    tutor = factory.SubFactory(TutorFactory)
    name = factory.Faker('first_name', locale='pt_BR')
    species = factory.Iterator(['CACHORRO', 'GATO', 'PASSARO'])
    breed = factory.LazyFunction(lambda: fake.word().capitalize())
    gender = factory.Iterator(['M', 'F'])
    age = factory.Faker('random_int', min=0, max=15)
    weight = factory.Faker('pyfloat', min_value=1.0, max_value=50.0, right_digits=2)
    color = factory.LazyFunction(lambda: fake.color_name())
    microchip = factory.Sequence(lambda n: f'BR{n:012d}')
    is_active = True


class VeterinarioFactory(DjangoModelFactory):
    class Meta:
        model = Veterinario
    
    name = factory.Faker('name', locale='pt_BR')
    email = factory.Sequence(lambda n: f'vet{n}@example.com')
    phone = factory.Faker('phone_number', locale='pt_BR')
    crmv = factory.Sequence(lambda n: f'SP-{n:05d}')
    specialties = factory.LazyFunction(lambda: ', '.join(fake.words(nb=2)))
    bio = factory.Faker('text', max_nb_chars=200, locale='pt_BR')
    status = 'ATIVO'
    work_start_hour = time(8, 0)
    work_end_hour = time(18, 0)


class PlanoSaudeFactory(DjangoModelFactory):
    class Meta:
        model = PlanoSaude
    
    # CORRIGIDO: Usar Sequence para evitar duplicação
    nome = factory.Sequence(lambda n: ['BASICO', 'PREMIUM', 'VIP'][n % 3] + f'-{n}')
    descricao = factory.Faker('text', max_nb_chars=200, locale='pt_BR')
    preco_mensal = factory.LazyFunction(lambda: Decimal(str(round(random.uniform(50.0, 300.0), 2))))
    consultas_mes = factory.Faker('random_int', min=2, max=10)
    exames_mes = factory.Faker('random_int', min=1, max=5)
    vacinas_ano = factory.Faker('random_int', min=2, max=8)
    telemedicina_incluida = factory.Faker('boolean')
    atendimento_24h = factory.Faker('boolean')
    internacao_incluida = factory.Faker('boolean')
    emergencia_prioritaria = factory.Faker('boolean')
    desconto_cirurgia = factory.Faker('random_int', min=0, max=30)
    desconto_medicamentos = factory.Faker('random_int', min=0, max=25)
    is_active = True


class ContratoPlanoFactory(DjangoModelFactory):
    class Meta:
        model = ContratoPlano
    
    tutor = factory.SubFactory(TutorFactory)
    plano = factory.SubFactory(PlanoSaudeFactory)
    data_inicio = factory.LazyFunction(date.today)
    data_fim = factory.LazyFunction(lambda: date.today() + timedelta(days=365))
    status = 'ATIVO'
    consultas_utilizadas_mes = 0
    exames_utilizados_mes = 0
    vacinas_utilizadas_ano = 0


class ConsultaFactory(DjangoModelFactory):
    class Meta:
        model = Consulta
    
    animal = factory.SubFactory(AnimalFactory)
    veterinario = factory.SubFactory(VeterinarioFactory)
    # CORRIGIDO: Cada consulta em um horário diferente
    data = factory.LazyFunction(lambda: date.today() + timedelta(days=random.randint(1, 30)))
    hora = factory.LazyFunction(lambda: time(random.randint(8, 17), random.choice([0, 30])))
    status = 'AGENDADA'
    tipo = 'ROTINA'
    motivo = factory.Faker('text', max_nb_chars=100, locale='pt_BR')
    valor = Decimal('150.00')


class VacinaFactory(DjangoModelFactory):
    class Meta:
        model = Vacina
    
    animal = factory.SubFactory(AnimalFactory)
    nome_vacina = factory.Iterator(['V10', 'V8', 'RAIVA', 'V3', 'V4'])
    fabricante = factory.Faker('company', locale='pt_BR')
    lote = factory.Sequence(lambda n: f'LOTE{n:06d}')
    data_aplicacao = factory.LazyFunction(date.today)
    data_proxima_dose = factory.LazyFunction(lambda: date.today() + timedelta(days=30))
    dose = '1ª dose'
    veterinario_responsavel = factory.Faker('name', locale='pt_BR')


class ExameFactory(DjangoModelFactory):
    class Meta:
        model = Exame
    
    animal = factory.SubFactory(AnimalFactory)
    veterinario_solicitante = factory.SubFactory(VeterinarioFactory)
    tipo_exame = factory.Iterator(['HEMOGRAMA', 'BIOQUIMICA', 'URINA', 'RAIO_X'])
    status = 'SOLICITADO'
    laboratorio = factory.Faker('company', locale='pt_BR')
    valor = Decimal('200.00')


class ClinicaFactory(DjangoModelFactory):
    class Meta:
        model = Clinica
    
    nome = factory.Sequence(lambda n: f'Clínica Veterinária {n}')
    endereco = factory.Faker('street_address', locale='pt_BR')
    cidade = factory.Faker('city', locale='pt_BR')
    estado = factory.LazyFunction(lambda: random.choice(ESTADOS_BR))
    cep = factory.Faker('postcode', locale='pt_BR')
    latitude = factory.Faker('latitude')
    longitude = factory.Faker('longitude')
    telefone = factory.Faker('phone_number', locale='pt_BR')
    email = factory.Sequence(lambda n: f'clinica{n}@example.com')
    horario_funcionamento = 'Seg-Sex 8h-18h'
    atendimento_24h = factory.Faker('boolean')
    atende_emergencia = factory.Faker('boolean')
    tem_internacao = factory.Faker('boolean')
    tem_uti = factory.Faker('boolean')
    tem_cirurgia = True
    avaliacao_media = factory.LazyFunction(lambda: round(random.uniform(0, 5), 1))
    total_avaliacoes = factory.Faker('random_int', min=0, max=500)
    is_active = True
