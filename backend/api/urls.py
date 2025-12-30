from django.urls import path, include
from rest_framework.routers import DefaultRouter

from api.views.health_check_views import HealthCheckViewSet
from api.views.tutor_views import TutorViewSet
from api.views.animal_views import AnimalViewSet
from api.views.veterinario_views import VeterinarioViewSet
from api.views.consulta_views import ConsultaViewSet
from api.views.vacina_views import VacinaViewSet
from api.views.exame_views import ExameViewSet
from api.views.plano_views import PlanoSaudeViewSet, ContratoPlanoViewSet
from api.views.clinica_views import ClinicaViewSet
from api.views.notificacao_views import NotificacaoViewSet
from api.views.diagnostico_views import DiagnosticoIAViewSet  # ← NOVO

router = DefaultRouter()
router.register(r'health-checks', HealthCheckViewSet, basename='health-check')
router.register(r'tutores', TutorViewSet, basename='tutor')
router.register(r'animais', AnimalViewSet, basename='animal')
router.register(r'veterinarios', VeterinarioViewSet, basename='veterinario')
router.register(r'consultas', ConsultaViewSet, basename='consulta')
router.register(r'vacinas', VacinaViewSet, basename='vacina')
router.register(r'exames', ExameViewSet, basename='exame')
router.register(r'planos', PlanoSaudeViewSet, basename='plano')
router.register(r'contratos', ContratoPlanoViewSet, basename='contrato')
router.register(r'clinicas', ClinicaViewSet, basename='clinica')
router.register(r'notificacoes', NotificacaoViewSet, basename='notificacao')
router.register(r'diagnosticos', DiagnosticoIAViewSet, basename='diagnostico')  # ← NOVO

urlpatterns = [
    path('', include(router.urls)),
]
