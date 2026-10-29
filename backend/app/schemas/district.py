from pydantic import BaseModel
from typing import Optional

class DistrictResponse(BaseModel):
    id: int
    name: str
    code: Optional[str] = None

    class Config:
        from_attributes = True