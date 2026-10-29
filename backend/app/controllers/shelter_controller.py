from sqlalchemy.orm import Session
from typing import List, Optional
from app.services.shelter_service import ShelterService
from app.models.shelter import Shelter


class ShelterController:

    def __init__(self, db: Session):
        self.service = ShelterService(db)

    def list_all(
        self,
        status: Optional[str] = None,
        district_id: Optional[int] = None
    ) -> List[Shelter]:
        shelters = self.service.get_all()
        if status:
            shelters = [s for s in shelters if s.status == status]
        if district_id:
            shelters = [s for s in shelters if s.district_id == district_id]
        return shelters

    def list_available(self) -> List[Shelter]:
        return self.service.get_available()

    def get_detail(self, shelter_id: int) -> Shelter:
        return self.service.get_by_id(shelter_id)

    def update_shelter(self, shelter_id: int, data: dict) -> Shelter:
        if "current_occupancy" in data and data["current_occupancy"] is not None:
            return self.service.update_occupancy(
                shelter_id, data["current_occupancy"]
            )
        if "status" in data and data["status"] is not None:
            return self.service.update_status(shelter_id, data["status"])
        return self.service.get_by_id(shelter_id)

    def get_stats(self) -> dict:
        return self.service.get_stats()