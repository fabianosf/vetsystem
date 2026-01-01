"""
Serializers da API VetSystem com type hints para drf-spectacular
"""
from rest_framework import serializers
from .notificacao import NotificacaoSerializer
from drf_spectacular.utils import extend_schema_field
from api.models import (
    Tutor, Animal, Veterinario, Consulta,
    Vacina, Exame, PlanoSaude, ContratoPlano, Clinica
)
from .prontuario_serializers import ProntuarioSerializer, PrescricaoSerializer




# ==========================================
# TUTORES
# ==========================================
class TutorSerializer(serializers.ModelSerializer):
    total_animais = serializers.SerializerMethodField()
    animais_count = serializers.SerializerMethodField()  # Alias para compatibilidade
    
    @extend_schema_field(serializers.IntegerField)
    def get_total_animais(self, obj):
        """Retorna o número total de animais do tutor"""
        return obj.total_animais
    
    @extend_schema_field(serializers.IntegerField)
    def get_animais_count(self, obj):
        """Alias para total_animais"""
        return obj.total_animais
    
    class Meta:
        model = Tutor
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')



# ==========================================
# ANIMAIS
# ==========================================
class AnimalSerializer(serializers.ModelSerializer):
    tutor_name = serializers.CharField(source='tutor.name', read_only=True)
    species_display = serializers.CharField(source='get_species_display', read_only=True)
    photo_url = serializers.SerializerMethodField()
    
    def get_photo_url(self, obj):
        """Retorna URL completa da foto"""
        if obj.photo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.photo.url)
            return obj.photo.url
        return None
    
    class Meta:
        model = Animal
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')




# ==========================================
# VETERINÁRIOS
# ==========================================
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



# ==========================================
# CONSULTAS
# ==========================================

# Serializers simples para relacionamentos (nested)
class AnimalSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Animal
        fields = ['id', 'name', 'species']


class VeterinarioSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Veterinario
        fields = ['id', 'name']


class TutorSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tutor
        fields = ['id', 'name']


class ConsultaSerializer(serializers.ModelSerializer):
    # Campos read_only com nomes descritivos (mantém compatibilidade)
    animal_name = serializers.CharField(source='animal.name', read_only=True)
    veterinario_name = serializers.CharField(source='veterinario.name', read_only=True)
    tutor_name = serializers.CharField(source='animal.tutor.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    
    class Meta:
        model = Consulta
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')
    
    def to_representation(self, instance):
        """
        Customiza a saída para incluir objetos aninhados
        """
        representation = super().to_representation(instance)
        
        # Sobrescreve os campos de ID com objetos completos
        if instance.animal:
            representation['animal'] = {
                'id': instance.animal.id,
                'name': instance.animal.name,
                'species': getattr(instance.animal, 'species', None),
            }
        
        if instance.veterinario:
            representation['veterinario'] = {
                'id': instance.veterinario.id,
                'name': instance.veterinario.name,
            }
        
        if instance.animal and instance.animal.tutor:
            representation['tutor'] = {
                'id': instance.animal.tutor.id,
                'name': instance.animal.tutor.name,
            }
        
        return representation



# ==========================================
# VACINAS
# ==========================================
class VacinaSerializer(serializers.ModelSerializer):
    animal_name = serializers.CharField(source='animal.name', read_only=True)
    tutor_name = serializers.CharField(source='animal.tutor.name', read_only=True)
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
        read_only_fields = ('id', 'created_at')



# ==========================================
# EXAMES
# ==========================================
class ExameSerializer(serializers.ModelSerializer):
    animal_name = serializers.CharField(source='animal.name', read_only=True)
    veterinario_name = serializers.CharField(source='veterinario_solicitante.name', read_only=True)
    tutor_name = serializers.CharField(source='animal.tutor.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Exame
        fields = '__all__'
        read_only_fields = ('id', 'created_at')



# ==========================================
# PLANOS DE SAÚDE
# ==========================================
class PlanoSaudeSerializer(serializers.ModelSerializer):
    consultas_ilimitadas = serializers.SerializerMethodField()
    exames_ilimitados = serializers.SerializerMethodField()
    vacinas_ilimitadas = serializers.SerializerMethodField()
    total_contratos_ativos = serializers.SerializerMethodField()
    
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
    
    @extend_schema_field(serializers.IntegerField)
    def get_total_contratos_ativos(self, obj):
        """Retorna total de contratos ativos"""
        return obj.contratos.filter(is_active=True).count()
    
    class Meta:
        model = PlanoSaude
        fields = '__all__'
        read_only_fields = ('id', 'created_at')



# ==========================================
# CONTRATOS
# ==========================================
class ContratoPlanoSerializer(serializers.ModelSerializer):
    tutor_name = serializers.CharField(source='tutor.name', read_only=True)
    plano_nome = serializers.CharField(source='plano.nome', read_only=True)
    plano_preco = serializers.DecimalField(
        source='plano.preco_mensal', 
        max_digits=10, 
        decimal_places=2, 
        read_only=True
    )
    status_display = serializers.CharField(source='get_status_display', read_only=True)
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
        read_only_fields = ('id', 'created_at')



# ==========================================
# CLÍNICAS
# ==========================================
class ClinicaSerializer(serializers.ModelSerializer):
    especialidades_list = serializers.SerializerMethodField()
    distancia = serializers.SerializerMethodField()
    
    @extend_schema_field(serializers.ListField(child=serializers.CharField()))
    def get_especialidades_list(self, obj):
        """Retorna lista de especialidades da clínica"""
        return obj.especialidades_list
    
    @extend_schema_field(serializers.FloatField)
    def get_distancia(self, obj):
        """Retorna distância calculada (se disponível no contexto)"""
        # Se tiver latitude/longitude no request context, calcular distância
        return None
    
    class Meta:
        model = Clinica
        fields = '__all__'
        read_only_fields = ('id', 'created_at')



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
    'NotificacaoSerializer',
    'AnimalSimpleSerializer',
    'VeterinarioSimpleSerializer',
    'TutorSimpleSerializer',
    'ProntuarioSerializer',
    'PrescricaoSerializer',
]


from .health_check_serializer import HealthCheckSerializer, HealthCheckCreateSerializer
