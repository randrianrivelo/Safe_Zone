from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DangerZoneBase(BaseModel):
    name: str
    danger_type: str
    center_lat: float
    center_lon: float
    radius_km: float = 0.5
    severity: str = "moyen"
    description: Optional[str] = None
    is_active: bool = True

class DangerZoneCreate(DangerZoneBase):
    pass

class DangerZoneUpdate(DangerZoneBase):
    pass

class DangerZoneResponse(DangerZoneBase):
    id: int
    started_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True