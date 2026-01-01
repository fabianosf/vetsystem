from django.db import models
from .prontuario import Prontuario


class Prescricao(models.Model):
    """Prescrições médicas"""
    
    prontuario = models.ForeignKey(Prontuario, on_delete=models.CASCADE, related_name='prescricoes')
    medicamento = models.CharField(max_length=200, verbose_name='Medicamento')
    dosagem = models.CharField(max_length=100, verbose_name='Dosagem')
    via_administracao = models.CharField(max_length=100, verbose_name='Via de Administração')
    frequencia = models.CharField(max_length=200, verbose_name='Frequência')
    duracao = models.CharField(max_length=100, verbose_name='Duração')
    
    data_inicio = models.DateField(verbose_name='Data de Início')
    data_fim = models.DateField(null=True, blank=True, verbose_name='Data de Término')
    
    orientacoes = models.TextField(blank=True, verbose_name='Orientações')
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Criado em')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Atualizado em')
    
    class Meta:
        db_table = 'prescricoes'
        ordering = ['-data_inicio']
        verbose_name = 'Prescrição'
        verbose_name_plural = 'Prescrições'
    
    def __str__(self):
        return f"{self.medicamento} - {self.prontuario.animal.name}"
