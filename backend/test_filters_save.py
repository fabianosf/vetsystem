#!/usr/bin/env python3
"""
Testa filtros da API VetSystem e salva resultado em arquivo
Execute: python test_filters_save.py
"""
import requests
import json
from datetime import datetime
import sys

BASE_URL = "http://127.0.0.1:8000/api"
OUTPUT_FILE = f"teste_filtros_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"

class Logger:
    """Logger que escreve simultaneamente no terminal e arquivo"""
    def __init__(self, filename):
        self.terminal = sys.stdout
        self.log = open(filename, 'w', encoding='utf-8')
    
    def write(self, message):
        self.terminal.write(message)
        self.log.write(message)
    
    def flush(self):
        self.terminal.flush()
        self.log.flush()
    
    def close(self):
        self.log.close()


def test(logger, name, endpoint, params=None):
    """Testa um endpoint e loga o resultado"""
    logger.write(f"\n{'='*70}\n")
    logger.write(f"✓ {name}\n")
    logger.write(f"{'='*70}\n")
    
    try:
        url = f"{BASE_URL}/{endpoint}/"
        logger.write(f"URL: {url}\n")
        logger.write(f"Parâmetros: {params}\n")
        
        r = requests.get(url, params=params, timeout=10)
        
        logger.write(f"Status HTTP: {r.status_code}\n")
        
        if r.status_code == 200:
            data = r.json()
            count = data.get('count', 0)
            logger.write(f"Total de registros encontrados: {count}\n")
            
            results = data.get('results', [])
            if results:
                # Limitar a 3 resultados para não poluir o arquivo
                limited_results = results[:3]
                logger.write(f"\nPrimeiros {len(limited_results)} resultado(s):\n")
                logger.write("-" * 70 + "\n")
                
                for i, item in enumerate(limited_results, 1):
                    logger.write(f"\nResultado {i}:\n")
                    logger.write(json.dumps(item, indent=2, ensure_ascii=False))
                    logger.write("\n")
                
                if count > 3:
                    logger.write(f"\n... e mais {count - 3} registro(s)\n")
            else:
                logger.write("\nNenhum resultado encontrado.\n")
        else:
            logger.write(f"ERRO HTTP {r.status_code}\n")
            logger.write(f"Resposta: {r.text[:500]}\n")
    
    except requests.exceptions.Timeout:
        logger.write("ERRO: Timeout na requisição\n")
    except requests.exceptions.ConnectionError:
        logger.write("ERRO: Não foi possível conectar à API\n")
    except Exception as e:
        logger.write(f"ERRO: {str(e)}\n")


