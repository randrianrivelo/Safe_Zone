# app/schemas/refuge.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class RefugeCreate(BaseModel):
    name: str
    description: Optional[str] = None
    latitude: float
    longitude: float
    capacity: int
    type: Optional[str] = None
    address: Optional[str] = None
    has_water: bool = False
    has_electricity: bool = False
    has_medical: bool = False
    contact_phone: Optional[str] = None


class RefugeUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    current_occupancy: Optional[int] = None
    is_active: Optional[bool] = None
    has_water: Optional[bool] = None
    has_electricity: Optional[bool] = None
    has_medical: Optional[bool] = None


class RefugeResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    latitude: float
    longitude: float
    capacity: int
    current_occupancy: int
    type: Optional[str]
    address: Optional[str]
    is_active: bool
    has_water: bool
    has_electricity: bool
    has_medical: bool
    contact_phone: Optional[str]
    available_spots: int = 0
    is_full: bool = False

    class Config:
        from_attributes = True


class RefugeWithDistance(RefugeResponse):
    distance_km: float
    estimated_time_minutes: float