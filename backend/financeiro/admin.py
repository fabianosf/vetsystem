from django.contrib import admin
from .models import CategoriaFinanceira, FormaPagamento, Transacao, Parcela, FluxoCaixa


@admin.register(CategoriaFinanceira)
class CategoriaFinanceiraAdmin(admin.ModelAdmin):
    list_display = ['nome', 'tipo', 'ativo', 'created_at']
    list_filter = ['tipo', 'ativo']
    search_fields = ['nome', 'descricao']


@admin.register(FormaPagamento)
class FormaPagamentoAdmin(admin.ModelAdmin):
    list_display = ['nome', 'taxa_juros', 'prazo_dias', 'ativo']
    list_filter = ['ativo']


@admin.register(Transacao)
class TransacaoAdmin(admin.ModelAdmin):
    list_display = ['descricao', 'tipo', 'valor', 'data_vencimento', 'status', 'usuario']
    list_filter = ['tipo', 'status', 'data_vencimento']
    search_fields = ['descricao', 'observacoes']
    date_hierarchy = 'data_vencimento'


@admin.register(FluxoCaixa)
class FluxoCaixaAdmin(admin.ModelAdmin):
    list_display = ['data', 'saldo_inicial', 'total_entradas', 'total_saidas', 'saldo_final']
    date_hierarchy = 'data'
