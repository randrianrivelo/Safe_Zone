from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ActivityLogBase(BaseModel):
    action: str
    module: str
    details: Optional[str] = None

class ActivityLogCreate(ActivityLogBase):
    user_id: Optional[int] = None
    ip_address: Optional[str] = None

class ActivityLogResponse(ActivityLogBase):
    id: int
    user_id: Optional[int]
    created_at: datetime
    ip_address: Optional[str]

    class Config:
        from_attributes = True
