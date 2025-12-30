from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from api.models import PlanoSaude, ContratoPlano
from api.serializers import PlanoSaudeSerializer, ContratoPlanoSerializer


class PlanoSaudeViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciamento de Planos de Saúde
    """
    queryset = PlanoSaude.objects.filter(is_active=True).prefetch_related('contratos')
    serializer_class = PlanoSaudeSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nome', 'descricao']
    ordering_fields = ['nome', 'preco_mensal', 'created_at']
    ordering = ['preco_mensal']


class ContratoPlanoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciamento de Contratos de Planos
    
    Vincula tutores aos planos de saúde e controla utilização
    """
    queryset = ContratoPlano.objects.select_related('tutor', 'plano').order_by('-data_inicio')
    serializer_class = ContratoPlanoSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['status', 'tutor', 'plano']
    search_fields = ['tutor__name', 'plano__nome']
    ordering = ['-data_inicio']
