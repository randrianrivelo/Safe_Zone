from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.config.database import Base


class Incident(Base):
    __tablename__ = "incidents"

    id            = Column(Integer, primary_key=True, index=True)
    title         = Column(String(200), nullable=False)
    incident_type = Column(String(50), nullable=False)
    latitude      = Column(Float, nullable=True)
    longitude     = Column(Float, nullable=True)
    description   = Column(Text, nullable=True)
    severity      = Column(String(20), default="moyen")
    is_resolved   = Column(Boolean, default=False)
    road_id       = Column(Integer, ForeignKey("roads.id"), nullable=True)
    reported_by   = Column(Integer, ForeignKey("admins.id"), nullable=True)
    resolved_at   = Column(DateTime, nullable=True)
    created_at    = Column(DateTime, default=func.now())