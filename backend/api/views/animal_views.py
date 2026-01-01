from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from api.models import Animal, Tutor
from api.serializers import AnimalSerializer
from api.filters import AnimalFilter


class AnimalViewSet(viewsets.ModelViewSet):
    serializer_class = AnimalSerializer
    filterset_class = AnimalFilter
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'breed', 'tutor__name', 'microchip', 'color']
    ordering_fields = ['name', 'age', 'weight', 'created_at', 'species']
    ordering = ['-created_at']

    def get_queryset(self):
        """
        Filtra animais baseado no role do usuário:
        - Tutor: vê apenas seus próprios animais
        - Admin/Vet/Recepcionista: vê todos os animais
        """
        user = self.request.user
        queryset = Animal.objects.filter(is_active=True).select_related('tutor').order_by('-created_at')
        
        # Se for tutor, filtra apenas os animais dele
        if hasattr(user, 'role') and user.role.lower() == 'tutor':
            try:
                # Busca o Tutor pelo email do User
                tutor = Tutor.objects.get(email=user.email)
                queryset = queryset.filter(tutor=tutor)
            except Tutor.DoesNotExist:
                # Se não encontrar o Tutor, retorna queryset vazio
                queryset = queryset.none()
        
        return queryset

    @action(detail=False, methods=['get'], url_path='me')
    def my_animals(self, request):
        """
        Endpoint /api/animals/me/ - Retorna animais do tutor logado
        """
        try:
            tutor = Tutor.objects.get(email=request.user.email)
            animais = Animal.objects.filter(tutor=tutor, is_active=True)
            serializer = self.get_serializer(animais, many=True)
            return Response(serializer.data)
        except Tutor.DoesNotExist:
            return Response(
                {'detail': 'Tutor não encontrado para este usuário'},
                status=status.HTTP_404_NOT_FOUND
            )
