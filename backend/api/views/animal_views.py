from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from api.models import Animal
from api.serializers import AnimalSerializer
from api.filters import AnimalFilter


class AnimalViewSet(viewsets.ModelViewSet):
    queryset = Animal.objects.filter(is_active=True).select_related('tutor').order_by('-created_at')
    serializer_class = AnimalSerializer
    filterset_class = AnimalFilter
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'breed', 'tutor__name', 'microchip', 'color']
    ordering_fields = ['name', 'age', 'weight', 'created_at', 'species']
    ordering = ['-created_at']
