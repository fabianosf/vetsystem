from rest_framework import serializers
from api.models import Prontuario, Prescricao


class PrescricaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prescricao
        fields = '__all__'


class ProntuarioSerializer(serializers.ModelSerializer):
    prescricoes = PrescricaoSerializer(many=True, read_only=True)
    veterinario_nome = serializers.SerializerMethodField()
    animal_nome = serializers.CharField(source='animal.name', read_only=True)
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    
    class Meta:
        model = Prontuario
        fields = '__all__'
    
    def get_veterinario_nome(self, obj):
        if obj.veterinario:
            return f"{obj.veterinario.first_name} {obj.veterinario.last_name}".strip() or obj.veterinario.username
        return None
