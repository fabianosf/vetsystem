#!/usr/bin/env python
"""
Teste do Sistema de Diagnóstico por IA
"""
import requests
import os

BASE_URL = "http://127.0.0.1:8000/api"

def test_diagnostico():
    print("="*60)
    print("🧪 TESTE DO SISTEMA DE DIAGNÓSTICO POR IA")
    print("="*60)
    
    # 1. Login - testar diferentes endpoints
    print("\n1️⃣ Testando autenticação...")
    
    # Tentar endpoint comum de auth
    auth_endpoints = [
        "/api/auth/login/",
        "/api/auth/token/",
        "/api/token/",
        "/api/login/",
    ]
    
    token = None
    headers = {}
    
    for endpoint in auth_endpoints:
        try:
            print(f"   Tentando: {endpoint}")
            response = requests.post(f"http://127.0.0.1:8000{endpoint}", json={
                "username": "admin",
                "password": "admin123"
            })
            if response.status_code == 200:
                data = response.json()
                token = data.get('access') or data.get('token') or data.get('key')
                if token:
                    headers = {"Authorization": f"Bearer {token}"}
                    print(f"✅ Login realizado com sucesso!")
                    print(f"   Token: {token[:30]}...")
                    break
        except Exception as e:
            continue
    
    if not token:
        print("❌ Não foi possível fazer login")
        print("\n💡 Teste sem autenticação:")
        print("   Acessando endpoints públicos...")
    
    # 2. Testar endpoint de diagnósticos
    print("\n2️⃣ Testando endpoint de diagnósticos...")
    try:
        response = requests.get(f"{BASE_URL}/diagnosticos/", headers=headers)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            diagnosticos = data.get('results', [])
            print(f"✅ Endpoint funcionando! Total: {len(diagnosticos)}")
            if diagnosticos:
                for i, diag in enumerate(diagnosticos[:3], 1):
                    print(f"   {i}. {diag.get('animal_name')} - {diag.get('classe_predita')} ({diag.get('confianca', 0)*100:.1f}%)")
        elif response.status_code == 404:
            print("❌ Endpoint /api/diagnosticos/ não encontrado")
        elif response.status_code == 401:
            print("⚠️ Autenticação necessária")
        else:
            print(f"⚠️ Status: {response.status_code}")
    except Exception as e:
        print(f"❌ Erro: {e}")
    
    # 3. Listar todas as URLs disponíveis
    print("\n3️⃣ URLs disponíveis no sistema:")
    try:
        response = requests.get("http://127.0.0.1:8000/api/")
        if response.status_code == 200:
            print("✅ API Root acessível")
            print("   Acesse: http://127.0.0.1:8000/api/")
    except:
        pass
    
    print("\n" + "="*60)
    print("📋 PRÓXIMOS PASSOS:")
    print("="*60)
    print("\n1. Acesse o Django Admin:")
    print("   http://127.0.0.1:8000/admin/")
    print("\n2. Veja a API Root:")
    print("   http://127.0.0.1:8000/api/")
    print("\n3. Veja a documentação Swagger:")
    print("   http://127.0.0.1:8000/api/docs/")
    print("\n" + "="*60)

if __name__ == "__main__":
    test_diagnostico()
