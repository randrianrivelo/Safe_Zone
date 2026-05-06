# app/models/refuge.py
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text
from sqlalchemy.sql import func
from ..database import Base


class Refuge(Base):
    __tablename__ = "refuges"

    id                = Column(Integer, primary_key=True, index=True)
    name              = Column(String(200), nullable=False)
    description       = Column(Text)
    latitude          = Column(Float, nullable=False)
    longitude         = Column(Float, nullable=False)
    capacity          = Column(Integer, nullable=False)
    current_occupancy = Column(Integer, default=0)
    type              = Column(String(50))
    address           = Column(Text)
    is_active         = Column(Boolean, default=True)
    has_water         = Column(Boolean, default=False)
    has_electricity   = Column(Boolean, default=False)
    has_medical       = Column(Boolean, default=False)
    contact_phone     = Column(String(20))
    created_at        = Column(DateTime, server_default=func.now())
    updated_at        = Column(DateTime, server_default=func.now(), onupdate=func.now())