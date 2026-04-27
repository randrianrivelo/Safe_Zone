"""
Algorithme de Dijkstra pour le pathfinding
"""
import heapq
from typing import List, Tuple, Dict, Optional


class DijkstraPathfinder:
    """Implémentation de l'algorithme de Dijkstra"""
    
    @staticmethod
    def find_path(
        graph: Dict,
        start_id: int,
        end_id: int,
        avoid_danger: bool = False
    ) -> Optional[Tuple[List[int], float]]:
        """
        Trouver le chemin optimal avec Dijkstra
        
        Args:
            graph: Le graphe représentant le réseau
            start_id: ID du nœud de départ
            end_id: ID du nœud d'arrivée
            avoid_danger: Si True, évite les zones dangereuses
            
        Returns:
            Tuple (chemin, distance) ou None si pas de chemin
        """
        if start_id not in graph or end_id not in graph:
            return None
        
        # Initialisation
        distances = {node_id: float('inf') for node_id in graph}
        distances[start_id] = 0
        
        previous = {node_id: None for node_id in graph}
        
        # Priority queue: (distance, node_id)
        pq = [(0, start_id)]
        visited = set()
        
        while pq:
            current_dist, current_id = heapq.heappop(pq)
            
            if current_id in visited:
                continue
            
            visited.add(current_id)
            
            if current_id == end_id:
                # Reconstruire le chemin
                path = []
                node = end_id
                
                while node is not None:
                    path.append(node)
                    node = previous[node]
                
                path.reverse()
                
                return path, distances[end_id]
            
            # Explorer les voisins
            for neighbor_id, edge_data in graph.get(current_id, {}).get('edges', {}).items():
                if neighbor_id in visited:
                    continue
                
                weight = edge_data['distance']
                
                # Pénalité pour les zones dangereuses
                if avoid_danger and edge_data.get('danger_level', 0) > 0:
                    weight += edge_data['danger_level'] * 100
                
                new_dist = current_dist + weight
                
                if new_dist < distances[neighbor_id]:
                    distances[neighbor_id] = new_dist
                    previous[neighbor_id] = current_id
                    heapq.heappush(pq, (new_dist, neighbor_id))
        
        return None
