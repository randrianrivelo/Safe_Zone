from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.services.auth_service import AuthService
from app.schemas.user import UserRegister, UserLogin, EmergencyLogin
from app.core.security import get_current_user

router = APIRouter()

@router.post("/register")
def register(data: UserRegister, db: Session = Depends(get_db)):
    return AuthService(db).register(
        email=data.email,
        password=data.password,
        name=data.name,
        phone=data.phone
    )

@router.post("/login")
def login(data: UserLogin, db: Session = Depends(get_db)):
    return AuthService(db).login(data.email, data.password)

@router.post("/emergency-login")
def emergency_login(data: EmergencyLogin, db: Session = Depends(get_db)):
    """Mode urgence - connexion avec code PIN"""
    return AuthService(db).emergency_login(data.email, data.emergency_code)

@router.get("/me")
def get_me(current_user=Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "role": current_user.role,
        "avatar": current_user.avatar,
        "last_login": current_user.last_login,
        "shelter_id": current_user.shelter_id
    }