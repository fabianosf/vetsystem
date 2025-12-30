from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from api.models import Consulta
from api.serializers import ConsultaSerializer
from api.filters import ConsultaFilter


class ConsultaViewSet(viewsets.ModelViewSet):
    queryset = Consulta.objects.select_related(
        'animal', 
        'veterinario', 
        'animal__tutor'
    ).order_by('-data', '-horario')
    serializer_class = ConsultaSerializer
    filterset_class = ConsultaFilter
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['animal__name', 'veterinario__name', 'motivo', 'diagnostico', 'animal__tutor__name']
    ordering_fields = ['data', 'horario', 'created_at', 'status']
    ordering = ['-data', '-horario']
