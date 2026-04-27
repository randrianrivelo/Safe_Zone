"""
Modèle Refuge (Lieu de refuge/abri)
"""
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, Boolean, Numeric
from sqlalchemy.sql import func
from datetime import datetime
from database import Base


class Refuge(Base):
    """Modèle du refuge"""
    __tablename__ = "refuges"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    latitude = Column(Numeric(10, 8), nullable=False)
    longitude = Column(Numeric(11, 8), nullable=False)
    capacity = Column(Integer, nullable=False)
    current_occupancy = Column(Integer, default=0)
    type = Column(String(50), nullable=True)  # ecole, eglise, stade, etc.
    address = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    has_water = Column(Boolean, default=False)
    has_electricity = Column(Boolean, default=False)
    has_medical = Column(Boolean, default=False)
    contact_phone = Column(String(20), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<Refuge(id={self.id}, name={self.name}, capacity={self.capacity})>"
