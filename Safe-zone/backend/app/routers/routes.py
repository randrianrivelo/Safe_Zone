# app/routers/routes.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..services.route_service import RouteService

router = APIRouter(prefix="/routes", tags=["Routes"])


@router.get("/")
def get_all(db: Session = Depends(get_db)):
    return RouteService.get_all_edges(db)


@router.put("/{edge_id}/block")
def block(edge_id: int, db: Session = Depends(get_db)):
    if not RouteService.block(db, edge_id):
        raise HTTPException(404, "Route introuvable")
    return {"message": f"Route {edge_id} bloquée"}


@router.put("/{edge_id}/unblock")
def unblock(edge_id: int, db: Session = Depends(get_db)):
    if not RouteService.unblock(db, edge_id):
        raise HTTPException(404, "Route introuvable")
    return {"message": f"Route {edge_id} débloquée"}