from sqlalchemy.orm import Session
from typing import List, Optional
from app.repositories.shelter_repository import ShelterRepository
from app.models.shelter import Shelter
from app.core.exceptions import NotFoundException
from app.services.cache_service import CacheService
from app.utils.logger import logger


class ShelterService:

    def __init__(self, db: Session):
        self.repo  = ShelterRepository(db)
        self.cache = CacheService()

    def get_all(self) -> List[Shelter]:
        cached = self.cache.get("shelters:all")
        if cached:
            return cached
        shelters = self.repo.get_all_active()
        return shelters

    def get_available(self) -> List[Shelter]:
        return self.repo.get_available()

    def get_by_id(self, shelter_id: int) -> Shelter:
        shelter = self.repo.get_by_id(shelter_id)
        if not shelter:
            raise NotFoundException("Refuge")
        return shelter

    def get_by_district(self, district_id: int) -> List[Shelter]:
        return self.repo.get_by_district(district_id)

    def update_occupancy(
        self,
        shelter_id: int,
        new_occupancy: int
    ) -> Shelter:
        shelter = self.repo.get_by_id(shelter_id)
        if not shelter:
            raise NotFoundException("Refuge")
        if new_occupancy < 0:
            raise ValueError("L'occupation ne peut pas etre negative")
        if new_occupancy > shelter.capacity_total:
            raise ValueError(
                f"Occupation ({new_occupancy}) "
                f"depasse la capacite ({shelter.capacity_total})"
            )
        updated = self.repo.update_occupancy(shelter_id, new_occupancy)
        self.cache.delete("shelters:all")
        logger.info(
            f"Occupation refuge {shelter_id} : "
            f"{new_occupancy}/{shelter.capacity_total}"
        )
        return updated

    def update_status(self, shelter_id: int, status: str) -> Shelter:
        shelter = self.repo.get_by_id(shelter_id)
        if not shelter:
            raise NotFoundException("Refuge")
        shelter.status = status
        self.repo.update(shelter)
        self.cache.delete("shelters:all")
        return shelter

    def get_stats(self) -> dict:
        return self.repo.get_global_stats()