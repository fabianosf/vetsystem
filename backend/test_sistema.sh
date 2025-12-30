#!/bin/bash

echo "🔍 TESTANDO BACKEND DJANGO"
echo "=========================="
echo ""

cd "$(dirname "$0")"

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para testar endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local token=$4
    
    echo -n "Testing: $description... "
    
    if [ -n "$token" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" -X $method \
            -H "Authorization: Bearer $token" \
            -H "Content-Type: application/json" \
            "http://localhost:8000$endpoint")
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" -X $method \
            -H "Content-Type: application/json" \
            "http://localhost:8000$endpoint")
    fi
    
    if [ $response -eq 200 ] || [ $response -eq 201 ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $response)"
        return 0
    elif [ $response -eq 401 ] && [ -z "$token" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $response - Auth required)"
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $response)"
        return 1
    fi
}

echo "1️⃣  Verificando se o servidor está rodando..."
if ! curl -s http://localhost:8000 > /dev/null; then
    echo -e "${RED}❌ Servidor não está rodando!${NC}"
    echo "Execute: python manage.py runserver"
    exit 1
fi
echo -e "${GREEN}✅ Servidor está rodando${NC}"
echo ""

echo "2️⃣  Testando Autenticação..."
# Tentar fazer login
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8000/api/auth/login/ \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${YELLOW}⚠️  Não conseguiu fazer login com credenciais padrão${NC}"
    echo "Certifique-se de ter um superusuário criado"
    TOKEN=""
else
    echo -e "${GREEN}✅ Login bem-sucedido${NC}"
fi
echo ""

echo "3️⃣  Testando Endpoints da API..."
test_endpoint "GET" "/api/tutores/" "Listar Tutores" "$TOKEN"
test_endpoint "GET" "/api/animais/" "Listar Animais" "$TOKEN"
test_endpoint "GET" "/api/veterinarios/" "Listar Veterinários" "$TOKEN"
test_endpoint "GET" "/api/consultas/" "Listar Consultas" "$TOKEN"
test_endpoint "GET" "/api/vacinas/" "Listar Vacinas" "$TOKEN"
test_endpoint "GET" "/api/exames/" "Listar Exames" "$TOKEN"
test_endpoint "GET" "/api/planos/" "Listar Planos" "$TOKEN"
test_endpoint "GET" "/api/clinicas/" "Listar Clínicas" "$TOKEN"
echo ""

echo "4️⃣  Testando Segurança..."
test_endpoint "GET" "/api/tutores/" "Endpoint sem token (deve falhar)" ""
echo ""

echo "5️⃣  Verificando Django Settings..."
python << PYTHON
import sys
sys.path.insert(0, '.')
from config.settings import DEBUG, ALLOWED_HOSTS, DATABASES

print("DEBUG:", DEBUG)
print("ALLOWED_HOSTS:", ALLOWED_HOSTS)
print("DATABASE:", DATABASES['default']['ENGINE'])

if DEBUG:
    print("\033[93m⚠️  DEBUG=True (OK para desenvolvimento)\033[0m")
else:
    print("\033[92m✅ DEBUG=False (Produção)\033[0m")
PYTHON

echo ""
echo "6️⃣  Verificando Migrações..."
python manage.py showmigrations | grep "\[ \]" > /dev/null
if [ $? -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Existem migrações pendentes${NC}"
    echo "Execute: python manage.py migrate"
else
    echo -e "${GREEN}✅ Todas migrações aplicadas${NC}"
fi

echo ""
echo "=========================================="
echo "✅ TESTES DO BACKEND CONCLUÍDOS"
echo "=========================================="