def main():
    """Função principal"""
    logger = Logger(OUTPUT_FILE)
    
    # Cabeçalho
    logger.write("=" * 70 + "\n")
    logger.write("      RELATÓRIO DE TESTES - VETSYSTEM API\n")
    logger.write("=" * 70 + "\n")
    logger.write(f"Data/Hora: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}\n")
    logger.write(f"Base URL: {BASE_URL}\n")
    logger.write(f"Arquivo de saída: {OUTPUT_FILE}\n")
    logger.write("=" * 70 + "\n\n")
    
    # Verificar se API está rodando
    logger.write("Verificando conectividade com a API...\n")
    try:
        r = requests.get(BASE_URL, timeout=5)
        logger.write("✓ API está respondendo!\n\n")
    except:
        logger.write("✗ ERRO: API não está rodando!\n")
        logger.write("Execute: python manage.py runserver\n")
        logger.close()
        return
    
    # ==========================================
    # ESTATÍSTICAS GERAIS
    # ==========================================
    logger.write("\n" + "=" * 70 + "\n")
    logger.write("ESTATÍSTICAS GERAIS\n")
    logger.write("=" * 70 + "\n\n")
    
    endpoints_stats = {
        "tutores": "Tutores",
        "animais": "Animais",
        "veterinarios": "Veterinários",
        "consultas": "Consultas",
        "vacinas": "Vacinas",
        "exames": "Exames",
        "planos": "Planos de Saúde",
        "contratos": "Contratos",
        "clinicas": "Clínicas"
    }
    
    for endpoint, name in endpoints_stats.items():
        try:
            r = requests.get(f"{BASE_URL}/{endpoint}/", timeout=5)
            if r.status_code == 200:
                count = r.json().get('count', 0)
                logger.write(f"  ✓ {name:20} {count:5} registros\n")
            else:
                logger.write(f"  ✗ {name:20} Erro HTTP {r.status_code}\n")
        except:
            logger.write(f"  ✗ {name:20} ERRO\n")
    
    # ==========================================
    # TESTES DE TUTORES
    # ==========================================
    logger.write("\n\n" + "=" * 70 + "\n")
    logger.write("TESTES - TUTORES\n")
    logger.write("=" * 70 + "\n")
    
    test(logger, "Buscar tutores com 'Silva' no nome", "tutores", {"name": "Silva"})
    test(logger, "Buscar tutores com 'João'", "tutores", {"search": "João"})
    test(logger, "Tutores ordenados por nome (A-Z)", "tutores", {"ordering": "name"})
    test(logger, "Tutores com animais", "tutores", {"has_animals": "true"})
    test(logger, "Tutores sem animais", "tutores", {"has_animals": "false"})
    
    # ==========================================
    # TESTES DE ANIMAIS
    # ==========================================
    logger.write("\n\n" + "=" * 70 + "\n")
    logger.write("TESTES - ANIMAIS\n")
    logger.write("=" * 70 + "\n")
    
    test(logger, "Filtrar apenas CACHORROS", "animais", {"species": "CACHORRO"})
    test(logger, "Filtrar apenas GATOS", "animais", {"species": "GATO"})
    test(logger, "Animais machos", "animais", {"gender": "M"})
    test(logger, "Animais fêmeas", "animais", {"gender": "F"})
    test(logger, "Animais com raça 'Golden'", "animais", {"breed": "Golden"})
    test(logger, "Animais entre 3-7 anos", "animais", {"age_min": 3, "age_max": 7})
    test(logger, "Animais com mais de 20kg", "animais", {"weight_min": 20})
    test(logger, "Cachorros machos com mais de 20kg", "animais", {
        "species": "CACHORRO",
        "gender": "M",
        "weight_min": 20
    })
    test(logger, "Animais ordenados por peso (maior→menor)", "animais", {"ordering": "-weight"})
    test(logger, "Animais ordenados por nome (A-Z)", "animais", {"ordering": "name"})
    
    # ==========================================
    # TESTES DE CONSULTAS
    # ==========================================
    logger.write("\n\n" + "=" * 70 + "\n")
    logger.write("TESTES - CONSULTAS\n")
    logger.write("=" * 70 + "\n")
    
    test(logger, "Consultas AGENDADAS", "consultas", {"status": "AGENDADA"})
    test(logger, "Consultas CONFIRMADAS", "consultas", {"status": "CONFIRMADA"})
    test(logger, "Consultas CONCLUÍDAS", "consultas", {"status": "CONCLUIDA"})
    test(logger, "Consultas de ROTINA", "consultas", {"tipo": "ROTINA"})
    test(logger, "Consultas de EMERGÊNCIA", "consultas", {"tipo": "EMERGENCIA"})
    test(logger, "Consultas após 01/12/2025", "consultas", {"data_after": "2025-12-01"})
    test(logger, "Consultas de dezembro/2025", "consultas", {"mes": 12, "ano": 2025})
    test(logger, "Consultas urgentes (filtro customizado)", "consultas", {"urgente": "true"})
    test(logger, "Consultas pendentes (filtro customizado)", "consultas", {"pendente": "true"})
    
    # ==========================================
    # TESTES DE VACINAS
    # ==========================================
    logger.write("\n\n" + "=" * 70 + "\n")
    logger.write("TESTES - VACINAS\n")
    logger.write("=" * 70 + "\n")
    
    test(logger, "Todas as vacinas", "vacinas", {})
    test(logger, "Vacinas V10", "vacinas", {"nome_vacina": "V10"})
    test(logger, "Vacinas atrasadas", "vacinas", {"atrasada": "true"})
    test(logger, "Vacinas próximas (30 dias)", "vacinas", {"proxima": "true"})
    test(logger, "Vacinas aplicadas após 01/11/2025", "vacinas", {"data_aplicacao_after": "2025-11-01"})
    
    # ==========================================
    # TESTES DE EXAMES
    # ==========================================
    logger.write("\n\n" + "=" * 70 + "\n")
    logger.write("TESTES - EXAMES\n")
    logger.write("=" * 70 + "\n")
    
    test(logger, "Todos os exames", "exames", {})
    test(logger, "Exames SOLICITADOS", "exames", {"status": "SOLICITADO"})
    test(logger, "Exames CONCLUÍDOS", "exames", {"status": "CONCLUIDO"})
    test(logger, "Exames pendentes", "exames", {"pendente": "true"})
    test(logger, "Exames de Hemograma", "exames", {"tipo_exame": "Hemograma"})
    
    # ==========================================
    # TESTES DE PLANOS
    # ==========================================
    logger.write("\n\n" + "=" * 70 + "\n")
    logger.write("TESTES - PLANOS\n")
    logger.write("=" * 70 + "\n")
    
    test(logger, "Todos os planos", "planos", {})
    test(logger, "Planos até R$ 150", "planos", {"preco_max": 150})
    test(logger, "Planos entre R$ 100 e R$ 200", "planos", {"preco_min": 100, "preco_max": 200})
    test(logger, "Planos com telemedicina", "planos", {"telemedicina": "true"})
    test(logger, "Planos com atendimento 24h", "planos", {"atendimento_24h": "true"})
    
    # ==========================================
    # TESTES DE CONTRATOS
    # ==========================================
    logger.write("\n\n" + "=" * 70 + "\n")
    logger.write("TESTES - CONTRATOS\n")
    logger.write("=" * 70 + "\n")
    
    test(logger, "Todos os contratos", "contratos", {})
    test(logger, "Contratos ATIVOS", "contratos", {"ativo": "true"})
    
    # ==========================================
    # TESTES DE CLÍNICAS
    # ==========================================
    logger.write("\n\n" + "=" * 70 + "\n")
    logger.write("TESTES - CLÍNICAS\n")
    logger.write("=" * 70 + "\n")
    
    test(logger, "Todas as clínicas", "clinicas", {})
    test(logger, "Clínicas com atendimento 24h", "clinicas", {"atendimento_24h": "true"})
    test(logger, "Clínicas que atendem emergência", "clinicas", {"atende_emergencia": "true"})
    test(logger, "Clínicas com internação", "clinicas", {"tem_internacao": "true"})
    
    # ==========================================
    # TESTES DE PAGINAÇÃO
    # ==========================================
    logger.write("\n\n" + "=" * 70 + "\n")
    logger.write("TESTES - PAGINAÇÃO\n")
    logger.write("=" * 70 + "\n")
    
    test(logger, "Animais - Página 1 (padrão 20 itens)", "animais", {"page": 1})
    test(logger, "Animais - 5 por página", "animais", {"page_size": 5})
    test(logger, "Animais - 10 por página", "animais", {"page_size": 10})
    
    # ==========================================
    # TESTES DE ORDENAÇÃO
    # ==========================================
    logger.write("\n\n" + "=" * 70 + "\n")
    logger.write("TESTES - ORDENAÇÃO\n")
    logger.write("=" * 70 + "\n")
    
    test(logger, "Animais por nome (A-Z)", "animais", {"ordering": "name"})
    test(logger, "Animais por nome (Z-A)", "animais", {"ordering": "-name"})
    test(logger, "Animais por peso (crescente)", "animais", {"ordering": "weight"})
    test(logger, "Animais por peso (decrescente)", "animais", {"ordering": "-weight"})
    test(logger, "Consultas por data (mais recentes primeiro)", "consultas", {"ordering": "-data"})
    
    # ==========================================
    # FINALIZAR
    # ==========================================
    logger.write("\n\n" + "=" * 70 + "\n")
    logger.write("TESTES CONCLUÍDOS\n")
    logger.write("=" * 70 + "\n")
    logger.write(f"Relatório salvo em: {OUTPUT_FILE}\n")
    logger.write(f"Data/Hora conclusão: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}\n")
    logger.write("=" * 70 + "\n")
    
    logger.close()
    print(f"\n✅ Relatório completo salvo em: {OUTPUT_FILE}")
    print(f"📄 Para visualizar: cat {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
