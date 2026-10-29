from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.config.database import Base

class UserHistory(Base):
    __tablename__ = "user_histories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    event_type = Column(String(50), nullable=False) # route_calculated, alert_received, refuge_check, emergency_activated
    description = Column(Text, nullable=True)
    metadata_json = Column(Text, nullable=True) # JSON flexible pour détails
    created_at = Column(DateTime, server_default=func.now())
