from rest_framework import status, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from api.models import Notificacao  # Adicionar no import
from api.serializers import NotificacaoSerializer  # Adicionar no import


from api.models import (
    Tutor, Animal, Veterinario, Consulta, Vacina, Exame,
    PlanoSaude, ContratoPlano, Clinica
)
from api.serializers import (
    TutorSerializer, AnimalSerializer, VeterinarioSerializer,
    ConsultaSerializer, VacinaSerializer, ExameSerializer,
    PlanoSaudeSerializer, ContratoPlanoSerializer, ClinicaSerializer
)


class TutorViewSet(viewsets.ModelViewSet):
    """ViewSet para Tutores"""
    queryset = Tutor.objects.all()
    serializer_class = TutorSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Tutor.objects.all()
        name = self.request.query_params.get('name', None)
        if name:
            queryset = queryset.filter(name__icontains=name)
        return queryset.order_by('-created_at')


class AnimalViewSet(viewsets.ModelViewSet):
    """ViewSet para Animais"""
    queryset = Animal.objects.all()
    serializer_class = AnimalSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Animal.objects.select_related('tutor').all()
        tutor_id = self.request.query_params.get('tutor', None)
        if tutor_id:
            queryset = queryset.filter(tutor_id=tutor_id)
        return queryset.order_by('-created_at')


class VeterinarioViewSet(viewsets.ModelViewSet):
    """ViewSet para Veterinários"""
    queryset = Veterinario.objects.all()
    serializer_class = VeterinarioSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Veterinario.objects.all()
        status_param = self.request.query_params.get('status', None)
        if status_param:
            queryset = queryset.filter(status=status_param)
        return queryset.order_by('-created_at')


class ConsultaViewSet(viewsets.ModelViewSet):
    serializer_class = ConsultaSerializer
    
    def get_queryset(self):
        try:
            return Consulta.objects.select_related(
                'animal', 'animal__tutor', 'veterinario', 'clinica'
            ).all().order_by('-data', '-horario')
        except Exception as e:
            print(f"Erro: {e}")
            return Consulta.objects.none()
    
    def list(self, request, *args, **kwargs):
        try:
            return super().list(request, *args, **kwargs)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VacinaViewSet(viewsets.ModelViewSet):
    """ViewSet para Vacinas"""
    queryset = Vacina.objects.all()
    serializer_class = VacinaSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Vacina.objects.select_related('animal', 'veterinario').all()
        animal_id = self.request.query_params.get('animal', None)
        if animal_id:
            queryset = queryset.filter(animal_id=animal_id)
        return queryset.order_by('-data_aplicacao')


class ExameViewSet(viewsets.ModelViewSet):
    """ViewSet para Exames"""
    queryset = Exame.objects.all()
    serializer_class = ExameSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Exame.objects.select_related('animal', 'veterinario').all()
        animal_id = self.request.query_params.get('animal', None)
        if animal_id:
            queryset = queryset.filter(animal_id=animal_id)
        return queryset.order_by('-data_exame')


class PlanoSaudeViewSet(viewsets.ModelViewSet):
    """ViewSet para Planos de Saúde"""
    queryset = PlanoSaude.objects.all()
    serializer_class = PlanoSaudeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = PlanoSaude.objects.all()
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        return queryset.order_by('-created_at')


class ContratoPlanoViewSet(viewsets.ModelViewSet):
    """ViewSet para Contratos de Planos"""
    queryset = ContratoPlano.objects.all()
    serializer_class = ContratoPlanoSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = ContratoPlano.objects.select_related('animal', 'plano').all()
        animal_id = self.request.query_params.get('animal', None)
        if animal_id:
            queryset = queryset.filter(animal_id=animal_id)
        return queryset.order_by('-data_inicio')


class ClinicaViewSet(viewsets.ModelViewSet):
    """ViewSet para Clínicas"""
    queryset = Clinica.objects.all()
    serializer_class = ClinicaSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Clinica.objects.all()
        return queryset.order_by('-created_at')


class NotificacaoViewSet(viewsets.ModelViewSet):
    """ViewSet para Notificações"""
    serializer_class = NotificacaoSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Retorna apenas notificações do usuário logado"""
        return Notificacao.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def nao_lidas(self, request):
        """Retorna apenas notificações não lidas"""
        queryset = self.get_queryset().filter(lida=False)
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'count': queryset.count(),
            'results': serializer.data
        })
    
    @action(detail=True, methods=['post'])
    def marcar_lida(self, request, pk=None):
        """Marca uma notificação como lida"""
        notificacao = self.get_object()
        notificacao.marcar_como_lida()
        return Response({'status': 'Notificação marcada como lida'})
    
    @action(detail=False, methods=['post'])
    def marcar_todas_lidas(self, request):
        """Marca todas as notificações como lidas"""
        notificacoes = self.get_queryset().filter(lida=False)
        count = notificacoes.update(
            lida=True,
            lida_em=timezone.now()
        )
        return Response({
            'status': f'{count} notificações marcadas como lidas'
        })
    
    @action(detail=False, methods=['delete'])
    def limpar_lidas(self, request):
        """Remove todas as notificações já lidas"""
        count, _ = self.get_queryset().filter(lida=True).delete()
        return Response({
            'status': f'{count} notificações removidas'
        })