# app/schemas/route.py
from pydantic import BaseModel
from typing import List, Optional


class PathRequest(BaseModel):
    start_lat: float
    start_lon: float
    refuge_id: Optional[int] = None


class PathStep(BaseModel):
    latitude: float
    longitude: float
    name: Optional[str] = None


class PathResponse(BaseModel):
    path: List[PathStep]
    total_distance_km: float
    estimated_time_minutes: float
    refuge_name: str
    refuge_id: int
    algorithm_used: str = "astar"


class EdgeUpdate(BaseModel):
    is_passable: Optional[bool] = None
    danger_level: Optional[int] = None
    flood_risk: Optional[bool] = None