from .animal import Animal
from .tutor import Tutor
from .veterinario import Veterinario
from .consulta import Consulta
from .vacina import Vacina
from .exame import Exame
from .plano_saude import PlanoSaude, ContratoPlano
from .clinica import Clinica
from .health_check import HealthCheck
from .notificacao import Notificacao

__all__ = [
    'Animal',
    'Tutor',
    'Veterinario',
    'Consulta',
    'Vacina',
    'Exame',
    'PlanoSaude',
    'ContratoPlano',
    'Clinica',
    'HealthCheck',
    'Notificacao',
]
from api.models.diagnostico import DiagnosticoIA
from api.models.notificacao_externa import NotificacaoExterna
