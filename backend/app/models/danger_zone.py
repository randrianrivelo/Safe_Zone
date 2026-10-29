from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime
from sqlalchemy.sql import func
from app.config.database import Base

class DangerZone(Base):
    __tablename__ = "danger_zones"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    danger_type = Column(String(50), nullable=False)
    center_lat = Column(Float, nullable=False)
    center_lon = Column(Float, nullable=False)
    radius_km = Column(Float, default=0.5)
    polygon_coords = Column(Text, nullable=True)
    severity = Column(String(20), default="moyen")
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, index=True)
    reported_by = Column(String(100), nullable=True)
    started_at = Column(DateTime, default=func.now())
    ended_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())