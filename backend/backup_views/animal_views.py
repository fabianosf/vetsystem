from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from api.models import Animal
from api.serializers import AnimalSerializer


class AnimalViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciamento de Animais
    
    Endpoints:
    - GET /api/animais/ - Lista todos os animais
    - POST /api/animais/ - Registra novo animal
    - GET /api/animais/{id}/ - Detalhes de um animal
    - PUT/PATCH /api/animais/{id}/ - Atualiza dados do animal
    - DELETE /api/animais/{id}/ - Remove animal (soft delete)
    
    Filtros disponíveis:
    - species: Espécie (CACHORRO, GATO, PASSARO, OUTRO)
    - gender: Sexo (M, F)
    - tutor: ID do tutor
    """
    queryset = Animal.objects.filter(is_active=True).select_related('tutor').order_by('-created_at')
    serializer_class = AnimalSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['species', 'gender', 'tutor', 'is_active']
    search_fields = ['name', 'breed', 'tutor__name', 'microchip']
    ordering_fields = ['name', 'age', 'created_at']
    ordering = ['-created_at']
