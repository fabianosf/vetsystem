from django.db import models
from .animal import Animal
from datetime import timedelta

class Vacina(models.Model):
    """
    Model representando vacinas aplicadas nos animais
    """
    TIPO_VACINA_CHOICES = [
        ('V10', 'Vacina V10 (Cães)'),
        ('V8', 'Vacina V8 (Cães)'),
        ('RAIVA', 'Vacina Antirrábica'),
        ('GRIPE_CANINA', 'Gripe Canina (Tosse dos Canis)'),
        ('GIARDIA', 'Giárdia'),
        ('V3', 'Vacina V3 (Gatos)'),
        ('V4', 'Vacina V4 (Gatos)'),
        ('V5', 'Vacina V5 (Gatos)'),
        ('LEUCEMIA_FELINA', 'Leucemia Felina'),
        ('OUTRA', 'Outra'),
    ]

    animal = models.ForeignKey(
        Animal,
        on_delete=models.CASCADE,
        related_name='vacinas',
        verbose_name='Animal'
    )
    nome_vacina = models.CharField(
        max_length=100,
        choices=TIPO_VACINA_CHOICES,
        verbose_name='Nome da Vacina'
    )
    fabricante = models.CharField(
        max_length=100,
        verbose_name='Fabricante',
        blank=True,
        null=True
    )
    lote = models.CharField(
        max_length=50,
        verbose_name='Lote',
        help_text='Número do lote da vacina'
    )
    data_aplicacao = models.DateField(
        verbose_name='Data de Aplicação'
    )
    data_proxima_dose = models.DateField(
        verbose_name='Próxima Dose',
        blank=True,
        null=True,
        help_text='Data da próxima dose ou reforço'
    )
    dose = models.CharField(
        max_length=50,
        verbose_name='Dose',
        help_text='Ex: 1ª dose, 2ª dose, Reforço anual'
    )
    veterinario_responsavel = models.CharField(
        max_length=255,
        verbose_name='Veterinário Responsável'
    )
    observacoes = models.TextField(
        verbose_name='Observações',
        blank=True,
        null=True,
        help_text='Reações, lembretes, etc.'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Registrado em'
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Atualizado em'
    )

    class Meta:
        db_table = 'api_vacina'
        verbose_name = 'Vacina'
        verbose_name_plural = 'Vacinas'
        ordering = ['-data_aplicacao']

    def __str__(self):
        return f"{self.nome_vacina} - {self.animal.name} ({self.data_aplicacao})"

    @property
    def dias_proxima_dose(self):
        """Retorna quantos dias faltam para a próxima dose"""
        if self.data_proxima_dose:
            from datetime import date
            delta = self.data_proxima_dose - date.today()
            return delta.days
        return None

    @property
    def atrasada(self):
        """Verifica se a vacina está atrasada"""
        if self.data_proxima_dose:
            from datetime import date
            return date.today() > self.data_proxima_dose
        return False
