"""
Configuration de l'application Smart Safe Zone
"""
import os


class Settings:
    """Configuration de l'application"""
    
    # Base de données MySQL
    DATABASE_USER: str = os.getenv("DATABASE_USER", "root")
    DATABASE_PASSWORD: str = os.getenv("DATABASE_PASSWORD", "")
    DATABASE_HOST: str = os.getenv("DATABASE_HOST", "localhost")
    DATABASE_PORT: int = int(os.getenv("DATABASE_PORT", 3306))
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "smart_safezone")
    
    # Construire l'URL de connexion
    DATABASE_URL: str = ""
    
    def __init__(self):
        # Format: mysql+pymysql://user:password@localhost:3306/dbname
        if self.DATABASE_PASSWORD:
            self.DATABASE_URL = (
                f"mysql+pymysql://{self.DATABASE_USER}:{self.DATABASE_PASSWORD}"
                f"@{self.DATABASE_HOST}:{self.DATABASE_PORT}/{self.DATABASE_NAME}"
            )
        else:
            self.DATABASE_URL = (
                f"mysql+pymysql://{self.DATABASE_USER}"
                f"@{self.DATABASE_HOST}:{self.DATABASE_PORT}/{self.DATABASE_NAME}"
            )
    
    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "smart-safe-zone-dev-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # API
    API_TITLE: str = "Smart Safe Zone API"
    API_VERSION: str = "1.0.0"
    API_DESCRIPTION: str = "API de gestion des zones de sécurité en cas de catastrophe naturelle"


settings = Settings()
