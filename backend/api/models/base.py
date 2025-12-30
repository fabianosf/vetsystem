from django.db import models

class BaseModel(models.Model):
    """Model abstrato base com campos de auditoria"""
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Data de Criação')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Data de Atualização')
    
    class Meta:
        abstract = True
