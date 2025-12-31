from django.db import models
from api.models.consulta import Consulta
from api.models.tutor import Tutor


class NotificacaoExterna(models.Model):
    """Modelo para notificações externas (Email/WhatsApp)"""
    
    TIPO_CHOICES = [
        ('email', 'Email'),
        ('whatsapp', 'WhatsApp'),
        ('sms', 'SMS'),
    ]
    
    EVENTO_CHOICES = [
        ('consulta_agendada', 'Consulta Agendada'),
        ('consulta_confirmada', 'Consulta Confirmada'),
        ('lembrete_consulta', 'Lembrete de Consulta'),
        ('consulta_cancelada', 'Consulta Cancelada'),
        ('resultado_exame', 'Resultado de Exame'),
        ('vacina_vencendo', 'Vacina Vencendo'),
        ('aniversario_pet', 'Aniversário do Pet'),
        ('custom', 'Personalizada'),
    ]
    
    STATUS_CHOICES = [
        ('pendente', 'Pendente'),
        ('enviada', 'Enviada'),
        ('erro', 'Erro'),
    ]
    
    tutor = models.ForeignKey(Tutor, on_delete=models.CASCADE, related_name='notificacoes_externas')
    consulta = models.ForeignKey(Consulta, on_delete=models.SET_NULL, null=True, blank=True)
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    evento = models.CharField(max_length=50, choices=EVENTO_CHOICES)
    
    destinatario = models.CharField(max_length=200)  # Email ou telefone
    assunto = models.CharField(max_length=200, blank=True)
    mensagem = models.TextField()
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pendente')
    erro_mensagem = models.TextField(blank=True)
    
    agendada_para = models.DateTimeField(null=True, blank=True)
    enviada_em = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'notificacoes_externas'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_tipo_display()} - {self.tutor.name} - {self.get_evento_display()}"
