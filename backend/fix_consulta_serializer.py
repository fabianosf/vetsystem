import os
import sys

# Adicionar o diretório atual ao path
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from api.models import Consulta
from api.serializers import ConsultaSerializer

print("🧪 Testando serialização de Consultas...")
print()

try:
    # Testar se existem consultas
    total = Consulta.objects.count()
    print(f"📊 Total de consultas no banco: {total}")
    
    if total == 0:
        print("⚠️  Não há consultas cadastradas")
    else:
        # Tentar serializar as primeiras 3
        consultas = Consulta.objects.all()[:3]
        
        for consulta in consultas:
            try:
                serializer = ConsultaSerializer(consulta)
                data = serializer.data
                print(f"✅ Consulta ID {consulta.id} serializada com sucesso")
            except Exception as e:
                print(f"❌ Erro na consulta ID {consulta.id}: {str(e)}")
                print(f"   Animal: {consulta.animal if hasattr(consulta, 'animal') else 'N/A'}")
                print(f"   Veterinario: {consulta.veterinario if hasattr(consulta, 'veterinario') else 'N/A'}")
                
except Exception as e:
    print(f"❌ Erro geral: {str(e)}")
    import traceback
    traceback.print_exc()
