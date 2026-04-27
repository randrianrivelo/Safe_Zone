#!/bin/bash

# Script pour démarrer le serveur FastAPI Smart Safe Zone

cd "$(dirname "$0")"
cd app

echo ""
echo "========================================"
echo "Smart Safe Zone - Backend Server"
echo "========================================"
echo ""

# Vérifier si Python est installé
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 n'est pas installé"
    exit 1
fi

# Vérifier si pip est installé
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 n'est pas installé"
    exit 1
fi

# Installer/mettre à jour les dépendances
echo "📦 Installation des dépendances..."
pip3 install -r ../requirements.txt

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de l'installation des dépendances"
    exit 1
fi

echo "✅ Dépendances installées avec succès"
echo ""
echo "🚀 Démarrage du serveur FastAPI..."
echo ""
echo "📝 Documentation disponible à: http://localhost:8000/docs"
echo ""

# Lancer le serveur
python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
