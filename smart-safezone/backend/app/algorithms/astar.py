"""
Algorithme A* pour le pathfinding
"""
import heapq
import math
from typing import List, Tuple, Dict, Optional


class Node:
    """Représentation d'un nœud dans l'algorithme A*"""
    def __init__(self, node_id: int, g: float = 0, h: float = 0):
        self.id = node_id
        self.g = g  # Coût du début au nœud actuel
        self.h = h  # Heuristique (distance estimée à l'objectif)
        self.f = g + h  # Coût total
        self.parent = None
    
    def __lt__(self, other):
        return self.f < other.f
    
    def __eq__(self, other):
        return self.id == other.id


class AStarPathfinder:
    """Implémentation de l'algorithme A*"""
    
    @staticmethod
    def heuristic(pos1: Tuple[float, float], pos2: Tuple[float, float]) -> float:
        """Calcul de l'heuristique (distance euclidienne)"""
        return math.sqrt((pos1[0] - pos2[0])**2 + (pos1[1] - pos2[1])**2)
    
    @staticmethod
    def find_path(
        graph: Dict,
        start_id: int,
        end_id: int,
        positions: Dict[int, Tuple[float, float]],
        avoid_danger: bool = False
    ) -> Optional[Tuple[List[int], float]]:
        """
        Trouver le chemin optimal avec A*
        
        Args:
            graph: Le graphe représentant le réseau
            start_id: ID du nœud de départ
            end_id: ID du nœud d'arrivée
            positions: Dictionnaire {node_id: (lat, lon)}
            avoid_danger: Si True, évite les zones dangereuses
            
        Returns:
            Tuple (chemin, distance) ou None si pas de chemin
        """
        if start_id not in graph or end_id not in graph:
            return None
        
        open_set = []
        closed_set = set()
        
        start = Node(start_id, 0, 
                    AStarPathfinder.heuristic(positions[start_id], positions[end_id]))
        heapq.heappush(open_set, start)
        
        g_scores = {start_id: 0}
        
        while open_set:
            current = heapq.heappop(open_set)
            
            if current.id == end_id:
                # Reconstruire le chemin
                path = []
                total_distance = 0
                node = current
                
                while node is not None:
                    path.append(node.id)
                    node = node.parent
                
                path.reverse()
                
                # Calculer la distance totale
                for i in range(len(path) - 1):
                    from_id = path[i]
                    to_id = path[i + 1]
                    
                    if to_id in graph.get(from_id, {}).get('edges', {}):
                        total_distance += graph[from_id]['edges'][to_id]['distance']
                
                return path, total_distance
            
            if current.id in closed_set:
                continue
            
            closed_set.add(current.id)
            
            # Explorer les voisins
            for neighbor_id, edge_data in graph.get(current.id, {}).get('edges', {}).items():
                if neighbor_id in closed_set:
                    continue
                
                tentative_g = g_scores[current.id] + edge_data['distance']
                
                # Pénalité pour les zones dangereuses
                if avoid_danger and edge_data.get('danger_level', 0) > 0:
                    tentative_g += edge_data['danger_level'] * 100
                
                if neighbor_id not in g_scores or tentative_g < g_scores[neighbor_id]:
                    g_scores[neighbor_id] = tentative_g
                    
                    h = AStarPathfinder.heuristic(
                        positions[neighbor_id],
                        positions[end_id]
                    )
                    
                    neighbor = Node(neighbor_id, tentative_g, h)
                    neighbor.parent = current
                    
                    heapq.heappush(open_set, neighbor)
        
        return None
