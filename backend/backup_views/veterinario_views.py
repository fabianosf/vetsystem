from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from api.models import Veterinario
from api.serializers import VeterinarioSerializer


class VeterinarioViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciamento de Veterinários
    """
    queryset = Veterinario.objects.filter(is_active=True).order_by('name')
    serializer_class = VeterinarioSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['status', 'is_active']
    search_fields = ['name', 'crmv', 'specialties', 'email']
