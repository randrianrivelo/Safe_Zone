from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class RoadBase(BaseModel):
    name: Optional[str] = None
    road_type: str = "urbaine"
    start_lat: float
    start_lon: float
    end_lat: float
    end_lon: float
    distance_km: float = 0
    status: str = "normal"
    is_passable: bool = True
    danger_level: int = 0

class RoadCreate(RoadBase):
    pass

class RoadUpdate(RoadBase):
    pass

class RoadResponse(RoadBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True