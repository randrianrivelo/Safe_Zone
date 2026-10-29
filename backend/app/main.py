from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.base import BaseHTTPMiddleware
from app.routes import danger_routes
import os
from app.config.settings import settings
from app.config.database import check_db_connection
from app.middleware.logging_middleware import logging_middleware
from app.routes import road_routes
from app.routes import websocket_routes
from app.routes import district_routes
from app.routes import emergency_routes
from app.routes import agent_routes
from app.routes import emergency_routes
from app.routes import (
    auth_routes,
    user_routes,
    shelter_routes,
    shelter_entry_routes,
    road_routes,
    route_routes,
    alert_routes,
    danger_routes,
    admin_routes,
    report_routes,
    weather_routes,
)

from app.utils.logger import logger

# Créer les dossiers statiques (idempotent)
try:
    os.makedirs("app/static", exist_ok=True)
    os.makedirs("app/static/avatars", exist_ok=True)
    os.makedirs("app/static/images", exist_ok=True)
except FileExistsError:
    pass

app = FastAPI(
    title="SafeZone Analamanga 2035",
    version=settings.APP_VERSION,
    description="API de guidage vers zones securisees en cas de catastrophe",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Fichiers statiques
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# ============================================================
# CONFIGURATION CORS COMPLÈTE (CORRIGÉE)
# ============================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        # Ajoute ton IP pour le mobile si besoin
        "http://192.168.232.150:8081",
        "exp://192.168.232.150:8081",
    ],
    allow_credentials=True,
    allow_methods=["*"],      # Autorise toutes les méthodes (GET, POST, PUT, DELETE, OPTIONS)
    allow_headers=["*"],      # Autorise tous les headers
)

# Logging
app.add_middleware(BaseHTTPMiddleware, dispatch=logging_middleware)

# ============================================================
# ROUTES
# ============================================================
app.include_router(auth_routes.router,         prefix="/api/auth",       tags=["Auth"])
app.include_router(user_routes.router,         prefix="/api/user",       tags=["Utilisateur"])
app.include_router(shelter_routes.router,      prefix="/api/shelters",   tags=["Refuges"])
app.include_router(shelter_entry_routes.router,prefix="/api/shelters",   tags=["ShelterEntries"])
app.include_router(road_routes.router,         prefix="/api/roads",      tags=["Routes"])
app.include_router(route_routes.router,        prefix="/api/itineraire", tags=["Itineraire"])
app.include_router(alert_routes.router,        prefix="/api/alerts",     tags=["Alertes"])
app.include_router(danger_routes.router,       prefix="/api/dangers",    tags=["Zones Danger"])
app.include_router(admin_routes.router,        prefix="/api/admin",      tags=["Admin"])
app.include_router(report_routes.router,       prefix="/api/reports",    tags=["Signalements"])
app.include_router(weather_routes.router,      prefix="/api/weather",    tags=["Meteo"])
app.include_router(district_routes.router,     prefix="/api/districts",  tags=["Districts"])
app.include_router(agent_routes.router,        prefix="/api",            tags=["Agent"])
app.include_router(emergency_routes.router, prefix="/api", tags=["Urgence"])
app.include_router(road_routes.router, prefix="/api", tags=["Routes"])
app.include_router(danger_routes.router, prefix="/api", tags=["Zones dangereuses"])
app.include_router(websocket_routes.router, prefix="/api", tags=["WebSocket"])

# ============================================================
# ÉVÉNEMENTS DE DÉMARRAGE
# ============================================================
@app.on_event("startup")
async def startup():
    logger.info(f"Demarrage : SafeZone Analamanga 2035 v{settings.APP_VERSION}")
    check_db_connection()

# ============================================================
# ROUTES DE BASE
# ============================================================
@app.get("/", tags=["Accueil"])
def root():
    return {
        "app":     "SafeZone Analamanga 2035",
        "version": settings.APP_VERSION,
        "status":  "en ligne",
        "docs":    "/docs"
    }

@app.get("/health", tags=["Sante"])
def health():
    return {"status": "ok"}