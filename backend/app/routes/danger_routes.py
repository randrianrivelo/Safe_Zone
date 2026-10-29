from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.config.database import get_db
from app.models.danger_zone import DangerZone
from app.schemas.danger_zone import DangerZoneResponse, DangerZoneCreate, DangerZoneUpdate
from app.core.security import get_current_admin, get_current_user
from app.models.user import User
from app.utils.logger import logger

router = APIRouter(prefix="/dangers", tags=["Zones dangereuses"])

# Routes publiques (pour tous les utilisateurs connectés)
@router.get("/", response_model=List[DangerZoneResponse])
def get_all_dangers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Récupérer toutes les zones dangereuses"""
    return db.query(DangerZone).all()

@router.get("/active", response_model=List[DangerZoneResponse])
def get_active_dangers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Récupérer les zones dangereuses actives"""
    return db.query(DangerZone).filter(DangerZone.is_active == True).all()

@router.get("/{zone_id}", response_model=DangerZoneResponse)
def get_danger_zone(
    zone_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    zone = db.query(DangerZone).filter(DangerZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone non trouvée")
    return zone

# Routes admin uniquement
@router.post("/", response_model=DangerZoneResponse)
def create_danger_zone(
    zone: DangerZoneCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Créer une zone dangereuse (admin uniquement)"""
    try:
        new_zone = DangerZone(**zone.dict())
        db.add(new_zone)
        db.commit()
        db.refresh(new_zone)
        logger.info(f"Zone dangereuse créée par admin {current_admin.email}: {new_zone.name}")
        return new_zone
    except Exception as e:
        db.rollback()
        logger.error(f"Erreur création zone: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la création")

@router.put("/{zone_id}", response_model=DangerZoneResponse)
def update_danger_zone(
    zone_id: int,
    zone: DangerZoneUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Modifier une zone dangereuse (admin uniquement)"""
    existing = db.query(DangerZone).filter(DangerZone.id == zone_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Zone non trouvée")

    try:
        for key, value in zone.dict(exclude_unset=True).items():
            setattr(existing, key, value)
        db.commit()
        db.refresh(existing)
        logger.info(f"Zone dangereuse modifiée par admin {current_admin.email}: {existing.name}")
        return existing
    except Exception as e:
        db.rollback()
        logger.error(f"Erreur modification zone: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la modification")

@router.patch("/{zone_id}/toggle")
def toggle_danger_zone(
    zone_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Activer/désactiver une zone dangereuse (admin uniquement)"""
    zone = db.query(DangerZone).filter(DangerZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone non trouvée")

    zone.is_active = not zone.is_active
    db.commit()
    logger.info(f"Zone dangereuse {'activée' if zone.is_active else 'désactivée'} par admin {current_admin.email}: {zone.name}")
    return {"id": zone.id, "is_active": zone.is_active}

@router.delete("/{zone_id}")
def delete_danger_zone(
    zone_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Supprimer une zone dangereuse (admin uniquement)"""
    zone = db.query(DangerZone).filter(DangerZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone non trouvée")

    try:
        zone_name = zone.name
        db.delete(zone)
        db.commit()
        logger.info(f"Zone dangereuse supprimée par admin {current_admin.email}: {zone_name}")
        return {"message": "Zone supprimée avec succès"}
    except Exception as e:
        db.rollback()
        logger.error(f"Erreur suppression zone: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la suppression")