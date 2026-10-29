from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func
from app.config.database import Base

class EmergencyLog(Base):
    __tablename__ = "emergency_logs"

    id = Column(Integer, primary_key=True, index=True)
    access_code = Column(String(10), nullable=False)
    user_id = Column(Integer, nullable=True)  # ID utilisateur si connecté
    user_email = Column(String(255), nullable=True)  # Email si connecté
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(500), nullable=True)
    status = Column(String(20), default="success")  # success, failed
    created_at = Column(DateTime, server_default=func.now())