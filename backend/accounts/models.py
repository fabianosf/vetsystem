from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = [
        ('ADMIN', 'Administrador'),
        ('VETERINARIO', 'Veterinário'),
        ('ATENDENTE', 'Atendente'),
        ('RECEPCIONISTA', 'Recepcionista'),
    ]
    
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='RECEPCIONISTA',
        verbose_name='Função'
    )
    
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name='Telefone')
    cpf = models.CharField(max_length=14, unique=True, blank=True, null=True, verbose_name='CPF')
    crmv = models.CharField(max_length=20, blank=True, null=True, verbose_name='CRMV')
    photo = models.ImageField(upload_to='users/', blank=True, null=True, verbose_name='Foto')
    
    class Meta:
        db_table = 'users'
        verbose_name = 'Usuário'
        verbose_name_plural = 'Usuários'
    
    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.get_role_display()})"
