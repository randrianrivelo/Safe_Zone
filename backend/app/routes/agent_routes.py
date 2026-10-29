from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.config.database import get_db
from app.core.security import get_current_user, get_current_agent_or_admin
from app.models.user import User
from app.models.shelter import Shelter
from app.models.shelter_entry import ShelterEntry
from app.schemas.shelter_entry import ShelterEntryCreate, ShelterEntryResponse, ShelterEntryUpdate
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/agent", tags=["Agent"])

# ============================================================
# REFUGE ASSIGNÉ À L'AGENT
# ============================================================
@router.get("/shelter")
def get_agent_shelter(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_agent_or_admin)
):
    """Récupérer le refuge assigné à l'agent"""
    if not current_user.shelter_id:
        raise HTTPException(status_code=404, detail="Aucun refuge assigné")

    shelter = db.query(Shelter).filter(Shelter.id == current_user.shelter_id).first()
    if not shelter:
        raise HTTPException(status_code=404, detail="Refuge non trouvé")

    return {
        "id": shelter.id,
        "name": shelter.name,
        "district": shelter.district,
        "capacity_total": shelter.capacity_total,
        "current_occupancy": shelter.current_occupancy,
        "status": shelter.status,
        "contact_phone": shelter.contact_phone,
        "address": shelter.address,
        "has_water": shelter.has_water,
        "has_electricity": shelter.has_electricity,
        "has_medical": shelter.has_medical,
        "has_food": shelter.has_food,
        "has_toilets": shelter.has_toilets
    }

# ============================================================
# STATISTIQUES DU REFUGE
# ============================================================
@router.get("/stats")
def get_shelter_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_agent_or_admin)
):
    """Récupérer les statistiques du refuge"""
    if not current_user.shelter_id:
        raise HTTPException(status_code=404, detail="Aucun refuge assigné")

    entries = db.query(ShelterEntry).filter(
        ShelterEntry.shelter_id == current_user.shelter_id,
        ShelterEntry.status == "present"
    ).all()

    today = datetime.now().date()
    today_entries = db.query(ShelterEntry).filter(
        ShelterEntry.shelter_id == current_user.shelter_id,
        ShelterEntry.entry_time >= today
    ).count()

    today_exits = db.query(ShelterEntry).filter(
        ShelterEntry.shelter_id == current_user.shelter_id,
        ShelterEntry.exit_time >= today
    ).count()

    children = len([e for e in entries if e.age < 18])
    elderly = len([e for e in entries if e.age >= 60])
    injured = len([e for e in entries if e.is_injured])
    families = len(set([e.family_id for e in entries if e.family_id]))
    alone = len([e for e in entries if not e.family_id])
    men = len([e for e in entries if e.gender == "M"])
    women = len([e for e in entries if e.gender == "F"])

    return {
        "total": len(entries),
        "children": children,
        "elderly": elderly,
        "injured": injured,
        "families": families,
        "alone": alone,
        "men": men,
        "women": women,
        "today_entries": today_entries,
        "today_exits": today_exits
    }

# ============================================================
# GESTION DES PERSONNES (CRUD)
# ============================================================
@router.get("/people", response_model=List[ShelterEntryResponse])
def get_shelter_people(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_agent_or_admin),
    status: Optional[str] = "present"
):
    """Récupérer les personnes du refuge"""
    if not current_user.shelter_id:
        raise HTTPException(status_code=404, detail="Aucun refuge assigné")

    query = db.query(ShelterEntry).filter(
        ShelterEntry.shelter_id == current_user.shelter_id
    )
    if status:
        query = query.filter(ShelterEntry.status == status)

    return query.order_by(ShelterEntry.entry_time.desc()).all()

@router.post("/people", response_model=ShelterEntryResponse)
def add_person(
    data: ShelterEntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_agent_or_admin)
):
    """Ajouter une personne au refuge"""
    if not current_user.shelter_id:
        raise HTTPException(status_code=404, detail="Aucun refuge assigné")

    entry = ShelterEntry(
        shelter_id=current_user.shelter_id,
        name=data.name,
        age=data.age,
        gender=data.gender,
        family_id=data.family_id,
        phone=data.phone,
        id_card=data.id_card,
        is_injured=data.is_injured,
        injury_type=data.injury_type,
        needs=data.needs,
        notes=data.notes,
        entry_time=data.entry_time or datetime.now(),
        status="present"
    )
    db.add(entry)

    # Mettre à jour l'occupation du refuge
    shelter = db.query(Shelter).filter(Shelter.id == current_user.shelter_id).first()
    if shelter:
        shelter.current_occupancy += 1

    db.commit()
    db.refresh(entry)
    return entry

@router.patch("/people/{entry_id}/depart")
def mark_departure(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_agent_or_admin)
):
    """Marquer le départ d'une personne"""
    entry = db.query(ShelterEntry).filter(
        ShelterEntry.id == entry_id,
        ShelterEntry.shelter_id == current_user.shelter_id
    ).first()

    if not entry:
        raise HTTPException(status_code=404, detail="Entrée non trouvée")

    entry.status = "departed"
    entry.exit_time = datetime.now()

    # Mettre à jour l'occupation du refuge
    shelter = db.query(Shelter).filter(Shelter.id == current_user.shelter_id).first()
    if shelter and shelter.current_occupancy > 0:
        shelter.current_occupancy -= 1

    db.commit()
    return {"success": True}

# ============================================================
# QR CODE POUR LE REFUGE
# ============================================================
@router.get("/qr-code")
def get_shelter_qr_code(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_agent_or_admin)
):
    """Générer les données du QR code pour le refuge"""
    if not current_user.shelter_id:
        raise HTTPException(status_code=404, detail="Aucun refuge assigné")

    shelter = db.query(Shelter).filter(Shelter.id == current_user.shelter_id).first()

    return {
        "shelter_id": shelter.id,
        "shelter_name": shelter.name,
        "agent_name": current_user.name,
        "timestamp": datetime.now().isoformat()
    }

# ============================================================
# RESSOURCES
# ============================================================
@router.get("/resources")
def get_shelter_resources(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_agent_or_admin)
):
    """Récupérer les ressources du refuge"""
    # À implémenter avec une table resources
    return {
        "water": 65,
        "food": 42,
        "medicine": 78,
        "blankets": 53
    }

@router.post("/resources/request")
def request_resource(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_agent_or_admin)
):
    """Faire une demande de ressources"""
    # À implémenter avec un système de notifications admin
    return {"success": True, "request_id": 1}

class QRScanData(BaseModel):
    shelter_id: int
    agent_id: int
    person_name: str
    person_phone: str = None
    entry_time: datetime = None

@router.post("/register-by-qr")
def register_by_qr(
    data: QRScanData,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_agent_or_admin)
):
    """Enregistrer une personne via scan QR code"""

    # Vérifier que l'agent a le droit d'enregistrer dans ce refuge
    if current_user.shelter_id != data.shelter_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Non autorisé pour ce refuge")

    # Créer l'entrée
    entry = ShelterEntry(
        shelter_id=data.shelter_id,
        name=data.person_name,
        phone=data.person_phone,
        entry_time=data.entry_time or datetime.now(),
        status="present",
        registered_by=current_user.id
    )
    db.add(entry)

    # Mettre à jour l'occupation du refuge
    shelter = db.query(Shelter).filter(Shelter.id == data.shelter_id).first()
    if shelter:
        shelter.current_occupancy += 1

    db.commit()
    db.refresh(entry)

    return {
        "success": True,
        "entry_id": entry.id,
        "message": f"{data.person_name} enregistré au refuge"
    }