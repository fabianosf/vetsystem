#!/usr/bin/env python3
"""
Script de testes para filtros da API VetSystem
Execute: python test_filters.py
"""
import requests
import json
from datetime import date
from typing import Dict, Any

BASE_URL = "http://127.0.0.1:8000/api"


class Colors:
    """Cores para output no terminal"""
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'


def print_section(title: str):
    """Imprime cabeçalho de seção"""
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{title}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}")


def print_test(name: str):
    """Imprime nome do teste"""
    print(f"\n{Colors.OKCYAN}✓ {name}{Colors.ENDC}")


def print_result(data: Dict[str, Any], keys: list = None):
    """Imprime resultado formatado"""
    if 'count' in data:
        print(f"  {Colors.OKGREEN}Total encontrado: {data['count']}{Colors.ENDC}")
    
    if 'results' in data and data['results']:
        results = data['results'][:3]  # Limitar a 3 resultados
        for item in results:
            if keys:
                filtered = {k: item.get(k) for k in keys if k in item}
                print(f"  {Colors.OKBLUE}{json.dumps(filtered, ensure_ascii=False)}{Colors.ENDC}")
            else:
                print(f"  {Colors.OKBLUE}{json.dumps(item, ensure_ascii=False)}{Colors.ENDC}")


def test_endpoint(endpoint: str, params: dict = None, keys: list = None):
    """Testa um endpoint com parâmetros"""
    try:
        response = requests.get(f"{BASE_URL}/{endpoint}/", params=params)
        if response.status_code == 200:
            data = response.json()
            print_result(data, keys)
            return data
        else:
            print(f"  {Colors.FAIL}Erro {response.status_code}: {response.text}{Colors.ENDC}")
            return None
    except Exception as e:
        print(f"  {Colors.FAIL}Erro: {str(e)}{Colors.ENDC}")
        return None


# ==========================================
# TESTES DE TUTORES
# ==========================================
def test_tutores():
    print_section("📋 TESTES DE FILTROS - TUTORES")
    
    print_test("Buscar tutores com 'Silva' no nome")
    test_endpoint("tutores", {"name": "Silva"}, ["id", "name", "email"])
    
    print_test("Buscar tutores com 'João'")
    test_endpoint("tutores", {"search": "João"}, ["id", "name", "email"])
    
    print_test("Tutores ordenados por nome (A-Z)")
    test_endpoint("tutores", {"ordering": "name"}, ["id", "name"])
    
    print_test("Tutores com animais")
    test_endpoint("tutores", {"has_animals": "true"}, ["id", "name", "total_animais"])


# ==========================================
# TESTES DE ANIMAIS
# ==========================================
def test_animais():
    print_section("🐕 TESTES DE FILTROS - ANIMAIS")
    
    print_test("Filtrar apenas CACHORROS")
    test_endpoint("animais", {"species": "CACHORRO"}, ["id", "name", "species", "breed"])
    
    print_test("Filtrar apenas GATOS")
    test_endpoint("animais", {"species": "GATO"}, ["id", "name", "species", "breed"])
    
    print_test("Animais machos")
    test_endpoint("animais", {"gender": "M"}, ["id", "name", "gender", "species"])
    
    print_test("Animais com raça 'Golden'")
    test_endpoint("animais", {"breed": "Golden"}, ["id", "name", "breed"])
    
    print_test("Animais entre 3-7 anos")
    test_endpoint("animais", {"age_min": 3, "age_max": 7}, ["id", "name", "age", "species"])
    
    print_test("Animais com mais de 20kg")
    test_endpoint("animais", {"weight_min": 20}, ["id", "name", "weight", "breed"])
    
    print_test("Cachorros machos com mais de 20kg")
    test_endpoint("animais", {
        "species": "CACHORRO",
        "gender": "M",
        "weight_min": 20
    }, ["id", "name", "species", "gender", "weight"])
    
    print_test("Animais ordenados por peso (desc)")
    test_endpoint("animais", {"ordering": "-weight"}, ["id", "name", "weight"])


