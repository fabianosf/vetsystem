#!/bin/bash

echo "🚀 Correção Direta - VetSystem"
echo "=============================="

# Criar backups
cp api/serializers.py api/serializers.py.bak
cp api/views.py api/views.py.bak
echo "✅ Backups criados"

###########################################
# 1. EXTRAIR O CÓDIGO ATUAL
###########################################
echo ""
echo "📋 Mostrando código atual de ConsultaSerializer:"
echo "================================================"
grep -A 20 "class ConsultaSerializer" api/serializers.py

echo ""
echo "📋 Mostrando código atual de ConsultaViewSet:"
echo "=============================================="
grep -A 20 "class ConsultaViewSet" api/views.py

###########################################
# 2. CRIAR ARQUIVOS NOVOS COMPLETOS
###########################################
echo ""
echo "🔧 Gerando código corrigido..."

# Ler o arquivo serializers.py linha por linha
python3 << 'PYTHON'
import sys

# Ler serializers.py
with open('api/serializers.py', 'r') as f:
    lines = f.readlines()

# Encontrar onde começa e termina ConsultaSerializer
start_idx = None
end_idx = None
in_class = False
indent_level = 0

for i, line in enumerate(lines):
    if 'class ConsultaSerializer' in line:
        start_idx = i
        in_class = True
        indent_level = len(line) - len(line.lstrip())
        continue
    
    if in_class and line.strip():
        current_indent = len(line) - len(line.lstrip())
        if current_indent <= indent_level and line.strip().startswith('class '):
            end_idx = i
            break

if start_idx is None:
    print("❌ ConsultaSerializer não encontrado!")
    sys.exit(1)

if end_idx is None:
    end_idx = len(lines)

# Novo código do serializer
new_code = '''class ConsultaSerializer(serializers.ModelSerializer):
    # Campos calculados com tratamento de erro
    animal_nome = serializers.SerializerMethodField()
    tutor_nome = serializers.SerializerMethodField()
    veterinario_nome = serializers.SerializerMethodField()
    clinica_nome = serializers.SerializerMethodField()
    
    class Meta:
        model = Consulta
        fields = '__all__'
    
    def get_animal_nome(self, obj):
        try:
            return obj.animal.name if obj.animal else None
        except Exception:
            return None
    
    def get_tutor_nome(self, obj):
        try:
            if obj.animal and hasattr(obj.animal, 'tutor') and obj.animal.tutor:
                return obj.animal.tutor.name
            return None
        except Exception:
            return None
    
    def get_veterinario_nome(self, obj):
        try:
            return obj.veterinario.name if obj.veterinario else None
        except Exception:
            return None
    
    def get_clinica_nome(self, obj):
        try:
            return obj.clinica.nome if obj.clinica else None
        except Exception:
            return None

'''

# Reconstruir o arquivo
new_lines = lines[:start_idx] + [new_code] + lines[end_idx:]

# Salvar
with open('api/serializers.py', 'w') as f:
    f.writelines(new_lines)

print("✅ api/serializers.py atualizado!")
PYTHON

# Fazer o mesmo para views.py
python3 << 'PYTHON2'
import sys

# Ler views.py
with open('api/views.py', 'r') as f:
    lines = f.readlines()

# Encontrar onde começa e termina ConsultaViewSet
start_idx = None
end_idx = None
in_class = False
indent_level = 0

for i, line in enumerate(lines):
    if 'class ConsultaViewSet' in line:
        start_idx = i
        in_class = True
        indent_level = len(line) - len(line.lstrip())
        continue
    
    if in_class and line.strip():
        current_indent = len(line) - len(line.lstrip())
        if current_indent <= indent_level and line.strip().startswith('class '):
            end_idx = i
            break

if start_idx is None:
    print("❌ ConsultaViewSet não encontrado!")
    sys.exit(1)

if end_idx is None:
    end_idx = len(lines)

# Verificar se Response está importado
has_response = any('from rest_framework.response import Response' in line for line in lines[:20])
has_status = any('from rest_framework import status' in line for line in lines[:20])

# Novo código da viewset
new_code = '''class ConsultaViewSet(viewsets.ModelViewSet):
    serializer_class = ConsultaSerializer
    
    def get_queryset(self):
        """Otimizar com select_related para evitar N+1 queries"""
        try:
            return Consulta.objects.select_related(
                'animal',
                'animal__tutor',
                'veterinario',
                'clinica'
            ).all().order_by('-data', '-hora')
        except Exception as e:
            print(f"❌ Erro no get_queryset: {e}")
            return Consulta.objects.none()
    
    def list(self, request, *args, **kwargs):
        """Tratamento de erro no list"""
        try:
            queryset = self.get_queryset()
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'detail': f'Erro ao listar consultas: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

'''

# Reconstruir o arquivo
new_lines = lines[:start_idx] + [new_code] + lines[end_idx:]

# Adicionar imports se necessário
if not has_response:
    # Encontrar linha com imports do rest_framework
    for i, line in enumerate(new_lines):
        if 'from rest_framework import' in line:
            new_lines.insert(i+1, 'from rest_framework.response import Response\n')
            break

if not has_status:
    for i, line in enumerate(new_lines):
        if 'from rest_framework import' in line and 'status' not in line:
            new_lines[i] = line.rstrip() + ', status\n'
            break

# Salvar
with open('api/views.py', 'w') as f:
    f.writelines(new_lines)

print("✅ api/views.py atualizado!")
PYTHON2

echo ""
echo "=============================="
echo "✅ CORREÇÕES APLICADAS!"
echo ""
echo "📋 Arquivos modificados:"
echo "   - api/serializers.py"
echo "   - api/views.py"
echo ""
echo "💾 Backups salvos:"
echo "   - api/serializers.py.bak"
echo "   - api/views.py.bak"
echo ""
echo "🚀 Próximo passo:"
echo "   python manage.py runserver"
echo ""

# Verificar se aplicou corretamente
echo "🔍 Verificando correções..."
if grep -q "get_animal_nome" api/serializers.py; then
    echo "   ✅ ConsultaSerializer atualizado"
else
    echo "   ❌ ConsultaSerializer falhou"
fi

if grep -q "select_related" api/views.py; then
    echo "   ✅ ConsultaViewSet atualizado"
else
    echo "   ❌ ConsultaViewSet falhou"
fi

