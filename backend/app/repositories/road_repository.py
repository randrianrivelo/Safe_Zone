from sqlalchemy.orm import Session
from typing import List
from app.models.road import Road
from app.repositories.base_repository import BaseRepository


class RoadRepository(BaseRepository[Road]):

    def __init__(self, db: Session):
        super().__init__(Road, db)

    def get_all_passable(self) -> List[Road]:
        return self.db.query(Road).filter(
            Road.is_passable == True
        ).all()

    def get_all_blocked(self) -> List[Road]:
        return self.db.query(Road).filter(
            Road.is_passable == False
        ).all()

    def update_status(
        self,
        road_id: int,
        status: str,
        is_passable: bool,
        danger_level: int = 0
    ) -> Road:
        road = self.get_by_id(road_id)
        if not road:
            return None
        road.status       = status
        road.is_passable  = is_passable
        road.danger_level = danger_level
        self.db.commit()
        self.db.refresh(road)
        return road