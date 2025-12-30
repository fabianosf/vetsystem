from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from api.models import Vacina
from api.serializers import VacinaSerializer
from api.filters import VacinaFilter


class VacinaViewSet(viewsets.ModelViewSet):
    queryset = Vacina.objects.select_related(
        'animal', 
        'animal__tutor'
    ).order_by('-data_aplicacao')
    serializer_class = VacinaSerializer
    filterset_class = VacinaFilter
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nome_vacina', 'fabricante', 'animal__name', 'lote', 'veterinario_responsavel']
    ordering_fields = ['data_aplicacao', 'data_proxima_dose', 'nome_vacina']
    ordering = ['-data_aplicacao']
