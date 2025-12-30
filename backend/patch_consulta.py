#!/usr/bin/env python3
import re

print("🔧 Aplicando patch no backend...")

# 1. SERIALIZERS.PY
with open('api/serializers.py', 'r') as f:
    content = f.read()

# Encontrar e substituir ConsultaSerializer
new_serializer = '''class ConsultaSerializer(serializers.ModelSerializer):
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

# Usar regex para encontrar a classe completa
pattern = r'class ConsultaSerializer\(.*?\):(.*?)(?=\nclass\s|\Z)'
if re.search(pattern, content, re.DOTALL):
    content = re.sub(pattern, new_serializer, content, flags=re.DOTALL)
    with open('api/serializers.py', 'w') as f:
        f.write(content)
    print("✅ api/serializers.py atualizado")
else:
    print("⚠️  ConsultaSerializer não encontrado em serializers.py")

# 2. VIEWS.PY
with open('api/views.py', 'r') as f:
    content = f.read()

# Adicionar imports se necessário
if 'from rest_framework.response import Response' not in content:
    content = 'from rest_framework.response import Response\n' + content

if 'from rest_framework import status' not in content:
    if 'from rest_framework import' in content:
        content = content.replace(
            'from rest_framework import',
            'from rest_framework import status,',
            1
        )

new_viewset = '''class ConsultaViewSet(viewsets.ModelViewSet):
    serializer_class = ConsultaSerializer
    
    def get_queryset(self):
        try:
            return Consulta.objects.select_related(
                'animal', 'animal__tutor', 'veterinario', 'clinica'
            ).all().order_by('-data', '-hora')
        except Exception as e:
            print(f"Erro: {e}")
            return Consulta.objects.none()
    
    def list(self, request, *args, **kwargs):
        try:
            return super().list(request, *args, **kwargs)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
'''

pattern = r'class ConsultaViewSet\(.*?\):(.*?)(?=\nclass\s|\Z)'
if re.search(pattern, content, re.DOTALL):
    content = re.sub(pattern, new_viewset, content, flags=re.DOTALL)
    with open('api/views.py', 'w') as f:
        f.write(content)
    print("✅ api/views.py atualizado")
else:
    print("⚠️  ConsultaViewSet não encontrado em views.py")

print("")
print("🎉 Patch aplicado! Reinicie o servidor Django.")
