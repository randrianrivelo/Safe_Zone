from sqlalchemy.orm import Session
from app.repositories.base_repository import BaseRepository
from app.models.shelter_entry import ShelterEntry

class ShelterEntryRepository(BaseRepository[ShelterEntry]):
    def __init__(self, db: Session):
        super().__init__(ShelterEntry, db)

    def get_by_shelter(self, shelter_id: int):
        return self.db.query(self.model).filter(self.model.shelter_id == shelter_id).all()

    def get_present_in_shelter(self, shelter_id: int):
        return self.db.query(self.model).filter(
            self.model.shelter_id == shelter_id,
            self.model.status == "present"
        ).all()
