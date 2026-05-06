# app/schemas/zones.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DangerZoneCreate(BaseModel):
    name: str
    description: Optional[str] = None
    latitude: float
    longitude: float
    radius: float
    danger_type: str
    severity: int = 1


class DangerZoneResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    latitude: float
    longitude: float
    radius: float
    danger_type: Optional[str]
    severity: int
    is_active: bool

    class Config:
        from_attributes = True


class AlertCreate(BaseModel):
    title: str
    message: str
    alert_type: Optional[str] = None
    severity: str = "info"


class AlertResponse(BaseModel):
    id: int
    title: str
    message: str
    alert_type: Optional[str]
    severity: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True