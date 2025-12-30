from .health_check_views import HealthCheckViewSet
from .tutor_views import TutorViewSet
from .animal_views import AnimalViewSet
from .veterinario_views import VeterinarioViewSet
from .consulta_views import ConsultaViewSet
from .vacina_views import VacinaViewSet
from .exame_views import ExameViewSet
from .plano_views import PlanoSaudeViewSet, ContratoPlanoViewSet
from .clinica_views import ClinicaViewSet
from .notificacao_views import NotificacaoViewSet

__all__ = [
    'HealthCheckViewSet',
    'TutorViewSet',
    'AnimalViewSet',
    'VeterinarioViewSet',
    'ConsultaViewSet',
    'VacinaViewSet',
    'ExameViewSet',
    'PlanoSaudeViewSet',
    'ContratoPlanoViewSet',
    'ClinicaViewSet',
    'NotificacaoViewSet',
]
