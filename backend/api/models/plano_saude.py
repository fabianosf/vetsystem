from django.db import models
from api.models.base import BaseModel

class PlanoSaude(BaseModel):
    """Model para Planos de Saúde"""
    
    nome = models.CharField(max_length=100)
    descricao = models.TextField(blank=True, null=True)
    preco_mensal = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Limites de serviços (null = ilimitado)
    consultas_mes = models.IntegerField(null=True, blank=True, help_text="Número de consultas por mês (null = ilimitado)")
    exames_mes = models.IntegerField(null=True, blank=True, help_text="Número de exames por mês (null = ilimitado)")
    vacinas_ano = models.IntegerField(null=True, blank=True, help_text="Número de vacinas por ano (null = ilimitado)")
    
    # Flags de ilimitado
    consultas_ilimitadas = models.BooleanField(default=False, help_text="Consultas ilimitadas")
    exames_ilimitados = models.BooleanField(default=False, help_text="Exames ilimitados")
    vacinas_ilimitadas = models.BooleanField(default=False, help_text="Vacinas ilimitadas")
    
    # Benefícios adicionais
    telemedicina_incluida = models.BooleanField(default=False)
    atendimento_24h = models.BooleanField(default=False)
    internacao_incluida = models.BooleanField(default=False)
    emergencia_prioritaria = models.BooleanField(default=False)
    desconto_cirurgia = models.DecimalField(max_digits=5, decimal_places=2, default=0, help_text="Percentual de desconto")
    desconto_medicamentos = models.DecimalField(max_digits=5, decimal_places=2, default=0, help_text="Percentual de desconto")
    
    # Status
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'plano_saude'
        verbose_name = 'Plano de Saúde'
        verbose_name_plural = 'Planos de Saúde'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.nome


class ContratoPlano(BaseModel):
    """Model para Contratos de Planos de Saúde"""
    
    animal = models.ForeignKey('Animal', on_delete=models.CASCADE, related_name='contratos_plano')
    plano = models.ForeignKey(PlanoSaude, on_delete=models.PROTECT, related_name='contratos')
    data_inicio = models.DateField(verbose_name='Data de Início')
    data_fim = models.DateField(null=True, blank=True, verbose_name='Data de Término')
    valor_mensal = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Valor Mensal')
    is_active = models.BooleanField(default=True, verbose_name='Ativo')
    observacoes = models.TextField(blank=True, null=True, verbose_name='Observações')
    
    class Meta:
        db_table = 'contrato_plano'
        verbose_name = 'Contrato de Plano'
        verbose_name_plural = 'Contratos de Planos'
        ordering = ['-data_inicio']
    
    def __str__(self):
        return f"{self.animal.name} - {self.plano.nome}"
