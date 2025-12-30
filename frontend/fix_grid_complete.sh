#!/bin/bash

echo "🚀 Fix COMPLETO do Material UI Grid v2"
echo "======================================"

# Backup de segurança
echo "💾 Criando backups..."
find src -name "*.tsx" -type f -exec cp {} {}.gridbackup \;

# Contador
fixed=0

# Processar cada arquivo
find src -name "*.tsx" -type f | while read file; do
    if grep -q "Grid" "$file"; then
        echo "🔧 Processando: $file"
        
        # 1. Substituir import
        sed -i 's/from "@mui\/material"/from "@mui\/material"/g' "$file"
        sed -i 's/import { Grid,/import { Grid2 as Grid,/g' "$file"
        sed -i 's/import { Grid }/import { Grid2 as Grid }/g' "$file"
        sed -i 's/import {Grid/import {Grid2 as Grid/g' "$file"
        
        # 2. Remover 'item' prop
        sed -i 's/<Grid item /<Grid /g' "$file"
        
        # 3. Converter TODAS as combinações possíveis para size
        # 4 props
        sed -i -E 's/ xs=\{([0-9]+)\} sm=\{([0-9]+)\} md=\{([0-9]+)\} lg=\{([0-9]+)\}/ size={{ xs: \1, sm: \2, md: \3, lg: \4 }}/g' "$file"
        
        # 3 props
        sed -i -E 's/ xs=\{([0-9]+)\} sm=\{([0-9]+)\} md=\{([0-9]+)\}/ size={{ xs: \1, sm: \2, md: \3 }}/g' "$file"
        sed -i -E 's/ xs=\{([0-9]+)\} md=\{([0-9]+)\} lg=\{([0-9]+)\}/ size={{ xs: \1, md: \2, lg: \3 }}/g' "$file"
        sed -i -E 's/ sm=\{([0-9]+)\} md=\{([0-9]+)\} lg=\{([0-9]+)\}/ size={{ sm: \1, md: \2, lg: \3 }}/g' "$file"
        
        # 2 props
        sed -i -E 's/ xs=\{([0-9]+)\} sm=\{([0-9]+)\}/ size={{ xs: \1, sm: \2 }}/g' "$file"
        sed -i -E 's/ xs=\{([0-9]+)\} md=\{([0-9]+)\}/ size={{ xs: \1, md: \2 }}/g' "$file"
        sed -i -E 's/ xs=\{([0-9]+)\} lg=\{([0-9]+)\}/ size={{ xs: \1, lg: \2 }}/g' "$file"
        sed -i -E 's/ sm=\{([0-9]+)\} md=\{([0-9]+)\}/ size={{ sm: \1, md: \2 }}/g' "$file"
        sed -i -E 's/ sm=\{([0-9]+)\} lg=\{([0-9]+)\}/ size={{ sm: \1, lg: \2 }}/g' "$file"
        sed -i -E 's/ md=\{([0-9]+)\} lg=\{([0-9]+)\}/ size={{ md: \1, lg: \2 }}/g' "$file"
        
        # 1 prop
        sed -i -E 's/ xs=\{([0-9]+)\}/ size={{ xs: \1 }}/g' "$file"
        sed -i -E 's/ sm=\{([0-9]+)\}/ size={{ sm: \1 }}/g' "$file"
        sed -i -E 's/ md=\{([0-9]+)\}/ size={{ md: \1 }}/g' "$file"
        sed -i -E 's/ lg=\{([0-9]+)\}/ size={{ lg: \1 }}/g' "$file"
        
        # Corrigir size duplicados (caso existam)
        sed -i -E 's/size=\{\{ xs: ([0-9]+) \}\} size=\{\{ lg: ([0-9]+) \}\}/size={{ xs: \1, lg: \2 }}/g' "$file"
        sed -i -E 's/size=\{\{ xs: ([0-9]+) \}\} size=\{\{ md: ([0-9]+) \}\}/size={{ xs: \1, md: \2 }}/g' "$file"
        sed -i -E 's/size=\{\{ xs: ([0-9]+) \}\} size=\{\{ sm: ([0-9]+) \}\}/size={{ xs: \1, sm: \2 }}/g' "$file"
        
        fixed=$((fixed + 1))
    fi
done

echo ""
echo "======================================"
echo "✅ Fix completo aplicado em $fixed arquivos!"
echo ""
echo "🧹 Limpando backups..."
find src -name "*.gridbackup" -delete
echo "✅ Backups removidos"
echo ""
echo "🔍 Verificando se ainda existem problemas..."

# Verificar se ainda tem props antigas
if grep -rq " xs={" src/ --include="*.tsx" 2>/dev/null; then
    echo "⚠️  Ainda existem props xs={}:"
    grep -rn " xs={" src/ --include="*.tsx" 2>/dev/null | head -5
fi

if grep -rq " lg={" src/ --include="*.tsx" 2>/dev/null; then
    echo "⚠️  Ainda existem props lg={}:"
    grep -rn " lg={" src/ --include="*.tsx" 2>/dev/null | head -5
fi

if grep -rq "<Grid item" src/ --include="*.tsx" 2>/dev/null; then
    echo "⚠️  Ainda existem Grid item:"
    grep -rn "<Grid item" src/ --include="*.tsx" 2>/dev/null | head -5
fi

echo ""
echo "🎉 Processo finalizado!"
