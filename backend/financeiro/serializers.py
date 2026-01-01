from rest_framework import serializers
from .models import CategoriaFinanceira, FormaPagamento, Transacao, Parcela, FluxoCaixa
# from consultas.serializers import ConsultaSerializer


class CategoriaFinanceiraSerializer(serializers.ModelSerializer):
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    total_transacoes = serializers.SerializerMethodField()
    
    class Meta:
        model = CategoriaFinanceira
        fields = '__all__'
    
    def get_total_transacoes(self, obj):
        return obj.transacoes.count()


class FormaPagamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormaPagamento
        fields = '__all__'


class ParcelaSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Parcela
        fields = '__all__'


class TransacaoSerializer(serializers.ModelSerializer):
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    categoria_nome = serializers.CharField(source='categoria.nome', read_only=True)
    forma_pagamento_nome = serializers.CharField(source='forma_pagamento.nome', read_only=True)
    usuario_nome = serializers.CharField(source='usuario.get_full_name', read_only=True)
    valor_com_juros = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    dias_atraso = serializers.IntegerField(read_only=True)
    parcelas = ParcelaSerializer(many=True, read_only=True)
    
    class Meta:
        model = Transacao
        fields = '__all__'
        read_only_fields = ['usuario', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        validated_data['usuario'] = self.context['request'].user
        return super().create(validated_data)


class FluxoCaixaSerializer(serializers.ModelSerializer):
    class Meta:
        model = FluxoCaixa
        fields = '__all__'
