#!/bin/bash

echo "🚀 VetSystem - Correção Completa"
echo "================================="
echo ""

#############################################
# PARTE 1: CORRIGIR GRID V2 NO FRONTEND
#############################################
echo "1️⃣ Corrigindo Material UI Grid v2..."
cd ~/Desktop/vetsystem/frontend

# Encontrar todos os arquivos com Grid
echo "   📁 Procurando arquivos com Grid..."
FILES=$(find src -name "*.tsx" -type f | grep -v node_modules)

for file in $FILES; do
    if grep -q "Grid" "$file"; then
        echo "   🔧 Corrigindo: $file"
        
        # Backup
        cp "$file" "$file.bak"
        
        # 1. Trocar import de Grid por Grid2
        sed -i 's/import { Grid,/import { Grid2 as Grid,/g' "$file"
        sed -i 's/import { Grid }/import { Grid2 as Grid }/g' "$file"
        sed -i 's/from '\''@mui\/material'\''/from '\''@mui\/material'\''/g' "$file"
        
        # 2. Remover a prop 'item'
        sed -i 's/<Grid item /<Grid /g' "$file"
        
        # 3. Converter props xs, sm, md, lg para size
        # Combinações múltiplas
        sed -i 's/xs={12} sm={6} md={4} lg={3}/size={{ xs: 12, sm: 6, md: 4, lg: 3 }}/g' "$file"
        sed -i 's/xs={12} sm={6} md={4}/size={{ xs: 12, sm: 6, md: 4 }}/g' "$file"
        sed -i 's/xs={12} md={6}/size={{ xs: 12, md: 6 }}/g' "$file"
        sed -i 's/xs={12} md={4}/size={{ xs: 12, md: 4 }}/g' "$file"
        sed -i 's/xs={12} md={3}/size={{ xs: 12, md: 3 }}/g' "$file"
        sed -i 's/xs={12} md={8}/size={{ xs: 12, md: 8 }}/g' "$file"
        sed -i 's/xs={12} md={9}/size={{ xs: 12, md: 9 }}/g' "$file"
        sed -i 's/xs={12} sm={6}/size={{ xs: 12, sm: 6 }}/g' "$file"
        
        # Props individuais
        sed -i 's/ xs={12}/ size={{ xs: 12 }}/g' "$file"
        sed -i 's/ xs={6}/ size={{ xs: 6 }}/g' "$file"
        sed -i 's/ sm={6}/ size={{ sm: 6 }}/g' "$file"
        sed -i 's/ md={3}/ size={{ md: 3 }}/g' "$file"
        sed -i 's/ md={4}/ size={{ md: 4 }}/g' "$file"
        sed -i 's/ md={6}/ size={{ md: 6 }}/g' "$file"
        sed -i 's/ md={8}/ size={{ md: 8 }}/g' "$file"
        sed -i 's/ md={9}/ size={{ md: 9 }}/g' "$file"
        sed -i 's/ lg={3}/ size={{ lg: 3 }}/g' "$file"
        sed -i 's/ lg={4}/ size={{ lg: 4 }}/g' "$file"
    fi
done

echo "   ✅ Grid v2 aplicado!"
echo ""

#############################################
# PARTE 2: CORRIGIR ERRO 500 NO BACKEND
#############################################
echo "2️⃣ Corrigindo erro 500 em /api/consultas/..."
cd ~/Desktop/vetsystem/backend

# Verificar se o serializer existe
if [ -f "api/serializers.py" ]; then
    echo "   📝 Atualizando api/serializers.py..."
    
    # Backup
    cp api/serializers.py api/serializers.py.backup
    
    # Criar novo serializer com tratamento de erro
    cat > api/serializers_consulta_fix.txt << 'EOF'

# ADICIONE ESTE CÓDIGO ao ConsultaSerializer em api/serializers.py:

class ConsultaSerializer(serializers.ModelSerializer):
    # Campos calculados com tratamento de erro
    animal_nome = serializers.SerializerMethodField()
    tutor_nome = serializers.SerializerMethodField()
    veterinario_nome = serializers.SerializerMethodField()
    clinica_nome = serializers.SerializerMethodField()
    
    class Meta:
        model = Consulta
        fields = '__all__'
    
    def get_animal_nome(self, obj):
        try:
            return obj.animal.name if obj.animal else None
        except Exception:
            return None
    
    def get_tutor_nome(self, obj):
        try:
            if obj.animal and hasattr(obj.animal, 'tutor') and obj.animal.tutor:
                return obj.animal.tutor.name
            return None
        except Exception:
            return None
    
    def get_veterinario_nome(self, obj):
        try:
            return obj.veterinario.name if obj.veterinario else None
        except Exception:
            return None
    
    def get_clinica_nome(self, obj):
        try:
            return obj.clinica.nome if obj.clinica else None
        except Exception:
            return None
EOF
    
    echo "   ⚠️  Verifique: api/serializers_consulta_fix.txt"
fi

# Verificar se a view existe
if [ -f "api/views.py" ]; then
    echo "   📝 Atualizando api/views.py..."
    
    # Backup
    cp api/views.py api/views.py.backup
    
    cat > api/views_consulta_fix.txt << 'EOF'

# ATUALIZE o ConsultaViewSet em api/views.py:

class ConsultaViewSet(viewsets.ModelViewSet):
    serializer_class = ConsultaSerializer
    
    def get_queryset(self):
        """Otimizar com select_related para evitar N+1 queries"""
        try:
            return Consulta.objects.select_related(
                'animal',
                'animal__tutor',
                'veterinario',
                'clinica'
            ).all().order_by('-data', '-hora')
        except Exception as e:
            print(f"❌ Erro no get_queryset: {e}")
            return Consulta.objects.none()
    
    def list(self, request, *args, **kwargs):
        """Tratamento de erro no list"""
        try:
            queryset = self.get_queryset()
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'detail': f'Erro ao listar consultas: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
EOF
    
    echo "   ⚠️  Verifique: api/views_consulta_fix.txt"
fi

echo ""
echo "✅ Correções aplicadas!"
echo ""
echo "📋 Próximos passos:"
echo "   1. No backend, atualize manualmente:"
echo "      - api/serializers.py (veja api/serializers_consulta_fix.txt)"
echo "      - api/views.py (veja api/views_consulta_fix.txt)"
echo ""
echo "   2. Reinicie os servidores:"
echo "      Backend:  cd backend && python manage.py runserver"
echo "      Frontend: cd frontend && npm run dev"
echo ""

# Limpar backups do frontend
echo "🧹 Limpando arquivos temporários..."
find ~/Desktop/vetsystem/frontend/src -name "*.bak" -delete
echo "✅ Limpeza concluída!"

