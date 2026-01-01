from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone


class TimeStampedModel(models.Model):
    """
    Modelo abstrato com campos de data de criação e atualização
    """
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class DiagnosticoIA(TimeStampedModel):
    """
    Diagnósticos realizados por IA/ML
    """
    animal = models.ForeignKey(
        'Animal',
        on_delete=models.CASCADE,
        related_name='diagnosticos_ia',
        null=True,      # ✅ Permite NULL
        blank=True,     # ✅ Permite vazio no form
        help_text='Animal relacionado ao diagnóstico (opcional)'
    )
    imagem = models.ImageField(
        upload_to='diagnosticos/%Y/%m/',
        help_text='Imagem para análise'
    )
    resultado = models.JSONField(
        default=dict,   # ✅ Valor padrão
        blank=True,     # ✅ Permite vazio
        help_text='Resultado da predição (JSON com classes e probabilidades)'
    )
    classe_predita = models.CharField(
        max_length=100,
        blank=True,     # ✅ Permite vazio inicialmente
        help_text='Classe com maior probabilidade'
    )
    confianca = models.FloatField(
        null=True,      # ✅ Permite NULL inicialmente
        blank=True,     # ✅ Permite vazio
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
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
        blank=True,
        help_text='Data em que o diagnóstico foi validado'
    )

    class Meta:
        db_table = 'api_diagnostico_ia'  # ✅ Nome explícito da tabela
        verbose_name = 'Diagnóstico IA'
        verbose_name_plural = 'Diagnósticos IA'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['validado']),
        ]

    def __str__(self):
        if self.animal:
            return f"{self.animal.name} - {self.classe_predita or 'Pendente'} ({self.confianca:.2%})" if self.confianca else f"{self.animal.name} - {self.classe_predita or 'Pendente'}"
        return f"Diagnóstico #{self.id} - {self.classe_predita or 'Pendente'}"

    def save(self, *args, **kwargs):
        """
        Garante que data_validacao seja preenchida quando validado=True
        """
        if self.validado and not self.data_validacao:
            self.data_validacao = timezone.now()
        super().save(*args, **kwargs)
