"""
Serviço de Notificações Externas - Email e WhatsApp
"""
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.utils import timezone
from twilio.rest import Client
from api.models import NotificacaoExterna
import logging

logger = logging.getLogger(__name__)


class NotificationService:
    """Serviço para envio de notificações externas (email / WhatsApp)"""

    def __init__(self):
        self.twilio_client = None
        if getattr(settings, "TWILIO_ACCOUNT_SID", None) and getattr(settings, "TWILIO_AUTH_TOKEN", None):
            try:
                self.twilio_client = Client(
                    settings.TWILIO_ACCOUNT_SID,
                    settings.TWILIO_AUTH_TOKEN
                )
            except Exception as e:
                logger.warning(f"Twilio não configurado corretamente: {e}")

    def enviar_email(self, destinatario, assunto, mensagem_html, mensagem_texto=None):
        """Enviar email simples ou HTML."""
        try:
            email = EmailMultiAlternatives(
                subject=assunto,
                body=mensagem_texto or mensagem_html,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[destinatario],
            )
            email.attach_alternative(mensagem_html, "text/html")
            email.send()
            return True, None
        except Exception as e:
            logger.error(f"Erro ao enviar email para {destinatario}: {str(e)}")
            return False, str(e)

    def enviar_whatsapp(self, destinatario, mensagem):
        """Enviar mensagem via WhatsApp (Twilio)."""
        if not self.twilio_client:
            return False, "Twilio não configurado"

        try:
            # Normaliza número
            if not destinatario.startswith("whatsapp:"):
                numero_limpo = "".join(filter(str.isdigit, destinatario))
                if not numero_limpo.startswith("55"):
                    numero_limpo = f"55{numero_limpo}"
                destinatario = f"whatsapp:+{numero_limpo}"

            self.twilio_client.messages.create(
                body=mensagem,
                from_=settings.TWILIO_WHATSAPP_NUMBER,
                to=destinatario,
            )
            return True, None
        except Exception as e:
            logger.error(f"Erro ao enviar WhatsApp para {destinatario}: {str(e)}")
            return False, str(e)

    def notificar_consulta_agendada(self, consulta):
        """Notificar tutor sobre consulta agendada."""
        tutor = consulta.animal.tutor

        mensagem_texto = f"""
Olá {tutor.name}!

Consulta agendada para {consulta.animal.name}:

📅 Data: {consulta.data.strftime('%d/%m/%Y')}
🕐 Horário: {consulta.horario.strftime('%H:%M')}
👨‍⚕️ Veterinário: {consulta.veterinario.name}
📋 Motivo: {consulta.motivo}

Em caso de dúvidas, entre em contato conosco.

VetSystem - Cuidando do seu pet com amor 🐾
        """

        mensagem_html = f"""
<html>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;
                border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #1976d2; text-align: center;">✅ Consulta Agendada</h2>

      <p>Olá <strong>{tutor.name}</strong>!</p>

      <p>Confirmamos o agendamento da consulta para
         <strong>{consulta.animal.name}</strong>:</p>

      <div style="background-color: #f5f5f5; padding: 15px;
                  border-radius: 5px; margin: 20px 0;">
        <p><strong>📅 Data:</strong> {consulta.data.strftime('%d/%m/%Y')}</p>
        <p><strong>🕐 Horário:</strong> {consulta.horario.strftime('%H:%M')}</p>
        <p><strong>👨‍⚕️ Veterinário:</strong> {consulta.veterinario.nome}</p>
        <p><strong>📋 Motivo:</strong> {consulta.motivo}</p>
      </div>

      <p>Em caso de dúvidas ou necessidade de remarcação,
         entre em contato conosco.</p>

      <p style="text-align: center; margin-top: 30px; color: #666;">
        <em>VetSystem - Cuidando do seu pet com amor 🐾</em>
      </p>
    </div>
  </body>
</html>
        """

        resultados = []

        # Email
        if tutor.email:
            sucesso, erro = self.enviar_email(
                tutor.email,
                "Consulta Agendada - VetSystem",
                mensagem_html,
                mensagem_texto.strip(),
            )

            NotificacaoExterna.objects.create(
                tutor=tutor,
                consulta=consulta,
                tipo="email",
                evento="consulta_agendada",
                destinatario=tutor.email,
                assunto="Consulta Agendada - VetSystem",
                mensagem=mensagem_texto.strip(),
                status="enviada" if sucesso else "erro",
                erro_mensagem=erro or "",
                enviada_em=timezone.now() if sucesso else None,
            )

            resultados.append({"tipo": "email", "sucesso": sucesso, "erro": erro})

        # WhatsApp
        if tutor.phone:
            sucesso, erro = self.enviar_whatsapp(tutor.phone, mensagem_texto.strip())

            NotificacaoExterna.objects.create(
                tutor=tutor,
                consulta=consulta,
                tipo="whatsapp",
                evento="consulta_agendada",
                destinatario=tutor.phone,
                mensagem=mensagem_texto.strip(),
                status="enviada" if sucesso else "erro",
                erro_mensagem=erro or "",
                enviada_em=timezone.now() if sucesso else None,
            )

            resultados.append({"tipo": "whatsapp", "sucesso": sucesso, "erro": erro})

        return resultados

    def notificar_lembrete_consulta(self, consulta):
        """Lembrete de consulta (24h antes)."""
        tutor = consulta.animal.tutor

        mensagem = f"""
🔔 LEMBRETE: Você tem uma consulta amanhã!

🐾 Animal: {consulta.animal.name}
📅 Data: {consulta.data.strftime('%d/%m/%Y')}
🕐 Horário: {consulta.horario.strftime('%H:%M')}
👨‍⚕️ Veterinário: {consulta.veterinario.nome}

Não se esqueça!

VetSystem
        """

        resultados = []

        if tutor.phone:
            sucesso, erro = self.enviar_whatsapp(tutor.phone, mensagem.strip())

            NotificacaoExterna.objects.create(
                tutor=tutor,
                consulta=consulta,
                tipo="whatsapp",
                evento="lembrete_consulta",
                destinatario=tutor.phone,
                mensagem=mensagem.strip(),
                status="enviada" if sucesso else "erro",
                erro_mensagem=erro or "",
                enviada_em=timezone.now() if sucesso else None,
            )

            resultados.append({"tipo": "whatsapp", "sucesso": sucesso, "erro": erro})

        # Opcional: também por email
        if tutor.email:
            sucesso, erro = self.enviar_email(
                tutor.email,
                "🔔 Lembrete de Consulta - VetSystem",
                f"<pre>{mensagem}</pre>",
                mensagem.strip(),
            )

            NotificacaoExterna.objects.create(
                tutor=tutor,
                consulta=consulta,
                tipo="email",
                evento="lembrete_consulta",
                destinatario=tutor.email,
                assunto="Lembrete de Consulta - VetSystem",
                mensagem=mensagem.strip(),
                status="enviada" if sucesso else "erro",
                erro_mensagem=erro or "",
                enviada_em=timezone.now() if sucesso else None,
            )

            resultados.append({"tipo": "email", "sucesso": sucesso, "erro": erro})

        return resultados

    def notificar_consulta_cancelada(self, consulta, motivo=""):
        """Notificar cancelamento de consulta."""
        tutor = consulta.animal.tutor

        mensagem = f"""
❌ Consulta Cancelada

🐾 Animal: {consulta.animal.name}
📅 Data: {consulta.data.strftime('%d/%m/%Y')}
🕐 Horário: {consulta.horario.strftime('%H:%M')}
{f"📝 Motivo: {motivo}" if motivo else ""}

Entre em contato para reagendar.

VetSystem
        """

        resultados = []

        if tutor.email:
            sucesso, erro = self.enviar_email(
                tutor.email,
                "Consulta Cancelada - VetSystem",
                f"<pre>{mensagem}</pre>",
                mensagem.strip(),
            )

            NotificacaoExterna.objects.create(
                tutor=tutor,
                consulta=consulta,
                tipo="email",
                evento="consulta_cancelada",
                destinatario=tutor.email,
                assunto="Consulta Cancelada - VetSystem",
                mensagem=mensagem.strip(),
                status="enviada" if sucesso else "erro",
                erro_mensagem=erro or "",
                enviada_em=timezone.now() if sucesso else None,
            )

            resultados.append({"tipo": "email", "sucesso": sucesso, "erro": erro})

        if tutor.phone:
            sucesso, erro = self.enviar_whatsapp(tutor.phone, mensagem.strip())

            NotificacaoExterna.objects.create(
                tutor=tutor,
                consulta=consulta,
                tipo="whatsapp",
                evento="consulta_cancelada",
                destinatario=tutor.phone,
                mensagem=mensagem.strip(),
                status="enviada" if sucesso else "erro",
                erro_mensagem=erro or "",
                enviada_em=timezone.now() if sucesso else None,
            )

            resultados.append({"tipo": "whatsapp", "sucesso": sucesso, "erro": erro})

        return resultados


# Instância global
notification_service = NotificationService()
