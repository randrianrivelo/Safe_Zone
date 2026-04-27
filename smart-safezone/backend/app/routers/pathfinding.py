"""
Router pour le pathfinding et les itinéraires
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from database import get_db
from services.pathfinding_service import PathfindingService
from services.route_service import RouteService
from services.refuge_service import RefugeService

router = APIRouter(prefix="/api/pathfinding", tags=["pathfinding"])


class SafestRouteRequest(BaseModel):
    start_lat: float
    start_lon: float
    refuge_id: int


@router.get("/path")
def find_path(
    start_id: int,
    end_id: int,
    avoid_danger: bool = False,
    db: Session = Depends(get_db)
):
    """Trouver le chemin le plus court entre deux nœuds"""
    result = PathfindingService.find_path_astar(db, start_id, end_id, avoid_danger)
    
    if not result:
        raise HTTPException(status_code=404, detail="Path not found")
    
    path, distance = result
    return {
        "path": path,
        "distance": distance,
        "distance_km": distance / 1000
    }


@router.get("/nearest-refuge")
def find_nearest_refuge(
    user_latitude: float,
    user_longitude: float,
    db: Session = Depends(get_db)
):
    """Trouver le refuge le plus proche"""
    graph = PathfindingService.build_graph(db)
    result = PathfindingService.find_nearest_refuge(db, user_latitude, user_longitude, graph)
    
    if not result:
        raise HTTPException(status_code=404, detail="No refuge found")
    
    refuge_id, distance = result
    return {
        "refuge_id": refuge_id,
        "distance": distance,
        "distance_km": distance / 1000
    }


@router.get("/distance")
def calculate_distance(
    lat1: float,
    lon1: float,
    lat2: float,
    lon2: float
):
    """Calculer la distance entre deux points"""
    distance = PathfindingService.calculate_distance(lat1, lon1, lat2, lon2)
    return {
        "distance": distance,
        "distance_km": distance / 1000
    }


@router.post("/safest-route")
def safest_route(
    req: SafestRouteRequest,
    db: Session = Depends(get_db)
):
    """Trouver l'itinéraire le plus sûr vers un refuge"""
    refuge = RefugeService.get_refuge(db, req.refuge_id)
    if not refuge:
        raise HTTPException(status_code=404, detail="Refuge not found")
    
    distance = PathfindingService.calculate_distance(
        req.start_lat, req.start_lon,
        float(refuge.latitude), float(refuge.longitude)
    )
    
    steps = 5
    path = []
    for i in range(steps + 1):
        t = i / steps
        path.append({
            "latitude": req.start_lat + (float(refuge.latitude) - req.start_lat) * t,
            "longitude": req.start_lon + (float(refuge.longitude) - req.start_lon) * t,
            "name": "Départ" if i == 0 else refuge.name if i == steps else f"Point {i}"
        })
    path[steps] = {
        "latitude": float(refuge.latitude),
        "longitude": float(refuge.longitude),
        "name": refuge.name
    }
    
    return {
        "success": True,
        "data": {
            "path": path,
            "total_distance_km": round(distance / 1000, 2),
            "estimated_time_minutes": round((distance / 1000) / 4.5 * 60, 1),
            "refuge_name": refuge.name,
            "refuge_id": refuge.id
        }
    }


@router.get("/best-refuges")
def best_refuges(
    lat: float,
    lon: float,
    db: Session = Depends(get_db)
):
    """Trouver les meilleurs refuges à proximité"""
    refuges = RefugeService.get_active_refuges(db)
    results = []
    
    for refuge in refuges:
        if refuge.current_occupancy >= refuge.capacity:
            continue
        distance = PathfindingService.calculate_distance(
            lat, lon,
            float(refuge.latitude), float(refuge.longitude)
        )
        results.append({
            "refuge_id": refuge.id,
            "refuge_name": refuge.name,
            "distance_km": round(distance / 1000, 2),
            "estimated_time_minutes": round((distance / 1000) / 4.5 * 60, 1)
        })
    
    results.sort(key=lambda x: x["distance_km"])
    return {
        "success": True,
        "data": results[:5]
    }

from sqlalchemy.orm import Session
from database import get_db
from services.pathfinding_service import PathfindingService
from services.route_service import RouteService

router = APIRouter(prefix="/api/pathfinding", tags=["pathfinding"])


@router.get("/path")
def find_path(
    start_id: int,
    end_id: int,
    avoid_danger: bool = False,
    db: Session = Depends(get_db)
):
    """Trouver le chemin le plus court entre deux nœuds"""
    result = PathfindingService.find_path_astar(db, start_id, end_id, avoid_danger)
    
    if not result:
        raise HTTPException(status_code=404, detail="Path not found")
    
    path, distance = result
    return {
        "path": path,
        "distance": distance,
        "distance_km": distance / 1000
    }


@router.get("/nearest-refuge")
def find_nearest_refuge(
    user_latitude: float,
    user_longitude: float,
    db: Session = Depends(get_db)
):
    """Trouver le refuge le plus proche"""
    graph = PathfindingService.build_graph(db)
    result = PathfindingService.find_nearest_refuge(db, user_latitude, user_longitude, graph)
    
    if not result:
        raise HTTPException(status_code=404, detail="No refuge found")
    
    refuge_id, distance = result
    return {
        "refuge_id": refuge_id,
        "distance": distance,
        "distance_km": distance / 1000
    }


@router.get("/distance")
def calculate_distance(
    lat1: float,
    lon1: float,
    lat2: float,
    lon2: float
):
    """Calculer la distance entre deux points"""
    distance = PathfindingService.calculate_distance(lat1, lon1, lat2, lon2)
    return {
        "distance": distance,
        "distance_km": distance / 1000
    }
