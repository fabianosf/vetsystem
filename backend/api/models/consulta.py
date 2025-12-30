from django.db import models
from api.models.base import BaseModel

class Consulta(BaseModel):
    """Model para Consultas"""
    
    animal = models.ForeignKey('Animal', on_delete=models.CASCADE, related_name='consultas')
    veterinario = models.ForeignKey('Veterinario', on_delete=models.SET_NULL, null=True, blank=True, related_name='consultas')
    clinica = models.ForeignKey('Clinica', on_delete=models.SET_NULL, null=True, blank=True, related_name='consultas')
    
    data = models.DateField(verbose_name='Data da Consulta')
    horario = models.TimeField(verbose_name='Horário', null=True, blank=True)
    
    # Status e Tipo
    STATUS_CHOICES = [
        ('AGENDADA', 'Agendada'),
        ('CONFIRMADA', 'Confirmada'),
        ('EM_ANDAMENTO', 'Em Andamento'),
        ('CONCLUIDA', 'Concluída'),
        ('CANCELADA', 'Cancelada'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='AGENDADA')
    
    TIPO_CHOICES = [
        ('CONSULTA', 'Consulta'),
        ('RETORNO', 'Retorno'),
        ('EMERGENCIA', 'Emergência'),
        ('CIRURGIA', 'Cirurgia'),
    ]
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, default='CONSULTA')
    
    # Informações da consulta
    motivo = models.TextField(verbose_name='Motivo da Consulta')
    diagnostico = models.TextField(blank=True, null=True, verbose_name='Diagnóstico')
    prescricao = models.TextField(blank=True, null=True, verbose_name='Prescrição')
    observacoes = models.TextField(blank=True, null=True, verbose_name='Observações')
    
    # Financeiro
    valor = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name='Valor')
    
    class Meta:
        db_table = 'consulta'
        verbose_name = 'Consulta'
        verbose_name_plural = 'Consultas'
        ordering = ['-data', '-horario']
    
    def __str__(self):
        return f"{self.animal.name} - {self.data}"
