"""
Filtros avançados para a API VetSystem
"""
import django_filters
from django.db.models import Q
from api.models import (
    Tutor, Animal, Veterinario, Consulta,
    Vacina, Exame, PlanoSaude, ContratoPlano, Clinica
)



# ==========================================
# TUTOR FILTERS
# ==========================================
class TutorFilter(django_filters.FilterSet):
    """Filtros avançados para Tutores"""
    
    name = django_filters.CharFilter(lookup_expr='icontains')
    email = django_filters.CharFilter(lookup_expr='icontains')
    cpf = django_filters.CharFilter(lookup_expr='icontains')
    city = django_filters.CharFilter(lookup_expr='icontains')
    state = django_filters.CharFilter(lookup_expr='iexact')
    is_active = django_filters.BooleanFilter()
    created_after = django_filters.DateFilter(field_name='created_at', lookup_expr='gte')
    created_before = django_filters.DateFilter(field_name='created_at', lookup_expr='lte')
    
    has_animals = django_filters.BooleanFilter(method='filter_has_animals')
    
    def filter_has_animals(self, queryset, name, value):
        if value:
            return queryset.filter(animais__isnull=False).distinct()
        return queryset.filter(animais__isnull=True)
    
    class Meta:
        model = Tutor
        fields = ['name', 'email', 'cpf', 'city', 'state', 'is_active']



# ==========================================
# ANIMAL FILTERS
# ==========================================
class AnimalFilter(django_filters.FilterSet):
    """Filtros avançados para Animais"""
    
    name = django_filters.CharFilter(lookup_expr='icontains')
    species = django_filters.CharFilter()
    gender = django_filters.CharFilter()
    breed = django_filters.CharFilter(lookup_expr='icontains')
    tutor = django_filters.NumberFilter(field_name='tutor__id')
    tutor_name = django_filters.CharFilter(field_name='tutor__name', lookup_expr='icontains')
    age_min = django_filters.NumberFilter(field_name='age', lookup_expr='gte')
    age_max = django_filters.NumberFilter(field_name='age', lookup_expr='lte')
    weight_min = django_filters.NumberFilter(field_name='weight', lookup_expr='gte')
    weight_max = django_filters.NumberFilter(field_name='weight', lookup_expr='lte')
    
    has_microchip = django_filters.BooleanFilter(method='filter_has_microchip')
    
    def filter_has_microchip(self, queryset, name, value):
        if value:
            return queryset.exclude(microchip__isnull=True).exclude(microchip='')
        return queryset.filter(Q(microchip__isnull=True) | Q(microchip=''))
    
    class Meta:
        model = Animal
        fields = ['species', 'gender', 'breed', 'tutor', 'is_active']



# ==========================================
# VETERINARIO FILTERS
# ==========================================
class VeterinarioFilter(django_filters.FilterSet):
    """Filtros avançados para Veterinários"""
    
    name = django_filters.CharFilter(lookup_expr='icontains')
    crmv = django_filters.CharFilter(lookup_expr='icontains')
    specialty = django_filters.CharFilter(field_name='specialties', lookup_expr='icontains')
    status = django_filters.CharFilter()
    email = django_filters.CharFilter(lookup_expr='icontains')
    
    class Meta:
        model = Veterinario
        fields = ['name', 'crmv', 'status', 'email']



