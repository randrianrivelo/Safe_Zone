from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ReportCreate(BaseModel):
    report_type: str
    description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class ReportResponse(BaseModel):
    id: int
    report_type: str
    description: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    status: str
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True