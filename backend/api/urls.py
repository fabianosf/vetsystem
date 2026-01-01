from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from api.views.diagnostico_views import DiagnosticoIAViewSet

# ViewSets
from api.views import (
    AnimalViewSet,
    TutorViewSet,
    VeterinarioViewSet,
    ConsultaViewSet,
    ExameViewSet,
    VacinaViewSet,
    ClinicaViewSet,
    PlanoSaudeViewSet,
    DiagnosticoIAViewSet,
)

# Dashboard e Auth views
from api.views.dashboard_views import dashboard_kpis
from api.views.auth_views import (
    login_view,
    register_user,
    request_password_reset,
    verify_reset_token,
    confirm_password_reset,
)

# Notification views
from api.views.notification_views import (
    listar_notificacoes,
    listar_notificacoes_nao_lidas,
    marcar_como_lida,
    marcar_todas_como_lidas,
)

# Router
router = DefaultRouter()
router.register(r'animais', AnimalViewSet, basename='animal')
router.register(r'tutores', TutorViewSet, basename='tutor')
router.register(r'veterinarios', VeterinarioViewSet, basename='veterinario')
router.register(r'consultas', ConsultaViewSet, basename='consulta')
router.register(r'exames', ExameViewSet, basename='exame')
router.register(r'vacinas', VacinaViewSet, basename='vacina')
router.register(r'clinicas', ClinicaViewSet, basename='clinica')
router.register(r'planos', PlanoSaudeViewSet, basename='plano')
router.register(r'diagnosticos', DiagnosticoIAViewSet, basename='diagnostico')

urlpatterns = [
    # Router
    path('', include(router.urls)),
    
    # Auth
    path('auth/login/', login_view, name='login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/register/', register_user, name='register'),
    path('auth/password-reset/request/', request_password_reset, name='password-reset-request'),
    path('auth/password-reset/verify/', verify_reset_token, name='password-reset-verify'),
    path('auth/password-reset/confirm/', confirm_password_reset, name='password-reset-confirm'),
    
    # Dashboard
    path('dashboard/kpis/', dashboard_kpis, name='dashboard-kpis'),
    
    # Notificações
    path('notificacoes/', listar_notificacoes, name='notificacoes-list'),
    path('notificacoes/nao_lidas/', listar_notificacoes_nao_lidas, name='notificacoes-nao-lidas'),
    path('notificacoes/<int:pk>/marcar_lida/', marcar_como_lida, name='notificacao-marcar-lida'),
    path('notificacoes/marcar_todas_lidas/', marcar_todas_como_lidas, name='notificacoes-marcar-todas'),
]
