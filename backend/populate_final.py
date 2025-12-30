#!/usr/bin/env python
"""Script definitivo para popular o banco de dados"""
import os
import django
from datetime import date, timedelta, time
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import Tutor, Animal, Veterinario, PlanoSaude, Clinica, Consulta

# Limpar dados
print("🗑️  Limpando banco...")
Consulta.objects.all().delete()
Animal.objects.all().delete()
Tutor.objects.all().delete()
Veterinario.objects.all().delete()
PlanoSaude.objects.all().delete()
Clinica.objects.all().delete()

# TUTOR
print("\n👤 Criando tutores...")
tutor1 = Tutor.objects.create(
    name='João Silva',
    email='joao@example.com',
    phone='(11) 99999-1111',
    cpf='123.456.789-00',
    address='Rua A, 100',
    city='São Paulo',
    state='SP',
    cep='01000-000'
)
print(f"✅ {tutor1.name}")

# ANIMAL
print("\n🐾 Criando animais...")
animal1 = Animal.objects.create(
    tutor=tutor1,
    name='Rex',
    species='CACHORRO',
    breed='Labrador',
    age=5,
    gender='M',
    weight=25.5,
    color='Amarelo'
)
animal2 = Animal.objects.create(
    tutor=tutor1,
    name='Mimi',
    species='GATO',
    breed='Siamês',
    age=4,
    gender='F',
    weight=4.2,
    color='Branco'
)
print(f"✅ {animal1.name}, {animal2.name}")

# VETERINARIO
print("\n👨‍⚕️ Criando veterinários...")
vet1 = Veterinario.objects.create(
    name='Dr. Carlos Mendes',
    crmv='CRMV/SP 12345',
    email='carlos@vet.com',
    phone='(11) 98888-1111',
    specialties='Clínico Geral',
    status='ATIVO',
    work_start_hour=time(8, 0),
    work_end_hour=time(18, 0)
)
print(f"✅ {vet1.name}")

# CLINICA
print("\n🏥 Criando clínicas...")
clinica1 = Clinica.objects.create(
    nome='VetCare',
    endereco='Rua das Flores, 123',
    cidade='São Paulo',
    estado='SP',
    cep='01234-567',
    telefone='(11) 98765-4321',
    email='contato@vetcare.com',
    latitude=-23.550520,
    longitude=-46.633308,
    is_active=True
)
print(f"✅ {clinica1.nome}")

# PLANO
print("\n💳 Criando planos...")
plano1 = PlanoSaude.objects.create(
    nome='Plano Básico',
    descricao='Cobertura básica',
    preco_mensal=Decimal('99.90'),
    consultas_mes=2,
    is_active=True
)
plano2 = PlanoSaude.objects.create(
    nome='Plano Premium',
    descricao='Cobertura completa',
    preco_mensal=Decimal('199.90'),
    consultas_ilimitadas=True,
    telemedicina_incluida=True,
    is_active=True
)
print(f"✅ {plano1.nome}, {plano2.nome}")

# CONSULTAS
print("\n📅 Criando consultas...")
hoje = date.today()

# Hoje
Consulta.objects.create(
    animal=animal1,
    veterinario=vet1,
    clinica=clinica1,
    data=hoje,
    horario=time(10, 0),  # CORRETO!
    motivo='Consulta de rotina',
    status='AGENDADA',
    tipo='CONSULTA'
)

# Amanhã
Consulta.objects.create(
    animal=animal2,
    veterinario=vet1,
    clinica=clinica1,
    data=hoje + timedelta(days=1),
    horario=time(14, 0),
    motivo='Vacinação',
    status='AGENDADA',
    tipo='CONSULTA'
)

# Passadas
for i in range(5):
    Consulta.objects.create(
        animal=animal1 if i % 2 == 0 else animal2,
        veterinario=vet1,
        clinica=clinica1,
        data=hoje - timedelta(days=(i+1)*7),
        horario=time(10 + i, 0),
        motivo='Consulta de rotina',
        status='CONCLUIDA',
        tipo='CONSULTA'
    )

print(f"✅ {Consulta.objects.count()} consultas")

print("\n" + "="*70)
print("🎉 BANCO POPULADO COM SUCESSO!")
print("="*70)
print(f"\n📊 Resumo:")
print(f"   • {Tutor.objects.count()} tutores")
print(f"   • {Animal.objects.count()} animais") 
print(f"   • {Veterinario.objects.count()} veterinários")
print(f"   • {Clinica.objects.count()} clínicas")
print(f"   • {PlanoSaude.objects.count()} planos")
print(f"   • {Consulta.objects.count()} consultas")
print(f"\n🔑 Login: admin / admin123")
print(f"\n🚀 Execute: python manage.py runserver")
print(f"📱 Acesse: http://localhost:5173\n")
