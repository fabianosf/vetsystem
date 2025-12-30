from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from api.models import Exame
from api.serializers import ExameSerializer


class ExameViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciamento de Exames
    
    Controla solicitação, realização e resultados de exames
    """
    queryset = Exame.objects.select_related(
        'animal',
        'veterinario_solicitante',
        'animal__tutor'
    ).order_by('-data_solicitacao')
    serializer_class = ExameSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'animal', 'veterinario_solicitante', 'tipo_exame']
    search_fields = ['tipo_exame', 'laboratorio', 'animal__name', 'resultado']
    ordering_fields = ['data_solicitacao', 'data_realizacao']
    ordering = ['-data_solicitacao']
