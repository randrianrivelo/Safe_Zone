from sqlalchemy.orm import Session
from typing import List
from app.models.danger_zone import DangerZone
from app.repositories.base_repository import BaseRepository


class DangerRepository(BaseRepository[DangerZone]):

    def __init__(self, db: Session):
        super().__init__(DangerZone, db)

    def get_active(self) -> List[DangerZone]:
        return self.db.query(DangerZone).filter(
            DangerZone.is_active == True
        ).all()

    def toggle(self, zone_id: int) -> DangerZone:
        zone = self.get_by_id(zone_id)
        if zone:
            zone.is_active = not zone.is_active
            self.db.commit()
            self.db.refresh(zone)
        return zone