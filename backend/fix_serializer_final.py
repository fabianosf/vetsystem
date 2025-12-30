#!/usr/bin/env python3

print("🔧 Fix Final - ConsultaSerializer")
print("=" * 50)

# Ler o arquivo
with open('api/serializers.py', 'r') as f:
    lines = f.readlines()

print(f"📄 Total de linhas: {len(lines)}")

# Procurar por qualquer serializer relacionado a Consulta
consulta_serializer_found = False
for i, line in enumerate(lines):
    if 'Consulta' in line and 'Serializer' in line and 'class' in line:
        print(f"✅ Encontrado na linha {i+1}: {line.strip()}")
        consulta_serializer_found = True

if not consulta_serializer_found:
    print("⚠️  Nenhum ConsultaSerializer encontrado!")
    print("")
    print("📝 Criando novo serializer...")
    
    # Adicionar no final do arquivo
    new_code = '''

class ConsultaSerializer(serializers.ModelSerializer):
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
        except:
            return None
    
    def get_tutor_nome(self, obj):
        try:
            return obj.animal.tutor.name if obj.animal and obj.animal.tutor else None
        except:
            return None
    
    def get_veterinario_nome(self, obj):
        try:
            return obj.veterinario.name if obj.veterinario else None
        except:
            return None
    
    def get_clinica_nome(self, obj):
        try:
            return obj.clinica.nome if obj.clinica else None
        except:
            return None
'''
    
    with open('api/serializers.py', 'a') as f:
        f.write(new_code)
    
    print("✅ ConsultaSerializer adicionado ao arquivo!")

print("")
print("🧪 Verificando importação...")
import os
import sys
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

try:
    from api.serializers import ConsultaSerializer
    print("✅ ConsultaSerializer importado com sucesso!")
except ImportError as e:
    print(f"❌ Erro ao importar: {e}")
except Exception as e:
    print(f"⚠️  Outro erro: {e}")

print("")
print("=" * 50)
print("✅ Fix concluído!")
