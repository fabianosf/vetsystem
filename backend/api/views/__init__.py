"""
Exportar todas as views
"""

# ViewSets básicos
from .animal_views import AnimalViewSet
from .tutor_views import TutorViewSet
from .veterinario_views import VeterinarioViewSet
from .consulta_views import ConsultaViewSet
from .exame_views import ExameViewSet
from .vacina_views import VacinaViewSet
from .clinica_views import ClinicaViewSet
from .plano_views import PlanoSaudeViewSet

# Views especializadas
from .diagnostico_views import DiagnosticoIAViewSet
from .health_check_views import HealthCheck  # ✅ CORRIGIDO

# Dashboard (funções corretas)
from .dashboard_views import (
    dashboard_stats,
    consultas_timeline,
    consultas_por_status,
    veterinarios_performance,
    racas_mais_comuns,
    diagnosticos_ia_timeline,
    planos_distribuicao,
)

# PDF (importar o que existir)
try:
    from .pdf_views import (
        gerar_ficha_animal,
        gerar_prescricao,
        gerar_atestado,
        gerar_relatorio_consulta,
    )
except ImportError:
    pass

# Notificações (function-based views)
from .notification_views import (
    notificar_consulta_agendada,
    notificar_lembrete_consulta,
    notificar_consulta_cancelada,
    enviar_notificacao_custom,
    listar_notificacoes,
)
