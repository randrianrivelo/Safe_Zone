from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from app.models.shelter import Shelter
from app.repositories.base_repository import BaseRepository
from app.core.constants import ShelterStatus


class ShelterRepository(BaseRepository[Shelter]):

    def __init__(self, db: Session):
        super().__init__(Shelter, db)

    def get_all_active(self) -> List[Shelter]:
        # Pour l'application (carte citoyen), on souhaite afficher tous les refuges.
        # On supprime le filtre sur is_active pour inclure aussi les refuges inactifs.
        return self.db.query(Shelter).order_by(Shelter.capacity_total.desc()).all()


    def get_available(self) -> List[Shelter]:
        return self.db.query(Shelter).filter(
            Shelter.is_active == True,
            Shelter.status == ShelterStatus.OUVERT
        ).all()

    def get_by_district(self, district_id: int) -> List[Shelter]:
        return self.db.query(Shelter).filter(
            Shelter.district_id == district_id
        ).all()

    def get_by_status(self, status: str) -> List[Shelter]:
        return self.db.query(Shelter).filter(
            Shelter.status == status,
            Shelter.is_active == True
        ).all()

    def get_with_medical(self) -> List[Shelter]:
        return self.db.query(Shelter).filter(
            Shelter.has_medical == True,
            Shelter.is_active == True
        ).all()

    def update_occupancy(
        self,
        shelter_id: int,
        new_occupancy: int
    ) -> Optional[Shelter]:
        shelter = self.get_by_id(shelter_id)
        if not shelter:
            return None
        shelter.current_occupancy = new_occupancy
        if new_occupancy >= shelter.capacity_total:
            shelter.status = ShelterStatus.SATURE
        elif shelter.status == ShelterStatus.SATURE:
            shelter.status = ShelterStatus.OUVERT
        self.db.commit()
        self.db.refresh(shelter)
        return shelter

    def get_global_stats(self) -> dict:
        result = self.db.query(
            func.count(Shelter.id).label("total"),
            func.sum(Shelter.capacity_total).label("capacity"),
            func.sum(Shelter.current_occupancy).label("occupancy"),
            func.count(
                func.nullif(Shelter.status != ShelterStatus.OUVERT, True)
            ).label("open")
        ).filter(Shelter.is_active == True).first()

        total    = result.total    or 0
        capacity = result.capacity or 0
        occupancy= result.occupancy or 0

        return {
            "total_shelters":   total,
            "total_capacity":   capacity,
            "total_occupancy":  occupancy,
            "available_spots":  capacity - occupancy,
            "open_shelters":    self.db.query(Shelter).filter(
                Shelter.status == ShelterStatus.OUVERT
            ).count(),
            "full_shelters":    self.db.query(Shelter).filter(
                Shelter.status == ShelterStatus.SATURE
            ).count()
        }