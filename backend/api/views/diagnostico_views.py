"""
Views para Diagnósticos IA
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters

from api.models import DiagnosticoIA, Veterinario
from api.serializers.diagnostico_serializers import (
    DiagnosticoIASerializer,
    DiagnosticoCreateSerializer,
    ValidarDiagnosticoSerializer
)
# from api.ml.disease_classifier import classifier
from ml.disease_classifier import classifier

from django.utils import timezone


class DiagnosticoIAViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Diagnósticos com IA
    
    Endpoints:
    - POST /api/diagnosticos/ - Fazer diagnóstico (upload de imagem)
    - GET /api/diagnosticos/ - Listar diagnósticos
    - GET /api/diagnosticos/{id}/ - Detalhe do diagnóstico
    - POST /api/diagnosticos/{id}/validar/ - Validar diagnóstico (veterinário)
    - GET /api/diagnosticos/stats/ - Estatísticas
    """
    
    queryset = DiagnosticoIA.objects.select_related(
        'animal',
        'animal__tutor',
        'validado_por'
    ).order_by('-created_at')
    
    serializer_class = DiagnosticoIASerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    filterset_fields = ['animal', 'classe_predita', 'validado']
    search_fields = ['animal__name', 'classe_predita', 'observacoes']
    ordering_fields = ['created_at', 'confianca']
    
    def get_serializer_class(self):
        """Retorna serializer apropriado para cada action"""
        if self.action == 'create':
            return DiagnosticoCreateSerializer
        elif self.action == 'validar':
            return ValidarDiagnosticoSerializer
        return DiagnosticoIASerializer
    
    def create(self, request, *args, **kwargs):
        """
        Cria novo diagnóstico fazendo predição na imagem
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Salvar temporariamente para obter o arquivo
        diagnostico = serializer.save()
        
        try:
            # Fazer predição com ML
            resultado = classifier.predict(diagnostico.imagem.path)
            
            # Atualizar o diagnóstico com os resultados
            diagnostico.resultado = resultado
            diagnostico.classe_predita = resultado['classe_predita']
            diagnostico.confianca = resultado['confianca']
            diagnostico.save()
            
            # Retornar resultado
            output_serializer = DiagnosticoIASerializer(
                diagnostico,
                context={'request': request}
            )
            
            return Response(
                {
                    'message': 'Diagnóstico realizado com sucesso!',
                    'diagnostico': output_serializer.data,
                    'resultado': resultado
                },
                status=status.HTTP_201_CREATED
            )
        
        except Exception as e:
            # Se erro na predição, deletar o diagnóstico
            diagnostico.delete()
            return Response(
                {'error': f'Erro ao processar imagem: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def validar(self, request, pk=None):
        """
        Permite veterinário validar um diagnóstico
        """
        diagnostico = self.get_object()
        serializer = ValidarDiagnosticoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Verificar se usuário é veterinário
        try:
            veterinario = Veterinario.objects.get(user=request.user)
        except Veterinario.DoesNotExist:
            return Response(
                {'error': 'Apenas veterinários podem validar diagnósticos'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Atualizar diagnóstico
        diagnostico.validado = True
        diagnostico.validado_por = veterinario
        diagnostico.data_validacao = timezone.now()
        
        if serializer.validated_data.get('observacoes'):
            diagnostico.observacoes = serializer.validated_data['observacoes']
        
        diagnostico.save()
        
        output_serializer = DiagnosticoIASerializer(
            diagnostico,
            context={'request': request}
        )
        
        return Response({
            'message': 'Diagnóstico validado com sucesso!',
            'diagnostico': output_serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Retorna estatísticas dos diagnósticos
        """
        from django.db.models import Count, Avg
        
        total = self.queryset.count()
        validados = self.queryset.filter(validado=True).count()
        
        # Contagem por classe
        por_classe = self.queryset.values('classe_predita').annotate(
            total=Count('id')
        ).order_by('-total')
        
        # Confiança média
        confianca_media = self.queryset.aggregate(
            media=Avg('confianca')
        )['media'] or 0
        
        return Response({
            'total_diagnosticos': total,
            'diagnosticos_validados': validados,
            'taxa_validacao': (validados / total * 100) if total > 0 else 0,
            'confianca_media': round(confianca_media * 100, 2),
            'diagnosticos_por_classe': list(por_classe),
        })
