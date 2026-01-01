# api/management/commands/enviar_lembretes_consultas.py
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta

from api.models import Consulta
from api.services.notification_service import notification_service


class Command(BaseCommand):
    help = "Envia lembretes de consulta (24h antes) para consultas agendadas."

    def handle(self, *args, **options):
        agora = timezone.now()
        amanha = agora + timedelta(days=1)

        # Ajuste o filtro conforme o campo de status real do modelo Consulta
        consultas = Consulta.objects.filter(
            data=amanha.date(),
            status='agendada',  # se o choices for diferente, ajuste aqui
        )

        total = consultas.count()
        self.stdout.write(f"Encontradas {total} consultas agendadas para {amanha.date()}.")

        for consulta in consultas:
            try:
                notification_service.notificar_lembrete_consulta(consulta)
                self.stdout.write(f"[OK] Lembrete enviado para consulta {consulta.id}")
            except Exception as e:
                self.stderr.write(f"[ERRO] Consulta {consulta.id}: {e}")
