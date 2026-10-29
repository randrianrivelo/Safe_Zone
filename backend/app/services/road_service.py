from sqlalchemy.orm import Session
from typing import List
from app.repositories.road_repository import RoadRepository
from app.models.road import Road
from app.core.exceptions import NotFoundException
from app.services.cache_service import CacheService
from app.utils.logger import logger


class RoadService:

    def __init__(self, db: Session):
        self.repo  = RoadRepository(db)
        self.cache = CacheService()

    def get_all(self) -> List[Road]:
        return self.repo.get_all()

    def get_passable(self) -> List[Road]:
        return self.repo.get_all_passable()

    def get_blocked(self) -> List[Road]:
        return self.repo.get_all_blocked()

    def update_status(
        self,
        road_id: int,
        status: str,
        is_passable: bool,
        danger_level: int = 0
    ) -> Road:
        road = self.repo.update_status(
            road_id, status, is_passable, danger_level
        )
        if not road:
            raise NotFoundException("Route")

        # Invalide le cache des itineraires
        self.cache.delete_pattern("route:*")

        logger.info(
            f"Route {road_id} mise a jour : "
            f"status={status}, praticable={is_passable}"
        )
        return road