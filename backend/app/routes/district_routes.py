from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.models.district import District
from typing import List, Any, Dict

router = APIRouter()

@router.get("/")
def get_districts(db: Session = Depends(get_db)) -> List[Dict[str, Any]]:
    """Récupérer tous les districts (public)"""
    try:
        districts = db.query(District).all()
        return [
            {
                "id": d.id,
                "name": d.name,
                "description": getattr(d, "description", None),
                "population": getattr(d, "population", None),
                "area": getattr(d, "area", None)
            }
            for d in districts
        ]
    except Exception as e:
        print(f"Erreur districts: {e}")
        return []

@router.get("/{district_id}")
def get_district(district_id: int, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Récupérer un district par son ID"""
    district = db.query(District).filter(District.id == district_id).first()
    if not district:
        raise HTTPException(status_code=404, detail="District non trouvé")
    return {
        "id": district.id,
        "name": district.name,
        "description": getattr(district, "description", None),
        "population": getattr(district, "population", None),
        "area": getattr(district, "area", None)
    }