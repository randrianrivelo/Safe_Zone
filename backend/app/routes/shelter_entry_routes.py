from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.config.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.shelter_entry import ShelterEntry
from app.repositories.shelter_entry_repository import ShelterEntryRepository
from app.schemas.shelter_entry import ShelterEntryCreate, ShelterEntryResponse

router = APIRouter()


@router.get("/people", response_model=List[ShelterEntryResponse])
def get_people(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retourne les personnes présentes dans le refuge du user connecté."""
    if current_user.shelter_id is None:
        raise HTTPException(status_code=400, detail="shelter_id manquant")

    repo = ShelterEntryRepository(db)
    return repo.get_present_in_shelter(current_user.shelter_id)


@router.post("/people", response_model=ShelterEntryResponse, status_code=201)
def add_person(
    data: ShelterEntryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Ajoute une personne dans le refuge du user connecté.

    Le front envoie shelter_id dans ShelterEntryCreate.
    On force shelter_id = current_user.shelter_id pour éviter les incohérences.
    """
    if current_user.shelter_id is None:
        raise HTTPException(status_code=400, detail="shelter_id manquant")

    payload = data.dict()
    payload["shelter_id"] = current_user.shelter_id

    entry = ShelterEntry(**payload)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.patch("/people/{entry_id}/depart", response_model=ShelterEntryResponse)
def depart_person(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Marque une personne comme sortie."""
    if current_user.shelter_id is None:
        raise HTTPException(status_code=400, detail="shelter_id manquant")

    repo = ShelterEntryRepository(db)
    entry = db.query(ShelterEntry).filter(
        ShelterEntry.id == entry_id,
        ShelterEntry.shelter_id == current_user.shelter_id,
    ).first()

    if not entry:
        raise HTTPException(status_code=404, detail="Entrée non trouvée")

    entry.status = "departed"
    # exit_time est nullable: on le met via SQLAlchemy server_default? -> on l'assigne à maintenant
    from datetime import datetime

    entry.exit_time = datetime.utcnow()

    db.commit()
    db.refresh(entry)
    return entry
