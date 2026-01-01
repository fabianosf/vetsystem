from django.db import models
from .tutor import Tutor

class Animal(models.Model):
    """
    Model representando um animal (pet)
    """
    SPECIES_CHOICES = [
        ('CACHORRO', 'Cachorro'),
        ('GATO', 'Gato'),
        ('PASSARO', 'Pássaro'),
        ('ROEDOR', 'Roedor'),
        ('REPTIL', 'Réptil'),
        ('OUTRO', 'Outro'),
    ]

    GENDER_CHOICES = [
        ('M', 'Macho'),
        ('F', 'Fêmea'),
    ]

    tutor = models.ForeignKey(
        Tutor,
        on_delete=models.CASCADE,
        related_name='animais',  # ← IMPORTANTE! Este é o related_name
        verbose_name='Tutor',
        help_text='Dono do animal'
    )
    name = models.CharField(
        max_length=100,
        verbose_name='Nome',
        help_text='Nome do animal'
    )
    species = models.CharField(
        max_length=20,
        choices=SPECIES_CHOICES,
        verbose_name='Espécie'
    )
    breed = models.CharField(
        max_length=100,
        verbose_name='Raça',
        help_text='Raça do animal'
    )
    gender = models.CharField(
        max_length=1,
        choices=GENDER_CHOICES,
        verbose_name='Sexo'
    )
    age = models.IntegerField(
        verbose_name='Idade (anos)',
        help_text='Idade em anos'
    )
    weight = models.FloatField(
        verbose_name='Peso (kg)',
        help_text='Peso em quilogramas'
    )
    color = models.CharField(
        max_length=50,
        verbose_name='Cor',
        blank=True,
        null=True
    )
    microchip = models.CharField(
        max_length=20,
        unique=True,
        verbose_name='Microchip',
        blank=True,
        null=True,
        help_text='Código do microchip (único)'
    )
    rg_animal = models.CharField(
        max_length=20,
        verbose_name='RG Animal',
        blank=True,
        null=True
    )
    profile_image = models.ImageField(
        upload_to='animals/',
        verbose_name='Foto',
        blank=True,
        null=True
    )
    observations = models.TextField(
        verbose_name='Observações',
        blank=True,
        null=True,
        help_text='Informações adicionais sobre o animal'
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name='Ativo'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Data de Cadastro'
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Última Atualização'
    )
    photo = models.ImageField(
        upload_to='animals/%Y/%m/',
        null=True,
        blank=True,
        verbose_name='Foto do Animal'
    )

    class Meta:
        db_table = 'animals'
        verbose_name = 'Animal'
        verbose_name_plural = 'Animais'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.species}) - Tutor: {self.tutor.name}"
