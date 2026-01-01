from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
import logging

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_kpis(request):
    """
    Dashboard KPIs - versão segura com dados mockados
    """
    try:
        # Dados mockados para testar
        return Response({
            'consultas': {
                'total': 150,
                'hoje': 8,
                'mes': 45,
                'ano': 150,
                'agendadas': 12,
                'crescimento_mensal': 15.5,
            },
            'animais': {
                'total': 85,
                'mes': 12,
                'por_especie': [
                    {'species': 'Cachorro', 'total': 50},
                    {'species': 'Gato', 'total': 30},
                    {'species': 'Outros', 'total': 5},
                ],
            },
            'diagnosticos': {
                'total': 25,
                'validados': 20,
                'pendentes': 5,
                'taxa_validacao': 80.0,
            },
            'outros': {
                'veterinarios': 5,
                'tutores': 60,
            }
        })
        
    except Exception as e:
        logger.error(f'Erro no dashboard: {e}')
        import traceback
        traceback.print_exc()
        
        return Response({
            'error': str(e)
        }, status=500)
