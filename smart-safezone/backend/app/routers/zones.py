"""
Router pour la gestion des zones dangereuses
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.zone_danger import DangerZone
from schemas.zones import DangerZoneCreate, DangerZoneUpdate

router = APIRouter(prefix="/api/danger-zones", tags=["danger-zones"])


@router.get("/", response_model=List[dict])
def get_danger_zones(db: Session = Depends(get_db)):
    """Récupérer toutes les zones dangereuses"""
    zones = db.query(DangerZone).filter(DangerZone.is_active == True).all()
    return [
        {
            "id": z.id,
            "name": z.name,
            "description": z.description,
            "latitude": float(z.latitude),
            "longitude": float(z.longitude),
            "radius": float(z.radius),
            "danger_type": z.danger_type,
            "severity": z.severity,
            "reported_at": z.reported_at,
            "expires_at": z.expires_at
        }
        for z in zones
    ]


@router.get("/{zone_id}", response_model=dict)
def get_danger_zone(zone_id: int, db: Session = Depends(get_db)):
    """Récupérer une zone dangereuse par ID"""
    zone = db.query(DangerZone).filter(DangerZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Danger zone not found")
    
    return {
        "id": zone.id,
        "name": zone.name,
        "description": zone.description,
        "latitude": float(zone.latitude),
        "longitude": float(zone.longitude),
        "radius": float(zone.radius),
        "danger_type": zone.danger_type,
        "severity": zone.severity,
        "is_active": zone.is_active,
        "reported_at": zone.reported_at,
        "expires_at": zone.expires_at
    }


@router.post("/", response_model=dict)
def create_danger_zone(zone: DangerZoneCreate, db: Session = Depends(get_db)):
    """Créer une nouvelle zone dangereuse"""
    db_zone = DangerZone(**zone.dict())
    db.add(db_zone)
    db.commit()
    db.refresh(db_zone)
    
    return {
        "id": db_zone.id,
        "name": db_zone.name,
        "latitude": float(db_zone.latitude),
        "longitude": float(db_zone.longitude),
        "radius": float(db_zone.radius),
        "danger_type": db_zone.danger_type,
        "severity": db_zone.severity
    }


@router.put("/{zone_id}", response_model=dict)
def update_danger_zone(zone_id: int, zone_update: DangerZoneUpdate, db: Session = Depends(get_db)):
    """Mettre à jour une zone dangereuse"""
    zone = db.query(DangerZone).filter(DangerZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Danger zone not found")
    
    update_data = zone_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(zone, key, value)
    
    db.add(zone)
    db.commit()
    db.refresh(zone)
    
    return {
        "id": zone.id,
        "name": zone.name,
        "latitude": float(zone.latitude),
        "longitude": float(zone.longitude),
        "radius": float(zone.radius),
        "danger_type": zone.danger_type,
        "severity": zone.severity
    }


@router.delete("/{zone_id}")
def delete_danger_zone(zone_id: int, db: Session = Depends(get_db)):
    """Supprimer une zone dangereuse"""
    zone = db.query(DangerZone).filter(DangerZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Danger zone not found")
    
    db.delete(zone)
    db.commit()
    return {"message": "Danger zone deleted"}
