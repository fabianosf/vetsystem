from rest_framework import serializers
from api.models import Consulta, Animal, Veterinario, Tutor


# Serializers simples para relacionamentos
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
    # Serializers aninhados para leitura (GET)
    animal_detail = AnimalSimpleSerializer(source='animal', read_only=True)
    veterinario_detail = VeterinarioSimpleSerializer(source='veterinario', read_only=True)
    tutor_detail = TutorSimpleSerializer(source='tutor', read_only=True)
    
    # IDs para escrita (POST/PUT/PATCH)
    animal = serializers.PrimaryKeyRelatedField(
        queryset=Animal.objects.all(), 
        write_only=True
    )
    veterinario = serializers.PrimaryKeyRelatedField(
        queryset=Veterinario.objects.all(), 
        write_only=True
    )
    tutor = serializers.PrimaryKeyRelatedField(
        queryset=Tutor.objects.all(), 
        required=False, 
        allow_null=True, 
        write_only=True
    )

    class Meta:
        model = Consulta
        fields = [
            'id',
            'animal',
            'animal_detail',
            'veterinario',
            'veterinario_detail',
            'tutor',
            'tutor_detail',
            'data',
            'hora',
            'motivo',
            'status',
            'observacoes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']

    def to_representation(self, instance):
        """
        Customiza a saída JSON para renomear campos
        """
        representation = super().to_representation(instance)
        
        # Renomeia _detail para o nome original (para o frontend)
        representation['animal'] = representation.pop('animal_detail', None)
        representation['veterinario'] = representation.pop('veterinario_detail', None)
        representation['tutor'] = representation.pop('tutor_detail', None)
        
        return representation
