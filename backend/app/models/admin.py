from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime
from sqlalchemy.sql import func
from app.config.database import Base


class Admin(Base):
    __tablename__ = "admins"

    id            = Column(Integer, primary_key=True, index=True)
    full_name     = Column(String(200), nullable=False)
    email         = Column(String(200), unique=True, nullable=False, index=True)
    password_hash = Column(Text, nullable=False)
    role          = Column(String(50), default="admin")
    is_active     = Column(Boolean, default=True)
    last_login    = Column(DateTime, nullable=True)
    created_at    = Column(DateTime, default=func.now())