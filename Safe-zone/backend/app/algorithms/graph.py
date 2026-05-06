# app/algorithms/graph.py
import math
from typing import Dict, List, Tuple, Optional


class Graph:
    """Représentation du réseau routier sous forme de graphe."""

    def __init__(self):
        self.adjacency_list: Dict[int, List[Tuple[int, float, dict]]] = {}
        self.nodes: Dict[int, dict] = {}

    def add_node(self, node_id: int, latitude: float, longitude: float, name: str = ""):
        self.nodes[node_id] = {
            "latitude": latitude,
            "longitude": longitude,
            "name": name
        }
        if node_id not in self.adjacency_list:
            self.adjacency_list[node_id] = []

    def add_edge(
        self,
        from_node: int,
        to_node: int,
        distance: float,
        is_passable: bool = True,
        danger_level: int = 0,
        metadata: dict = None
    ):
        if not is_passable:
            return

        weight = distance + (danger_level * 500)
        edge_data = {
            "distance": distance,
            "danger_level": danger_level,
            "weight": weight,
            **(metadata or {})
        }

        self.adjacency_list.setdefault(from_node, []).append((to_node, weight, edge_data))
        self.adjacency_list.setdefault(to_node, []).append((from_node, weight, edge_data))

    def get_neighbors(self, node_id: int) -> List[Tuple[int, float, dict]]:
        return self.adjacency_list.get(node_id, [])

    @staticmethod
    def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        R = 6371000
        p1, p2 = math.radians(lat1), math.radians(lat2)
        dp = math.radians(lat2 - lat1)
        dl = math.radians(lon2 - lon1)
        a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
        return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    def find_nearest_node(self, latitude: float, longitude: float) -> Optional[int]:
        if not self.nodes:
            return None
        return min(
            self.nodes.keys(),
            key=lambda nid: self.haversine(
                latitude, longitude,
                self.nodes[nid]["latitude"],
                self.nodes[nid]["longitude"]
            )
        )