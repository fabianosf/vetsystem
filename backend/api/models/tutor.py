from django.db import models
from django.conf import settings  # Para pegar o User model

class Tutor(models.Model):
    """
    Model representando um tutor (dono de pet)
    """
    user = models.OneToOneField(  # 👈 NOVO CAMPO
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='tutor_profile',
        null=True,
        blank=True,
        verbose_name='Usuário',
        help_text='Conta de acesso do tutor'
    )
    
    name = models.CharField(
        max_length=255,
        verbose_name='Nome Completo',
        help_text='Nome completo do tutor'
    )
    email = models.EmailField(
        unique=True,
        verbose_name='E-mail',
        help_text='E-mail para contato e login'
    )
    phone = models.CharField(
        max_length=20,
        verbose_name='Telefone',
        help_text='Telefone com DDD'
    )
    cpf = models.CharField(
        max_length=14,
        unique=True,
        verbose_name='CPF',
        help_text='CPF no formato 000.000.000-00'
    )
    address = models.CharField(
        max_length=500,
        verbose_name='Endereço',
        blank=True,
        null=True
    )
    city = models.CharField(
        max_length=100,
        verbose_name='Cidade',
        blank=True,
        null=True
    )
    state = models.CharField(
        max_length=2,
        verbose_name='Estado (UF)',
        blank=True,
        null=True
    )
    cep = models.CharField(
        max_length=10,
        verbose_name='CEP',
        blank=True,
        null=True
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name='Ativo',
        help_text='Indica se o tutor está ativo no sistema'
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
        db_table = 'api_tutor'
        verbose_name = 'Tutor'
        verbose_name_plural = 'Tutores'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.cpf}"

    @property
    def total_animais(self):
        """Retorna o número total de animais do tutor"""
        # CORRIGIDO: usar 'animais' que é o related_name definido no Animal
        return self.animais.count()
