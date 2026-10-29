from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ShelterEntryBase(BaseModel):
    name: str
    age: int
    gender: Optional[str] = "M"
    family_id: Optional[int] = None
    phone: Optional[str] = None
    id_card: Optional[str] = None
    is_injured: Optional[bool] = False
    injury_type: Optional[str] = None
    needs: Optional[str] = None
    notes: Optional[str] = None
    entry_time: Optional[datetime] = None

class ShelterEntryCreate(ShelterEntryBase):
    shelter_id: Optional[int] = None

class ShelterEntryUpdate(BaseModel):
    """Schéma pour la mise à jour d'une entrée"""
    status: Optional[str] = None
    exit_time: Optional[datetime] = None
    notes: Optional[str] = None
    needs: Optional[str] = None
    is_injured: Optional[bool] = None
    injury_type: Optional[str] = None

class ShelterEntryResponse(ShelterEntryBase):
    id: int
    shelter_id: int
    status: str
    entry_time: datetime
    exit_time: Optional[datetime] = None

    class Config:
        from_attributes = True