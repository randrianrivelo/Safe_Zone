from pydantic_settings import BaseSettings
from urllib.parse import quote_plus
import os
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    DB_HOST: str = "localhost"
    DB_PORT: str = "5432"
    DB_NAME: str = "smart_safezone"
    DB_USER: str = "postgres"
    DB_PASSWORD: str = "Hyacinthe"
    SECRET_KEY: str = "smart-safe-zone-2035-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    class Config:
        env_file = ".env"


settings = Settings()