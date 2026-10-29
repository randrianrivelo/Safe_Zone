from pydantic import BaseModel, Field
from typing import Optional
from app.core.constants import RouteMode


class RouteRequest(BaseModel):
    user_lat:   float = Field(..., ge=-90,   le=90)
    user_lon:   float = Field(..., ge=-180,  le=180)
    mode:       str   = RouteMode.NORMAL


class PathToShelterRequest(BaseModel):
    user_lat:   float = Field(..., ge=-90,  le=90)
    user_lon:   float = Field(..., ge=-180, le=180)
    shelter_id: int   = Field(..., gt=0)
    mode:       str   = RouteMode.NORMAL