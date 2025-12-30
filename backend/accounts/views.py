"""
Views de autenticação e gerenciamento de usuários
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import serializers
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from drf_spectacular.utils import extend_schema, OpenApiResponse
from django.contrib.auth import get_user_model

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Serializer customizado para adicionar informações extras ao token"""
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['email'] = user.email
        token['role'] = user.role if hasattr(user, 'role') else 'TUTOR'
        return token
    
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'role': self.user.role if hasattr(self.user, 'role') else 'TUTOR',
        }
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    """View customizada para login com JWT"""
    serializer_class = CustomTokenObtainPairSerializer


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer para registro de novos usuários"""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'phone', 'role'
        ]
        read_only_fields = ('id',)
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password': 'As senhas não coincidem.'})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    """Serializer para exibir dados do usuário"""
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'phone', 'role', 'date_joined'
        ]
        read_only_fields = ('id', 'username', 'date_joined')


@extend_schema(
    request=UserRegistrationSerializer,
    responses={201: UserSerializer},
    description="Registra um novo usuário no sistema"
)
@api_view(['POST'])
@permission_classes([AllowAny])
def UserRegistrationView(request):
    """Registra um novo usuário"""
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        user_data = UserSerializer(user).data
        return Response(user_data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    responses={200: UserSerializer},
    description="Retorna os dados do usuário autenticado"
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    """Retorna os dados do usuário atual"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@extend_schema(
    request=UserSerializer,
    responses={200: UserSerializer},
    description="Atualiza os dados do usuário autenticado"
)
@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_current_user(request):
    """Atualiza os dados do usuário atual"""
    serializer = UserSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
