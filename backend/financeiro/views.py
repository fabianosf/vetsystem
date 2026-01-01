from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Q, Count
from django.utils import timezone
from datetime import datetime, timedelta
from decimal import Decimal

from .models import CategoriaFinanceira, FormaPagamento, Transacao, Parcela, FluxoCaixa
from .serializers import (
    CategoriaFinanceiraSerializer, FormaPagamentoSerializer,
    TransacaoSerializer, ParcelaSerializer, FluxoCaixaSerializer
)


class CategoriaFinanceiraViewSet(viewsets.ModelViewSet):
    queryset = CategoriaFinanceira.objects.all()
    serializer_class = CategoriaFinanceiraSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        tipo = self.request.query_params.get('tipo', None)
        ativo = self.request.query_params.get('ativo', None)
        
        if tipo:
            queryset = queryset.filter(tipo=tipo)
        if ativo:
            queryset = queryset.filter(ativo=ativo.lower() == 'true')
        
        return queryset


class FormaPagamentoViewSet(viewsets.ModelViewSet):
    queryset = FormaPagamento.objects.filter(ativo=True)
    serializer_class = FormaPagamentoSerializer
    permission_classes = [IsAuthenticated]


class TransacaoViewSet(viewsets.ModelViewSet):
    queryset = Transacao.objects.all()
    serializer_class = TransacaoSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtros
        tipo = self.request.query_params.get('tipo', None)
        status_filter = self.request.query_params.get('status', None)
        categoria = self.request.query_params.get('categoria', None)
        data_inicio = self.request.query_params.get('data_inicio', None)
        data_fim = self.request.query_params.get('data_fim', None)
        
        if tipo:
            queryset = queryset.filter(tipo=tipo)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if categoria:
            queryset = queryset.filter(categoria_id=categoria)
        if data_inicio:
            queryset = queryset.filter(data_vencimento__gte=data_inicio)
        if data_fim:
            queryset = queryset.filter(data_vencimento__lte=data_fim)
        
        return queryset.select_related('categoria', 'forma_pagamento', 'usuario', 'consulta')
    
    @action(detail=True, methods=['post'])
    def confirmar_pagamento(self, request, pk=None):
        transacao = self.get_object()
        data_pagamento = request.data.get('data_pagamento', timezone.now().date())
        
        transacao.status = 'pago'
        transacao.data_pagamento = data_pagamento
        transacao.save()
        
        # Atualizar fluxo de caixa
        self._atualizar_fluxo_caixa(data_pagamento)
        
        serializer = self.get_serializer(transacao)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancelar(self, request, pk=None):
        transacao = self.get_object()
        transacao.status = 'cancelado'
        transacao.save()
        
        serializer = self.get_serializer(transacao)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        hoje = timezone.now().date()
        mes_atual = hoje.month
        ano_atual = hoje.year
        
        # Receitas e despesas do mês
        transacoes_mes = Transacao.objects.filter(
            data_vencimento__month=mes_atual,
            data_vencimento__year=ano_atual
        )
        
        receitas_mes = transacoes_mes.filter(tipo='receita', status='pago').aggregate(
            total=Sum('valor')
        )['total'] or Decimal('0.00')
        
        despesas_mes = transacoes_mes.filter(tipo='despesa', status='pago').aggregate(
            total=Sum('valor')
        )['total'] or Decimal('0.00')
        
        # Contas a receber e a pagar
        contas_receber = Transacao.objects.filter(
            tipo='receita',
            status='pendente'
        ).aggregate(total=Sum('valor'))['total'] or Decimal('0.00')
        
        contas_pagar = Transacao.objects.filter(
            tipo='despesa',
            status='pendente'
        ).aggregate(total=Sum('valor'))['total'] or Decimal('0.00')
        
        # Contas atrasadas
        contas_atrasadas = Transacao.objects.filter(
            status='pendente',
            data_vencimento__lt=hoje
        ).count()
        
        # Fluxo mensal (últimos 6 meses)
        fluxo_mensal = []
        for i in range(5, -1, -1):
            data = hoje - timedelta(days=30*i)
            mes = data.month
            ano = data.year
            
            receitas = Transacao.objects.filter(
                tipo='receita',
                status='pago',
                data_pagamento__month=mes,
                data_pagamento__year=ano
            ).aggregate(total=Sum('valor'))['total'] or Decimal('0.00')
            
            despesas = Transacao.objects.filter(
                tipo='despesa',
                status='pago',
                data_pagamento__month=mes,
                data_pagamento__year=ano
            ).aggregate(total=Sum('valor'))['total'] or Decimal('0.00')
            
            fluxo_mensal.append({
                'mes': data.strftime('%b'),
                'receitas': float(receitas),
                'despesas': float(despesas),
                'saldo': float(receitas - despesas)
            })
        
        # Receitas por categoria
        receitas_por_categoria = CategoriaFinanceira.objects.filter(
            tipo='receita',
            ativo=True
        ).annotate(
            total=Sum('transacoes__valor', filter=Q(
                transacoes__status='pago',
                transacoes__data_pagamento__month=mes_atual,
                transacoes__data_pagamento__year=ano_atual
            ))
        ).values('nome', 'total')
        
        # Despesas por categoria
        despesas_por_categoria = CategoriaFinanceira.objects.filter(
            tipo='despesa',
            ativo=True
        ).annotate(
            total=Sum('transacoes__valor', filter=Q(
                transacoes__status='pago',
                transacoes__data_pagamento__month=mes_atual,
                transacoes__data_pagamento__year=ano_atual
            ))
        ).values('nome', 'total')
        
        return Response({
            'resumo': {
                'receitas_mes': float(receitas_mes),
                'despesas_mes': float(despesas_mes),
                'saldo_mes': float(receitas_mes - despesas_mes),
                'contas_receber': float(contas_receber),
                'contas_pagar': float(contas_pagar),
                'contas_atrasadas': contas_atrasadas,
            },
            'fluxo_mensal': fluxo_mensal,
            'receitas_por_categoria': list(receitas_por_categoria),
            'despesas_por_categoria': list(despesas_por_categoria),
        })
    
    def _atualizar_fluxo_caixa(self, data):
        fluxo, created = FluxoCaixa.objects.get_or_create(data=data)
        
        # Calcular entradas e saídas do dia
        entradas = Transacao.objects.filter(
            tipo='receita',
            status='pago',
            data_pagamento=data
        ).aggregate(total=Sum('valor'))['total'] or Decimal('0.00')
        
        saidas = Transacao.objects.filter(
            tipo='despesa',
            status='pago',
            data_pagamento=data
        ).aggregate(total=Sum('valor'))['total'] or Decimal('0.00')
        
        # Buscar saldo anterior
        fluxo_anterior = FluxoCaixa.objects.filter(
            data__lt=data
        ).order_by('-data').first()
        
        saldo_inicial = fluxo_anterior.saldo_final if fluxo_anterior else Decimal('0.00')
        
        fluxo.saldo_inicial = saldo_inicial
        fluxo.total_entradas = entradas
        fluxo.total_saidas = saidas
        fluxo.saldo_final = saldo_inicial + entradas - saidas
        fluxo.save()


class FluxoCaixaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = FluxoCaixa.objects.all()
    serializer_class = FluxoCaixaSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        data_inicio = self.request.query_params.get('data_inicio', None)
        data_fim = self.request.query_params.get('data_fim', None)
        
        if data_inicio:
            queryset = queryset.filter(data__gte=data_inicio)
        if data_fim:
            queryset = queryset.filter(data__lte=data_fim)
        
        return queryset
