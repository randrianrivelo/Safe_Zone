# app/models/route.py
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from ..database import Base


class Node(Base):
    __tablename__ = "nodes"

    id        = Column(Integer, primary_key=True, index=True)
    latitude  = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    name      = Column(String(200))
    node_type = Column(String(50), default="intersection")


class Edge(Base):
    __tablename__ = "edges"

    id           = Column(Integer, primary_key=True, index=True)
    node_from    = Column(Integer, ForeignKey("nodes.id"), nullable=False)
    node_to      = Column(Integer, ForeignKey("nodes.id"), nullable=False)
    distance     = Column(Float, nullable=False)
    road_name    = Column(String(200))
    road_type    = Column(String(50))
    is_passable  = Column(Boolean, default=True)
    danger_level = Column(Integer, default=0)
    flood_risk   = Column(Boolean, default=False)
    last_updated = Column(DateTime, server_default=func.now())