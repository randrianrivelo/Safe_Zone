from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import os
from pathlib import Path
from typing import List
from app.config.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.shelter import Shelter
from app.schemas.shelter import ShelterEntryResponse, ShelterUpdate

router = APIRouter()

# Créer le dossier des images
BASE_DIR = Path(__file__).resolve().parent.parent.parent
SHELTER_IMG_DIR = BASE_DIR / "app" / "static" / "images"
os.makedirs(str(SHELTER_IMG_DIR), exist_ok=True)

@router.get("/", response_model=List[ShelterEntryResponse])
def get_shelters(
    skip: int = 0,
    limit: int = 200,
    district_id: int | None = None,
    include_inactive: bool = False,
    db: Session = Depends(get_db)
):
    """Récupérer tous les refuges.
    Passer `include_inactive=true` pour inclure les refuges inactifs.
    Passer `district_id` pour filtrer par district."""
    query = db.query(Shelter)
    if district_id is not None:
        query = query.filter(Shelter.district_id == district_id)
    if not include_inactive:
        query = query.filter(Shelter.is_active == True)
    shelters = query.offset(skip).limit(limit).all()
    return shelters

@router.get("/available", response_model=List[ShelterEntryResponse])
def get_available_shelters(
    db: Session = Depends(get_db)
):
    """Récupérer les refuges disponibles"""
    shelters = db.query(Shelter).filter(
        Shelter.is_active == True,
        Shelter.status == "ouvert"
    ).all()
    return shelters

@router.get("/people", response_model=List[ShelterEntryResponse])
def get_people_placeholder(
    db: Session = Depends(get_db)
):
    # Route de garde: évite que "people" soit interprété comme shelter_id
    return []

@router.get("/{shelter_id}", response_model=ShelterEntryResponse)
def get_shelter(
    shelter_id: int,
    db: Session = Depends(get_db)
):

    """Récupérer un refuge par son ID"""
    shelter = db.query(Shelter).filter(Shelter.id == shelter_id, Shelter.is_active == True).first()
    if not shelter:
        raise HTTPException(status_code=404, detail="Refuge non trouvé")
    return shelter

@router.patch("/{shelter_id}", response_model=ShelterEntryResponse)
def update_shelter(
    shelter_id: int,
    data: ShelterUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mettre à jour un refuge (admin uniquement)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Non autorisé")

    shelter = db.query(Shelter).filter(Shelter.id == shelter_id).first()
    if not shelter:
        raise HTTPException(status_code=404, detail="Refuge non trouvé")

    # Mettre à jour les champs
    for key, value in data.dict(exclude_unset=True).items():
        setattr(shelter, key, value)

    # Vérifier que l'occupation ne dépasse pas la capacité
    if shelter.current_occupancy > shelter.capacity_total:
        shelter.current_occupancy = shelter.capacity_total

    db.commit()
    db.refresh(shelter)
    return shelter

@router.get("/stats", response_model=dict)
def get_shelter_stats(
    db: Session = Depends(get_db)
):
    """Récupérer les statistiques des refuges"""
    total = db.query(Shelter).filter(Shelter.is_active == True).count()
    open_shelters = db.query(Shelter).filter(Shelter.is_active == True, Shelter.status == "ouvert").count()
    total_capacity = db.query(Shelter).filter(Shelter.is_active == True).with_entities(db.func.sum(Shelter.capacity_total)).scalar() or 0
    total_occupancy = db.query(Shelter).filter(Shelter.is_active == True).with_entities(db.func.sum(Shelter.current_occupancy)).scalar() or 0

    return {
        "total_shelters": total,
        "open_shelters": open_shelters,
        "total_capacity": total_capacity,
        "total_occupancy": total_occupancy,
        "available_spots": total_capacity - total_occupancy
    }