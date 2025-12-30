from celery import shared_task
from django.core.mail import send_mail, EmailMultipleAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from datetime import date, timedelta
from api.models import Consulta, Vacina, Animal, Tutor


@shared_task
def enviar_email_boas_vindas(tutor_email, tutor_nome):
    """
    Envia email de boas-vindas para novo tutor
    """
    subject = '🐾 Bem-vindo ao VetSystem!'
    
    html_message = f"""
    <html>
        <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
                <h1 style="color: #0ea5e9; text-align: center;">🐾 VetSystem</h1>
                <h2 style="color: #333;">Olá, {tutor_nome}!</h2>
                <p style="color: #666; font-size: 16px; line-height: 1.6;">
                    Seja muito bem-vindo(a) ao <strong>VetSystem</strong>!
                </p>
                <p style="color: #666; font-size: 16px; line-height: 1.6;">
                    Estamos felizes em tê-lo(a) conosco. Nosso sistema foi desenvolvido para 
                    proporcionar o melhor cuidado para seu pet.
                </p>
                <div style="background-color: #e0f2fe; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #0ea5e9; margin-top: 0;">O que você pode fazer:</h3>
                    <ul style="color: #666; line-height: 2;">
                        <li>📅 Agendar consultas</li>
                        <li>💉 Controlar vacinas</li>
                        <li>🏥 Acompanhar exames</li>
                        <li>📱 Receber lembretes automáticos</li>
                    </ul>
                </div>
                <p style="color: #666; font-size: 16px;">
                    Qualquer dúvida, estamos à disposição!
                </p>
                <p style="color: #666; font-size: 16px;">
                    Atenciosamente,<br>
                    <strong style="color: #0ea5e9;">Equipe VetSystem</strong>
                </p>
            </div>
        </body>
    </html>
    """
    
    plain_message = strip_tags(html_message)
    
    send_mail(
        subject,
        plain_message,
        settings.DEFAULT_FROM_EMAIL,
        [tutor_email],
        html_message=html_message,
        fail_silently=False,
    )


@shared_task
def enviar_confirmacao_consulta(consulta_id):
    """
    Envia email de confirmação de consulta agendada
    """
    try:
        consulta = Consulta.objects.select_related('animal__tutor', 'veterinario', 'clinica').get(id=consulta_id)
        tutor = consulta.animal.tutor
        
        subject = f'✅ Consulta Agendada - {consulta.animal.name}'
        
        html_message = f"""
        <html>
            <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
                    <h1 style="color: #10b981; text-align: center;">✅ Consulta Agendada</h1>
                    <p style="color: #666; font-size: 16px;">Olá, {tutor.name}!</p>
                    <p style="color: #666; font-size: 16px;">
                        A consulta do(a) <strong>{consulta.animal.name}</strong> foi agendada com sucesso!
                    </p>
                    
                    <div style="background-color: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #10b981; margin-top: 0;">📋 Detalhes da Consulta:</h3>
                        <table style="width: 100%; color: #666;">
                            <tr>
                                <td style="padding: 8px 0;"><strong>🐾 Pet:</strong></td>
                                <td>{consulta.animal.name}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0;"><strong>👨‍⚕️ Veterinário:</strong></td>
                                <td>{consulta.veterinario.name}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0;"><strong>📅 Data:</strong></td>
                                <td>{consulta.data.strftime('%d/%m/%Y')}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0;"><strong>🕐 Horário:</strong></td>
                                <td>{consulta.horario or 'A definir'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0;"><strong>🏥 Clínica:</strong></td>
                                <td>{consulta.clinica.nome if consulta.clinica else 'N/A'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0;"><strong>📝 Motivo:</strong></td>
                                <td>{consulta.motivo}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <p style="color: #666; font-size: 14px; background-color: #fef3c7; padding: 15px; border-radius: 8px;">
                        ⏰ <strong>Lembrete:</strong> Por favor, chegue com 10 minutos de antecedência.
                    </p>
                    
                    <p style="color: #666; font-size: 16px;">
                        Atenciosamente,<br>
                        <strong style="color: #0ea5e9;">Equipe VetSystem</strong>
                    </p>
                </div>
            </body>
        </html>
        """
        
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [tutor.email],
            html_message=html_message,
            fail_silently=False,
        )
        
    except Consulta.DoesNotExist:
        pass


