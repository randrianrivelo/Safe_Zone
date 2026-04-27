# GUIDE DE DÉMARRAGE RAPIDE - Smart Safe Zone 🚀

## ⚡ Démarrage en 5 minutes

### 1️⃣ Configuration de MySQL

**Windows:**
```bash
cd database
setup.bat
```

**Linux/Mac:**
```bash
cd database
chmod +x setup.sh
./setup.sh
```

### 2️⃣ Lancer le Backend

**Windows:**
```bash
cd backend
run.bat
```

**Linux/Mac:**
```bash
cd backend
chmod +x run.sh
./run.sh
```

**Avec Docker (optionnel):**
```bash
docker-compose up --build
```

Le serveur démarre à: `http://localhost:8000`

### 3️⃣ Lancer le Frontend

```bash
cd frontend
npm install
npm run dev
```

L'app est disponible à: `http://localhost:5173`

---

## 🧪 Tester l'API

### Vérifier que tout marche:
```bash
python test_api.py
```

### Ou avec curl:
```bash
# Test santé
curl http://localhost:8000/health

# Lister les refuges
curl http://localhost:8000/api/refuges

# Documentation Swagger
# Ouvrir: http://localhost:8000/docs
```

---

## 🔧 Configuration Quick Start

### Fichier .env du Backend
```env
DATABASE_USER=root
DATABASE_PASSWORD=root
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=smart_safezone
SECRET_KEY=dev-secret-key
```

---

## 📱 Endpoints Principaux

### Refuges 🏘️
- `GET /api/refuges` - Tous les refuges
- `GET /api/refuges/nearby?latitude=-18.91&longitude=47.52` - À proximité
- `POST /api/refuges` - Créer un refuge

### Pathfinding 🗺️  
- `GET /api/pathfinding/nearest-refuge?user_latitude=-18.91&user_longitude=47.52` - Refuge le plus proche
- `GET /api/pathfinding/distance?lat1=-18.91&lon1=47.52&lat2=-18.92&lon2=47.53` - Calculer distance

### Zones Dangereuses ⚠️
- `GET /api/danger-zones` - Toutes les zones
- `POST /api/danger-zones` - Créer une zone
- `DELETE /api/danger-zones/{id}` - Supprimer une zone

### Auth 🔐
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion

---

## 📚 Documentation Complète

Voir [README.md](./README.md) pour la documentation complète.

---

## 🐛 Dépannage Rapide

### MySQL ne démarre pas
```bash
# Vérifier l'installation
mysql --version

# Démarrer le service (Windows)
net start MySQL80

# Linux
sudo service mysql start
```

### Port 8000 occupé
Changer le port dans `backend/run.bat` ou `backend/run.sh`:
```bash
uvicorn main:app --port 8001
```

### Dépendances manquantes
```bash
cd backend
pip install -r requirements.txt --force-reinstall
```

---

## 🎯 Étapes suivantes

1. ✅ Vérifier que tout marche avec `python test_api.py`
2. 📖 Consulter la documentation Swagger: `http://localhost:8000/docs`
3. 🛠️ Customiser la configuration MySQL dans `.env`
4. 🚀 Commencer à développer!

---

**Bienvenue dans Smart Safe Zone! 🌟**
