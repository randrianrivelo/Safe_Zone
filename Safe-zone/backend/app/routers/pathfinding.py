# app/routers/pathfinding.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas.route import PathRequest
from ..services.pathfinding_service import PathfindingService

router = APIRouter(prefix="/pathfinding", tags=["Pathfinding"])


@router.post("/route")
def calculate_route(body: PathRequest, db: Session = Depends(get_db)):
    result = PathfindingService.calculate_route(
        db, body.start_lat, body.start_lon, body.refuge_id
    )
    if "error" in result:
        raise HTTPException(404, result["error"])
    return {"success": True, "data": result}


@router.get("/best-refuges")
def best_refuges(lat: float, lon: float, db: Session = Depends(get_db)):
    results = PathfindingService.find_best_refuges(db, lat, lon)
    return {"success": True, "data": results}