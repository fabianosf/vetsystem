from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from api.models import Tutor
from api.serializers import TutorSerializer


class TutorViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciamento de Tutores
    
    Endpoints:
    - GET /api/tutores/ - Lista todos os tutores
    - POST /api/tutores/ - Cria novo tutor
    - GET /api/tutores/{id}/ - Detalhes de um tutor
    - PUT/PATCH /api/tutores/{id}/ - Atualiza tutor
    - DELETE /api/tutores/{id}/ - Remove tutor (soft delete)
    """
    queryset = Tutor.objects.filter(is_active=True).order_by('-created_at')
    serializer_class = TutorSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'city', 'state']
    search_fields = ['name', 'email', 'cpf', 'phone']
    ordering_fields = ['name', 'created_at']
    ordering = ['-created_at']
