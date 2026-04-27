#!/bin/bash

# Script pour initialiser la base de données MySQL

echo ""
echo "========================================"
echo "Smart Safe Zone - Database Setup"
echo "========================================"
echo ""

# Vérifier si mysql est disponible
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL Client n'est pas installé"
    echo "Veuillez installer MySQL Client"
    exit 1
fi

echo "📋 Configuration de la base de données"
echo ""

read -p "Entrez votre utilisateur MySQL (défaut: root): " MYSQL_USER
MYSQL_USER=${MYSQL_USER:-root}

read -p "Entrez le port MySQL (défaut: 3306): " MYSQL_PORT
MYSQL_PORT=${MYSQL_PORT:-3306}

read -sp "Entrez votre mot de passe MySQL (si nécessaire, appuyez sur Entrée si aucun): " MYSQL_PASSWORD
echo ""

echo ""
echo "🔄 Début de l'initialisation de la base de données..."
echo ""

# Créer la base et les tables
if [ -z "$MYSQL_PASSWORD" ]; then
    mysql -u $MYSQL_USER -h localhost -P $MYSQL_PORT < init.sql
else
    mysql -u $MYSQL_USER -p$MYSQL_PASSWORD -h localhost -P $MYSQL_PORT < init.sql
fi

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de l'initialisation de la base de données"
    exit 1
fi

echo "✅ Base de données créée avec succès"
echo ""
echo "🌱 Insertion des données de test..."
echo ""

# Insérer les données de test
if [ -z "$MYSQL_PASSWORD" ]; then
    mysql -u $MYSQL_USER -h localhost -P $MYSQL_PORT smart_safezone < seed.sql
else
    mysql -u $MYSQL_USER -p$MYSQL_PASSWORD -h localhost -P $MYSQL_PORT smart_safezone < seed.sql
fi

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de l'insertion des données"
    exit 1
fi

echo "✅ Données de test insérées avec succès"
echo ""
echo "📝 Veuillez mettre à jour le fichier .env avec vos identifiants MySQL:"
echo "   - DATABASE_USER=$MYSQL_USER"
echo "   - DATABASE_PASSWORD=votre_mot_de_passe"
echo "   - DATABASE_HOST=localhost"
echo "   - DATABASE_PORT=$MYSQL_PORT"
echo ""
echo "✨ Configuration terminée!"
echo ""
