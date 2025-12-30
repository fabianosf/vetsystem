#!/usr/bin/env python3
"""
Script para aplicar correções automaticamente no serializers.py e views.py
"""
import re
import os

def backup_file(filepath):
    """Criar backup do arquivo"""
    if os.path.exists(filepath):
        backup_path = f"{filepath}.backup"
        with open(filepath, 'r') as f:
            content = f.read()
        with open(backup_path, 'w') as f:
            f.write(content)
        print(f"✅ Backup criado: {backup_path}")
        return content
    return None

def fix_serializers():
    """Corrigir api/serializers.py"""
    filepath = "api/serializers.py"
    print(f"\n🔧 Corrigindo {filepath}...")
    
    content = backup_file(filepath)
    if not content:
        print(f"❌ Arquivo {filepath} não encontrado!")
        return False
    
    # Procurar a classe ConsultaSerializer
    consulta_pattern = r'class ConsultaSerializer\([^)]+\):(.*?)(?=class\s+\w+|$)'
    
    # Novo código do serializer
    new_serializer = '''class ConsultaSerializer(serializers.ModelSerializer):
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
'''
    
    # Substituir a classe antiga
    if 'class ConsultaSerializer' in content:
        # Encontrar onde termina a classe ConsultaSerializer
        lines = content.split('\n')
        new_lines = []
        inside_consulta = False
        class_indent = 0
        
        i = 0
        while i < len(lines):
            line = lines[i]
            
            # Detectar início da classe ConsultaSerializer
            if 'class ConsultaSerializer' in line:
                inside_consulta = True
                class_indent = len(line) - len(line.lstrip())
                # Adicionar a nova implementação
                new_lines.append(new_serializer)
                i += 1
                continue
            
            # Se estamos dentro da classe, pular até encontrar outra classe ou fim
            if inside_consulta:
                # Detectar fim da classe (próxima classe ou fim do arquivo)
                if line.strip() and not line.strip().startswith('#'):
                    current_indent = len(line) - len(line.lstrip())
                    if current_indent <= class_indent and (line.strip().startswith('class ') or i == len(lines) - 1):
                        inside_consulta = False
                        new_lines.append(line)
                    # Caso contrário, pular a linha (está dentro da classe antiga)
                else:
                    # Linha vazia ou comentário, pular
                    pass
            else:
                new_lines.append(line)
            
            i += 1
        
        # Escrever arquivo corrigido
        with open(filepath, 'w') as f:
            f.write('\n'.join(new_lines))
        
        print(f"✅ {filepath} corrigido!")
        return True
    else:
        print(f"⚠️  ConsultaSerializer não encontrado em {filepath}")
        return False

def fix_views():
    """Corrigir api/views.py"""
    filepath = "api/views.py"
    print(f"\n🔧 Corrigindo {filepath}...")
    
    content = backup_file(filepath)
    if not content:
        print(f"❌ Arquivo {filepath} não encontrado!")
        return False
    
    # Novo código da ViewSet
    new_viewset = '''class ConsultaViewSet(viewsets.ModelViewSet):
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
'''
    
    # Substituir a classe antiga
    if 'class ConsultaViewSet' in content:
        lines = content.split('\n')
        new_lines = []
        inside_consulta = False
        class_indent = 0
        
        i = 0
        while i < len(lines):
            line = lines[i]
            
            # Detectar início da classe ConsultaViewSet
            if 'class ConsultaViewSet' in line:
                inside_consulta = True
                class_indent = len(line) - len(line.lstrip())
                # Adicionar a nova implementação
                new_lines.append(new_viewset)
                i += 1
                continue
            
            # Se estamos dentro da classe, pular até encontrar outra classe ou fim
            if inside_consulta:
                if line.strip() and not line.strip().startswith('#'):
                    current_indent = len(line) - len(line.lstrip())
                    if current_indent <= class_indent and (line.strip().startswith('class ') or i == len(lines) - 1):
                        inside_consulta = False
                        new_lines.append(line)
                # Caso contrário, pular
            else:
                new_lines.append(line)
            
            i += 1
        
        # Escrever arquivo corrigido
        with open(filepath, 'w') as f:
            f.write('\n'.join(new_lines))
        
        print(f"✅ {filepath} corrigido!")
        return True
    else:
        print(f"⚠️  ConsultaViewSet não encontrado em {filepath}")
        return False

def main():
    print("🚀 Aplicando correções automáticas...")
    print("=" * 50)
    
    # Verificar se estamos no diretório correto
    if not os.path.exists('api'):
        print("❌ Erro: Execute este script na pasta backend/")
        return
    
    # Aplicar correções
    serializers_ok = fix_serializers()
    views_ok = fix_views()
    
    print("\n" + "=" * 50)
    if serializers_ok and views_ok:
        print("✅ Todas as correções aplicadas com sucesso!")
        print("\n📋 Próximos passos:")
        print("   1. Reinicie o servidor Django:")
        print("      python manage.py runserver")
        print("\n   2. Teste o endpoint:")
        print("      curl http://localhost:8000/api/consultas/")
    else:
        print("⚠️  Algumas correções falharam. Verifique os backups.")
        print("   Backups criados:")
        print("   - api/serializers.py.backup")
        print("   - api/views.py.backup")

if __name__ == '__main__':
    main()