# ==========================================
# TESTES DE CONSULTAS
# ==========================================
def test_consultas():
    print_section("📅 TESTES DE FILTROS - CONSULTAS")
    
    print_test("Consultas AGENDADAS")
    test_endpoint("consultas", {"status": "AGENDADA"}, ["id", "animal_name", "data", "status"])
    
    print_test("Consultas CONCLUÍDAS")
    test_endpoint("consultas", {"status": "CONCLUIDA"}, ["id", "animal_name", "data", "status"])
    
    print_test("Consultas de ROTINA")
    test_endpoint("consultas", {"tipo": "ROTINA"}, ["id", "animal_name", "tipo", "data"])
    
    print_test("Consultas de EMERGÊNCIA")
    test_endpoint("consultas", {"tipo": "EMERGENCIA"}, ["id", "animal_name", "tipo", "status"])
    
    print_test("Consultas após 01/12/2025")
    test_endpoint("consultas", {"data_after": "2025-12-01"}, ["id", "animal_name", "data"])
    
    print_test("Consultas de dezembro/2025")
    test_endpoint("consultas", {"mes": 12, "ano": 2025}, ["id", "animal_name", "data", "status"])
    
    print_test("Consultas urgentes")
    test_endpoint("consultas", {"urgente": "true"}, ["id", "animal_name", "tipo", "status"])
    
    print_test("Consultas pendentes")
    test_endpoint("consultas", {"pendente": "true"}, ["id", "animal_name", "data", "status"])


# ==========================================
# TESTES DE VACINAS
# ==========================================
def test_vacinas():
    print_section("💉 TESTES DE FILTROS - VACINAS")
    
    print_test("Vacinas V10")
    test_endpoint("vacinas", {"nome_vacina": "V10"}, ["id", "animal_name", "nome_vacina", "data_aplicacao"])
    
    print_test("Vacinas atrasadas")
    test_endpoint("vacinas", {"atrasada": "true"}, ["id", "animal_name", "nome_vacina", "data_proxima_dose"])
    
    print_test("Vacinas próximas (30 dias)")
    test_endpoint("vacinas", {"proxima": "true"}, ["id", "animal_name", "nome_vacina", "data_proxima_dose"])
    
    print_test("Vacinas aplicadas após 01/11/2025")
    test_endpoint("vacinas", {"data_aplicacao_after": "2025-11-01"}, ["id", "animal_name", "data_aplicacao"])


# ==========================================
# TESTES DE EXAMES
# ==========================================
def test_exames():
    print_section("🔬 TESTES DE FILTROS - EXAMES")
    
    print_test("Exames SOLICITADOS")
    test_endpoint("exames", {"status": "SOLICITADO"}, ["id", "animal_name", "tipo_exame", "status"])
    
    print_test("Exames CONCLUÍDOS")
    test_endpoint("exames", {"status": "CONCLUIDO"}, ["id", "animal_name", "tipo_exame", "status"])
    
    print_test("Exames pendentes")
    test_endpoint("exames", {"pendente": "true"}, ["id", "animal_name", "tipo_exame", "status"])
    
    print_test("Exames de Hemograma")
    test_endpoint("exames", {"tipo_exame": "Hemograma"}, ["id", "animal_name", "tipo_exame"])


# ==========================================
# TESTES DE PLANOS
# ==========================================
def test_planos():
    print_section("💳 TESTES DE FILTROS - PLANOS")
    
    print_test("Planos até R$ 150")
    test_endpoint("planos", {"preco_max": 150}, ["id", "nome", "preco_mensal"])
    
    print_test("Planos entre R$ 100 e R$ 200")
    test_endpoint("planos", {"preco_min": 100, "preco_max": 200}, ["id", "nome", "preco_mensal"])
    
    print_test("Planos com telemedicina")
    test_endpoint("planos", {"telemedicina": "true"}, ["id", "nome", "telemedicina_incluida"])
    
    print_test("Planos com atendimento 24h")
    test_endpoint("planos", {"atendimento_24h": "true"}, ["id", "nome", "atendimento_24h"])


# ==========================================
# TESTES DE CONTRATOS
# ==========================================
def test_contratos():
    print_section("📄 TESTES DE FILTROS - CONTRATOS")
    
    print_test("Contratos ATIVOS")
    test_endpoint("contratos", {"status": "ATIVO"}, ["id", "tutor_name", "plano_nome", "status"])
    
    print_test("Contratos ativos (filtro customizado)")
    test_endpoint("contratos", {"ativo": "true"}, ["id", "tutor_name", "plano_nome", "status"])


