"""
Algorithme de pathfinding A* et fonctions utilitaires
"""
import heapq
import math
from typing import List, Tuple, Optional, Dict
from sqlalchemy.orm import Session
from models.route import Route
from models.graph import Node


class PathfindingService:
    """Service de pathfinding avec algorithmes A* et Dijkstra"""
    
    @staticmethod
    def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculer la distance entre deux points (formule de Haversine)"""
        R = 6371000  # Rayon de la Terre en mètres
        
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lon2 - lon1)
        
        a = (math.sin(delta_phi/2)**2 + 
             math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda/2)**2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        
        return R * c
    
    @staticmethod
    def heuristic(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Heuristique pour A* (distance à vol d'oiseau)"""
        return PathfindingService.calculate_distance(lat1, lon1, lat2, lon2)
    
    @staticmethod
    def build_graph(db: Session) -> Dict:
        """Construire le graphe à partir de la base de données"""
        graph = {}
        
        nodes = db.query(Node).all()
        for node in nodes:
            graph[node.id] = {
                'latitude': float(node.latitude),
                'longitude': float(node.longitude),
                'edges': []
            }
        
        routes = db.query(Route).filter(Route.is_passable == True).all()
        for route in routes:
            if route.node_from in graph:
                graph[route.node_from]['edges'].append({
                    'to': route.node_to,
                    'distance': float(route.distance),
                    'danger_level': route.danger_level
                })
        
        return graph
    
    @staticmethod
    def find_path_astar(
        db: Session,
        start_id: int,
        end_id: int,
        avoid_danger: bool = False
    ) -> Optional[Tuple[List[int], float]]:
        """
        Trouver le chemin le plus court avec A*
        Retourne: (liste_de_nœuds, distance_totale) ou None
        """
        graph = PathfindingService.build_graph(db)
        
        if start_id not in graph or end_id not in graph:
            return None
        
        # A* search
        open_set = [(0, start_id)]
        came_from = {}
        g_score = {node_id: float('inf') for node_id in graph}
        g_score[start_id] = 0
        
        visited = set()
        
        while open_set:
            _, current = heapq.heappop(open_set)
            
            if current in visited:
                continue
            visited.add(current)
            
            if current == end_id:
                # Reconstruire le chemin
                path = [current]
                while current in came_from:
                    current = came_from[current]
                    path.append(current)
                path.reverse()
                
                # Calculer la distance totale
                total_distance = 0
                for i in range(len(path) - 1):
                    node_from = path[i]
                    node_to = path[i + 1]
                    # Trouver la route
                    for edge in graph[node_from]['edges']:
                        if edge['to'] == node_to:
                            total_distance += edge['distance']
                            break
                
                return path, total_distance
            
            for edge in graph[current]['edges']:
                next_node = edge['to']
                cost = edge['distance']
                danger = edge['danger_level']
                
                # Pénalité si on veut éviter le danger
                if avoid_danger:
                    cost += danger * 100
                
                tentative_g_score = g_score[current] + cost
                
                if tentative_g_score < g_score[next_node]:
                    came_from[next_node] = current
                    g_score[next_node] = tentative_g_score
                    
                    h = PathfindingService.heuristic(
                        graph[next_node]['latitude'],
                        graph[next_node]['longitude'],
                        graph[end_id]['latitude'],
                        graph[end_id]['longitude']
                    )
                    f_score = tentative_g_score + h
                    
                    if next_node not in visited:
                        heapq.heappush(open_set, (f_score, next_node))
        
        return None
    
    @staticmethod
    def find_nearest_refuge(
        db: Session,
        user_latitude: float,
        user_longitude: float,
        graph: Dict
    ) -> Optional[Tuple[int, float]]:
        """Trouver le refuge le plus proche"""
        from models.refuge import Refuge
        
        refuges = db.query(Refuge).filter(Refuge.is_active == True).all()
        
        nearest = None
        min_distance = float('inf')
        
        for refuge in refuges:
            distance = PathfindingService.calculate_distance(
                user_latitude, user_longitude,
                float(refuge.latitude), float(refuge.longitude)
            )
            
            if distance < min_distance:
                min_distance = distance
                nearest = refuge.id
        
        return (nearest, min_distance) if nearest else None
