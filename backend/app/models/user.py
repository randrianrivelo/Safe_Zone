from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship  # ← AJOUTER CETTE LIGNE
from app.config.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    role = Column(String(50), default="citizen")  # citizen, agent, admin
    avatar = Column(String(255), nullable=True)
    emergency_code_hash = Column(String(255), nullable=True)
    emergency_enabled = Column(Boolean, default=True)
    last_emergency_access = Column(DateTime, nullable=True)
    preferred_shelter_id = Column(Integer, nullable=True)
    is_active = Column(Boolean, default=True)
    shelter_id = Column(Integer, ForeignKey("shelters.id"), nullable=True)
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())


    # Relations
    reports = relationship("Report", back_populates="user", cascade="all, delete-orphan")

    @property
    def full_name(self):
        return self.name