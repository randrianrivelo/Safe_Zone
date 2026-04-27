"""
Schemas Pydantic pour User
"""
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class UserBase(BaseModel):
    """Base schema pour User"""
    username: str
    email: EmailStr
    phone: Optional[str] = None
    role: str = "citizen"


class UserCreate(UserBase):
    """Schema pour créer un utilisateur"""
    password: str


class UserUpdate(BaseModel):
    """Schema pour mettre à jour un utilisateur"""
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    password: Optional[str] = None


class UserResponse(UserBase):
    """Schema pour retourner un utilisateur"""
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    """Schema pour le login"""
    email: EmailStr
    password: str