# ==========================================
# CONSULTA FILTERS
# ==========================================
class ConsultaFilter(django_filters.FilterSet):
    """Filtros avançados para Consultas"""
    
    status = django_filters.CharFilter()
    tipo = django_filters.CharFilter()
    animal = django_filters.NumberFilter(field_name='animal__id')
    animal_name = django_filters.CharFilter(field_name='animal__name', lookup_expr='icontains')
    veterinario = django_filters.NumberFilter(field_name='veterinario__id')
    veterinario_name = django_filters.CharFilter(field_name='veterinario__name', lookup_expr='icontains')
    tutor = django_filters.NumberFilter(field_name='animal__tutor__id')
    tutor_name = django_filters.CharFilter(field_name='animal__tutor__name', lookup_expr='icontains')
    data = django_filters.DateFilter()
    data_after = django_filters.DateFilter(field_name='data', lookup_expr='gte')
    data_before = django_filters.DateFilter(field_name='data', lookup_expr='lte')
    mes = django_filters.NumberFilter(field_name='data__month')
    ano = django_filters.NumberFilter(field_name='data__year')
    
    urgente = django_filters.BooleanFilter(method='filter_urgente')
    
    def filter_urgente(self, queryset, name, value):
        if value:
            return queryset.filter(tipo='EMERGENCIA')
        return queryset.exclude(tipo='EMERGENCIA')
    
    pendente = django_filters.BooleanFilter(method='filter_pendente')
    
    def filter_pendente(self, queryset, name, value):
        if value:
            return queryset.filter(status__in=['AGENDADA', 'CONFIRMADA'])
        return queryset.exclude(status__in=['AGENDADA', 'CONFIRMADA'])
    
    class Meta:
        model = Consulta
        fields = ['status', 'tipo', 'animal', 'veterinario', 'data']



# ==========================================
# VACINA FILTERS
# ==========================================
class VacinaFilter(django_filters.FilterSet):
    """Filtros avançados para Vacinas"""
    
    animal = django_filters.NumberFilter(field_name='animal__id')
    animal_name = django_filters.CharFilter(field_name='animal__name', lookup_expr='icontains')
    nome_vacina = django_filters.CharFilter(lookup_expr='icontains')
    fabricante = django_filters.CharFilter(lookup_expr='icontains')
    data_aplicacao = django_filters.DateFilter()
    data_aplicacao_after = django_filters.DateFilter(field_name='data_aplicacao', lookup_expr='gte')
    data_aplicacao_before = django_filters.DateFilter(field_name='data_aplicacao', lookup_expr='lte')
    proxima_dose_after = django_filters.DateFilter(field_name='data_proxima_dose', lookup_expr='gte')
    proxima_dose_before = django_filters.DateFilter(field_name='data_proxima_dose', lookup_expr='lte')
    
    atrasada = django_filters.BooleanFilter(method='filter_atrasada')
    
    def filter_atrasada(self, queryset, name, value):
        from datetime import date
        if value:
            return queryset.filter(data_proxima_dose__lt=date.today())
        return queryset.filter(data_proxima_dose__gte=date.today())
    
    proxima = django_filters.BooleanFilter(method='filter_proxima')
    
    def filter_proxima(self, queryset, name, value):
        from datetime import date, timedelta
        if value:
            hoje = date.today()
            limite = hoje + timedelta(days=30)
            return queryset.filter(data_proxima_dose__range=[hoje, limite])
        return queryset
    
    class Meta:
        model = Vacina
        fields = ['animal', 'nome_vacina', 'fabricante', 'data_aplicacao']



# ==========================================
# EXAME FILTERS
# ==========================================
class ExameFilter(django_filters.FilterSet):
    """Filtros avançados para Exames"""
    
    status = django_filters.CharFilter()
    animal = django_filters.NumberFilter(field_name='animal__id')
    animal_name = django_filters.CharFilter(field_name='animal__name', lookup_expr='icontains')
    veterinario = django_filters.NumberFilter(field_name='veterinario_solicitante__id')
    veterinario_name = django_filters.CharFilter(field_name='veterinario_solicitante__name', lookup_expr='icontains')
    tipo_exame = django_filters.CharFilter(lookup_expr='icontains')
    laboratorio = django_filters.CharFilter(lookup_expr='icontains')
    data_solicitacao = django_filters.DateFilter()
    data_solicitacao_after = django_filters.DateFilter(field_name='data_solicitacao', lookup_expr='gte')
    data_solicitacao_before = django_filters.DateFilter(field_name='data_solicitacao', lookup_expr='lte')
    
    pendente = django_filters.BooleanFilter(method='filter_pendente')
    
    def filter_pendente(self, queryset, name, value):
        if value:
            return queryset.filter(status__in=['SOLICITADO', 'EM_ANALISE'])
        return queryset.exclude(status__in=['SOLICITADO', 'EM_ANALISE'])
    
    class Meta:
        model = Exame
        fields = ['status', 'animal', 'veterinario_solicitante', 'tipo_exame']



