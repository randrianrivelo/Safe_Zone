"""
Router pour l'authentification et la gestion des utilisateurs
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from schemas.user import UserCreate, UserResponse, UserLogin
from utils import hash_password, verify_password, create_access_token
from datetime import timedelta

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    """Enregistrer un nouvel utilisateur"""
    # Vérifier si l'email existe déjà
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Créer le nouvel utilisateur
    hashed_password = hash_password(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        password_hash=hashed_password,
        role=user.role,
        phone=user.phone
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user


@router.post("/login")
def login(user_creds: UserLogin, db: Session = Depends(get_db)):
    """Se connecter et obtenir un token"""
    user = db.query(User).filter(User.email == user_creds.email).first()
    
    if not user or not verify_password(user_creds.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Créer le token
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse.from_orm(user)
    }


@router.get("/me", response_model=UserResponse)
def get_current_user(db: Session = Depends(get_db)):
    """Récupérer l'utilisateur actuellement connecté"""
    from fastapi import Header
    from utils import verify_token
    
    # Note: Ce endpoint doit être sécurisé avec le token
    # Implémentation basique - à améliorer
    raise HTTPException(status_code=401, detail="Not authenticated")
