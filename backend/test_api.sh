#!/bin/bash
# 🧪 VetSystem - Testes Completos da API
# Execute: bash test_api.sh

BASE_URL="http://127.0.0.1:8000/api"

echo "🚀 INICIANDO TESTES DA API VETSYSTEM"
echo "===================================="

# ========================================
# 1️⃣ TUTORES
# ========================================
echo -e "\n📋 1. TESTANDO ENDPOINT: /tutores/"
echo "------------------------------------"

# CREATE
echo "✅ CREATE - Criando tutor..."
TUTOR1=$(curl -s -X POST $BASE_URL/tutores/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "phone": "(11) 98765-4321",
    "cpf": "123.456.789-00",
    "address": "Rua das Flores, 123",
    "city": "São Paulo",
    "state": "SP",
    "cep": "01234-567"
  }')

TUTOR_ID=$(echo $TUTOR1 | jq -r '.id')
echo "   ID criado: $TUTOR_ID"

# CREATE outro tutor
TUTOR2=$(curl -s -X POST $BASE_URL/tutores/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Santos",
    "email": "maria@example.com",
    "phone": "(21) 99876-5432",
    "cpf": "987.654.321-00",
    "city": "Rio de Janeiro",
    "state": "RJ"
  }')

TUTOR2_ID=$(echo $TUTOR2 | jq -r '.id')
echo "   ID criado: $TUTOR2_ID"

# READ - List
echo "✅ READ - Listando tutores..."
curl -s $BASE_URL/tutores/ | jq '.results[] | {id, name, email, phone}'

# READ - Detail
echo "✅ READ - Detalhes do tutor $TUTOR_ID..."
curl -s $BASE_URL/tutores/$TUTOR_ID/ | jq '{id, name, email, city, state}'

# UPDATE
echo "✅ UPDATE - Atualizando tutor..."
curl -s -X PATCH $BASE_URL/tutores/$TUTOR_ID/ \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "(11) 91234-5678",
    "address": "Rua Nova, 456"
  }' | jq '{id, name, phone, address}'

# SEARCH
echo "✅ SEARCH - Buscando 'João'..."
curl -s "$BASE_URL/tutores/?search=João" | jq '.results[] | {id, name}'


# ========================================
# 2️⃣ ANIMAIS
# ========================================
echo -e "\n🐕 2. TESTANDO ENDPOINT: /animais/"
echo "------------------------------------"

# CREATE
echo "✅ CREATE - Criando animal..."
ANIMAL1=$(curl -s -X POST $BASE_URL/animais/ \
  -H "Content-Type: application/json" \
  -d "{
    \"tutor\": $TUTOR_ID,
    \"name\": \"Rex\",
    \"species\": \"CACHORRO\",
    \"breed\": \"Golden Retriever\",
    \"gender\": \"M\",
    \"age\": 5,
    \"weight\": 28.5,
    \"color\": \"Dourado\"
  }")

ANIMAL_ID=$(echo $ANIMAL1 | jq -r '.id')
echo "   ID criado: $ANIMAL_ID"

# CREATE outro animal
ANIMAL2=$(curl -s -X POST $BASE_URL/animais/ \
  -H "Content-Type: application/json" \
  -d "{
    \"tutor\": $TUTOR2_ID,
    \"name\": \"Mimi\",
    \"species\": \"GATO\",
    \"breed\": \"Siamês\",
    \"gender\": \"F\",
    \"age\": 3,
    \"weight\": 4.2,
    \"color\": \"Branco e Marrom\"
  }")

ANIMAL2_ID=$(echo $ANIMAL2 | jq -r '.id')
echo "   ID criado: $ANIMAL2_ID"

# READ - List
echo "✅ READ - Listando animais..."
curl -s $BASE_URL/animais/ | jq '.results[] | {id, name, species, breed, age, weight}'

# READ - Detail com tutor
echo "✅ READ - Detalhes do animal com tutor..."
curl -s $BASE_URL/animais/$ANIMAL_ID/ | jq '{id, name, species, breed, tutor_name}'

# UPDATE
echo "✅ UPDATE - Atualizando peso..."
curl -s -X PATCH $BASE_URL/animais/$ANIMAL_ID/ \
  -H "Content-Type: application/json" \
  -d '{"weight": 30.0, "age": 6}' | jq '{id, name, age, weight}'

# FILTER
echo "✅ FILTER - Filtrando por espécie CACHORRO..."
curl -s "$BASE_URL/animais/?species=CACHORRO" | jq '.results[] | {id, name, species}'


# ========================================
# 3️⃣ VETERINÁRIOS
# ========================================
echo -e "\n👨‍⚕️ 3. TESTANDO ENDPOINT: /veterinarios/"
echo "------------------------------------"

