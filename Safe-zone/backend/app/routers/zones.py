# app/routers/zones.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.zone_danger import DangerZone, Alert
from ..schemas.zones import DangerZoneCreate, AlertCreate

router = APIRouter(prefix="/zones", tags=["Zones & Alertes"])


@router.get("/danger")
def get_danger_zones(db: Session = Depends(get_db)):
    zones = db.query(DangerZone).filter(DangerZone.is_active == True).all()
    return [{
        "id": z.id, "name": z.name, "description": z.description,
        "latitude": z.latitude, "longitude": z.longitude,
        "radius": z.radius, "danger_type": z.danger_type,
        "severity": z.severity, "is_active": z.is_active
    } for z in zones]


@router.post("/danger")
def create_danger_zone(body: DangerZoneCreate, db: Session = Depends(get_db)):
    zone = DangerZone(**body.dict())
    db.add(zone)
    db.commit()
    db.refresh(zone)
    return {"message": "Zone créée", "id": zone.id}


@router.delete("/danger/{zone_id}")
def delete_danger_zone(zone_id: int, db: Session = Depends(get_db)):
    zone = db.query(DangerZone).filter(DangerZone.id == zone_id).first()
    if not zone:
        raise HTTPException(404, "Zone introuvable")
    zone.is_active = False
    db.commit()
    return {"message": "Zone désactivée"}


@router.get("/alerts")
def get_alerts(db: Session = Depends(get_db)):
    alerts = db.query(Alert).filter(Alert.is_active == True).all()
    return [{
        "id": a.id, "title": a.title, "message": a.message,
        "alert_type": a.alert_type, "severity": a.severity,
        "is_active": a.is_active
    } for a in alerts]


@router.post("/alerts")
def create_alert(body: AlertCreate, db: Session = Depends(get_db)):
    alert = Alert(**body.dict())
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return {"message": "Alerte créée", "id": alert.id}


@router.delete("/alerts/{alert_id}")
def delete_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(404, "Alerte introuvable")
    alert.is_active = False
    db.commit()
    return {"message": "Alerte désactivée"}