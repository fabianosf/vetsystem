from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """
    Modelo de usuário customizado com roles
    """
    ROLE_CHOICES = [
        ('ADMIN', 'Administrador'),
        ('VETERINARIO', 'Veterinário'),
        ('TUTOR', 'Tutor'),
    ]
    
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='TUTOR',
        verbose_name='Papel no Sistema'
    )
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name='Telefone')
    cpf = models.CharField(max_length=14, unique=True, blank=True, null=True, verbose_name='CPF')
    profile_image = models.ImageField(upload_to='users/', blank=True, null=True, verbose_name='Foto de Perfil')
    
    class Meta:
        db_table = 'accounts_user'
        verbose_name = 'Usuário'
        verbose_name_plural = 'Usuários'
    
    def __str__(self):
        return f"{self.username} - {self.get_role_display()}"
    
    @property
    def is_admin(self):
        return self.role == 'ADMIN' or self.is_superuser
    
    @property
    def is_veterinario(self):
        return self.role == 'VETERINARIO'
    
    @property
    def is_tutor(self):
        return self.role == 'TUTOR'
