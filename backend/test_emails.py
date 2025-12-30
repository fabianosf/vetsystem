#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.tasks import (
    enviar_email_boas_vindas,
    enviar_lembretes_consultas,
    verificar_vacinas_vencendo
)

print("📧 Testando Sistema de Emails...")
print("")

# 1. Testar email de boas-vindas
print("1️⃣ Enviando email de boas-vindas...")
enviar_email_boas_vindas.delay('teste@example.com', 'João Silva')
print("✅ Email de boas-vindas enviado!")

# 2. Testar lembretes de consultas
print("")
print("2️⃣ Verificando lembretes de consultas para amanhã...")
enviar_lembretes_consultas.delay()
print("✅ Verificação concluída!")

# 3. Testar verificação de vacinas
print("")
print("3️⃣ Verificando vacinas vencendo...")
verificar_vacinas_vencendo.delay()
print("✅ Verificação concluída!")

print("")
print("============================================")
print("✅ TESTES CONCLUÍDOS!")
print("============================================")
print("")
print("📧 Verifique o console para ver os emails enviados")
print("(Em produção, os emails serão enviados por SMTP real)")
