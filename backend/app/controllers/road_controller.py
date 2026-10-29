from sqlalchemy.orm import Session
from typing import List
from app.services.road_service import RoadService
from app.models.road import Road


class RoadController:

    def __init__(self, db: Session):
        self.service = RoadService(db)

    def list_all(self) -> List[Road]:
        return self.service.get_all()

    def list_blocked(self) -> List[Road]:
        return self.service.get_blocked()

    def list_passable(self) -> List[Road]:
        return self.service.get_passable()

    def update_status(
        self,
        road_id: int,
        status: str,
        is_passable: bool,
        danger_level: int = 0
    ) -> Road:
        return self.service.update_status(
            road_id, status, is_passable, danger_level
        )