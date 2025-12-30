from api.models import Notificacao
from django.contrib.auth.models import User

def criar_notificacao(
    user,
    titulo,
    mensagem,
    tipo='INFO',
    categoria='SISTEMA',
    link=None,
    icone=None
):
    """
    Cria uma notificação para o usuário
    
    Args:
        user: Usuário que receberá a notificação
        titulo: Título da notificação
        mensagem: Mensagem da notificação
        tipo: INFO, SUCCESS, WARNING, ERROR
        categoria: CONSULTA, VACINA, EXAME, PLANO, SISTEMA
        link: URL opcional para ação
        icone: Ícone Material-UI opcional
    """
    return Notificacao.objects.create(
        user=user,
        titulo=titulo,
        mensagem=mensagem,
        tipo=tipo,
        categoria=categoria,
        link=link,
        icone=icone
    )

def notificar_consulta_agendada(consulta, user):
    """Notifica quando uma consulta é agendada"""
    criar_notificacao(
        user=user,
        titulo='Consulta Agendada',
        mensagem=f'Consulta para {consulta.animal.name} agendada para {consulta.data}',
        tipo='SUCCESS',
        categoria='CONSULTA',
        link=f'/consultas/{consulta.id}',
        icone='EventAvailable'
    )

def notificar_vacina_proxima(vacina, user):
    """Notifica quando uma vacina está próxima"""
    criar_notificacao(
        user=user,
        titulo='Vacina Próxima',
        mensagem=f'Vacina de {vacina.animal.name} vence em breve',
        tipo='WARNING',
        categoria='VACINA',
        link=f'/animais/{vacina.animal.id}',
        icone='Vaccines'
    )

def notificar_plano_vencendo(contrato, user):
    """Notifica quando um plano está vencendo"""
    criar_notificacao(
        user=user,
        titulo='Plano Vencendo',
        mensagem=f'Plano de {contrato.animal.name} vence em breve',
        tipo='WARNING',
        categoria='PLANO',
        link=f'/planos',
        icone='Warning'
    )
