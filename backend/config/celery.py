import os
from celery import Celery
from celery.schedules import crontab

# Definir settings do Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('vetsystem')

# Configurações do Celery usando settings do Django
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-descobrir tasks em todos os apps
app.autodiscover_tasks()

# Configurar tarefas periódicas
app.conf.beat_schedule = {
    # Enviar lembretes de consultas (todo dia às 8h)
    'enviar-lembretes-consultas': {
        'task': 'api.tasks.enviar_lembretes_consultas',
        'schedule': crontab(hour=8, minute=0),  # 8:00 AM
    },
    # Verificar vacinas vencendo (todo dia às 9h)
    'verificar-vacinas-vencendo': {
        'task': 'api.tasks.verificar_vacinas_vencendo',
        'schedule': crontab(hour=9, minute=0),  # 9:00 AM
    },
}

@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
