"""
Configuration de la base de données avec SQLAlchemy
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from config import settings

# Créer l'engine de SQLAlchemy
engine = create_engine(
    settings.DATABASE_URL,
    echo=False,
    pool_pre_ping=True,  # Vérifie la connexion avant de l'utiliser
    pool_recycle=3600,   # Recycle les connexions après 1 heure
    connect_args={
        "charset": "utf8mb4",
        "use_unicode": True,
    }
)

# SessionLocal pour créer les sessions
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base pour les modèles ORM
Base = declarative_base()


def get_db() -> Session:
    """Dependency pour obtenir une session de base de données"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialiser la base de données (créer toutes les tables)"""
    Base.metadata.create_all(bind=engine)
