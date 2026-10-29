import redis
from app.config.settings import settings
from app.utils.logger import logger


def get_redis_client():
    """Retourne un client Redis ou None si indisponible"""
    try:
        client = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=settings.REDIS_DB,
            decode_responses=True,
            socket_connect_timeout=2,
            socket_timeout=2
        )
        client.ping()
        logger.info("Connexion Redis OK")
        return client
    except Exception:
        logger.warning("Redis indisponible — cache désactivé")
        return None


# Instance globale
redis_client = get_redis_client()