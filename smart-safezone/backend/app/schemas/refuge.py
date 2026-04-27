"""
Schemas Pydantic pour Refuge
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class RefugeBase(BaseModel):
    """Base schema pour Refuge"""
    name: str
    description: Optional[str] = None
    latitude: float
    longitude: float
    capacity: int
    type: Optional[str] = None
    address: Optional[str] = None
    is_active: bool = True
    has_water: bool = False
    has_electricity: bool = False
    has_medical: bool = False
    contact_phone: Optional[str] = None


class RefugeCreate(RefugeBase):
    """Schema pour créer un refuge"""
    pass


class RefugeUpdate(BaseModel):
    """Schema pour mettre à jour un refuge"""
    name: Optional[str] = None
    description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    capacity: Optional[int] = None
    current_occupancy: Optional[int] = None
    type: Optional[str] = None
    address: Optional[str] = None
    is_active: Optional[bool] = None
    has_water: Optional[bool] = None
    has_electricity: Optional[bool] = None
    has_medical: Optional[bool] = None
    contact_phone: Optional[str] = None


class RefugeResponse(RefugeBase):
    """Schema pour retourner un refuge"""
    id: int
    current_occupancy: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
