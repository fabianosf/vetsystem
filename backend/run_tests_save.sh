#!/bin/bash

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT_FILE="resultado_testes_${TIMESTAMP}.txt"

echo "🧪 Executando testes e salvando em: $OUTPUT_FILE"
echo ""

python test_filters.py > "$OUTPUT_FILE" 2>&1

echo "✅ Testes concluídos!"
echo "📄 Arquivo: $OUTPUT_FILE"
echo ""
echo "Para visualizar:"
echo "  cat $OUTPUT_FILE"
echo "  less $OUTPUT_FILE"
echo "  code $OUTPUT_FILE"