# CREATE
echo "✅ CREATE - Criando veterinário..."
VET1=$(curl -s -X POST $BASE_URL/veterinarios/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Carlos Mendes",
    "email": "carlos@vetclinic.com",
    "phone": "(11) 3456-7890",
    "crmv": "SP-12345",
    "specialties": "Cirurgia, Ortopedia",
    "bio": "Veterinário com 15 anos de experiência",
    "status": "ATIVO"
  }')

VET_ID=$(echo $VET1 | jq -r '.id')
echo "   ID criado: $VET_ID"

# CREATE outro vet
VET2=$(curl -s -X POST $BASE_URL/veterinarios/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dra. Ana Paula",
    "email": "ana@vetclinic.com",
    "phone": "(11) 3456-7891",
    "crmv": "SP-54321",
    "specialties": "Dermatologia, Cardiologia",
    "status": "ATIVO"
  }')

VET2_ID=$(echo $VET2 | jq -r '.id')
echo "   ID criado: $VET2_ID"

# READ
echo "✅ READ - Listando veterinários..."
curl -s $BASE_URL/veterinarios/ | jq '.results[] | {id, name, crmv, specialties, status}'

# UPDATE
echo "✅ UPDATE - Atualizando status..."
curl -s -X PATCH $BASE_URL/veterinarios/$VET_ID/ \
  -H "Content-Type: application/json" \
  -d '{"work_start_hour": "08:00", "work_end_hour": "18:00"}' | jq '{id, name, work_start_hour, work_end_hour}'


# ========================================
# 4️⃣ CONSULTAS
# ========================================
echo -e "\n📅 4. TESTANDO ENDPOINT: /consultas/"
echo "------------------------------------"

# CREATE
echo "✅ CREATE - Agendando consulta..."
CONSULTA1=$(curl -s -X POST $BASE_URL/consultas/ \
  -H "Content-Type: application/json" \
  -d "{
    \"animal\": $ANIMAL_ID,
    \"veterinario\": $VET_ID,
    \"data\": \"2025-12-31\",
    \"hora\": \"10:00\",
    \"status\": \"AGENDADA\",
    \"tipo\": \"ROTINA\",
    \"motivo\": \"Check-up anual\",
    \"valor\": \"150.00\"
  }")

CONSULTA_ID=$(echo $CONSULTA1 | jq -r '.id')
echo "   ID criado: $CONSULTA_ID"

# CREATE consulta de emergência
CONSULTA2=$(curl -s -X POST $BASE_URL/consultas/ \
  -H "Content-Type: application/json" \
  -d "{
    \"animal\": $ANIMAL2_ID,
    \"veterinario\": $VET2_ID,
    \"data\": \"2025-12-30\",
    \"hora\": \"14:30\",
    \"status\": \"CONFIRMADA\",
    \"tipo\": \"EMERGENCIA\",
    \"motivo\": \"Vômitos e diarreia\"
  }")

CONSULTA2_ID=$(echo $CONSULTA2 | jq -r '.id')

# READ
echo "✅ READ - Listando consultas..."
curl -s $BASE_URL/consultas/ | jq '.results[] | {id, animal_name, veterinario_name, data, hora, status, tipo}'

# UPDATE
echo "✅ UPDATE - Atualizando status e diagnóstico..."
curl -s -X PATCH $BASE_URL/consultas/$CONSULTA_ID/ \
  -H "Content-Type: application/json" \
  -d '{
    "status": "CONCLUIDA",
    "diagnostico": "Animal saudável",
    "prescricao": "Continuar com ração atual"
  }' | jq '{id, status, diagnostico, prescricao}'

# FILTER
echo "✅ FILTER - Filtrando por status AGENDADA..."
curl -s "$BASE_URL/consultas/?status=AGENDADA" | jq '.results[] | {id, animal_name, status}'


# ========================================
# 5️⃣ VACINAS
# ========================================
echo -e "\n💉 5. TESTANDO ENDPOINT: /vacinas/"
echo "------------------------------------"

# CREATE
echo "✅ CREATE - Registrando vacina..."
VACINA1=$(curl -s -X POST $BASE_URL/vacinas/ \
  -H "Content-Type: application/json" \
  -d "{
    \"animal\": $ANIMAL_ID,
    \"nome_vacina\": \"V10\",
    \"fabricante\": \"Zoetis\",
    \"lote\": \"ABC123\",
    \"data_aplicacao\": \"2025-12-30\",
    \"data_proxima_dose\": \"2026-12-30\",
    \"dose\": \"1ª dose\",
    \"veterinario_responsavel\": \"Dr. Carlos Mendes\"
  }")

VACINA_ID=$(echo $VACINA1 | jq -r '.id')
echo "   ID criado: $VACINA_ID"

