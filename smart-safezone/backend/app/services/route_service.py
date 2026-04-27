"""
Service pour la gestion des routes et des nœuds du graphe
"""
from sqlalchemy.orm import Session
from models.route import Route
from models.graph import Node
from schemas.route import RouteCreate, RouteUpdate, NodeCreate
from typing import List, Optional


class RouteService:
    """Service pour gérer les routes et nœuds"""
    
    # ===== Nœuds =====
    @staticmethod
    def get_node(db: Session, node_id: int) -> Optional[Node]:
        """Récupérer un nœud par ID"""
        return db.query(Node).filter(Node.id == node_id).first()
    
    @staticmethod
    def get_all_nodes(db: Session) -> List[Node]:
        """Récupérer tous les nœuds"""
        return db.query(Node).all()
    
    @staticmethod
    def create_node(db: Session, node: NodeCreate) -> Node:
        """Créer un nouveau nœud"""
        db_node = Node(**node.dict())
        db.add(db_node)
        db.commit()
        db.refresh(db_node)
        return db_node
    
    # ===== Routes =====
    @staticmethod
    def get_route(db: Session, route_id: int) -> Optional[Route]:
        """Récupérer une route par ID"""
        return db.query(Route).filter(Route.id == route_id).first()
    
    @staticmethod
    def get_all_routes(db: Session) -> List[Route]:
        """Récupérer toutes les routes"""
        return db.query(Route).all()
    
    @staticmethod
    def create_route(db: Session, route: RouteCreate) -> Route:
        """Créer une nouvelle route"""
        db_route = Route(**route.dict())
        db.add(db_route)
        db.commit()
        db.refresh(db_route)
        return db_route
    
    @staticmethod
    def update_route(db: Session, route_id: int, route_update: RouteUpdate) -> Optional[Route]:
        """Mettre à jour une route"""
        db_route = db.query(Route).filter(Route.id == route_id).first()
        if not db_route:
            return None
        
        update_data = route_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_route, key, value)
        
        db.add(db_route)
        db.commit()
        db.refresh(db_route)
        return db_route
    
    @staticmethod
    def get_edges_from_node(db: Session, node_id: int) -> List[Route]:
        """Récupérer toutes les arêtes sortantes d'un nœud"""
        return db.query(Route).filter(Route.node_from == node_id, Route.is_passable == True).all()
