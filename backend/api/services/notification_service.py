"""
Serviço de Notificações - Email e WhatsApp
"""
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.utils import timezone
from twilio.rest import Client
from api.models import NotificacaoExterna
import logging

logger = logging.getLogger(__name__)


class NotificationService:
    """Serviço para envio de notificações externas"""
    
    def __init__(self):
        self.twilio_client = None
        if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN:
            try:
                self.twilio_client = Client(
                    settings.TWILIO_ACCOUNT_SID,
                    settings.TWILIO_AUTH_TOKEN
                )
            except Exception as e:
                logger.warning(f"Twilio não configurado: {e}")
    
    def enviar_email(self, destinatario, assunto, mensagem_html, mensagem_texto=None):
        """Enviar email"""
        try:
            email = EmailMultiAlternatives(
                subject=assunto,
                body=mensagem_texto or mensagem_html,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[destinatario]
            )
            email.attach_alternative(mensagem_html, "text/html")
            email.send()
            return True, None
        except Exception as e:
            logger.error(f"Erro ao enviar email: {str(e)}")
            return False, str(e)
    
    def enviar_whatsapp(self, destinatario, mensagem):
        """Enviar mensagem via WhatsApp (Twilio)"""
        if not self.twilio_client:
            return False, "Twilio não configurado"
        
        try:
            # Formatar número se necessário
            if not destinatario.startswith('whatsapp:'):
                # Remove caracteres não numéricos
                numero_limpo = ''.join(filter(str.isdigit, destinatario))
                # Adiciona código do país se não tiver
                if not numero_limpo.startswith('55'):
                    numero_limpo = f"55{numero_limpo}"
                destinatario = f"whatsapp:+{numero_limpo}"
            
            message = self.twilio_client.messages.create(
                body=mensagem,
                from_=settings.TWILIO_WHATSAPP_NUMBER,
                to=destinatario
            )
            return True, None
        except Exception as e:
            logger.error(f"Erro ao enviar WhatsApp: {str(e)}")
            return False, str(e)
    
    def notificar_consulta_agendada(self, consulta):
        """Notificar sobre consulta agendada"""
        tutor = consulta.animal.tutor
        
        # Criar mensagem
        mensagem = f"""
Olá {tutor.name}!

Consulta agendada para {consulta.animal.name}
Data: {consulta.data_consulta.strftime('%d/%m/%Y')}
Horário: {consulta.horario.strftime('%H:%M')}
Veterinário: {consulta.veterinario.nome}
Motivo: {consulta.motivo}

Em caso de dúvidas, entre em contato conosco.

VetSystem - Cuidando do seu pet com amor 🐾
        """
        
        mensagem_html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #1976d2; text-align: center;">✅ Consulta Agendada</h2>
                
                <p>Olá <strong>{tutor.name}</strong>!</p>
                
                <p>Confirmamos o agendamento da consulta para <strong>{consulta.animal.name}</strong>:</p>
                
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>📅 Data:</strong> {consulta.data_consulta.strftime('%d/%m/%Y')}</p>
                    <p><strong>🕐 Horário:</strong> {consulta.horario.strftime('%H:%M')}</p>
                    <p><strong>👨‍⚕️ Veterinário:</strong> {consulta.veterinario.nome}</p>
                    <p><strong>📋 Motivo:</strong> {consulta.motivo}</p>
                </div>
                
                <p>Em caso de dúvidas ou necessidade de remarcação, entre em contato conosco.</p>
                
                <p style="text-align: center; margin-top: 30px; color: #666;">
                    <em>VetSystem - Cuidando do seu pet com amor 🐾</em>
                </p>
            </div>
        </body>
        </html>
        """
        
        resultados = []
        
        # Enviar Email
        if tutor.email:
            sucesso, erro = self.enviar_email(
                tutor.email,
                "Consulta Agendada - VetSystem",
                mensagem_html,
                mensagem.strip()
            )
            
            NotificacaoExterna.objects.create(
                tutor=tutor,
                consulta=consulta,
                tipo='email',
                evento='consulta_agendada',
                destinatario=tutor.email,
                assunto="Consulta Agendada",
                mensagem=mensagem.strip(),
                status='enviada' if sucesso else 'erro',
                erro_mensagem=erro or '',
                enviada_em=timezone.now() if sucesso else None
            )
            resultados.append({'tipo': 'email', 'sucesso': sucesso, 'erro': erro})
        
        # Enviar WhatsApp
        if tutor.phone:
            sucesso, erro = self.enviar_whatsapp(tutor.phone, mensagem.strip())
            
            NotificacaoExterna.objects.create(
                tutor=tutor,
                consulta=consulta,
                tipo='whatsapp',
                evento='consulta_agendada',
                destinatario=tutor.phone,
                mensagem=mensagem.strip(),
                status='enviada' if sucesso else 'erro',
                erro_mensagem=erro or '',
                enviada_em=timezone.now() if sucesso else None
            )
            resultados.append({'tipo': 'whatsapp', 'sucesso': sucesso, 'erro': erro})
        
        return resultados
    
    def notificar_lembrete_consulta(self, consulta):
        """Lembrete de consulta (24h antes)"""
        tutor = consulta.animal.tutor
        
        mensagem = f"""
