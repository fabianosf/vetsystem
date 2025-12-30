from django.db import models

# Create your models here.


class DiagnosticoIA(TimeStampedModel):
    """
    Diagnósticos realizados por IA/ML
    """
    animal = models.ForeignKey(
        'Animal',
        on_delete=models.CASCADE,
        related_name='diagnosticos_ia'
    )
    imagem = models.ImageField(
        upload_to='diagnosticos/%Y/%m/',
        help_text='Imagem para análise'
    )
    resultado = models.JSONField(
        help_text='Resultado da predição (JSON com classes e probabilidades)'
    )
    classe_predita = models.CharField(
        max_length=100,
        help_text='Classe com maior probabilidade'
    )
    confianca = models.FloatField(
        help_text='Confiança da predição (0-1)'
    )
    observacoes = models.TextField(
        blank=True,
        help_text='Observações do veterinário sobre o diagnóstico'
    )
    validado_por = models.ForeignKey(
        'Veterinario',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='diagnosticos_validados',
        help_text='Veterinário que validou o diagnóstico'
    )
    validado = models.BooleanField(
        default=False,
        help_text='Se o diagnóstico foi validado por um veterinário'
    )
    data_validacao = models.DateTimeField(
        null=True,
        blank=True
    )

    class Meta:
        verbose_name = 'Diagnóstico IA'
        verbose_name_plural = 'Diagnósticos IA'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.animal.name} - {self.classe_predita} ({self.confianca:.2%})"
