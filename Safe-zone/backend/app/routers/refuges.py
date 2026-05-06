# app/routers/refuges.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas.refuge import RefugeCreate, RefugeUpdate
from ..services.refuge_service import RefugeService

router = APIRouter(prefix="/refuges", tags=["Refuges"])


@router.get("/")
def get_all(db: Session = Depends(get_db)):
    return RefugeService.get_all(db)


@router.get("/nearest")
def get_nearest(lat: float, lon: float, limit: int = 10, db: Session = Depends(get_db)):
    return RefugeService.get_nearest(db, lat, lon, limit)


@router.get("/{refuge_id}")
def get_one(refuge_id: int, db: Session = Depends(get_db)):
    r = RefugeService.get_by_id(db, refuge_id)
    if not r:
        raise HTTPException(404, "Refuge introuvable")
    return RefugeService._format(r)


@router.post("/")
def create(body: RefugeCreate, db: Session = Depends(get_db)):
    return RefugeService.create(db, body.dict())


@router.put("/{refuge_id}")
def update(refuge_id: int, body: RefugeUpdate, db: Session = Depends(get_db)):
    r = RefugeService.update(db, refuge_id, body.dict(exclude_unset=True))
    if not r:
        raise HTTPException(404, "Refuge introuvable")
    return r


@router.delete("/{refuge_id}")
def delete(refuge_id: int, db: Session = Depends(get_db)):
    if not RefugeService.delete(db, refuge_id):
        raise HTTPException(404, "Refuge introuvable")
    return {"message": "Refuge désactivé"}