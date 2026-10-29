from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.config.database import Base

class Shelter(Base):
    __tablename__ = "shelters"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    short_name = Column(String(100))
    shelter_type = Column(String(50), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(Text)
    fokontany = Column(String(100))
    district_id = Column(Integer, ForeignKey('districts.id'), nullable=True)

    # relation vers District
    district_rel = relationship('District', backref='shelters')

    # Capacité
    capacity_total = Column(Integer, default=0)
    capacity_sleeping = Column(Integer, default=0)
    current_occupancy = Column(Integer, default=0)

    # Statut
    status = Column(String(30), default="ouvert")
    is_active = Column(Boolean, default=True)

    # Services
    has_water = Column(Boolean, default=False)
    has_electricity = Column(Boolean, default=False)
    has_medical = Column(Boolean, default=False)
    has_food = Column(Boolean, default=False)
    has_toilets = Column(Boolean, default=False)
    has_wifi = Column(Boolean, default=False)

    # Contacts
    contact_name = Column(String(150))
    contact_phone = Column(String(30))
    contact_email = Column(String(150))

    # Description
    description = Column(Text)
    notes = Column(Text)
    image_url = Column(Text)

    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    @property
    def district(self):
        try:
            return self.district_rel.name if self.district_rel else None
        except Exception:
            return None