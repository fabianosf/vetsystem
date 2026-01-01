from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from api.models import Consulta
from api.serializers import ConsultaSerializer
from api.filters import ConsultaFilter
from api.services.notification_service import notification_service


class ConsultaViewSet(viewsets.ModelViewSet):
    serializer_class = ConsultaSerializer
    filterset_class = ConsultaFilter
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['animal__name', 'veterinario__name', 'motivo', 'diagnostico', 'animal__tutor__name']
    ordering_fields = ['data', 'horario', 'created_at', 'status']
    ordering = ['-data', '-horario']

    def get_queryset(self):
        """
        Filtra consultas baseado no role do usuário:
        - Tutor: vê apenas consultas dos seus animais
        - Admin/Vet/Recepcionista: vê todas as consultas
        """
        user = self.request.user
        queryset = Consulta.objects.select_related(
            'animal',
            'veterinario',
            'animal__tutor',
        ).order_by('-data', '-horario')
        
        # Se for tutor, filtra apenas consultas dos animais dele
        if hasattr(user, 'role') and user.role.lower() == 'tutor':
            queryset = queryset.filter(animal__tutor=user)
        
        return queryset

    def get_serializer_context(self):
        """
        Passa o role do usuário para o serializer
        para esconder campos sensíveis da recepcionista
        """
        context = super().get_serializer_context()
        context['user_role'] = getattr(self.request.user, 'role', None)
        return context

    def perform_create(self, serializer):
        """
        Ao criar uma consulta, envia notificação externa de consulta agendada
        para o tutor (email/whatsapp), usando o NotificationService.
        """
        consulta = serializer.save()
        try:
            notification_service.notificar_consulta_agendada(consulta)
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(
                f"Erro ao enviar notificação de consulta agendada: {e}"
            )

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def cancelar(self, request, pk=None):
        """
        Action para cancelar uma consulta e notificar o tutor.
        Endpoint: POST /api/consultas/{id}/cancelar/
        Body opcional: { "motivo": "Tutor pediu cancelamento" }
        """
        consulta = self.get_object()
        motivo = request.data.get('motivo', '')

        # Ajuste o valor de status conforme seu modelo (ex: 'CANCELADA', 'cancelado', etc.)
        if hasattr(consulta, 'status'):
            consulta.status = 'cancelada'
            consulta.save(update_fields=['status'])
        else:
            consulta.save()

        try:
            notification_service.notificar_consulta_cancelada(consulta, motivo)
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(
                f"Erro ao enviar notificação de cancelamento: {e}"
            )
            return Response(
                {'detail': 'Consulta cancelada, mas houve erro ao notificar.'},
                status=status.HTTP_200_OK,
            )

        return Response(
            {'detail': 'Consulta cancelada e notificações enviadas.'},
            status=status.HTTP_200_OK,
        )
