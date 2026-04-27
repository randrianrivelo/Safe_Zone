"""
Router pour la gestion des routes et nœuds
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.graph import Node
from models.route import Route
from schemas.route import NodeCreate, NodeResponse, RouteCreate, RouteUpdate, RouteResponse
from services.route_service import RouteService

router = APIRouter(prefix="/api/routes", tags=["routes"])


# ===== Nœuds =====
@router.get("/nodes", response_model=List[NodeResponse])
def get_nodes(db: Session = Depends(get_db)):
    """Récupérer tous les nœuds"""
    nodes = RouteService.get_all_nodes(db)
    return nodes


@router.get("/nodes/{node_id}", response_model=NodeResponse)
def get_node(node_id: int, db: Session = Depends(get_db)):
    """Récupérer un nœud par ID"""
    node = RouteService.get_node(db, node_id)
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    return node


@router.post("/nodes", response_model=NodeResponse)
def create_node(node: NodeCreate, db: Session = Depends(get_db)):
    """Créer un nouveau nœud"""
    return RouteService.create_node(db, node)


# ===== Routes/Arêtes =====
@router.get("/edges", response_model=List[RouteResponse])
def get_routes(db: Session = Depends(get_db)):
    """Récupérer toutes les routes"""
    routes = RouteService.get_all_routes(db)
    return routes


@router.get("/edges/{route_id}", response_model=RouteResponse)
def get_route(route_id: int, db: Session = Depends(get_db)):
    """Récupérer une route par ID"""
    route = RouteService.get_route(db, route_id)
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    return route


@router.post("/edges", response_model=RouteResponse)
def create_route(route: RouteCreate, db: Session = Depends(get_db)):
    """Créer une nouvelle route"""
    # Vérifier que les nœuds existent
    node_from = RouteService.get_node(db, route.node_from)
    node_to = RouteService.get_node(db, route.node_to)
    
    if not node_from or not node_to:
        raise HTTPException(status_code=400, detail="One or both nodes do not exist")
    
    return RouteService.create_route(db, route)


@router.put("/edges/{route_id}", response_model=RouteResponse)
def update_route(route_id: int, route_update: RouteUpdate, db: Session = Depends(get_db)):
    """Mettre à jour une route"""
    route = RouteService.update_route(db, route_id, route_update)
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    return route


@router.get("/edges/from/{node_id}", response_model=List[RouteResponse])
def get_edges_from_node(node_id: int, db: Session = Depends(get_db)):
    """Récupérer toutes les arêtes sortantes d'un nœud"""
    edges = RouteService.get_edges_from_node(db, node_id)
    return edges


@router.put("/edges/{route_id}/block", response_model=RouteResponse)
def block_route(route_id: int, db: Session = Depends(get_db)):
    """Bloquer une route (rendre impraticable)"""
    route = RouteService.update_route(db, route_id, RouteUpdate(is_passable=False))
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    return route