# ==========================================
# PLANO FILTERS
# ==========================================
class PlanoSaudeFilter(django_filters.FilterSet):
    """Filtros avançados para Planos de Saúde"""
    
    nome = django_filters.CharFilter(lookup_expr='icontains')
    preco_min = django_filters.NumberFilter(field_name='preco_mensal', lookup_expr='gte')
    preco_max = django_filters.NumberFilter(field_name='preco_mensal', lookup_expr='lte')
    telemedicina = django_filters.BooleanFilter(field_name='telemedicina_incluida')
    atendimento_24h = django_filters.BooleanFilter()
    consultas_ilimitadas = django_filters.BooleanFilter()
    is_active = django_filters.BooleanFilter()
    
    class Meta:
        model = PlanoSaude
        fields = ['nome', 'is_active', 'telemedicina_incluida', 'atendimento_24h']



# ==========================================
# CONTRATO FILTERS (CORRIGIDO - VERSÃO FINAL)
# ==========================================
class ContratoPlanoFilter(django_filters.FilterSet):
    """
    Filtros avançados para Contratos de Planos
    
    Campos disponíveis:
    - animal (ForeignKey -> Animal)
    - plano (ForeignKey -> PlanoSaude)
    - data_inicio, data_fim
    - valor_mensal
    - is_active
    - observacoes
    """
    
    # Filtros diretos
    is_active = django_filters.BooleanFilter()
    animal = django_filters.NumberFilter(field_name='animal__id')
    animal_name = django_filters.CharFilter(field_name='animal__name', lookup_expr='icontains')
    plano = django_filters.NumberFilter(field_name='plano__id')
    plano_nome = django_filters.CharFilter(field_name='plano__nome', lookup_expr='icontains')
    
    # Filtros por tutor (via animal.tutor)
    tutor = django_filters.NumberFilter(field_name='animal__tutor__id')
    tutor_name = django_filters.CharFilter(field_name='animal__tutor__name', lookup_expr='icontains')
    
    # Filtros por data
    data_inicio_after = django_filters.DateFilter(field_name='data_inicio', lookup_expr='gte')
    data_inicio_before = django_filters.DateFilter(field_name='data_inicio', lookup_expr='lte')
    data_fim_after = django_filters.DateFilter(field_name='data_fim', lookup_expr='gte')
    data_fim_before = django_filters.DateFilter(field_name='data_fim', lookup_expr='lte')
    
    # Filtros por valor
    valor_min = django_filters.NumberFilter(field_name='valor_mensal', lookup_expr='gte')
    valor_max = django_filters.NumberFilter(field_name='valor_mensal', lookup_expr='lte')
    
    # Alias para "ativo" (mesmo que is_active)
    ativo = django_filters.BooleanFilter(field_name='is_active')
    
    class Meta:
        model = ContratoPlano
        fields = ['is_active', 'animal', 'plano', 'data_inicio', 'data_fim', 'valor_mensal']



# ==========================================
# CLINICA FILTERS
# ==========================================
class ClinicaFilter(django_filters.FilterSet):
    """Filtros avançados para Clínicas"""
    
    nome = django_filters.CharFilter(lookup_expr='icontains')
    cidade = django_filters.CharFilter(lookup_expr='icontains')
    estado = django_filters.CharFilter(lookup_expr='iexact')
    especialidade = django_filters.CharFilter(field_name='especialidades', lookup_expr='icontains')
    atendimento_24h = django_filters.BooleanFilter()
    atende_emergencia = django_filters.BooleanFilter()
    tem_internacao = django_filters.BooleanFilter()
    tem_cirurgia = django_filters.BooleanFilter()
    tem_uti = django_filters.BooleanFilter()
    is_active = django_filters.BooleanFilter()
    
    class Meta:
        model = Clinica
        fields = ['nome', 'cidade', 'estado', 'atendimento_24h', 'atende_emergencia']