# CREATE vacina antirrábica
curl -s -X POST $BASE_URL/vacinas/ \
  -H "Content-Type: application/json" \
  -d "{
    \"animal\": $ANIMAL2_ID,
    \"nome_vacina\": \"Antirrábica\",
    \"data_aplicacao\": \"2025-11-15\",
    \"data_proxima_dose\": \"2026-11-15\",
    \"dose\": \"Reforço anual\"
  }" > /dev/null

# READ
echo "✅ READ - Listando vacinas..."
curl -s $BASE_URL/vacinas/ | jq '.results[] | {id, animal_name, nome_vacina, data_aplicacao, data_proxima_dose}'

# UPDATE
echo "✅ UPDATE - Atualizando observações..."
curl -s -X PATCH $BASE_URL/vacinas/$VACINA_ID/ \
  -H "Content-Type: application/json" \
  -d '{"observacoes": "Animal reagiu bem à vacina"}' | jq '{id, nome_vacina, observacoes}'


# ========================================
# 6️⃣ EXAMES
# ========================================
echo -e "\n🔬 6. TESTANDO ENDPOINT: /exames/"
echo "------------------------------------"

# CREATE
echo "✅ CREATE - Solicitando exame..."
EXAME1=$(curl -s -X POST $BASE_URL/exames/ \
  -H "Content-Type: application/json" \
  -d "{
    \"animal\": $ANIMAL_ID,
    \"veterinario_solicitante\": $VET_ID,
    \"tipo_exame\": \"Hemograma Completo\",
    \"data_solicitacao\": \"2025-12-30\",
    \"status\": \"SOLICITADO\",
    \"laboratorio\": \"Labvet\",
    \"valor\": \"180.00\"
  }")

EXAME_ID=$(echo $EXAME1 | jq -r '.id')
echo "   ID criado: $EXAME_ID"

# CREATE exame de imagem
curl -s -X POST $BASE_URL/exames/ \
  -H "Content-Type: application/json" \
  -d "{
    \"animal\": $ANIMAL2_ID,
    \"veterinario_solicitante\": $VET2_ID,
    \"tipo_exame\": \"Raio-X\",
    \"data_solicitacao\": \"2025-12-29\",
    \"data_realizacao\": \"2025-12-30\",
    \"status\": \"CONCLUIDO\",
    \"resultado\": \"Sem alterações ósseas\"
  }" > /dev/null

# READ
echo "✅ READ - Listando exames..."
curl -s $BASE_URL/exames/ | jq '.results[] | {id, animal_name, tipo_exame, status, data_solicitacao}'

# UPDATE
echo "✅ UPDATE - Atualizando resultado..."
curl -s -X PATCH $BASE_URL/exames/$EXAME_ID/ \
  -H "Content-Type: application/json" \
  -d '{
    "status": "CONCLUIDO",
    "data_realizacao": "2025-12-31",
    "resultado": "Valores dentro da normalidade"
  }' | jq '{id, status, resultado}'


# ========================================
# 7️⃣ PLANOS DE SAÚDE
# ========================================
echo -e "\n💳 7. TESTANDO ENDPOINT: /planos/"
echo "------------------------------------"

# CREATE
echo "✅ CREATE - Criando plano..."
PLANO1=$(curl -s -X POST $BASE_URL/planos/ \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Plano Básico",
    "descricao": "Cobertura básica para consultas e vacinas",
    "preco_mensal": "99.90",
    "consultas_mes": 2,
    "vacinas_ano": 4,
    "telemedicina_incluida": false,
    "atendimento_24h": false,
    "is_active": true
  }')

PLANO_ID=$(echo $PLANO1 | jq -r '.id')
echo "   ID criado: $PLANO_ID"

# CREATE plano premium
PLANO2=$(curl -s -X POST $BASE_URL/planos/ \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Plano Premium",
    "descricao": "Cobertura completa",
    "preco_mensal": "249.90",
    "consultas_ilimitadas": true,
    "exames_ilimitados": true,
    "vacinas_ilimitadas": true,
    "telemedicina_incluida": true,
    "atendimento_24h": true,
    "internacao_incluida": true,
    "desconto_cirurgia": 50,
    "is_active": true
  }')

PLANO2_ID=$(echo $PLANO2 | jq -r '.id')

# READ
echo "✅ READ - Listando planos..."
curl -s $BASE_URL/planos/ | jq '.results[] | {id, nome, preco_mensal, is_active}'


# ========================================
# 8️⃣ CONTRATOS DE PLANO
# ========================================
echo -e "\n📄 8. TESTANDO ENDPOINT: /contratos/"
echo "------------------------------------"

# CREATE
echo "✅ CREATE - Criando contrato..."
CONTRATO1=$(curl -s -X POST $BASE_URL/contratos/
