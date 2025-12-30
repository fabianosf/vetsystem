"""
ViewSets da API com permissões por role
"""
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from api.models import Tutor, Animal, Veterinario, Consulta, Vacina, Exame, PlanoSaude, ContratoPlano, Clinica
from api.serializers import TutorSerializer, AnimalSerializer, VeterinarioSerializer, ConsultaSerializer, VacinaSerializer, ExameSerializer, PlanoSaudeSerializer, ContratoPlanoSerializer, ClinicaSerializer
from api.permissions import IsAdminUser, IsVeterinarioUser, ReadOnlyOrAuthenticated

class TutorViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Tutores
    - Leitura: Todos autenticados
    - Criação: Admins e próprio tutor
    - Edição/Exclusão: Admins e próprio tutor
    """
    queryset = Tutor.objects.all()
    serializer_class = TutorSerializer
    filterset_fields = ['city', 'state', 'is_active']
    search_fields = ['name', 'email', 'cpf']
    ordering_fields = ['name', 'created_at']
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsAuthenticated()]

class AnimalViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Animais
    - Tutores: veem apenas seus animais
    - Veterinários e Admins: veem todos
    """
    queryset = Animal.objects.all()
    serializer_class = AnimalSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['species', 'tutor', 'is_active']
    search_fields = ['name', 'microchip']
    ordering_fields = ['name', 'created_at']
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin or user.is_veterinario:
            return Animal.objects.all()
        elif user.is_tutor and user.tutor_profile:
            return Animal.objects.filter(tutor=user.tutor_profile)
        return Animal.objects.none()

class VeterinarioViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Veterinários
    - Leitura: Todos autenticados
    - Criação/Edição/Exclusão: Apenas admins
    """
    queryset = Veterinario.objects.all()
    serializer_class = VeterinarioSerializer
    filterset_fields = ['status']
    search_fields = ['name', 'crmv', 'specialties']
    ordering_fields = ['name', 'created_at']
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsAdminUser()]

class ConsultaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Consultas
    - Veterinários: criam e gerenciam suas consultas
    - Tutores: veem apenas consultas de seus animais
    - Admins: acesso total
    """
    queryset = Consulta.objects.all()
    serializer_class = ConsultaSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['status', 'tipo', 'veterinario', 'animal', 'data']
    search_fields = ['motivo', 'diagnostico']
    ordering_fields = ['data', 'hora', 'created_at']
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return Consulta.objects.all()
        elif user.is_veterinario and user.veterinario_profile:
            return Consulta.objects.filter(veterinario=user.veterinario_profile)
        elif user.is_tutor and user.tutor_profile:
            return Consulta.objects.filter(animal__tutor=user.tutor_profile)
        return Consulta.objects.none()
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update']:
            return [IsVeterinarioUser()]
        return [IsAuthenticated()]

class VacinaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Vacinas
    """
    queryset = Vacina.objects.all()
    serializer_class = VacinaSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['nome_vacina', 'animal']
    search_fields = ['nome_vacina', 'lote']
    ordering_fields = ['data_aplicacao', 'created_at']
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin or user.is_veterinario:
            return Vacina.objects.all()
        elif user.is_tutor and user.tutor_profile:
            return Vacina.objects.filter(animal__tutor=user.tutor_profile)
        return Vacina.objects.none()

class ExameViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Exames
    """
    queryset = Exame.objects.all()
    serializer_class = ExameSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['tipo_exame', 'status', 'animal', 'veterinario_solicitante']
    search_fields = ['tipo_exame', 'laboratorio']
    ordering_fields = ['data_solicitacao', 'created_at']
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin or user.is_veterinario:
            return Exame.objects.all()
        elif user.is_tutor and user.tutor_profile:
            return Exame.objects.filter(animal__tutor=user.tutor_profile)
        return Exame.objects.none()

class PlanoSaudeViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Planos de Saúde
    - Leitura: Todos autenticados
    - Criação/Edição: Apenas admins
    """
    queryset = PlanoSaude.objects.all()
    serializer_class = PlanoSaudeSerializer
    filterset_fields = ['nome', 'is_active']
    search_fields = ['nome', 'descricao']
    ordering_fields = ['preco_mensal', 'created_at']
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsAdminUser()]

class ContratoPlanoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Contratos de Plano
    """
    queryset = ContratoPlano.objects.all()
    serializer_class = ContratoPlanoSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['status', 'tutor', 'plano']
    search_fields = ['tutor__name']
    ordering_fields = ['data_inicio', 'created_at']
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return ContratoPlano.objects.all()
        elif user.is_tutor and user.tutor_profile:
            return ContratoPlano.objects.filter(tutor=user.tutor_profile)
        return ContratoPlano.objects.none()

class ClinicaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Clínicas
    - Leitura: Todos (público)
    - Criação/Edição: Apenas admins
    """
    queryset = Clinica.objects.all()
    serializer_class = ClinicaSerializer
    filterset_fields = ['cidade', 'estado', 'atendimento_24h', 'atende_emergencia', 'is_active']
    search_fields = ['nome', 'endereco', 'especialidades']
    ordering_fields = ['nome', 'avaliacao_media', 'created_at']
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]