# ==========================================
# TESTES DE CLÍNICAS
# ==========================================
def test_clinicas():
    print_section("🏥 TESTES DE FILTROS - CLÍNICAS")
    
    print_test("Clínicas com atendimento 24h")
    test_endpoint("clinicas", {"atendimento_24h": "true"}, ["id", "nome", "cidade", "atendimento_24h"])
    
    print_test("Clínicas que atendem emergência")
    test_endpoint("clinicas", {"atende_emergencia": "true"}, ["id", "nome", "atende_emergencia"])
    
    print_test("Clínicas com internação")
    test_endpoint("clinicas", {"tem_internacao": "true"}, ["id", "nome", "tem_internacao"])


# ==========================================
# TESTES DE PAGINAÇÃO
# ==========================================
def test_paginacao():
    print_section("📄 TESTES DE PAGINAÇÃO")
    
    print_test("Animais - Página 1 (padrão)")
    data = test_endpoint("animais", {"page": 1})
    if data:
        print(f"  {Colors.WARNING}Next: {data.get('next')}{Colors.ENDC}")
        print(f"  {Colors.WARNING}Previous: {data.get('previous')}{Colors.ENDC}")
    
    print_test("Animais - 5 por página")
    data = test_endpoint("animais", {"page_size": 5})
    if data:
        print(f"  {Colors.WARNING}Itens retornados: {len(data.get('results', []))}{Colors.ENDC}")


# ==========================================
# TESTES DE ORDENAÇÃO
# ==========================================
def test_ordenacao():
    print_section("📊 TESTES DE ORDENAÇÃO")
    
    print_test("Animais ordenados por nome (A-Z)")
    test_endpoint("animais", {"ordering": "name"}, ["name", "species"])
    
    print_test("Animais ordenados por nome (Z-A)")
    test_endpoint("animais", {"ordering": "-name"}, ["name", "species"])
    
    print_test("Animais ordenados por peso (maior→menor)")
    test_endpoint("animais", {"ordering": "-weight"}, ["name", "weight"])
    
    print_test("Consultas ordenadas por data e horário")
    test_endpoint("consultas", {"ordering": "data,horario"}, ["animal_name", "data", "horario"])


# ==========================================
# ESTATÍSTICAS GERAIS
# ==========================================
def test_estatisticas():
    print_section("📊 ESTATÍSTICAS GERAIS")
    
    endpoints = ["tutores", "animais", "veterinarios", "consultas", "vacinas", "exames", "planos", "contratos", "clinicas"]
    
    for endpoint in endpoints:
        try:
            response = requests.get(f"{BASE_URL}/{endpoint}/")
            if response.status_code == 200:
                data = response.json()
                count = data.get('count', 0)
                print(f"  {Colors.OKGREEN}✓ {endpoint.capitalize()}: {count} registros{Colors.ENDC}")
        except:
            print(f"  {Colors.FAIL}✗ {endpoint.capitalize()}: Erro{Colors.ENDC}")


# ==========================================
# MAIN
# ==========================================
def main():
    print(f"{Colors.BOLD}{Colors.HEADER}")
    print("╔════════════════════════════════════════════════════════════╗")
    print("║         TESTES DE FILTROS - VETSYSTEM API                  ║")
    print("╚════════════════════════════════════════════════════════════╝")
    print(f"{Colors.ENDC}")
    
    # Verificar se a API está rodando
    try:
        response = requests.get(BASE_URL)
        print(f"{Colors.OKGREEN}✓ API está rodando!{Colors.ENDC}")
    except:
        print(f"{Colors.FAIL}✗ ERRO: API não está rodando em {BASE_URL}{Colors.ENDC}")
        print(f"{Colors.WARNING}Execute: python manage.py runserver{Colors.ENDC}")
        return
    
    # Executar testes
    test_estatisticas()
    test_tutores()
    test_animais()
    test_consultas()
    test_vacinas()
    test_exames()
    test_planos()
    test_contratos()
    test_clinicas()
    test_paginacao()
    test_ordenacao()
    
    # Resumo final
    print_section("✅ TESTES CONCLUÍDOS")
    print(f"{Colors.OKGREEN}Todos os testes de filtros foram executados!{Colors.ENDC}")
    print(f"{Colors.OKCYAN}Base URL: {BASE_URL}{Colors.ENDC}")


if __name__ == "__main__":
    main()
