from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.models.user import User

# Configuration
SECRET_KEY = "votre_clé_secrète_ici_changez_la_en_production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 jours

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# ============================================================
# HASH MOT DE PASSE
# ============================================================
def hash_password(password: str) -> str:
    """Hasher un mot de passe avec bcrypt"""
    return pwd_context.hash(password)

def get_password_hash(password: str) -> str:
    """Hasher un mot de passe avec bcrypt (alias)"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Vérifier un mot de passe"""
    return pwd_context.verify(plain_password, hashed_password)

# ============================================================
# JWT TOKEN
# ============================================================
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

# ============================================================
# AUTHENTIFICATION DE BASE
# ============================================================
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Non authentifié",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        # Essayer de récupérer l'ID depuis 'id' ou 'sub'
        user_id = payload.get("id")
        if user_id is None:
            # Si 'id' n'existe pas, essayer avec 'sub' comme email
            email = payload.get("sub")
            if email:
                user = db.query(User).filter(User.email == email).first()
                if user:
                    return user
            raise credentials_exception

        user = db.query(User).filter(User.id == user_id).first()
        if user is None:
            raise credentials_exception
        return user
    except JWTError as e:
        print(f"JWT Error: {e}")
        raise credentials_exception

# ============================================================
# RÔLES ET PERMISSIONS
# ============================================================
async def get_current_agent_or_admin(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    """Vérifie que l'utilisateur est un agent ou un administrateur"""
    user = await get_current_user(token, db)
    if user.role not in ["agent", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé aux agents et administrateurs"
        )
    return user

async def get_current_admin(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    """Vérifie que l'utilisateur est un administrateur"""
    user = await get_current_user(token, db)
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé aux administrateurs"
        )
    return user