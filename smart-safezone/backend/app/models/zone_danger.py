"""
Modèle pour les zones dangereuses
"""
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, Boolean, Numeric
from sqlalchemy.sql import func
from datetime import datetime
from database import Base


class DangerZone(Base):
    """Modèle des zones dangereuses"""
    __tablename__ = "danger_zones"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=True)
    description = Column(Text, nullable=True)
    latitude = Column(Numeric(10, 8), nullable=False)
    longitude = Column(Numeric(11, 8), nullable=False)
    radius = Column(Numeric(10, 2), nullable=False)  # en mètres
    danger_type = Column(String(50), nullable=True)  # flood, landslide, wind
    severity = Column(Integer, default=1)  # 1-5
    is_active = Column(Boolean, default=True)
    reported_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=True)
    
    def __repr__(self):
        return f"<DangerZone(id={self.id}, name={self.name}, type={self.danger_type})>"
