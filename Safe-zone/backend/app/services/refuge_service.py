# app/services/refuge_service.py
from sqlalchemy.orm import Session
from ..models.refuge import Refuge
from ..algorithms.graph import Graph


class RefugeService:

    @staticmethod
    def _format(r: Refuge, distance_km: float = None, time_min: float = None) -> dict:
        data = {
            "id":                 r.id,
            "name":               r.name,
            "description":        r.description,
            "latitude":           r.latitude,
            "longitude":          r.longitude,
            "capacity":           r.capacity,
            "current_occupancy":  r.current_occupancy,
            "type":               r.type,
            "address":            r.address,
            "is_active":          r.is_active,
            "has_water":          r.has_water,
            "has_electricity":    r.has_electricity,
            "has_medical":        r.has_medical,
            "contact_phone":      r.contact_phone,
            "available_spots":    r.capacity - r.current_occupancy,
            "is_full":            r.current_occupancy >= r.capacity
        }
        if distance_km is not None:
            data["distance_km"] = distance_km
        if time_min is not None:
            data["estimated_time_minutes"] = time_min
        return data

    @staticmethod
    def get_all(db: Session):
        refuges = db.query(Refuge).filter(Refuge.is_active == True).all()
        return [RefugeService._format(r) for r in refuges]

    @staticmethod
    def get_by_id(db: Session, refuge_id: int):
        return db.query(Refuge).filter(Refuge.id == refuge_id).first()

    @staticmethod
    def get_nearest(db: Session, lat: float, lon: float, limit: int = 10):
        refuges = db.query(Refuge).filter(Refuge.is_active == True).all()
        result = []
        for r in refuges:
            dist = Graph.haversine(lat, lon, r.latitude, r.longitude)
            km = round(dist / 1000, 2)
            mins = round(km / 4.5 * 60, 1)
            result.append(RefugeService._format(r, km, mins))
        result.sort(key=lambda x: x["distance_km"])
        return result[:limit]

    @staticmethod
    def create(db: Session, data: dict):
        refuge = Refuge(**data)
        db.add(refuge)
        db.commit()
        db.refresh(refuge)
        return RefugeService._format(refuge)

    @staticmethod
    def update(db: Session, refuge_id: int, data: dict):
        refuge = db.query(Refuge).filter(Refuge.id == refuge_id).first()
        if not refuge:
            return None
        for k, v in data.items():
            setattr(refuge, k, v)
        db.commit()
        db.refresh(refuge)
        return RefugeService._format(refuge)

    @staticmethod
    def delete(db: Session, refuge_id: int):
        refuge = db.query(Refuge).filter(Refuge.id == refuge_id).first()
        if not refuge:
            return False
        refuge.is_active = False
        db.commit()
        return True