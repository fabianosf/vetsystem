from django.db import models
from django.conf import settings  # ← ADICIONAR
from .animal import Animal


class Prontuario(models.Model):
    """Entrada do prontuário médico do animal"""
    
    TIPO_CHOICES = [
        ('consulta', 'Consulta'),
        ('exame', 'Exame'),
        ('vacina', 'Vacina'),
        ('cirurgia', 'Cirurgia'),
        ('internacao', 'Internação'),
        ('retorno', 'Retorno'),
    ]
    
    animal = models.ForeignKey(Animal, on_delete=models.CASCADE, related_name='prontuarios')
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    data = models.DateTimeField()
    
    # ← CORRIGIDO: usar settings.AUTH_USER_MODEL
    veterinario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    # Dados clínicos
    motivo = models.TextField()
    sintomas = models.TextField(blank=True)
    diagnostico = models.TextField(blank=True)
    tratamento = models.TextField(blank=True)
    observacoes = models.TextField(blank=True)
    
    # Dados vitais
    temperatura = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)
    peso = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    frequencia_cardiaca = models.IntegerField(null=True, blank=True)
    frequencia_respiratoria = models.IntegerField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'prontuarios'
        ordering = ['-data']
        verbose_name = 'Prontuário'
        verbose_name_plural = 'Prontuários'
    
    def __str__(self):
        return f"{self.animal.name} - {self.get_tipo_display()} - {self.data.strftime('%d/%m/%Y')}"
