"""
Model para Diagnósticos com IA/ML
"""
from django.db import models


class DiagnosticoIA(models.Model):
    """
    Diagnósticos realizados por IA/ML
    """
    # Campos de auditoria
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Data de Criação')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Data de Atualização')
    
    # Relacionamentos
    animal = models.ForeignKey(
        'Animal',
        on_delete=models.CASCADE,
        related_name='diagnosticos_ia',
        verbose_name='Animal'
    )
    
    # Dados do diagnóstico
    imagem = models.ImageField(
        upload_to='diagnosticos/%Y/%m/',
        help_text='Imagem para análise',
        verbose_name='Imagem'
    )
    resultado = models.JSONField(
        help_text='Resultado da predição (JSON com classes e probabilidades)',
        default=dict,
        verbose_name='Resultado',
        blank=True
    )
    classe_predita = models.CharField(
        max_length=100,
        help_text='Classe com maior probabilidade',
        verbose_name='Classe Predita',
        blank=True,
        default=''
    )
    confianca = models.FloatField(
        help_text='Confiança da predição (0-1)',
        verbose_name='Confiança',
        null=True,  # ← PERMITE NULL
        blank=True
    )
    observacoes = models.TextField(
        blank=True,
        help_text='Observações do veterinário sobre o diagnóstico',
        verbose_name='Observações'
    )
    
    # Validação por veterinário
    validado_por = models.ForeignKey(
        'Veterinario',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='diagnosticos_validados',
        help_text='Veterinário que validou o diagnóstico',
        verbose_name='Validado Por'
    )
    validado = models.BooleanField(
        default=False,
        help_text='Se o diagnóstico foi validado por um veterinário',
        verbose_name='Validado'
    )
    data_validacao = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Data de Validação'
    )

    class Meta:
        verbose_name = 'Diagnóstico IA'
        verbose_name_plural = 'Diagnósticos IA'
        ordering = ['-created_at']
        db_table = 'api_diagnostico_ia'

    def __str__(self):
        if self.classe_predita and self.animal:
            return f"{self.animal.name} - {self.classe_predita} ({self.confianca:.2%})"
        return f"Diagnóstico #{self.id}"
