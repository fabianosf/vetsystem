from rest_framework import viewsets
from api.models import Notificacao
from rest_framework.serializers import ModelSerializer

class NotificacaoSerializer(ModelSerializer):
    class Meta:
        model = Notificacao
        fields = '__all__'

class NotificacaoViewSet(viewsets.ModelViewSet):
    queryset = Notificacao.objects.all()
    serializer_class = NotificacaoSerializer
