from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from api.models import Clinica
from api.serializers import ClinicaSerializer
from api.filters import ClinicaFilter


class ClinicaViewSet(viewsets.ModelViewSet):
    queryset = Clinica.objects.filter(is_active=True).order_by('nome')
    serializer_class = ClinicaSerializer
    filterset_class = ClinicaFilter
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nome', 'cidade', 'estado', 'especialidades', 'endereco']
    ordering_fields = ['nome', 'cidade', 'estado', 'avaliacao_media']
    ordering = ['nome']
