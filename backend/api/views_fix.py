# Adicione este código ao seu api/views.py

from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from .models import Consulta
from .serializers import ConsultaSerializer

class ConsultaViewSet(viewsets.ModelViewSet):
    serializer_class = ConsultaSerializer
    
    def get_queryset(self):
        """Otimizar queries e evitar N+1"""
        try:
            return Consulta.objects.select_related(
                'animal',
                'animal__tutor',
                'veterinario',
                'clinica'
            ).all().order_by('-data', '-hora')
        except Exception as e:
            print(f"Erro no get_queryset: {str(e)}")
            return Consulta.objects.none()
    
    def list(self, request, *args, **kwargs):
        """Adicionar tratamento de erro no list"""
        try:
            queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {
                    'error': 'Erro ao listar consultas',
                    'detail': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
