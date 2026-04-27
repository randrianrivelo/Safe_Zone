"""
Schemas Pydantic pour DangerZone
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class DangerZoneBase(BaseModel):
    """Base schema pour DangerZone"""
    name: Optional[str] = None
    description: Optional[str] = None
    latitude: float
    longitude: float
    radius: float
    danger_type: Optional[str] = None
    severity: int = 1
    is_active: bool = True


class DangerZoneCreate(DangerZoneBase):
    """Schema pour créer une zone dangereuse"""
    pass


class DangerZoneUpdate(BaseModel):
    """Schema pour mettre à jour une zone dangereuse"""
    name: Optional[str] = None
    description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    radius: Optional[float] = None
    danger_type: Optional[str] = None
    severity: Optional[int] = None
    is_active: Optional[bool] = None
    expires_at: Optional[datetime] = None


class DangerZoneResponse(DangerZoneBase):
    """Schema pour retourner une zone dangereuse"""
    id: int
    reported_at: datetime
    expires_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
