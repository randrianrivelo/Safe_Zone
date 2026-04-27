"""
Service de gestion des refuges
"""
from sqlalchemy.orm import Session
from sqlalchemy import and_
from models.refuge import Refuge
from schemas.refuge import RefugeCreate, RefugeUpdate
from typing import List, Optional


class RefugeService:
    """Service pour gérer les refuges"""
    
    @staticmethod
    def get_refuge(db: Session, refuge_id: int) -> Optional[Refuge]:
        """Récupérer un refuge par ID"""
        return db.query(Refuge).filter(Refuge.id == refuge_id).first()
    
    @staticmethod
    def get_all_refuges(db: Session, skip: int = 0, limit: int = 100) -> List[Refuge]:
        """Récupérer tous les refuges avec pagination"""
        return db.query(Refuge).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_active_refuges(db: Session) -> List[Refuge]:
        """Récupérer les refuges actifs"""
        return db.query(Refuge).filter(Refuge.is_active == True).all()
    
    @staticmethod
    def create_refuge(db: Session, refuge: RefugeCreate) -> Refuge:
        """Créer un nouveau refuge"""
        db_refuge = Refuge(**refuge.dict())
        db.add(db_refuge)
        db.commit()
        db.refresh(db_refuge)
        return db_refuge
    
    @staticmethod
    def update_refuge(db: Session, refuge_id: int, refuge_update: RefugeUpdate) -> Optional[Refuge]:
        """Mettre à jour un refuge"""
        db_refuge = db.query(Refuge).filter(Refuge.id == refuge_id).first()
        if not db_refuge:
            return None
        
        update_data = refuge_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_refuge, key, value)
        
        db.add(db_refuge)
        db.commit()
        db.refresh(db_refuge)
        return db_refuge
    
    @staticmethod
    def delete_refuge(db: Session, refuge_id: int) -> bool:
        """Supprimer un refuge"""
        db_refuge = db.query(Refuge).filter(Refuge.id == refuge_id).first()
        if not db_refuge:
            return False
        
        db.delete(db_refuge)
        db.commit()
        return True
    
    @staticmethod
    def get_nearby_refuges(db: Session, latitude: float, longitude: float, radius_km: float = 5) -> List[Refuge]:
        """Récupérer les refuges à proximité (environ)"""
        # Approximation simple (à améliorer avec calcul de distance réel)
        lat_delta = radius_km / 111.0
        lon_delta = radius_km / (111.0 * abs(__import__('math').cos(__import__('math').radians(latitude))))
        
        return db.query(Refuge).filter(
            and_(
                Refuge.latitude >= latitude - lat_delta,
                Refuge.latitude <= latitude + lat_delta,
                Refuge.longitude >= longitude - lon_delta,
                Refuge.longitude <= longitude + lon_delta,
                Refuge.is_active == True
            )
        ).all()
    
    @staticmethod
    def update_occupancy(db: Session, refuge_id: int, occupancy: int) -> Optional[Refuge]:
        """Mettre à jour l'occupation d'un refuge"""
        db_refuge = db.query(Refuge).filter(Refuge.id == refuge_id).first()
        if not db_refuge:
            return None
        
        db_refuge.current_occupancy = min(occupancy, db_refuge.capacity)
        db.add(db_refuge)
        db.commit()
        db.refresh(db_refuge)
        return db_refuge
