"""
Views para Notificações Externas
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from api.models import Consulta, Tutor, NotificacaoExterna
from api.services.notification_service import notification_service
from rest_framework import serializers


class NotificacaoExternaSerializer(serializers.ModelSerializer):
    tutor_nome = serializers.CharField(source='tutor.name', read_only=True)
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    evento_display = serializers.CharField(source='get_evento_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = NotificacaoExterna
        fields = '__all__'


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def notificar_consulta_agendada(request, consulta_id):
    """Enviar notificação de consulta agendada"""
    consulta = get_object_or_404(Consulta, id=consulta_id)
    
    resultados = notification_service.notificar_consulta_agendada(consulta)
    
    return Response({
        'message': 'Notificações enviadas',
        'resultados': resultados
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def notificar_lembrete_consulta(request, consulta_id):
    """Enviar lembrete de consulta"""
    consulta = get_object_or_404(Consulta, id=consulta_id)
    
    resultados = notification_service.notificar_lembrete_consulta(consulta)
    
    return Response({
        'message': 'Lembrete enviado',
        'resultados': resultados
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def notificar_consulta_cancelada(request, consulta_id):
    """Notificar cancelamento de consulta"""
    consulta = get_object_or_404(Consulta, id=consulta_id)
    motivo = request.data.get('motivo', '')
    
    resultados = notification_service.notificar_consulta_cancelada(consulta, motivo)
    
    return Response({
        'message': 'Notificações de cancelamento enviadas',
        'resultados': resultados
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enviar_notificacao_custom(request):
    """Enviar notificação personalizada"""
    tutor_id = request.data.get('tutor_id')
    tipo = request.data.get('tipo')  # email ou whatsapp
    assunto = request.data.get('assunto', '')
    mensagem = request.data.get('mensagem')
    
    if not all([tutor_id, tipo, mensagem]):
        return Response(
            {'error': 'tutor_id, tipo e mensagem são obrigatórios'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    tutor = get_object_or_404(Tutor, id=tutor_id)
    
    if tipo == 'email':
        if not tutor.email:
            return Response({'error': 'Tutor não possui email'}, status=400)
        sucesso, erro = notification_service.enviar_email(
            tutor.email, assunto, mensagem, mensagem
        )
        destinatario = tutor.email
    elif tipo == 'whatsapp':
        if not tutor.phone:
            return Response({'error': 'Tutor não possui telefone'}, status=400)
        sucesso, erro = notification_service.enviar_whatsapp(tutor.phone, mensagem)
        destinatario = tutor.phone
    else:
        return Response({'error': 'Tipo inválido. Use "email" ou "whatsapp"'}, status=400)
    
    # Registrar notificação
    from django.utils import timezone
    notif = NotificacaoExterna.objects.create(
        tutor=tutor,
        tipo=tipo,
        evento='custom',
        destinatario=destinatario,
        assunto=assunto,
        mensagem=mensagem,
        status='enviada' if sucesso else 'erro',
        erro_mensagem=erro or '',
        enviada_em=timezone.now() if sucesso else None
    )
    
    return Response({
        'success': sucesso,
        'message': 'Notificação enviada com sucesso' if sucesso else 'Erro ao enviar',
        'erro': erro,
        'notificacao_id': notif.id
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listar_notificacoes(request):
    """Listar notificações externas"""
    tutor_id = request.GET.get('tutor_id')
    tipo = request.GET.get('tipo')
    status_filter = request.GET.get('status')
    
    notificacoes = NotificacaoExterna.objects.all()
    
    if tutor_id:
        notificacoes = notificacoes.filter(tutor_id=tutor_id)
    if tipo:
        notificacoes = notificacoes.filter(tipo=tipo)
    if status_filter:
        notificacoes = notificacoes.filter(status=status_filter)
    
    notificacoes = notificacoes[:50]  # Últimas 50
    
    serializer = NotificacaoExternaSerializer(notificacoes, many=True)
    return Response(serializer.data)
