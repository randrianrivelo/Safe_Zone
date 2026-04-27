"""
Utilitaires pour le graphe et la gestion des nœuds
"""
from typing import Dict, List, Tuple
import math


class GraphBuilder:
    """Construit et gère le graphe de pathfinding"""
    
    @staticmethod
    def build_adjacency_list(routes: List[Dict]) -> Dict:
        """
        Construire une liste d'adjacence à partir des routes
        
        Args:
            routes: Liste des routes/arêtes
            
        Returns:
            Dict {from_node: {to_node: {distance, danger_level, ...}}}
        """
        graph = {}
        
        for route in routes:
            from_id = route['node_from']
            to_id = route['node_to']
            
            if from_id not in graph:
                graph[from_id] = {'edges': {}}
            
            if not route.get('is_passable', True):
                continue
            
            graph[from_id]['edges'][to_id] = {
                'distance': float(route['distance']),
                'danger_level': route.get('danger_level', 0),
                'flood_risk': route.get('flood_risk', False)
            }
        
        return graph
    
    @staticmethod
    def add_node_positions(graph: Dict, nodes: List[Dict]) -> Dict:
        """Ajouter les positions des nœuds au graphe"""
        for node in nodes:
            node_id = node['id']
            
            if node_id not in graph:
                graph[node_id] = {'edges': {}}
            
            graph[node_id]['position'] = (float(node['latitude']), float(node['longitude']))
        
        return graph
    
    @staticmethod
    def validate_graph(graph: Dict) -> bool:
        """Valider que le graphe est bien formé"""
        for node_id, node_data in graph.items():
            if 'edges' not in node_data:
                return False
            
            for neighbor_id in node_data['edges'].keys():
                if neighbor_id not in graph:
                    return False
        
        return True
    
    @staticmethod
    def get_connected_components(graph: Dict) -> List[List[int]]:
        """Trouver les composantes connexes du graphe"""
        visited = set()
        components = []
        
        def dfs(node, component):
            visited.add(node)
            component.append(node)
            
            for neighbor in graph.get(node, {}).get('edges', {}):
                if neighbor not in visited:
                    dfs(neighbor, component)
        
        for node in graph:
            if node not in visited:
                component = []
                dfs(node, component)
                components.append(component)
        
        return components
    
    @staticmethod
    def calculate_graph_statistics(graph: Dict, nodes: List[Dict]) -> Dict:
        """Calculer des statistiques sur le graphe"""
        total_edges = sum(len(node_data.get('edges', {})) for node_data in graph.values())
        total_nodes = len(graph)
        components = GraphBuilder.get_connected_components(graph)
        
        # Calculer la distance totale
        total_distance = 0
        for node_data in graph.values():
            for edge_data in node_data.get('edges', {}).values():
                total_distance += edge_data.get('distance', 0)
        
        return {
            'total_nodes': total_nodes,
            'total_edges': total_edges,
            'num_components': len(components),
            'largest_component': max(len(c) for c in components) if components else 0,
            'total_distance_km': total_distance / 1000,
            'average_degree': total_edges / total_nodes if total_nodes > 0 else 0
        }
