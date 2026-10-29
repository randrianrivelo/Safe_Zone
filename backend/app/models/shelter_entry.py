from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from app.config.database import Base

class ShelterEntry(Base):
    __tablename__ = "shelter_entries"

    id = Column(Integer, primary_key=True, index=True)
    shelter_id = Column(Integer, ForeignKey("shelters.id"), nullable=False)
    name = Column(String(255), nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String(10), default="M")
    family_id = Column(Integer, nullable=True)
    phone = Column(String(50), nullable=True)
    id_card = Column(String(50), nullable=True)
    is_injured = Column(Boolean, default=False)
    injury_type = Column(String(100), nullable=True)
    needs = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    status = Column(String(50), default="present")  # present, departed
    entry_time = Column(DateTime, server_default=func.now())
    exit_time = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())