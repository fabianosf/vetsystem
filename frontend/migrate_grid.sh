#!/bin/bash
echo "🔄 Migrando Grid v1 para Grid2..."

# Substituir imports
find src -name "*.tsx" -type f -exec sed -i '' \
  's/import { Grid } from/import { Grid2 as Grid } from/g' {} \;

# Remover prop 'item' e converter xs, sm, md, lg para size
find src -name "*.tsx" -type f -exec sed -i '' \
  -e 's/<Grid item xs={\([0-9]*\)} sm={\([0-9]*\)} md={\([0-9]*\)}/<Grid size={{ xs: \1, sm: \2, md: \3 }}/g' \
  -e 's/<Grid item xs={\([0-9]*\)} sm={\([0-9]*\)}/<Grid size={{ xs: \1, sm: \2 }}/g' \
  -e 's/<Grid item xs={\([0-9]*\)} md={\([0-9]*\)}/<Grid size={{ xs: \1, md: \2 }}/g' \
  -e 's/<Grid item xs={\([0-9]*\)}/<Grid size={{ xs: \1 }}/g' \
  -e 's/<Grid item md={\([0-9]*\)}/<Grid size={{ md: \1 }}/g' \
  -e 's/<Grid item>/<Grid>/g' {} \;

echo "✅ Migração concluída!"
