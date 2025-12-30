#!/bin/bash

echo "🔧 Corrigindo atributos 'size' duplicados..."

# Encontrar e corrigir todos os casos de size duplicado
find src -name "*.tsx" -type f | while read file; do
    # Verificar se tem size duplicado
    if grep -q 'size={{.*}} size={{' "$file"; then
        echo "   🔧 Corrigindo: $file"
        
        # Padrão: <Grid size={{ xs: 12 }} size={{ lg: 4 }}>
        # Resultado: <Grid size={{ xs: 12, lg: 4 }}>
        
        sed -i -E 's/size=\{\{ xs: ([0-9]+) \}\} size=\{\{ lg: ([0-9]+) \}\}/size={{ xs: \1, lg: \2 }}/g' "$file"
        sed -i -E 's/size=\{\{ xs: ([0-9]+) \}\} size=\{\{ md: ([0-9]+) \}\}/size={{ xs: \1, md: \2 }}/g' "$file"
        sed -i -E 's/size=\{\{ xs: ([0-9]+) \}\} size=\{\{ sm: ([0-9]+) \}\}/size={{ xs: \1, sm: \2 }}/g' "$file"
        sed -i -E 's/size=\{\{ sm: ([0-9]+) \}\} size=\{\{ md: ([0-9]+) \}\}/size={{ sm: \1, md: \2 }}/g' "$file"
        sed -i -E 's/size=\{\{ md: ([0-9]+) \}\} size=\{\{ lg: ([0-9]+) \}\}/size={{ md: \1, lg: \2 }}/g' "$file"
        
        # Caso mais complexo: 3 atributos
        sed -i -E 's/size=\{\{ xs: ([0-9]+) \}\} size=\{\{ sm: ([0-9]+) \}\} size=\{\{ md: ([0-9]+) \}\}/size={{ xs: \1, sm: \2, md: \3 }}/g' "$file"
        sed -i -E 's/size=\{\{ xs: ([0-9]+) \}\} size=\{\{ md: ([0-9]+) \}\} size=\{\{ lg: ([0-9]+) \}\}/size={{ xs: \1, md: \2, lg: \3 }}/g' "$file"
    fi
done

echo "✅ Correção concluída!"
