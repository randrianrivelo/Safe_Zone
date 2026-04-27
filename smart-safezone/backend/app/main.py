"""
Application FastAPI - Smart Safe Zone
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from config import settings
from database import init_db
from routers import auth, refuges, pathfinding, zones, routes


# Lifecycle events
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    print("🚀 Initializing database...")
    init_db()
    print("✅ Database initialized")
    
    yield
    
    # Shutdown
    print("🔌 Shutting down...")


# Créer l'application FastAPI
app = FastAPI(
    title=settings.API_TITLE,
    description=settings.API_DESCRIPTION,
    version=settings.API_VERSION,
    lifespan=lifespan
)


# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # À restreindre en production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Inclure les routers
app.include_router(auth.router)
app.include_router(refuges.router)
app.include_router(pathfinding.router)
app.include_router(zones.router)
app.include_router(routes.router)


# Routes de base
@app.get("/")
def read_root():
    """Endpoint racine"""
    return {
        "message": "Smart Safe Zone API",
        "version": settings.API_VERSION,
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    """Vérifier la santé de l'API"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