🔔 LEMBRETE: Você tem uma consulta amanhã!

🐾 Animal: {consulta.animal.name}
📅 Data: {consulta.data_consulta.strftime('%d/%m/%Y')}
�� Horário: {consulta.horario.strftime('%H:%M')}
👨‍⚕️ Veterinário: {consulta.veterinario.nome}

Não se esqueça!
VetSystem
        """
        
        resultados = []
        
        # WhatsApp prioritário para lembretes
        if tutor.phone:
            sucesso, erro = self.enviar_whatsapp(tutor.phone, mensagem.strip())
            NotificacaoExterna.objects.create(
                tutor=tutor,
                consulta=consulta,
                tipo='whatsapp',
                evento='lembrete_consulta',
                destinatario=tutor.phone,
                mensagem=mensagem.strip(),
                status='enviada' if sucesso else 'erro',
                erro_mensagem=erro or '',
                enviada_em=timezone.now() if sucesso else None
            )
            resultados.append({'tipo': 'whatsapp', 'sucesso': sucesso})
        
        # Também enviar por email
        if tutor.email:
            sucesso, erro = self.enviar_email(
                tutor.email,
                "🔔 Lembrete de Consulta - VetSystem",
                f"<pre>{mensagem}</pre>",
                mensagem.strip()
            )
            resultados.append({'tipo': 'email', 'sucesso': sucesso})
        
        return resultados
    
    def notificar_consulta_cancelada(self, consulta, motivo=''):
        """Notificar cancelamento de consulta"""
        tutor = consulta.animal.tutor
        
        mensagem = f"""
❌ Consulta Cancelada

Animal: {consulta.animal.name}
Data: {consulta.data_consulta.strftime('%d/%m/%Y')}
Horário: {consulta.horario.strftime('%H:%M')}
{f"Motivo: {motivo}" if motivo else ""}

Entre em contato para reagendar.
VetSystem
        """
        
        resultados = []
        
        if tutor.email:
            sucesso, erro = self.enviar_email(
                tutor.email,
                "Consulta Cancelada - VetSystem",
                f"<pre>{mensagem}</pre>",
                mensagem.strip()
            )
            resultados.append({'tipo': 'email', 'sucesso': sucesso})
        
        if tutor.phone:
            sucesso, erro = self.enviar_whatsapp(tutor.phone, mensagem.strip())
            resultados.append({'tipo': 'whatsapp', 'sucesso': sucesso})
        
        return resultados


# Instância global
notification_service = NotificationService()
