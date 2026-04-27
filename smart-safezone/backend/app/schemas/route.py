"""
Schemas Pydantic pour Route et Node
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class NodeBase(BaseModel):
    """Base schema pour Node"""
    latitude: float
    longitude: float
    name: Optional[str] = None
    node_type: str = "intersection"


class NodeCreate(NodeBase):
    """Schema pour créer un node"""
    pass


class NodeResponse(NodeBase):
    """Schema pour retourner un node"""
    id: int
    
    class Config:
        from_attributes = True


class RouteBase(BaseModel):
    """Base schema pour Route"""
    node_from: int
    node_to: int
    distance: float
    road_name: Optional[str] = None
    road_type: Optional[str] = None
    is_passable: bool = True
    danger_level: int = 0
    flood_risk: bool = False


class RouteCreate(RouteBase):
    """Schema pour créer une route"""
    pass


class RouteUpdate(BaseModel):
    """Schema pour mettre à jour une route"""
    is_passable: Optional[bool] = None
    danger_level: Optional[int] = None
    flood_risk: Optional[bool] = None


class RouteResponse(RouteBase):
    """Schema pour retourner une route"""
    id: int
    last_updated: datetime
    
    class Config:
        from_attributes = True
