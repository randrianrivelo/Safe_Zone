from pydantic import BaseModel, EmailStr
from typing import Optional

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class EmergencyLogin(BaseModel):
    email: EmailStr
    emergency_code: str

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None

class EmergencyCodeUpdate(BaseModel):
    emergency_code: Optional[str] = None