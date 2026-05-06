# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, refuges, routes, zones, pathfinding

app = FastAPI(
    title="Smart Safe Zone 2035",
    description="API de guidage vers les zones sûres — Analamanga",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(auth.router)
app.include_router(refuges.router)
app.include_router(routes.router)
app.include_router(zones.router)
app.include_router(pathfinding.router)


@app.get("/")
def root():
    return {
        "app":     "Smart Safe Zone 2035",
        "version": "1.0.0",
        "status":  "running",
        "docs":    "/docs"
    }


@app.get("/health")
def health():
    return {"status": "OK"}