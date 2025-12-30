#!/usr/bin/env python
import os
import django
from datetime import date, timedelta, time
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import Tutor, Animal, Veterinario, PlanoSaude, Clinica, Consulta

print("🗑️ Limpando dados...")
Consulta.objects.all().delete()
Animal.objects.all().delete()
Tutor.objects.all().delete()
Veterinario.objects.all().delete()
PlanoSaude.objects.all().delete()
Clinica.objects.all().delete()
print("✅ Limpo!")

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
print(f"✅ {animal1.name}")

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
print(f"✅ {animal2.name}")

print("\n👨‍⚕️ Criando veterinários...")
vet1 = Veterinario.objects.create(
    name='Dr. Carlos Mendes',
    crmv='CRMV/SP 12345',
    email='carlos@vet.com',
    phone='(11) 98888-1111',
    specialties='Clínico Geral',
    status='ATIVO',
    work_start_hour=time(8, 0),   # 08:00
    work_end_hour=time(18, 0)     # 18:00
)
print(f"✅ {vet1.name}")

print("\n🏥 Criando clínicas...")
clinica1 = Clinica.objects.create(
    nome='VetCare',
    endereco='Rua das Flores, 123',
    cidade='São Paulo',
    estado='SP',
    cep='01234-567',
    telefone='(11) 98765-4321',
    email='contato@vetcare.com',
    is_active=True
)
print(f"✅ {clinica1.nome}")

print("\n💳 Criando planos...")
plano1 = PlanoSaude.objects.create(
    nome='Plano Básico',
    descricao='Cobertura básica',
    preco_mensal=Decimal('99.90'),
    consultas_mes=2,
    is_active=True
)
print(f"✅ {plano1.nome}")

plano2 = PlanoSaude.objects.create(
    nome='Plano Premium',
    descricao='Cobertura completa',
    preco_mensal=Decimal('199.90'),
    consultas_ilimitadas=True,
    telemedicina_incluida=True,
    is_active=True
)
print(f"✅ {plano2.nome}")

print("\n📅 Criando consultas...")
hoje = date.today()

consulta1 = Consulta.objects.create(
    animal=animal1,
    veterinario=vet1,
    clinica=clinica1,
    data=hoje,
    hora=time(10, 0),
    motivo='Consulta de rotina',
    status='AGENDADA',
    tipo='CONSULTA'
)
print(f"✅ Consulta hoje às 10:00")

consulta2 = Consulta.objects.create(
    animal=animal2,
    veterinario=vet1,
    clinica=clinica1,
    data=hoje + timedelta(days=1),
    hora=time(14, 0),
    motivo='Vacinação',
    status='AGENDADA',
    tipo='CONSULTA'
)
print(f"✅ Consulta amanhã às 14:00")

# Consultas passadas para dashboard
for i in range(3):
    Consulta.objects.create(
        animal=animal1 if i % 2 == 0 else animal2,
        veterinario=vet1,
        clinica=clinica1,
        data=hoje - timedelta(days=i*10 + 5),
        hora=time(14, 0),
        motivo='Consulta de rotina',
        status='CONCLUIDA',
        tipo='CONSULTA'
    )

print(f"✅ +3 consultas passadas")

print("\n" + "="*60)
print("🎉 SUCESSO! BANCO TOTALMENTE POPULADO!")
print("="*60)
print(f"📊 Resumo:")
print(f"   • {Tutor.objects.count()} tutores")
print(f"   • {Animal.objects.count()} animais")
print(f"   • {Veterinario.objects.count()} veterinários")
print(f"   • {Clinica.objects.count()} clínicas")
print(f"   • {PlanoSaude.objects.count()} planos")
print(f"   • {Consulta.objects.count()} consultas")
print("")
print("🔑 Credenciais de Login:")
print("   👤 Usuário: admin")
print("   🔒 Senha: admin123")
print("")
print("🚀 Próximos Passos:")
print("   1. python manage.py runserver")
print("   2. Acesse: http://localhost:5173")
print("   3. Faça login e teste o sistema!")
print("")
