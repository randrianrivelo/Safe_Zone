# Smart Safe Zone - Système de Gestion des Zones de Sécurité 🌍

### Une application complète pour gérer les refuges en cas de catastrophe naturelle

---

## 📋 Vue d'ensemble

**Smart Safe Zone** est une application full-stack pour gérer les zones de refuge et les itinéraires d'évacuation lors de catastrophes naturelles (cyclones, inondations, glissements de terrain).

### Fonctionnalités principales

- **Gestion des refuges** 🏘️
  - Liste complète des refuges avec capacité
  - Informations détaillées (eau, électricité, services médicaux)
  - Suivi de l'occupation en temps réel

- **Pathfinding intelligent** 🗺️
  - Algorithme A* pour trouver le chemin optimal
  - Calcul de distance (Haversine)
  - Évitement des zones dangereuses
  - Recherche du refuge le plus proche

- **Gestion des zones dangereuses** ⚠️
  - Zones d'inondation, glissements de terrain, vents
  - Niveaux de sévérité
  - Expiration automatique des alertes

- **Authentification** 🔐
  - Inscription et login avec JWT
  - Rôles (citoyen, administrateur)
  - Hachage sécurisé des mots de passe (bcrypt)

---

## 🏗️ Architecture

### Backend (FastAPI + MySQL)
```
backend/
├── app/
│   ├── models/          # Modèles SQLAlchemy ORM
│   ├── schemas/         # Schémas Pydantic
│   ├── services/        # Logique métier
│   ├── routers/         # Endpoints FastAPI
│   ├── main.py          # Application principale
│   ├── config.py        # Configuration
│   ├── database.py      # Configuration SQLAlchemy
│   └── utils.py         # Utilitaires (JWT, hash)
├── database/
│   ├── init.sql         # Schéma de base
│   ├── seed.sql         # Données de test
│   └── setup.sh/.bat    # Scripts d'initialisation
├── requirements.txt     # Dépendances Python
├── .env                 # Configuration (à personnaliser)
├── run.sh/.bat          # Scripts de démarrage
└── README.md

### Frontend (React + Vite)
frontend/
├── src/
│   ├── components/      # Composants React
│   ├── pages/           # Pages
│   ├── services/        # Services API
│   ├── hooks/           # Hooks personnalisés
│   ├── styles/          # CSS
│   ├── utils/           # Utilitaires
│   └── App.jsx
├── package.json
├── vite.config.js
└── index.html
```

---

## 🚀 Installation et Démarrage

### Prérequis

- **MySQL** 8.0+ installé et en cours d'exécution
- **Python** 3.9+
- **Node.js** 16+ (pour le frontend)

### 1️⃣ Configuration de la Base de Données

#### Windows
```bash
cd database
setup.bat
```

#### Linux/Mac
```bash
cd database
chmod +x setup.sh
./setup.sh
```

Suivez les instructions et entrez vos identifiants MySQL.

### 2️⃣ Setup Backend

```bash
cd backend

# Mettre à jour le fichier .env
# Éditer .env avec vos identifiants MySQL
```

#### Configuration du .env
```env
DATABASE_USER=root
DATABASE_PASSWORD=votre_mot_de_passe
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=smart_safezone

SECRET_KEY=votre-clé-secrète-très-sûre-changez-en-production
```

#### Démarrer le serveur backend

**Windows:**
```bash
run.bat
```

**Linux/Mac:**
```bash
chmod +x run.sh
./run.sh
```

Le serveur sera disponible à `http://localhost:8000`

### 3️⃣ Setup Frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

L'application sera disponible à `http://localhost:5173`

---

## 📚 API Documentation

Une fois le backend démarré, accédez à la documentation interactive:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

### Endpoints principaux

#### Authentification
- `POST /api/auth/register` - Créer un compte
- `POST /api/auth/login` - Se connecter

#### Refuges
- `GET /api/refuges` - Lister tous les refuges
- `GET /api/refuges/active` - Refuges actifs
- `GET /api/refuges/nearby?latitude=...&longitude=...` - Refuges à proximité
- `POST /api/refuges` - Créer un refuge
- `PUT /api/refuges/{id}` - Modifier un refuge
- `DELETE /api/refuges/{id}` - Supprimer un refuge
- `PUT /api/refuges/{id}/occupancy` - Mettre à jour l'occupation

