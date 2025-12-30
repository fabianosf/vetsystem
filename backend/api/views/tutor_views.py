from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from api.models import Tutor
from api.serializers import TutorSerializer
from api.filters import TutorFilter


class TutorViewSet(viewsets.ModelViewSet):
    queryset = Tutor.objects.filter(is_active=True).order_by('-created_at')
    serializer_class = TutorSerializer
    filterset_class = TutorFilter
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'email', 'cpf', 'phone', 'address']
    ordering_fields = ['name', 'email', 'created_at', 'city']
    ordering = ['-created_at']
