"""
Serializers para Diagnósticos IA
"""
from rest_framework import serializers
from api.models import DiagnosticoIA, Animal
import os


class DiagnosticoIASerializer(serializers.ModelSerializer):
    """Serializer para Diagnósticos IA"""
    
    animal_name = serializers.CharField(source='animal.name', read_only=True)
    animal_species = serializers.CharField(source='animal.get_species_display', read_only=True)
    validado_por_nome = serializers.CharField(source='validado_por.name', read_only=True)
    imagem_url = serializers.SerializerMethodField()
    
    class Meta:
        model = DiagnosticoIA
        fields = [
            'id', 'animal', 'animal_name', 'animal_species',
            'imagem', 'imagem_url', 'resultado', 'classe_predita',
            'confianca', 'observacoes', 'validado', 'validado_por',
            'validado_por_nome', 'data_validacao', 'created_at', 'updated_at'
        ]
        read_only_fields = ['resultado', 'classe_predita', 'confianca', 'created_at', 'updated_at']
    
    def get_imagem_url(self, obj):
        """Retorna URL completa da imagem"""
        if obj.imagem:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.imagem.url)
        return None


class DiagnosticoCreateSerializer(serializers.ModelSerializer):
    """Serializer para criar diagnóstico (upload de imagem)"""
    
    # ✅ Tornar animal opcional
    animal = serializers.PrimaryKeyRelatedField(
        queryset=Animal.objects.all(),
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = DiagnosticoIA
        fields = ['animal', 'imagem', 'observacoes']
    
    def validate_imagem(self, value):
        """Valida o arquivo de imagem"""
        # Verificar extensão
        valid_extensions = ['.jpg', '.jpeg', '.png']
        ext = os.path.splitext(value.name)[1].lower()
        if ext not in valid_extensions:
            raise serializers.ValidationError(
                f"Formato de arquivo inválido. Use: {', '.join(valid_extensions)}"
            )
        
        # Verificar tamanho (máx 5MB)
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("Arquivo muito grande. Máximo: 5MB")
        
        return value


class ValidarDiagnosticoSerializer(serializers.Serializer):
    """Serializer para validação de diagnóstico por veterinário"""
    
    observacoes = serializers.CharField(required=False, allow_blank=True)
    diagnostico_correto = serializers.BooleanField(default=True)
