# Importar tasks no topo do arquivo (adicionar se não existir)
from api.tasks import enviar_email_boas_vindas, enviar_confirmacao_consulta
from api.models import Notificacao  

class ConsultaSerializer(serializers.ModelSerializer):
    animal_nome = serializers.SerializerMethodField()
    tutor_nome = serializers.SerializerMethodField()
    veterinario_nome = serializers.SerializerMethodField()
    clinica_nome = serializers.SerializerMethodField()
    
    class Meta:
        model = Consulta
        fields = '__all__'
    
    def get_animal_nome(self, obj):
        try:
            return obj.animal.name if obj.animal else None
        except:
            return None
    
    def get_tutor_nome(self, obj):
        try:
            return obj.animal.tutor.name if obj.animal and obj.animal.tutor else None
        except:
            return None
    
    def get_veterinario_nome(self, obj):
        try:
            return obj.veterinario.name if obj.veterinario else None
        except:
            return None
    
    def get_clinica_nome(self, obj):
        try:
            return obj.clinica.nome if obj.clinica else None
        except:
            return None


class NotificacaoSerializer(serializers.ModelSerializer):
    """Serializer para Notificações"""
    
    user_name = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Notificacao
        fields = [
            'id',
            'user',
            'user_name',
            'titulo',
            'mensagem',
            'tipo',
            'categoria',
            'lida',
            'lida_em',
            'link',
            'icone',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'user_name', 'lida_em', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        # Auto-adicionar user do request
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['user'] = request.user
        return super().create(validated_data)
