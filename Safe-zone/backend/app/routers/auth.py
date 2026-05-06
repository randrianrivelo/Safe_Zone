# app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from ..database import get_db
from ..models.user import User
from ..schemas.user import UserCreate, UserResponse, LoginRequest

router = APIRouter(prefix="/auth", tags=["Authentification"])
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


@router.post("/register", response_model=UserResponse)
def register(body: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(400, "Email déjà utilisé")
    user = User(
        username=body.username,
        email=body.email,
        password_hash=pwd.hash(body.password),
        phone=body.phone
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login")
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not pwd.verify(body.password, user.password_hash):
        raise HTTPException(401, "Email ou mot de passe incorrect")
    return {
        "message": "Connexion réussie",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role
        }
    }