"""
Serializers da API VetSystem com type hints para drf-spectacular
"""
from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from api.models import (
    Tutor, Animal, Veterinario, Consulta,
    Vacina, Exame, PlanoSaude, ContratoPlano, Clinica
)


class TutorSerializer(serializers.ModelSerializer):
    total_animais = serializers.SerializerMethodField()
    
    @extend_schema_field(serializers.IntegerField)
    def get_total_animais(self, obj):
        """Retorna o número total de animais do tutor"""
        return obj.total_animais
    
    class Meta:
        model = Tutor
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')


class AnimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Animal
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')


class VeterinarioSerializer(serializers.ModelSerializer):
    especialidades_list = serializers.SerializerMethodField()
    
    @extend_schema_field(serializers.ListField(child=serializers.CharField()))
    def get_especialidades_list(self, obj):
        """Retorna lista de especialidades"""
        return obj.especialidades_list
    
    class Meta:
        model = Veterinario
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')


class ConsultaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Consulta
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')


class VacinaSerializer(serializers.ModelSerializer):
    dias_proxima_dose = serializers.SerializerMethodField()
    atrasada = serializers.SerializerMethodField()
    
    @extend_schema_field(serializers.IntegerField)
    def get_dias_proxima_dose(self, obj):
        """Retorna dias até a próxima dose"""
        return obj.dias_proxima_dose
    
    @extend_schema_field(serializers.BooleanField)
    def get_atrasada(self, obj):
        """Retorna se a vacina está atrasada"""
        return obj.atrasada
    
    class Meta:
        model = Vacina
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')


class ExameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exame
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')


class PlanoSaudeSerializer(serializers.ModelSerializer):
    consultas_ilimitadas = serializers.SerializerMethodField()
    exames_ilimitados = serializers.SerializerMethodField()
    vacinas_ilimitadas = serializers.SerializerMethodField()
    
    @extend_schema_field(serializers.BooleanField)
    def get_consultas_ilimitadas(self, obj):
        """Retorna se o plano tem consultas ilimitadas"""
        return obj.consultas_ilimitadas
    
    @extend_schema_field(serializers.BooleanField)
    def get_exames_ilimitados(self, obj):
        """Retorna se o plano tem exames ilimitados"""
        return obj.exames_ilimitados
    
    @extend_schema_field(serializers.BooleanField)
    def get_vacinas_ilimitadas(self, obj):
        """Retorna se o plano tem vacinas ilimitadas"""
        return obj.vacinas_ilimitadas
    
    class Meta:
        model = PlanoSaude
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')


class ContratoPlanoSerializer(serializers.ModelSerializer):
    pode_agendar_consulta = serializers.SerializerMethodField()
    pode_fazer_exame = serializers.SerializerMethodField()
    pode_vacinar = serializers.SerializerMethodField()
    
    @extend_schema_field(serializers.BooleanField)
    def get_pode_agendar_consulta(self, obj):
        """Retorna se pode agendar consulta"""
        return obj.pode_agendar_consulta
    
    @extend_schema_field(serializers.BooleanField)
    def get_pode_fazer_exame(self, obj):
        """Retorna se pode fazer exame"""
        return obj.pode_fazer_exame
    
    @extend_schema_field(serializers.BooleanField)
    def get_pode_vacinar(self, obj):
        """Retorna se pode vacinar"""
        return obj.pode_vacinar
    
    class Meta:
        model = ContratoPlano
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')


class ClinicaSerializer(serializers.ModelSerializer):
    especialidades_list = serializers.SerializerMethodField()
    
    @extend_schema_field(serializers.ListField(child=serializers.CharField()))
    def get_especialidades_list(self, obj):
        """Retorna lista de especialidades da clínica"""
        return obj.especialidades_list
    
    class Meta:
        model = Clinica
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')


__all__ = [
    'TutorSerializer',
    'AnimalSerializer',
    'VeterinarioSerializer',
    'ConsultaSerializer',
    'VacinaSerializer',
    'ExameSerializer',
    'PlanoSaudeSerializer',
    'ContratoPlanoSerializer',
    'ClinicaSerializer',
]
