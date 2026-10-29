from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.config.database import get_db
from app.models.road import Road
from app.schemas.road import RoadResponse, RoadCreate, RoadUpdate
from app.core.security import get_current_admin, get_current_user
from app.models.user import User
from app.utils.logger import logger

router = APIRouter(prefix="/roads", tags=["Routes"])

# Route publique pour les utilisateurs connectés
@router.get("/", response_model=List[RoadResponse])
def get_all_roads(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Récupérer toutes les routes"""
    try:
        roads = db.query(Road).all()
        return roads
    except Exception as e:
        logger.error(f"Erreur récupération routes: {e}")
        raise HTTPException(status_code=500, detail="Erreur interne")

@router.get("/blocked", response_model=List[RoadResponse])
def get_blocked_roads(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Récupérer les routes bloquées"""
    roads = db.query(Road).filter(Road.is_passable == False).all()
    return roads

@router.get("/passable", response_model=List[RoadResponse])
def get_passable_roads(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Récupérer les routes praticables"""
    roads = db.query(Road).filter(Road.is_passable == True).all()
    return roads

@router.get("/{road_id}", response_model=RoadResponse)
def get_road(
    road_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Récupérer une route par son ID"""
    road = db.query(Road).filter(Road.id == road_id).first()
    if not road:
        raise HTTPException(status_code=404, detail="Route non trouvée")
    return road

@router.post("/", response_model=RoadResponse)
def create_road(
    road: RoadCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Créer une nouvelle route (admin uniquement)"""
    try:
        new_road = Road(**road.dict())
        db.add(new_road)
        db.commit()
        db.refresh(new_road)
        logger.info(f"Route créée par admin {current_admin.email}: {new_road.name}")
        return new_road
    except Exception as e:
        db.rollback()
        logger.error(f"Erreur création route: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la création")

@router.put("/{road_id}", response_model=RoadResponse)
def update_road(
    road_id: int,
    road: RoadUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Modifier une route (admin uniquement)"""
    existing = db.query(Road).filter(Road.id == road_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Route non trouvée")

    try:
        for key, value in road.dict(exclude_unset=True).items():
            setattr(existing, key, value)
        db.commit()
        db.refresh(existing)
        logger.info(f"Route modifiée par admin {current_admin.email}: {existing.name}")
        return existing
    except Exception as e:
        db.rollback()
        logger.error(f"Erreur modification route: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la modification")

@router.patch("/{road_id}/status")
def update_road_status(
    road_id: int,
    status_data: dict,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Mettre à jour le statut d'une route (admin uniquement)"""
    road = db.query(Road).filter(Road.id == road_id).first()
    if not road:
        raise HTTPException(status_code=404, detail="Route non trouvée")

    try:
        if "status" in status_data:
            road.status = status_data["status"]
        if "is_passable" in status_data:
            road.is_passable = status_data["is_passable"]
        if "danger_level" in status_data:
            road.danger_level = status_data["danger_level"]

        db.commit()
        logger.info(f"Statut route mis à jour par admin {current_admin.email}: {road.name} -> {road.status}")
        return {"message": "Statut mis à jour", "road": {"id": road.id, "status": road.status, "is_passable": road.is_passable}}
    except Exception as e:
        db.rollback()
        logger.error(f"Erreur mise à jour statut: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la mise à jour")

@router.delete("/{road_id}")
def delete_road(
    road_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Supprimer une route (admin uniquement)"""
    road = db.query(Road).filter(Road.id == road_id).first()
    if not road:
        raise HTTPException(status_code=404, detail="Route non trouvée")

    try:
        road_name = road.name
        db.delete(road)
        db.commit()
        logger.info(f"Route supprimée par admin {current_admin.email}: {road_name}")
        return {"message": "Route supprimée avec succès"}
    except Exception as e:
        db.rollback()
        logger.error(f"Erreur suppression route: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la suppression")