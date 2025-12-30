from rest_framework import serializers
from api.models import HealthCheck, Animal


class HealthCheckSerializer(serializers.ModelSerializer):
    animal_name = serializers.CharField(source='animal.name', read_only=True)
    animal_species = serializers.CharField(source='animal.get_species_display', read_only=True)
    
    class Meta:
        model = HealthCheck
        fields = '__all__'
        read_only_fields = [
            'predicted_condition',
            'condition_category',
            'confidence_score',
            'urgency_level',
            'recommendations',
            'detected_symptoms',
            'processing_time',
            'model_version',
        ]


class HealthCheckCreateSerializer(serializers.Serializer):
    animal_id = serializers.IntegerField()
    image = serializers.ImageField()
    
    def validate_animal_id(self, value):
        try:
            Animal.objects.get(id=value)
        except Animal.DoesNotExist:
            raise serializers.ValidationError("Animal não encontrado")
        return value
    
    def validate_image(self, value):
        valid_extensions = ['.jpg', '.jpeg', '.png']
        ext = value.name.lower().split('.')[-1]
        
        if f'.{ext}' not in valid_extensions:
            raise serializers.ValidationError("Formato inválido. Use: JPG, JPEG ou PNG")
        
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("Imagem muito grande. Máximo: 10MB")
        
        return value
