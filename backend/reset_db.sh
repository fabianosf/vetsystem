#!/bin/bash

# SCRIPT COMPLETO DE RESET

echo "🔄 Dropando banco..."
sudo -u postgres psql -c "DROP DATABASE IF EXISTS vetsystem_db;"
sudo -u postgres psql -c "CREATE DATABASE vetsystem_db;"

echo "🗑️ Removendo migrations antigas..."
rm -rf api/migrations/0*.py
rm -rf accounts/migrations/0*.py

echo "📝 Criando migration do accounts..."
python manage.py makemigrations accounts

echo "📝 Criando migration do api..."
python manage.py makemigrations api

echo "⚙️ Aplicando migrations..."
python manage.py migrate

echo "✅ Pronto! Agora crie o superuser:"
echo "python manage.py createsuperuser"