#### Pathfinding
- `GET /api/pathfinding/path?start_id=...&end_id=...` - Trouver un chemin
- `GET /api/pathfinding/nearest-refuge?latitude=...&longitude=...` - Refuge le plus proche
- `GET /api/pathfinding/distance?lat1=...&lon1=...&lat2=...&lon2=...` - Calculer distance

#### Routes et Nœuds
- `GET /api/routes/nodes` - Tous les nœuds
- `GET /api/routes/edges` - Toutes les routes
- `POST /api/routes/nodes` - Créer un nœud
- `POST /api/routes/edges` - Créer une route

#### Zones Dangereuses
- `GET /api/danger-zones` - Lister les zones dangereuses
- `POST /api/danger-zones` - Créer une zone
- `PUT /api/danger-zones/{id}` - Modifier une zone
- `DELETE /api/danger-zones/{id}` - Supprimer une zone

---

## 📊 Modèles de Données

### Users
```sql
id, username, email, password_hash, role, phone, created_at
```

### Refuges
```sql
id, name, description, latitude, longitude, capacity, current_occupancy
type, address, is_active, has_water, has_electricity, has_medical, contact_phone
created_at, updated_at
```

### DangerZones
```sql
id, name, description, latitude, longitude, radius
danger_type, severity, is_active, reported_at, expires_at
```

### Nodes (Graph nodes)
```sql
id, latitude, longitude, name, node_type
```

### Edges (Graph edges/routes)
```sql
id, node_from, node_to, distance, road_name, road_type
is_passable, danger_level, flood_risk, last_updated
```

---

## 🔧 Technologies Utilisées

### Backend
- **FastAPI** - Framework web moderne et rapide
- **SQLAlchemy** - ORM pour Python
- **Pydantic** - Validation des données
- **PyMySQL** - Connecteur MySQL pur Python
- **python-jose** - JWT tokens
- **passlib** - Hash de mots de passe (bcrypt)
- **Uvicorn** - Serveur ASGI

### Frontend
- **React 18** - Framework UI
- **Vite** - Build tool rapide
- **React Router** - Routage
- **Leaflet** - Cartes interactives
- **Axios** - HTTP client

### Base de Données
- **MySQL 8.0+** - Base de données relationnelle

---

## 🧪 Tests

### Tester l'API avec curl

#### Créer un utilisateur
```bash
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_user",
    "email": "test@example.com",
    "password": "password123",
    "role": "citizen"
  }'
```

#### Lister les refuges
```bash
curl "http://localhost:8000/api/refuges"
```

#### Trouver le refuge le plus proche
```bash
curl "http://localhost:8000/api/pathfinding/nearest-refuge?user_latitude=-18.9137&user_longitude=47.5261"
```

---

## ⚙️ Configuration Production

### Variables d'environnement essentielles

```env
# Sécurité
SECRET_KEY=votre-vraie-clé-secrète-très-longue

# Base de données
DATABASE_USER=votre_user
DATABASE_PASSWORD=votre_mot_de_passe_fort
DATABASE_HOST=votre_host_mysql
DATABASE_PORT=3306

# CORS
ALLOWED_ORIGINS=https://yourfrontend.com,https://yourapp.com
```

### Déploiement avec Docker

Un `Dockerfile` peut être ajouté:

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app/ .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 🐛 Dépannage

### Erreur: "MySQL connection failed"
- Vérifier que MySQL est en cours d'exécution
- Vérifier les identifiants dans `.env`
- Vérifier que la base `smart_safezone` existe

### Erreur: "Module not found"
```bash
# Réinstaller les dépendances
pip install -r requirements.txt --force-reinstall
```

### Port 8000 déjà utilisé
```bash
# Changer le port dans run.bat/run.sh
# Ou terminer le processus qui utilise le port
```

---

## 📝 Documentation API Complète

La documentation interactive Swagger est disponible à:
```
http://localhost:8000/docs
```

---

## 👤 Auteurs & Contact

Projet développé pour le système de gestion d'urgence **Smart Safe Zone 2035**.

---

## 📄 License

Ce projet est sous licence MIT - voir le fichier LICENSE pour plus de détails.

---

## 🎯 Roadmap Futur

- [ ] Notifications push en temps réel
- [ ] Intégration avec meteo API
- [ ] Historique des évacuations
- [ ] Analytics et reporting
- [ ] Support multi-languages
- [ ] Application mobile native
- [ ] Temps réel avec WebSockets

---

**Bienvenue dans Smart Safe Zone 2035! 🌟**
