"""
Schemas - Tous les schemas Pydantic
"""
from .user import UserBase, UserCreate, UserUpdate, UserResponse, UserLogin
from .refuge import RefugeBase, RefugeCreate, RefugeUpdate, RefugeResponse
from .route import NodeBase, NodeCreate, NodeResponse, RouteBase, RouteCreate, RouteUpdate, RouteResponse

__all__ = [
    "UserBase", "UserCreate", "UserUpdate", "UserResponse", "UserLogin",
    "RefugeBase", "RefugeCreate", "RefugeUpdate", "RefugeResponse",
    "NodeBase", "NodeCreate", "NodeResponse",
    "RouteBase", "RouteCreate", "RouteUpdate", "RouteResponse"
]
