"""
Modèle User (Utilisateur)
"""
from sqlalchemy import Column, Integer, String, DateTime, Enum, Boolean
from sqlalchemy.sql import func
from datetime import datetime
from database import Base
import enum


class UserRole(str, enum.Enum):
    """Rôles possibles pour les utilisateurs"""
    CITIZEN = "citizen"
    ADMIN = "admin"


class User(Base):
    """Modèle de l'utilisateur"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default=UserRole.CITIZEN.value)
    phone = Column(String(20), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<User(id={self.id}, username={self.username}, email={self.email}, role={self.role})>"
