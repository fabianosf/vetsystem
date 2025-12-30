# Corrigir serializer PlanoSaudeSerializer
# O campo é 'is_active' e não 'status'

# Abra api/serializers/__init__.py e corrija:

# ANTES (ERRADO):
# return obj.contratos.filter(status='ATIVO').count()

# DEPOIS (CORRETO):
# return obj.contratos.filter(is_active=True).count()
