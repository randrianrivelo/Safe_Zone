# app/models/zone_danger.py
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text
from sqlalchemy.sql import func
from ..database import Base


class DangerZone(Base):
    __tablename__ = "danger_zones"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String(200), nullable=False)
    description = Column(Text)
    latitude    = Column(Float, nullable=False)
    longitude   = Column(Float, nullable=False)
    radius      = Column(Float, nullable=False)
    danger_type = Column(String(50))
    severity    = Column(Integer, default=1)
    is_active   = Column(Boolean, default=True)
    reported_at = Column(DateTime, server_default=func.now())
    expires_at  = Column(DateTime, nullable=True)


class Alert(Base):
    __tablename__ = "alerts"

    id         = Column(Integer, primary_key=True, index=True)
    title      = Column(String(300), nullable=False)
    message    = Column(Text, nullable=False)
    alert_type = Column(String(50))
    severity   = Column(String(20), default="info")
    is_active  = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    expires_at = Column(DateTime, nullable=True)