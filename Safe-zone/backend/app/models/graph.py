# app/models/graph.py
from sqlalchemy import Column, Integer, String, Float, Boolean
from ..database import Base


class GraphNode(Base):
    """Noeud persisté en BDD pour le graphe routier."""
    __tablename__ = "nodes"

    id        = Column(Integer, primary_key=True)
    latitude  = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    name      = Column(String(200))
    node_type = Column(String(50), default="intersection")


class GraphEdge(Base):
    """Arête persistée en BDD pour le graphe routier."""
    __tablename__ = "edges"

    id           = Column(Integer, primary_key=True)
    node_from    = Column(Integer, nullable=False)
    node_to      = Column(Integer, nullable=False)
    distance     = Column(Float, nullable=False)
    is_passable  = Column(Boolean, default=True)
    danger_level = Column(Integer, default=0)