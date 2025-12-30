#!/usr/bin/env python3
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import PlanoSaude
from decimal import Decimal

print("🔧 Corrigindo exibição de Planos...")

# Atualizar planos existentes
planos = PlanoSaude.objects.all()

for plano in planos:
    updated = False
    
    # Se consultas_mes é None mas não é ilimitado, setar valor padrão
    if plano.consultas_mes is None and not plano.consultas_ilimitadas:
        if 'Básico' in plano.nome:
            plano.consultas_mes = 2
        elif 'Premium' in plano.nome:
            plano.consultas_mes = 0  # Será ilimitado
            plano.consultas_ilimitadas = True
        updated = True
    
    # Se exames_mes é None mas não é ilimitado
    if plano.exames_mes is None and not plano.exames_ilimitados:
        if 'Básico' in plano.nome:
            plano.exames_mes = 1
        elif 'Premium' in plano.nome:
            plano.exames_mes = 5
        updated = True
    
    # Se vacinas_ano é None mas não é ilimitado
    if plano.vacinas_ano is None and not plano.vacinas_ilimitadas:
        if 'Básico' in plano.nome:
            plano.vacinas_ano = 4
        elif 'Premium' in plano.nome:
            plano.vacinas_ano = 12
        updated = True
    
    if updated:
        plano.save()
        print(f"✅ {plano.nome} atualizado")

print("\n📊 Estado atual dos planos:")
for plano in PlanoSaude.objects.all():
    print(f"\n{plano.nome}:")
    print(f"  Consultas: {'∞ ilimitadas' if plano.consultas_ilimitadas else f'{plano.consultas_mes}/mês'}")
    print(f"  Exames: {'∞ ilimitados' if plano.exames_ilimitados else f'{plano.exames_mes}/mês'}")
    print(f"  Vacinas: {'∞ ilimitadas' if plano.vacinas_ilimitadas else f'{plano.vacinas_ano}/ano'}")

