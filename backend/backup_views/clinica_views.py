from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from api.models import Clinica
from api.serializers import ClinicaSerializer


class ClinicaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciamento de Clínicas
    
    Cadastro de clínicas com geolocalização
    """
    queryset = Clinica.objects.filter(is_active=True).order_by('nome')
    serializer_class = ClinicaSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        'cidade', 
        'estado', 
        'atendimento_24h', 
        'atende_emergencia',
        'tem_internacao',
        'tem_cirurgia'
    ]
    search_fields = ['nome', 'cidade', 'estado', 'especialidades', 'endereco']
    ordering_fields = ['nome', 'cidade', 'avaliacao_media']
    ordering = ['nome']
