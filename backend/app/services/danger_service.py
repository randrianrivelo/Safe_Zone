from sqlalchemy.orm import Session
from typing import List
from app.repositories.danger_repository import DangerRepository
from app.models.danger_zone import DangerZone
from app.core.exceptions import NotFoundException


class DangerService:

    def __init__(self, db: Session):
        self.repo = DangerRepository(db)

    def get_active(self) -> List[DangerZone]:
        return self.repo.get_active()

    def get_all(self) -> List[DangerZone]:
        return self.repo.get_all()

    def toggle(self, zone_id: int) -> DangerZone:
        zone = self.repo.toggle(zone_id)
        if not zone:
            raise NotFoundException("Zone dangereuse")
        return zone

    def create(
        self,
        name: str,
        danger_type: str,
        center_lat: float,
        center_lon: float,
        radius_km: float,
        severity: str,
        description: str = None
    ) -> DangerZone:
        zone = DangerZone(
            name        = name,
            danger_type = danger_type,
            center_lat  = center_lat,
            center_lon  = center_lon,
            radius_km   = radius_km,
            severity    = severity,
            description = description,
            is_active   = True
        )
        return self.repo.create(zone)