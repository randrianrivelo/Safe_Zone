"""
Modèle pour les nœuds du graphe (intersections, points d'intérêt)
"""
from sqlalchemy import Column, Integer, String, Float, Numeric
from database import Base


class Node(Base):
    """Modèle des nœuds du graphe de pathfinding"""
    __tablename__ = "nodes"
    
    id = Column(Integer, primary_key=True, index=True)
    latitude = Column(Numeric(10, 8), nullable=False)
    longitude = Column(Numeric(11, 8), nullable=False)
    name = Column(String(200), nullable=True)
    node_type = Column(String(50), default="intersection")  # intersection, refuge_entry, landmark
    
    def __repr__(self):
        return f"<Node(id={self.id}, name={self.name}, lat={self.latitude}, lon={self.longitude})>"
