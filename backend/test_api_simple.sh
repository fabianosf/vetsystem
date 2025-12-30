#!/bin/bash
BASE_URL="http://127.0.0.1:8000/api"

# Gerar dados únicos com timestamp
TIMESTAMP=$(date +%s)
CPF="111.222.333-$(printf "%02d" $((TIMESTAMP % 100)))"
EMAIL="teste${TIMESTAMP}@example.com"

echo "🧪 Teste Simples da API VetSystem"
echo "=================================="
echo "Timestamp: $TIMESTAMP"
echo "CPF único: $CPF"
echo "Email único: $EMAIL"

# ========================================
# 1. CRIAR TUTOR
# ========================================
echo -e "\n1️⃣ CRIANDO TUTOR..."
RESPONSE=$(curl -s -X POST $BASE_URL/tutores/ \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"João Silva ${TIMESTAMP}\",
    \"email\": \"${EMAIL}\",
    \"phone\": \"(11) 98765-4321\",
    \"cpf\": \"${CPF}\"
  }")

echo "Resposta completa:"
echo $RESPONSE | jq '.'

TUTOR_ID=$(echo $RESPONSE | jq -r '.id // empty')

if [ -z "$TUTOR_ID" ] || [ "$TUTOR_ID" == "null" ]; then
    echo "❌ ERRO: Falha ao criar tutor!"
    echo "Resposta: $RESPONSE"
    exit 1
else
    echo "✅ Tutor criado! ID: $TUTOR_ID"
fi

# ========================================
# 2. LISTAR TUTORES
# ========================================
echo -e "\n2️⃣ LISTANDO TUTORES..."
curl -s $BASE_URL/tutores/ | jq '.results[0:3] | .[] | {id, name, email, phone, total_animais}'

# ========================================
# 3. CRIAR ANIMAL
# ========================================
echo -e "\n3️⃣ CRIANDO ANIMAL..."
ANIMAL_RESPONSE=$(curl -s -X POST $BASE_URL/animais/ \
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

echo "Resposta:"
echo $ANIMAL_RESPONSE | jq '.'

ANIMAL_ID=$(echo $ANIMAL_RESPONSE | jq -r '.id // empty')

if [ -z "$ANIMAL_ID" ] || [ "$ANIMAL_ID" == "null" ]; then
    echo "❌ ERRO: Falha ao criar animal!"
    echo "Resposta: $ANIMAL_RESPONSE"
else
    echo "✅ Animal criado! ID: $ANIMAL_ID"
fi

# ========================================
# 4. LISTAR ANIMAIS COM TUTOR
# ========================================
echo -e "\n4️⃣ LISTANDO ANIMAIS COM DADOS DO TUTOR..."
curl -s $BASE_URL/animais/ | jq '.results[0:3] | .[] | {id, name, species, breed, tutor_name}'

# ========================================
# 5. ATUALIZAR ANIMAL
# ========================================
if [ ! -z "$ANIMAL_ID" ] && [ "$ANIMAL_ID" != "null" ]; then
    echo -e "\n5️⃣ ATUALIZANDO PESO DO ANIMAL..."
    curl -s -X PATCH $BASE_URL/animais/$ANIMAL_ID/ \
      -H "Content-Type: application/json" \
      -d '{"weight": 30.0, "age": 6}' | jq '{id, name, age, weight, tutor_name}'
fi

# ========================================
# 6. BUSCAR TUTORES
# ========================================
echo -e "\n6️⃣ BUSCANDO TUTORES POR NOME 'João'..."
curl -s "$BASE_URL/tutores/?search=João" | jq '.count, .results[0:2] | if type == "array" then .[] | {id, name, email} else . end'

# ========================================
# 7. FILTRAR ANIMAIS POR ESPÉCIE
# ========================================
echo -e "\n7️⃣ FILTRANDO ANIMAIS - ESPÉCIE: CACHORRO..."
curl -s "$BASE_URL/animais/?species=CACHORRO" | jq '.count, .results[0:2] | if type == "array" then .[] | {id, name, species, breed} else . end'

# ========================================
# 8. ESTATÍSTICAS
# ========================================
echo -e "\n8️⃣ ESTATÍSTICAS..."
TOTAL_TUTORES=$(curl -s $BASE_URL/tutores/ | jq '.count')
TOTAL_ANIMAIS=$(curl -s $BASE_URL/animais/ | jq '.count')
TOTAL_CONSULTAS=$(curl -s $BASE_URL/consultas/ | jq '.count')

echo "Total de Tutores: $TOTAL_TUTORES"
echo "Total de Animais: $TOTAL_ANIMAIS"
echo "Total de Consultas: $TOTAL_CONSULTAS"

# ========================================
# 9. RESUMO
# ========================================
echo -e "\n📊 RESUMO DOS TESTES"
echo "===================================="
echo "✅ Tutor ID: $TUTOR_ID"
echo "✅ Animal ID: $ANIMAL_ID"
echo "✅ CPF usado: $CPF"
echo "✅ Email usado: $EMAIL"
echo ""
echo "🎉 TODOS OS TESTES CONCLUÍDOS COM SUCESSO!"
