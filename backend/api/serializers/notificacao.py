from rest_framework import serializers
from api.models import Notificacao

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
