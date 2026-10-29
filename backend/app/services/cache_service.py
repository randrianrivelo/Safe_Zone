import json
from typing import Optional, Any
from app.config.redis import redis_client
from app.config.settings import settings
from app.utils.logger import logger


class CacheService:
    """
    Service de cache Redis
    Si Redis est indisponible, tout fonctionne sans cache
    """

    @staticmethod
    def get(key: str) -> Optional[Any]:
        if not redis_client:
            return None
        try:
            data = redis_client.get(key)
            if data:
                logger.debug(f"Cache HIT : {key}")
                return json.loads(data)
        except Exception as e:
            logger.warning(f"Cache GET erreur : {e}")
        return None

    @staticmethod
    def set(key: str, value: Any, expire: int = None) -> None:
        if not redis_client:
            return
        try:
            ttl = expire or settings.REDIS_EXPIRE_SECONDS
            redis_client.setex(key, ttl, json.dumps(value))
            logger.debug(f"Cache SET : {key} (TTL={ttl}s)")
        except Exception as e:
            logger.warning(f"Cache SET erreur : {e}")

    @staticmethod
    def delete(key: str) -> None:
        if not redis_client:
            return
        try:
            redis_client.delete(key)
            logger.debug(f"Cache DELETE : {key}")
        except Exception as e:
            logger.warning(f"Cache DELETE erreur : {e}")

    @staticmethod
    def delete_pattern(pattern: str) -> None:
        if not redis_client:
            return
        try:
            keys = redis_client.keys(pattern)
            if keys:
                redis_client.delete(*keys)
                logger.debug(f"Cache DELETE pattern : {pattern}")
        except Exception as e:
            logger.warning(f"Cache DELETE pattern erreur : {e}")