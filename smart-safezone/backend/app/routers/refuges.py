"""
Router pour la gestion des refuges
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.refuge import Refuge
from schemas.refuge import RefugeCreate, RefugeUpdate, RefugeResponse
from services.refuge_service import RefugeService

router = APIRouter(prefix="/api/refuges", tags=["refuges"])


@router.get("/", response_model=List[RefugeResponse])
def get_refuges(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Récupérer tous les refuges"""
    refuges = RefugeService.get_all_refuges(db, skip=skip, limit=limit)
    return refuges


@router.get("/active", response_model=List[RefugeResponse])
def get_active_refuges(db: Session = Depends(get_db)):
    """Récupérer les refuges actifs"""
    refuges = RefugeService.get_active_refuges(db)
    return refuges


@router.get("/nearby", response_model=List[RefugeResponse])
def get_nearby_refuges(
    latitude: float,
    longitude: float,
    radius_km: float = 5,
    db: Session = Depends(get_db)
):
    """Récupérer les refuges à proximité"""
    refuges = RefugeService.get_nearby_refuges(db, latitude, longitude, radius_km)
    return refuges


@router.get("/{refuge_id}", response_model=RefugeResponse)
def get_refuge(refuge_id: int, db: Session = Depends(get_db)):
    """Récupérer un refuge par ID"""
    refuge = RefugeService.get_refuge(db, refuge_id)
    if not refuge:
        raise HTTPException(status_code=404, detail="Refuge not found")
    return refuge


@router.post("/", response_model=RefugeResponse)
def create_refuge(refuge: RefugeCreate, db: Session = Depends(get_db)):
    """Créer un nouveau refuge"""
    return RefugeService.create_refuge(db, refuge)


@router.put("/{refuge_id}", response_model=RefugeResponse)
def update_refuge(refuge_id: int, refuge_update: RefugeUpdate, db: Session = Depends(get_db)):
    """Mettre à jour un refuge"""
    refuge = RefugeService.update_refuge(db, refuge_id, refuge_update)
    if not refuge:
        raise HTTPException(status_code=404, detail="Refuge not found")
    return refuge


@router.delete("/{refuge_id}")
def delete_refuge(refuge_id: int, db: Session = Depends(get_db)):
    """Supprimer un refuge"""
    if not RefugeService.delete_refuge(db, refuge_id):
        raise HTTPException(status_code=404, detail="Refuge not found")
    return {"message": "Refuge deleted successfully"}


@router.put("/{refuge_id}/occupancy")
def update_occupancy(refuge_id: int, occupancy: int, db: Session = Depends(get_db)):
    """Mettre à jour l'occupation d'un refuge"""
    refuge = RefugeService.update_occupancy(db, refuge_id, occupancy)
    if not refuge:
        raise HTTPException(status_code=404, detail="Refuge not found")
    return refuge
