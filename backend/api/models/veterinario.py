from django.db import models

class Veterinario(models.Model):
    """
    Model representando um veterinário
    """
    STATUS_CHOICES = [
        ('ATIVO', 'Ativo'),
        ('INATIVO', 'Inativo'),
        ('FERIAS', 'Férias'),
        ('LICENCA', 'Licença'),
    ]

    name = models.CharField(
        max_length=255,
        verbose_name='Nome Completo'
    )
    email = models.EmailField(
        unique=True,
        verbose_name='E-mail'
    )
    phone = models.CharField(
        max_length=20,
        verbose_name='Telefone'
    )
    crmv = models.CharField(
        max_length=20,
        unique=True,
        verbose_name='CRMV',
        help_text='Número do registro profissional'
    )
    specialties = models.CharField(
        max_length=255,
        verbose_name='Especialidades',
        help_text='Especialidades separadas por vírgula'
    )
    bio = models.TextField(
        verbose_name='Biografia',
        blank=True,
        null=True
    )
    profile_image = models.ImageField(
        upload_to='veterinarios/',
        verbose_name='Foto',
        blank=True,
        null=True
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='ATIVO',
        verbose_name='Status'
    )
    work_start_hour = models.TimeField(
        verbose_name='Início do Expediente',
        help_text='Hora de início do trabalho'
    )
    work_end_hour = models.TimeField(
        verbose_name='Fim do Expediente',
        help_text='Hora de término do trabalho'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Data de Cadastro'
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Última Atualização'
    )

    class Meta:
        db_table = 'api_veterinario'
        verbose_name = 'Veterinário'
        verbose_name_plural = 'Veterinários'
        ordering = ['name']

    def __str__(self):
        return f"Dr(a). {self.name} - CRMV: {self.crmv}"

    @property
    def especialidades_list(self):
        """Retorna lista de especialidades"""
        return [e.strip() for e in self.specialties.split(',')]
