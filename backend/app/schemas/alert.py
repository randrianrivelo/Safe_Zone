from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AlertResponse(BaseModel):
    id:         int
    title:      str
    message:    str
    alert_type: str
    severity:   str
    is_active:  bool
    created_at: datetime

    class Config:
        from_attributes = True


class AlertCreate(BaseModel):
    title:           str
    message:         str
    alert_type:      Optional[str] = "info"
    severity:        Optional[str] = "moyen"
    target_district: Optional[str] = None