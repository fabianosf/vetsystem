from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
import math

class Clinica(models.Model):
    """
    Model representando clínicas veterinárias
    """
    nome = models.CharField(
        max_length=255,
        verbose_name='Nome da Clínica'
    )
    endereco = models.CharField(
        max_length=500,
        verbose_name='Endereço Completo'
    )
    cidade = models.CharField(
        max_length=100,
        verbose_name='Cidade'
    )
    estado = models.CharField(
        max_length=2,
        verbose_name='Estado (UF)'
    )
    cep = models.CharField(
        max_length=10,
        verbose_name='CEP'
    )
    
    # Geolocalização
    latitude = models.FloatField(
        verbose_name='Latitude',
        validators=[MinValueValidator(-90), MaxValueValidator(90)],
        help_text='Coordenada geográfica (-90 a 90)'
    )
    longitude = models.FloatField(
        verbose_name='Longitude',
        validators=[MinValueValidator(-180), MaxValueValidator(180)],
        help_text='Coordenada geográfica (-180 a 180)'
    )
    
    # Contato
    telefone = models.CharField(
        max_length=20,
        verbose_name='Telefone'
    )
    email = models.EmailField(
        verbose_name='E-mail',
        blank=True,
        null=True
    )
    site = models.URLField(
        verbose_name='Website',
        blank=True,
        null=True
    )
    
    # Características
    horario_funcionamento = models.CharField(
        max_length=200,
        verbose_name='Horário de Funcionamento',
        help_text='Ex: Seg-Sex 8h-18h, Sáb 8h-12h'
    )
    atendimento_24h = models.BooleanField(
        default=False,
        verbose_name='Atendimento 24 horas'
    )
    atende_emergencia = models.BooleanField(
        default=False,
        verbose_name='Atende Emergências'
    )
    tem_internacao = models.BooleanField(
        default=False,
        verbose_name='Possui Internação'
    )
    tem_uti = models.BooleanField(
        default=False,
        verbose_name='Possui UTI'
    )
    tem_cirurgia = models.BooleanField(
        default=True,
        verbose_name='Realiza Cirurgias'
    )
    
    # Especialidades
    especialidades = models.TextField(
        verbose_name='Especialidades',
        help_text='Especialidades separadas por vírgula',
        blank=True,
        null=True
    )
    
    # Avaliação
    avaliacao_media = models.FloatField(
        default=0.0,
        verbose_name='Avaliação Média',
        validators=[MinValueValidator(0), MaxValueValidator(5)]
    )
    total_avaliacoes = models.IntegerField(
        default=0,
        verbose_name='Total de Avaliações'
    )
    
    logo = models.ImageField(
        upload_to='clinicas/',
        verbose_name='Logo',
        blank=True,
        null=True
    )
    descricao = models.TextField(
        verbose_name='Descrição',
        blank=True,
        null=True
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name='Ativa'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Cadastrada em'
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Atualizada em'
    )

    class Meta:
        db_table = 'api_clinica'
        verbose_name = 'Clínica'
        verbose_name_plural = 'Clínicas'
        ordering = ['nome']

    def __str__(self):
        return f"{self.nome} - {self.cidade}/{self.estado}"

    def calcular_distancia(self, lat, lon):
        """
        Calcula distância usando a fórmula de Haversine
        Retorna distância em km
        """
        R = 6371  # Raio da Terra em km
        
        lat1 = math.radians(self.latitude)
        lon1 = math.radians(self.longitude)
        lat2 = math.radians(lat)
        lon2 = math.radians(lon)
        
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        
        return R * c

    @property
    def especialidades_list(self):
        """Retorna lista de especialidades"""
        if self.especialidades:
            return [e.strip() for e in self.especialidades.split(',')]
        return []
