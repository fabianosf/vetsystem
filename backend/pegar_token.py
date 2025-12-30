#!/usr/bin/env python
"""
Pegar token de autenticação
"""
import requests

response = requests.post("http://127.0.0.1:8000/api/auth/login/", json={
    "username": "admin",
    "password": "admin123"
})

if response.status_code == 200:
    data = response.json()
    token = data['access']
    print("\n" + "="*70)
    print("🔑 SEU TOKEN:")
    print("="*70)
    print(token)
    print("="*70)
    print("\n📋 Use em curl:")
    print(f'curl -H "Authorization: Bearer {token}" http://127.0.0.1:8000/api/animais/')
    print("\n")
else:
    print(f"❌ Erro: {response.status_code}")
    print(response.text)
