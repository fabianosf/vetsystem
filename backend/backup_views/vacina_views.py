from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from api.models import Vacina
from api.serializers import VacinaSerializer


class VacinaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciamento de Vacinas
    
    Cartão de vacinação completo com alertas de doses atrasadas
    """
    queryset = Vacina.objects.select_related(
        'animal', 
        'animal__tutor'
    ).order_by('-data_aplicacao')
    serializer_class = VacinaSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['animal', 'nome_vacina', 'data_aplicacao']
    search_fields = ['nome_vacina', 'fabricante', 'animal__name', 'lote']
    ordering_fields = ['data_aplicacao', 'data_proxima_dose']
    ordering = ['-data_aplicacao']