@shared_task
def enviar_lembretes_consultas():
    """
    Envia lembretes de consultas para o dia seguinte
    Executado diariamente às 8h
    """
    amanha = date.today() + timedelta(days=1)
    consultas = Consulta.objects.filter(
        data=amanha,
        status__in=['AGENDADA', 'CONFIRMADA']
    ).select_related('animal__tutor', 'veterinario', 'clinica')
    
    for consulta in consultas:
        tutor = consulta.animal.tutor
        
        subject = f'⏰ Lembrete: Consulta Amanhã - {consulta.animal.name}'
        
        html_message = f"""
        <html>
            <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
                    <h1 style="color: #f59e0b; text-align: center;">⏰ Lembrete de Consulta</h1>
                    <p style="color: #666; font-size: 16px;">Olá, {tutor.name}!</p>
                    <p style="color: #666; font-size: 16px;">
                        Este é um lembrete de que <strong>{consulta.animal.name}</strong> tem consulta <strong>amanhã</strong>!
                    </p>
                    
                    <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #f59e0b; margin-top: 0;">�� Detalhes:</h3>
                        <table style="width: 100%; color: #666;">
                            <tr>
                                <td style="padding: 8px 0;"><strong>📅 Data:</strong></td>
                                <td>{consulta.data.strftime('%d/%m/%Y')}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0;"><strong>🕐 Horário:</strong></td>
                                <td>{consulta.horario or 'A definir'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0;"><strong>👨‍⚕️ Veterinário:</strong></td>
                                <td>{consulta.veterinario.name}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0;"><strong>🏥 Local:</strong></td>
                                <td>{consulta.clinica.nome if consulta.clinica else 'N/A'}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <p style="color: #666; font-size: 14px; background-color: #dbeafe; padding: 15px; border-radius: 8px;">
                        💡 <strong>Dica:</strong> Não esqueça de trazer a carteira de vacinação!
                    </p>
                    
                    <p style="color: #666; font-size: 16px;">
                        Nos vemos amanhã!<br>
                        <strong style="color: #0ea5e9;">Equipe VetSystem</strong>
                    </p>
                </div>
            </body>
        </html>
        """
        
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [tutor.email],
            html_message=html_message,
            fail_silently=True,  # Não falhar se um email der erro
        )


@shared_task
def verificar_vacinas_vencendo():
    """
    Verifica vacinas que estão vencendo em 7 dias
    Executado diariamente às 9h
    """
    daqui_7_dias = date.today() + timedelta(days=7)
    
    vacinas = Vacina.objects.filter(
        proxima_dose__lte=daqui_7_dias,
        proxima_dose__gte=date.today()
    ).select_related('animal__tutor')
    
    for vacina in vacinas:
        tutor = vacina.animal.tutor
        dias_restantes = (vacina.proxima_dose - date.today()).days
        
        subject = f'💉 Vacina Próxima do Vencimento - {vacina.animal.name}'
        
        html_message = f"""
        <html>
            <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
                    <h1 style="color: #8b5cf6; text-align: center;">💉 Lembrete de Vacinação</h1>
                    <p style="color: #666; font-size: 16px;">Olá, {tutor.name}!</p>
                    <p style="color: #666; font-size: 16px;">
                        A vacina de <strong>{vacina.animal.name}</strong> está próxima do vencimento!
                    </p>
                    
                    <div style="background-color: #ede9fe; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #8b5cf6; margin-top: 0;">💉 Detalhes da Vacina:</h3>
                        <table style="width: 100%; color: #666;">
                            <tr>
                                <td style="padding: 8px 0;"><strong>🐾 Pet:</strong></td>
                                <td>{vacina.animal.name}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0;"><strong>💉 Vacina:</strong></td>
                                <td>{vacina.nome}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0;"><strong>📅 Próxima Dose:</strong></td>
                                <td>{vacina.proxima_dose.strftime('%d/%m/%Y')}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0;"><strong>⏰ Faltam:</strong></td>
                                <td><strong style="color: #ef4444;">{dias_restantes} dias</strong></td>
                            </tr>
                        </table>
                    </div>
                    
                    <p style="color: #666; font-size: 14px; background-color: #fee2e2; padding: 15px; border-radius: 8px;">
                        ⚠️ <strong>Importante:</strong> Agende a próxima dose o quanto antes para manter a proteção do seu pet!
                    </p>
                    
                    <p style="color: #666; font-size: 16px;">
                        Atenciosamente,<br>
                        <strong style="color: #0ea5e9;">Equipe VetSystem</strong>
                    </p>
                </div>
            </body>
        </html>
        """
        
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [tutor.email],
            html_message=html_message,
            fail_silently=True,
        )


@shared_task
def enviar_relatorio_mensal_tutor(tutor_id):
    """
    Envia relatório mensal para o tutor
    """
    try:
        tutor = Tutor.objects.get(id=tutor_id)
        animais = tutor.animais.all()
        
        subject = f'📊 Relatório Mensal - VetSystem'
        
        # Montar informações dos animais
        info_animais = ""
        for animal in animais:
            consultas_mes = animal.consultas.filter(
                data__month=date.today().month,
                data__year=date.today().year
            ).count()
            
            info_animais += f"""
            <tr style="background-color: #f9fafb;">
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">{animal.name}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">{consultas_mes}</td>
            </tr>
            """
        
        html_message = f"""
        <html>
            <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
                    <h1 style="color: #0ea5e9; text-align: center;">📊 Relatório Mensal</h1>
                    <p style="color: #666; font-size: 16px;">Olá, {tutor.name}!</p>
                    <p style="color: #666; font-size: 16px;">
                        Aqui está o resumo das atividades dos seus pets este mês:
                    </p>
                    
                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                        <thead>
                            <tr style="background-color: #0ea5e9; color: white;">
                                <th style="padding: 12px; text-align: left;">Pet</th>
                                <th style="padding: 12px; text-align: left;">Consultas</th>
                            </tr>
                        </thead>
                        <tbody>
                            {info_animais}
                        </tbody>
                    </table>
                    
                    <p style="color: #666; font-size: 16px;">
                        Continue cuidando bem dos seus pets!<br>
                        <strong style="color: #0ea5e9;">Equipe VetSystem</strong>
                    </p>
                </div>
            </body>
        </html>
        """
        
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [tutor.email],
            html_message=html_message,
            fail_silently=False,
        )
        
    except Tutor.DoesNotExist:
        pass
