#!/bin/bash

# Encontrar todos os arquivos TypeScript/React
find src -name "*.tsx" -type f | while read file; do
    echo "Corrigindo: $file"
    
    # Backup
    cp "$file" "$file.bak"
    
    # Substituir Grid por Grid2
    sed -i 's/import { Grid,/import { Grid2 as Grid,/g' "$file"
    sed -i 's/import { Grid }/import { Grid2 as Grid }/g' "$file"
    sed -i 's/} from '\''@mui\/material'\'';/} from '\''@mui\/material'\'';/g' "$file"
    
    # Remover prop 'item' e converter para size
    sed -i 's/<Grid item xs={12} sm={6} md={4}/<Grid size={{ xs: 12, sm: 6, md: 4 }}/g' "$file"
    sed -i 's/<Grid item xs={12} sm={6}/<Grid size={{ xs: 12, sm: 6 }}/g' "$file"
    sed -i 's/<Grid item xs={12} md={6}/<Grid size={{ xs: 12, md: 6 }}/g' "$file"
    sed -i 's/<Grid item xs={12} md={4}/<Grid size={{ xs: 12, md: 4 }}/g' "$file"
    sed -i 's/<Grid item xs={12} md={3}/<Grid size={{ xs: 12, md: 3 }}/g' "$file"
    sed -i 's/<Grid item xs={12} md={8}/<Grid size={{ xs: 12, md: 8 }}/g' "$file"
    sed -i 's/<Grid item xs={12} md={9}/<Grid size={{ xs: 12, md: 9 }}/g' "$file"
    sed -i 's/<Grid item xs={12}/<Grid size={{ xs: 12 }}/g' "$file"
    sed -i 's/<Grid item md={6}/<Grid size={{ md: 6 }}/g' "$file"
    sed -i 's/<Grid item md={4}/<Grid size={{ md: 4 }}/g' "$file"
done

echo "✅ Correção aplicada!"
echo "Removendo backups..."
find src -name "*.bak" -delete
