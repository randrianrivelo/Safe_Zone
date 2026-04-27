"""
Modèle pour les routes (arêtes du graphe de pathfinding)
"""
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean, Numeric
from sqlalchemy.sql import func
from datetime import datetime
from database import Base


class Route(Base):
    """Modèle des routes (arêtes)"""
    __tablename__ = "edges"
    
    id = Column(Integer, primary_key=True, index=True)
    node_from = Column(Integer, ForeignKey("nodes.id", ondelete="CASCADE"), nullable=False)
    node_to = Column(Integer, ForeignKey("nodes.id", ondelete="CASCADE"), nullable=False)
    distance = Column(Numeric(10, 2), nullable=False)  # en mètres
    road_name = Column(String(200), nullable=True)
    road_type = Column(String(50), nullable=True)  # primary, secondary, tertiary
    is_passable = Column(Boolean, default=True)
    danger_level = Column(Integer, default=0)  # 0-5
    flood_risk = Column(Boolean, default=False)
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<Route(id={self.id}, from={self.node_from}, to={self.node_to}, distance={self.distance})>"
