from django.db import models
from .animal import Animal
from .veterinario import Veterinario

class Exame(models.Model):
    """
    Model representando exames realizados
    """
    TIPO_EXAME_CHOICES = [
        ('HEMOGRAMA', 'Hemograma Completo'),
        ('BIOQUIMICA', 'Bioquímica Sanguínea'),
        ('URINA', 'Exame de Urina (Urinálise)'),
        ('FEZES', 'Exame de Fezes (Parasitológico)'),
        ('RAIO_X', 'Raio-X'),
        ('ULTRASSOM', 'Ultrassom'),
        ('ECOCARDIOGRAMA', 'Ecocardiograma'),
        ('ELETROCARDIOGRAMA', 'Eletrocardiograma (ECG)'),
        ('TOMOGRAFIA', 'Tomografia Computadorizada'),
        ('RESSONANCIA', 'Ressonância Magnética'),
        ('BIOPSIA', 'Biópsia'),
        ('CITOLOGIA', 'Citologia'),
        ('CULTURA', 'Cultura e Antibiograma'),
        ('OUTRO', 'Outro'),
    ]

    STATUS_CHOICES = [
        ('SOLICITADO', 'Solicitado'),
        ('EM_ANALISE', 'Em Análise'),
        ('CONCLUIDO', 'Concluído'),
        ('CANCELADO', 'Cancelado'),
    ]

    animal = models.ForeignKey(
        Animal,
        on_delete=models.CASCADE,
        related_name='exames',
        verbose_name='Animal'
    )
    veterinario_solicitante = models.ForeignKey(
        Veterinario,
        on_delete=models.PROTECT,
        related_name='exames_solicitados',
        verbose_name='Veterinário Solicitante'
    )
    tipo_exame = models.CharField(
        max_length=50,
        choices=TIPO_EXAME_CHOICES,
        verbose_name='Tipo de Exame'
    )
    data_solicitacao = models.DateField(
        verbose_name='Data de Solicitação',
        auto_now_add=True
    )
    data_realizacao = models.DateField(
        verbose_name='Data de Realização',
        blank=True,
        null=True
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='SOLICITADO',
        verbose_name='Status'
    )
    laboratorio = models.CharField(
        max_length=255,
        verbose_name='Laboratório',
        blank=True,
        null=True,
        help_text='Nome do laboratório que realizou o exame'
    )
    resultado = models.TextField(
        verbose_name='Resultado',
        blank=True,
        null=True,
        help_text='Resultado ou laudo do exame'
    )
    arquivo_resultado = models.FileField(
        upload_to='exames/',
        verbose_name='Arquivo do Resultado',
        blank=True,
        null=True,
        help_text='PDF, imagem ou documento do resultado'
    )
    observacoes = models.TextField(
        verbose_name='Observações',
        blank=True,
        null=True
    )
    valor = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Valor (R$)',
        blank=True,
        null=True
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Criado em'
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Atualizado em'
    )

    class Meta:
        db_table = 'api_exame'
        verbose_name = 'Exame'
        verbose_name_plural = 'Exames'
        ordering = ['-data_solicitacao']

    def __str__(self):
        return f"{self.tipo_exame} - {self.animal.name} ({self.data_solicitacao})"
