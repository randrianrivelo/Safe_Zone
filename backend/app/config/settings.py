from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_EXPIRE_SECONDS: int = 300
    APP_NAME: str = "Smart SafeZone Analamanga 2035"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    LAT_MIN: float = -19.50
    LAT_MAX: float = -18.00
    LON_MIN: float = 46.80
    LON_MAX: float = 48.20

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()