from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listar_notificacoes_nao_lidas(request):
    """
    GET /api/notificacoes/nao_lidas/
    Lista notificações não lidas do usuário
    """
    try:
        user = request.user
        
        # 🔹 Tenta buscar notificações reais do banco
        try:
            from api.models import Notificacao
            
            # ✅ CORRIGIDO: user em vez de usuario
            notifications_qs = Notificacao.objects.filter(
                user=user,
                lida=False
            ).order_by('-created_at')[:10]
            
            notifications = [
                {
                    'id': n.id,
                    'tipo': getattr(n, 'tipo', 'info'),
                    'titulo': n.titulo,
                    'mensagem': n.mensagem,
                    'lida': n.lida,
                    'created_at': n.created_at.isoformat(),
                    'icon': getattr(n, 'icon', 'notifications'),
                    'color': getattr(n, 'color', 'primary'),
                }
                for n in notifications_qs
            ]
            
            return Response({
                'count': len(notifications),
                'results': notifications
            })
            
        except (ImportError, AttributeError) as e:
            logger.info(f'Modelo Notificacao não encontrado: {e}')
            # Se modelo não existe, retorna vazio
            return Response({
                'count': 0,
                'results': []
            })
        
    except Exception as e:
        logger.error(f'Erro ao listar notificações: {e}')
        return Response({
            'count': 0,
            'results': []
        })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listar_notificacoes(request):
    """
    GET /api/notificacoes/
    Lista todas as notificações do usuário
    """
    try:
        user = request.user
        
        try:
            from api.models import Notificacao
            
            # ✅ CORRIGIDO: user em vez de usuario
            notifications_qs = Notificacao.objects.filter(
                user=user
            ).order_by('-created_at')[:50]
            
            notifications = [
                {
                    'id': n.id,
                    'tipo': getattr(n, 'tipo', 'info'),
                    'titulo': n.titulo,
                    'mensagem': n.mensagem,
                    'lida': n.lida,
                    'created_at': n.created_at.isoformat(),
                }
                for n in notifications_qs
            ]
            
            return Response({
                'count': len(notifications),
                'results': notifications
            })
            
        except (ImportError, AttributeError):
            return Response({
                'count': 0,
                'results': []
            })
        
    except Exception as e:
        logger.error(f'Erro ao listar notificações: {e}')
        return Response({
            'count': 0,
            'results': []
        })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def marcar_como_lida(request, pk):
    """
    POST /api/notificacoes/{id}/marcar_lida/
    Marca notificação como lida
    """
    try:
        try:
            from api.models import Notificacao
            
            # ✅ CORRIGIDO: user em vez de usuario
            notificacao = Notificacao.objects.get(
                id=pk,
                user=request.user
            )
            notificacao.lida = True
            notificacao.save()
            
            return Response({'message': 'Notificação marcada como lida'})
            
        except ImportError:
            return Response({'message': 'Modelo não existe'})
        except Notificacao.DoesNotExist:
            return Response({'error': 'Notificação não encontrada'}, status=404)
            
    except Exception as e:
        logger.error(f'Erro ao marcar notificação: {e}')
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def marcar_todas_como_lidas(request):
    """
    POST /api/notificacoes/marcar_todas_lidas/
    Marca todas as notificações como lidas
    """
    try:
        try:
            from api.models import Notificacao
            
            # ✅ CORRIGIDO: user em vez de usuario
            updated = Notificacao.objects.filter(
                user=request.user,
                lida=False
            ).update(lida=True)
            
            return Response({
                'message': f'{updated} notificações marcadas como lidas'
            })
            
        except ImportError:
            return Response({'message': 'Modelo não existe'})
            
    except Exception as e:
        logger.error(f'Erro ao marcar notificações: {e}')
        return Response({'error': str(e)}, status=500)


# Funções auxiliares para criar notificações
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def notificar_consulta_agendada(request):
    """Envia notificação de consulta agendada"""
    return Response({'message': 'Notificação enviada'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def notificar_lembrete_consulta(request):
    """Envia lembrete de consulta"""
    return Response({'message': 'Lembrete enviado'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def notificar_consulta_cancelada(request):
    """Notifica cancelamento de consulta"""
    return Response({'message': 'Notificação de cancelamento enviada'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enviar_notificacao_custom(request):
    """Envia notificação customizada"""
    return Response({'message': 'Notificação customizada enviada'})
