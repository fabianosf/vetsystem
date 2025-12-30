from django.db import models


class HealthCheck(models.Model):
    """Análise de saúde do animal com IA"""
    
    URGENCY_CHOICES = [
        ('BAIXA', 'Monitorar - Não requer ação imediata'),
        ('MEDIA', 'Agendar Consulta - Recomendado em 3-7 dias'),
        ('ALTA', 'Urgência - Procurar veterinário imediatamente'),
    ]
    
    CONDITION_CATEGORIES = [
        ('PELE', 'Problemas de Pele'),
        ('OLHOS', 'Problemas Oculares'),
        ('OUVIDOS', 'Problemas Auriculares'),
        ('DENTAL', 'Problemas Dentários'),
        ('RESPIRATORIO', 'Problemas Respiratórios'),
        ('GASTROINTESTINAL', 'Problemas Gastrointestinais'),
        ('MUSCULOESQUELETICO', 'Problemas Musculoesqueléticos'),
        ('OUTRO', 'Outros'),
    ]
    
    animal = models.ForeignKey('Animal', on_delete=models.CASCADE, related_name='health_checks')
    image = models.ImageField(upload_to='health_checks/%Y/%m/%d/')
    predicted_condition = models.CharField(max_length=200)
    condition_category = models.CharField(max_length=50, choices=CONDITION_CATEGORIES, default='OUTRO')
    confidence_score = models.FloatField(default=0.0)
    urgency_level = models.CharField(max_length=20, choices=URGENCY_CHOICES, default='MEDIA')
    recommendations = models.TextField(blank=True)
    detected_symptoms = models.JSONField(default=list, blank=True)
    processing_time = models.FloatField(default=0.0)
    model_version = models.CharField(max_length=50, default='v1.0')
    user_feedback = models.CharField(
        max_length=20,
        choices=[
            ('CORRETO', 'Diagnóstico Correto'),
            ('PARCIAL', 'Parcialmente Correto'),
            ('INCORRETO', 'Incorreto'),
            ('NAO_AVALIADO', 'Não Avaliado'),
        ],
        default='NAO_AVALIADO'
    )
    veterinarian_diagnosis = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'health_checks'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.animal.name} - {self.predicted_condition}"

