from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.controllers.route_controller import RouteController
from app.core.constants import RouteMode

router = APIRouter()


@router.get("/best-shelter")
def find_best_shelter(
    user_lat: float = Query(..., description="Latitude utilisateur"),
    user_lon: float = Query(..., description="Longitude utilisateur"),
    mode:     str   = Query(RouteMode.NORMAL, description="normal ou urgence"),
    db: Session = Depends(get_db)
):
    return RouteController(db).find_best(user_lat, user_lon, mode)


@router.get("/to-shelter/{shelter_id}")
def path_to_shelter(
    shelter_id: int,
    user_lat:   float = Query(...),
    user_lon:   float = Query(...),
    mode:       str   = Query(RouteMode.NORMAL),
    db: Session = Depends(get_db)
):
    return RouteController(db).path_to(user_lat, user_lon, shelter_id, mode)


@router.get("/compare/{shelter_id}")
def compare_routes(
    shelter_id: int,
    user_lat:   float = Query(...),
    user_lon:   float = Query(...),
    db: Session = Depends(get_db)
):
    return RouteController(db).compare(user_lat, user_lon, shelter_id)