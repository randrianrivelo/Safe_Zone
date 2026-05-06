# app/services/route_service.py
from sqlalchemy.orm import Session
from ..models.route import Edge, Node


class RouteService:

    @staticmethod
    def get_all_edges(db: Session):
        edges = db.query(Edge).all()
        return [{
            "id":           e.id,
            "node_from":    e.node_from,
            "node_to":      e.node_to,
            "distance":     e.distance,
            "road_name":    e.road_name,
            "road_type":    e.road_type,
            "is_passable":  e.is_passable,
            "danger_level": e.danger_level,
            "flood_risk":   e.flood_risk
        } for e in edges]

    @staticmethod
    def block(db: Session, edge_id: int):
        edge = db.query(Edge).filter(Edge.id == edge_id).first()
        if not edge:
            return None
        edge.is_passable = False
        db.commit()
        return edge

    @staticmethod
    def unblock(db: Session, edge_id: int):
        edge = db.query(Edge).filter(Edge.id == edge_id).first()
        if not edge:
            return None
        edge.is_passable = True
        db.commit()
        return edge

    @staticmethod
    def update_danger(db: Session, edge_id: int, danger_level: int):
        edge = db.query(Edge).filter(Edge.id == edge_id).first()
        if not edge:
            return None
        edge.danger_level = danger_level
        db.commit()
        return edge