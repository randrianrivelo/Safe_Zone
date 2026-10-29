from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from sqlalchemy.sql import func
from app.config.database import Base

class Road(Base):
    __tablename__ = "roads"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=True)
    road_type = Column(String(50), default="urbaine")

    start_lat = Column(Float, nullable=False)
    start_lon = Column(Float, nullable=False)
    end_lat = Column(Float, nullable=False)
    end_lon = Column(Float, nullable=False)

    distance_km = Column(Float, nullable=False)
    status = Column(String(50), default="normal")
    is_passable = Column(Boolean, default=True)
    danger_level = Column(Integer, default=0)

    commune_id = Column(Integer, nullable=True)
    reported_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())