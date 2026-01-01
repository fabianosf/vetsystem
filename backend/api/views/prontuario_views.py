from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from api.models import Prontuario, Prescricao, Exame, Vacina
from api.serializers.prontuario_serializers import ProntuarioSerializer, PrescricaoSerializer
from api.serializers import ExameSerializer, VacinaSerializer
import logging

logger = logging.getLogger(__name__)


class ProntuarioViewSet(viewsets.ModelViewSet):
    queryset = Prontuario.objects.all()
    serializer_class = ProntuarioSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['animal', 'tipo', 'veterinario']
    search_fields = ['motivo', 'diagnostico', 'sintomas']
    ordering_fields = ['data', 'created_at']
    
    @action(detail=False, methods=['get'])
    def por_animal(self, request):
        """Retorna prontuários de um animal específico"""
        animal_id = request.query_params.get('animal_id')
        if not animal_id:
            return Response({'error': 'animal_id é obrigatório'}, status=400)
        
        prontuarios = self.queryset.filter(animal_id=animal_id).order_by('-data')
        serializer = self.get_serializer(prontuarios, many=True)
        return Response(serializer.data)


class PrescricaoViewSet(viewsets.ModelViewSet):
    queryset = Prescricao.objects.all()
    serializer_class = PrescricaoSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['prontuario']
