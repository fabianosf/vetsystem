# Adicione este código ao seu api/serializers.py

from rest_framework import serializers
from .models import Consulta

class ConsultaSerializer(serializers.ModelSerializer):
    # Campos adicionais para exibição
    animal_nome = serializers.SerializerMethodField()
    tutor_nome = serializers.SerializerMethodField()
    veterinario_nome = serializers.SerializerMethodField()
    clinica_nome = serializers.SerializerMethodField()
    
    class Meta:
        model = Consulta
        fields = '__all__'
    
    def get_animal_nome(self, obj):
        """Retornar nome do animal com tratamento de erro"""
        try:
            return obj.animal.name if obj.animal else None
        except:
            return None
    
    def get_tutor_nome(self, obj):
        """Retornar nome do tutor com tratamento de erro"""
        try:
            return obj.animal.tutor.name if obj.animal and obj.animal.tutor else None
        except:
            return None
    
    def get_veterinario_nome(self, obj):
        """Retornar nome do veterinário com tratamento de erro"""
        try:
            return obj.veterinario.name if obj.veterinario else None
        except:
            return None
    
    def get_clinica_nome(self, obj):
        """Retornar nome da clínica com tratamento de erro"""
        try:
            return obj.clinica.nome if obj.clinica else None
        except:
            return None
