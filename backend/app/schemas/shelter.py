from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ShelterEntryResponse(BaseModel):
    id: int
    name: str
    shelter_type: str
    latitude: float
    longitude: float
    address: Optional[str] = None
    capacity_total: int
    current_occupancy: int
    status: str
    district_id: Optional[int] = None
    district: Optional[str] = None
    has_water: bool = False
    has_electricity: bool = False
    has_medical: bool = False
    has_food: bool = False
    has_toilets: bool = False
    contact_phone: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ShelterUpdate(BaseModel):
    current_occupancy: Optional[int] = None
    status: Optional[str] = None
    name: Optional[str] = None
    capacity_total: Optional[int] = None
    has_water: Optional[bool] = None
    has_electricity: Optional[bool] = None
    has_medical: Optional[bool] = None
    has_food: Optional[bool] = None
    has_toilets: Optional[bool] = None