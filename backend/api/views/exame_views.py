from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from api.models import Exame
from api.serializers import ExameSerializer
from api.filters import ExameFilter


class ExameViewSet(viewsets.ModelViewSet):
    queryset = Exame.objects.select_related(
        'animal',
        'veterinario_solicitante',
        'animal__tutor'
    ).order_by('-data_solicitacao')
    serializer_class = ExameSerializer
    filterset_class = ExameFilter
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['tipo_exame', 'laboratorio', 'animal__name', 'resultado', 'observacoes']
    ordering_fields = ['data_solicitacao', 'data_realizacao', 'status', 'tipo_exame']
    ordering = ['-data_solicitacao']
