from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from api.models import PlanoSaude, ContratoPlano
from api.serializers import PlanoSaudeSerializer, ContratoPlanoSerializer
from api.filters import PlanoSaudeFilter, ContratoPlanoFilter


class PlanoSaudeViewSet(viewsets.ModelViewSet):
    queryset = PlanoSaude.objects.filter(is_active=True).prefetch_related('contratos')
    serializer_class = PlanoSaudeSerializer
    filterset_class = PlanoSaudeFilter
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nome', 'descricao']
    ordering_fields = ['nome', 'preco_mensal', 'created_at']
    ordering = ['preco_mensal']


class ContratoPlanoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Contratos de Planos de Saúde
    
    Relacionamentos:
    - animal (ForeignKey -> Animal)
    - plano (ForeignKey -> PlanoSaude)
    - animal.tutor (acesso via animal)
    """
    queryset = ContratoPlano.objects.select_related(
        'animal', 
        'animal__tutor',  # Tutor via animal
        'plano'
    ).order_by('-data_inicio')
    
    serializer_class = ContratoPlanoSerializer
    filterset_class = ContratoPlanoFilter
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    # Busca por nome do tutor (via animal) e nome do plano
    search_fields = ['animal__tutor__name', 'animal__name', 'plano__nome']
    
    # Ordenação pelos campos que existem no modelo
    ordering_fields = ['data_inicio', 'data_fim', 'valor_mensal', 'is_active']
    ordering = ['-data_inicio']

