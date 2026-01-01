from django.db import models
from django.conf import settings
from decimal import Decimal


class CategoriaFinanceira(models.Model):
    TIPO_CHOICES = [
        ('receita', 'Receita'),
        ('despesa', 'Despesa'),
    ]
    
    nome = models.CharField(max_length=100)
    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES)
    descricao = models.TextField(blank=True, null=True)
    ativo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'categorias_financeiras'
        ordering = ['tipo', 'nome']
        verbose_name = 'Categoria Financeira'
        verbose_name_plural = 'Categorias Financeiras'
    
    def __str__(self):
        return f"{self.get_tipo_display()} - {self.nome}"


class FormaPagamento(models.Model):
    nome = models.CharField(max_length=50)
    taxa_juros = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    prazo_dias = models.IntegerField(default=0)
    ativo = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'formas_pagamento'
        ordering = ['nome']
        verbose_name = 'Forma de Pagamento'
        verbose_name_plural = 'Formas de Pagamento'
    
    def __str__(self):
        return self.nome


class Transacao(models.Model):
    TIPO_CHOICES = [
        ('receita', 'Receita'),
        ('despesa', 'Despesa'),
    ]
    
    STATUS_CHOICES = [
        ('pendente', 'Pendente'),
        ('pago', 'Pago'),
        ('cancelado', 'Cancelado'),
        ('atrasado', 'Atrasado'),
    ]
    
    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES)
    categoria = models.ForeignKey(CategoriaFinanceira, on_delete=models.PROTECT, related_name='transacoes')
    descricao = models.CharField(max_length=255)
    valor = models.DecimalField(max_digits=10, decimal_places=2)
    data_vencimento = models.DateField()
    data_pagamento = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pendente')
    
    forma_pagamento = models.ForeignKey(FormaPagamento, on_delete=models.PROTECT, blank=True, null=True)
    
    # Relacionamento com consulta (comentado até o app consultas estar disponível)
    # consulta = models.ForeignKey('consultas.Consulta', on_delete=models.SET_NULL, blank=True, null=True, related_name='transacoes')
    
    observacoes = models.TextField(blank=True, null=True)
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='transacoes_financeiras')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'transacoes'
        ordering = ['-data_vencimento']
        verbose_name = 'Transação'
        verbose_name_plural = 'Transações'
    
    def __str__(self):
        return f"{self.get_tipo_display()} - {self.descricao} - R$ {self.valor}"
    
    @property
    def valor_com_juros(self):
        if self.forma_pagamento and self.forma_pagamento.taxa_juros > 0:
            juros = self.valor * (self.forma_pagamento.taxa_juros / 100)
            return self.valor + juros
        return self.valor
    
    @property
    def dias_atraso(self):
        if self.status == 'pendente' and self.data_vencimento:
            from datetime import date
            hoje = date.today()
            if hoje > self.data_vencimento:
                return (hoje - self.data_vencimento).days
        return 0


class Parcela(models.Model):
    transacao = models.ForeignKey(Transacao, on_delete=models.CASCADE, related_name='parcelas')
    numero_parcela = models.IntegerField()
    valor = models.DecimalField(max_digits=10, decimal_places=2)
    data_vencimento = models.DateField()
    data_pagamento = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=Transacao.STATUS_CHOICES, default='pendente')
    
    class Meta:
        db_table = 'parcelas'
        ordering = ['numero_parcela']
        verbose_name = 'Parcela'
        verbose_name_plural = 'Parcelas'
    
    def __str__(self):
        return f"Parcela {self.numero_parcela} - R$ {self.valor}"


class FluxoCaixa(models.Model):
    data = models.DateField(unique=True)
    saldo_inicial = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_entradas = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_saidas = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    saldo_final = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'fluxo_caixa'
        ordering = ['-data']
        verbose_name = 'Fluxo de Caixa'
        verbose_name_plural = 'Fluxo de Caixa'
    
    def __str__(self):
        return f"Fluxo {self.data} - Saldo: R$ {self.saldo_final}"
