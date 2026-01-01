from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from django.core.mail import send_mail
from django.conf import settings
from django.utils.crypto import get_random_string
from django.utils import timezone
from datetime import timedelta
import logging

User = get_user_model()
logger = logging.getLogger(__name__)

# Armazenamento temporário de tokens (use Redis em produção)
reset_tokens = {}


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Login com email e senha
    Retorna access e refresh tokens JWT
    """
    email = request.data.get('email', '').strip().lower()
    password = request.data.get('password', '')
    
    if not email or not password:
        return Response(
            {'detail': 'Email e senha são obrigatórios'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Busca usuário por email
        user = User.objects.get(email=email)
        
        # Autentica com username (Django usa username internamente)
        user_auth = authenticate(username=user.username, password=password)
        
        if user_auth is None:
            return Response(
                {'detail': 'Email ou senha incorretos'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Gera tokens JWT
        refresh = RefreshToken.for_user(user_auth)
        
        # Dados do usuário
        user_data = {
            'id': user_auth.id,
            'email': user_auth.email,
            'username': user_auth.username,
            'first_name': user_auth.first_name,
            'last_name': user_auth.last_name,
        }
        
        # Adiciona role se existir
        if hasattr(user_auth, 'role'):
            user_data['role'] = user_auth.role
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': user_data
        })
        
    except User.DoesNotExist:
        return Response(
            {'detail': 'Email ou senha incorretos'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    except Exception as e:
        logger.error(f'Erro no login: {e}')
        return Response(
            {'detail': 'Erro ao fazer login'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """
    Cadastro de novo usuário
    """
    email = request.data.get('email', '').strip().lower()
    password = request.data.get('password', '')
    first_name = request.data.get('first_name', '').strip()
    last_name = request.data.get('last_name', '').strip()
    role = request.data.get('role', 'tutor').lower()
    
    if not email or not password:
        return Response(
            {'error': 'Email e senha são obrigatórios'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if len(password) < 6:
        return Response(
            {'error': 'A senha deve ter pelo menos 6 caracteres'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if User.objects.filter(email=email).exists():
        return Response(
            {'error': 'Este email já está cadastrado'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    allowed_roles = ['tutor']
    if role not in allowed_roles:
        role = 'tutor'
    
    try:
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        
        if hasattr(user, 'role'):
            user.role = role
            user.save()
        
        logger.info(f'Novo usuário registrado: {email}')
        
        return Response({
            'message': 'Cadastro realizado com sucesso!',
            'email': email
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f'Erro ao criar usuário: {e}')
        return Response(
            {'error': 'Erro ao criar conta'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def request_password_reset(request):
    """
    Solicita código de recuperação de senha
    """
    email = request.data.get('email', '').strip().lower()
    
    if not email:
        return Response(
            {'error': 'Email é obrigatório'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = User.objects.get(email=email)
        token = get_random_string(6, allowed_chars='0123456789')
        
        reset_tokens[email] = {
            'token': token,
            'expires_at': timezone.now() + timedelta(minutes=15),
            'user_id': user.id
        }
        
        try:
            send_mail(
                subject='VetSystem - Código de Recuperação',
                message=f'Seu código: {token}\n\nExpira em 15 minutos.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
        except Exception as e:
            logger.error(f'Erro ao enviar email: {e}')
            if settings.DEBUG:
                return Response({
                    'message': 'Código gerado (DEBUG)',
                    'token': token
                })
        
        return Response({
            'message': 'Código enviado para o email'
        })
        
    except User.DoesNotExist:
        return Response({
            'message': 'Se o email estiver cadastrado, você receberá um código'
        })


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_reset_token(request):
    """
    Verifica código de recuperação
    """
    email = request.data.get('email', '').strip().lower()
    token = request.data.get('token', '').strip()
    
    if not email or not token:
        return Response(
            {'error': 'Email e token são obrigatórios'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    stored_data = reset_tokens.get(email)
    
    if not stored_data:
        return Response(
            {'error': 'Token inválido ou expirado'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if timezone.now() > stored_data['expires_at']:
        del reset_tokens[email]
        return Response(
            {'error': 'Token expirado'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if stored_data['token'] != token:
        return Response(
            {'error': 'Código incorreto'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    return Response({'message': 'Token válido'})


@api_view(['POST'])
@permission_classes([AllowAny])
def confirm_password_reset(request):
    """
    Confirma nova senha
    """
    email = request.data.get('email', '').strip().lower()
    token = request.data.get('token', '').strip()
    new_password = request.data.get('new_password', '')
    
    if not email or not token or not new_password:
        return Response(
            {'error': 'Todos os campos são obrigatórios'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if len(new_password) < 6:
        return Response(
            {'error': 'A senha deve ter pelo menos 6 caracteres'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    stored_data = reset_tokens.get(email)
    
    if not stored_data or stored_data['token'] != token:
        return Response(
            {'error': 'Token inválido'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = User.objects.get(id=stored_data['user_id'])
        user.set_password(new_password)
        user.save()
        
        del reset_tokens[email]
        
        return Response({'message': 'Senha alterada com sucesso!'})
        
    except User.DoesNotExist:
        return Response(
            {'error': 'Usuário não encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )
