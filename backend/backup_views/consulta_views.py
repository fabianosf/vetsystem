from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from api.models import Consulta
from api.serializers import ConsultaSerializer


class ConsultaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciamento de Consultas
    
    Filtros:
    - status: AGENDADA, CONFIRMADA, EM_ATENDIMENTO, CONCLUIDA, CANCELADA
    - tipo: ROTINA, RETORNO, EMERGENCIA, CIRURGIA
    - animal: ID do animal
    - veterinario: ID do veterinário
    - data: Data da consulta (YYYY-MM-DD)
    """
    queryset = Consulta.objects.select_related(
        'animal', 
        'veterinario', 
        'animal__tutor'
    ).order_by('-data', '-hora')
    serializer_class = ConsultaSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'tipo', 'animal', 'veterinario', 'data']
    search_fields = ['animal__name', 'veterinario__name', 'motivo', 'diagnostico']
    ordering_fields = ['data', 'hora', 'created_at']
    ordering = ['-data', '-hora']
