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

# Dashboard
try:
    from .dashboard_views import dashboard_kpis
except ImportError:
    pass

# PDF
try:
    from .pdf_views import (
        gerar_ficha_animal,
        gerar_prescricao,
        gerar_atestado,
        gerar_relatorio_consulta,
    )
except ImportError:
    pass

# Notificações
try:
    from .notification_views import (
        listar_notificacoes,
        listar_notificacoes_nao_lidas,
        marcar_como_lida,
        marcar_todas_como_lidas,
        notificar_consulta_agendada,
        notificar_lembrete_consulta,
        notificar_consulta_cancelada,
        enviar_notificacao_custom,
    )
except ImportError:
    pass
