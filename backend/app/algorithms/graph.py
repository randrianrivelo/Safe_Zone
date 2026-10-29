from typing import Dict, List, Tuple, Optional, Any
from app.utils.logger import logger
import math


Node = Tuple[float, float]


class Graph:
    """
    Graphe de la région Analamanga
    Noeud = coordonnée GPS arrondie à 6 décimales
    Arête = segment de route avec distance en km
    """

    def __init__(self):
        self.adjacency: Dict[Node, List[Tuple[float, Node]]] = {}
        self.node_count = 0
        self.edge_count = 0
        self.node_by_id: Dict[int, Node] = {}  # Mapping ID -> (lat, lon)
        self.id_by_node: Dict[Node, int] = {}  # Mapping (lat, lon) -> ID
        self.next_id = 1

    def add_node(self, node: Node, node_id: Optional[int] = None) -> int:
        """Ajoute un noeud et retourne son ID"""
        if node not in self.adjacency:
            self.adjacency[node] = []
            self.node_count += 1

            # Assigner un ID
            if node_id is None:
                node_id = self.next_id
                self.next_id += 1

            self.node_by_id[node_id] = node
            self.id_by_node[node] = node_id
            return node_id
        return self.id_by_node.get(node, -1)

    def add_edge(self, start: Node, end: Node, weight: float) -> None:
        """Ajoute une arête bidirectionnelle"""
        self.add_node(start)
        self.add_node(end)
        self.adjacency[start].append((weight, end))
        self.adjacency[end].append((weight, start))
        self.edge_count += 1

    def add_edge_by_id(self, start_id: int, end_id: int, weight: float) -> None:
        """Ajoute une arête par ID de noeud"""
        start = self.node_by_id.get(start_id)
        end = self.node_by_id.get(end_id)
        if start and end:
            self.add_edge(start, end, weight)
        else:
            logger.warning(f"Impossible d'ajouter l'arête {start_id} -> {end_id}")

    def build_from_roads(self, roads: list) -> None:
        """
        Construit le graphe depuis la liste des routes BDD
        Ignore automatiquement les routes non praticables
        """
        self.adjacency = {}
        self.node_count = 0
        self.edge_count = 0
        self.node_by_id = {}
        self.id_by_node = {}
        self.next_id = 1

        passable_count = 0
        skipped_count = 0

        for road in roads:
            if not road.is_passable:
                skipped_count += 1
                continue

            start = self._normalize(road.start_lat, road.start_lon)
            end = self._normalize(road.end_lat, road.end_lon)
            weight = road.distance_km

            self.add_edge(start, end, weight)
            passable_count += 1

        logger.info(
            f"Graphe construit — {self.node_count} noeuds, "
            f"{self.edge_count} arêtes, "
            f"{skipped_count} routes ignorées (impraticables)"
        )

    def connect_external_point(self, point: Node) -> Node:
        """
        Connecte un point externe (utilisateur ou refuge)
        au noeud du graphe le plus proche
        Retourne le point normalisé
        """
        normalized_point = self._normalize(point[0], point[1])

        if normalized_point in self.adjacency:
            return normalized_point

        if not self.adjacency:
            self.add_node(normalized_point)
            return normalized_point

        # Trouver le noeud le plus proche
        closest = min(
            self.adjacency.keys(),
            key=lambda n: self._euclidean_km(n, normalized_point)
        )
        dist = self._euclidean_km(closest, normalized_point)

        # Ajouter le point externe comme nouveau noeud
        self.add_node(normalized_point)
        self.add_edge(normalized_point, closest, dist)

        logger.debug(f"Point externe {normalized_point} connecté au noeud {closest} (dist={dist:.3f}km)")
        return normalized_point

    def get_neighbors(self, node: Node) -> List[Tuple[float, Node]]:
        return self.adjacency.get(node, [])

    def get_neighbors_by_id(self, node_id: int) -> List[Tuple[float, int]]:
        """Retourne les voisins par ID"""
        node = self.node_by_id.get(node_id)
        if not node:
            return []
        return [(weight, self.id_by_node[neighbor]) for weight, neighbor in self.adjacency.get(node, [])]

    def has_node(self, node: Node) -> bool:
        return node in self.adjacency

    def has_node_id(self, node_id: int) -> bool:
        return node_id in self.node_by_id

    def get_node_id(self, node: Node) -> Optional[int]:
        return self.id_by_node.get(node)

    def get_node_coords(self, node_id: int) -> Optional[Node]:
        return self.node_by_id.get(node_id)

    @staticmethod
    def _normalize(lat: float, lon: float) -> Node:
        """Normalise les coordonnées à 6 décimales"""
        return (round(lat, 6), round(lon, 6))

    @staticmethod
    def _euclidean_km(a: Node, b: Node) -> float:
        """Distance approximative en km entre deux points GPS"""
        dlat = (b[0] - a[0]) * 111.0
        dlon = (b[1] - a[1]) * 111.0 * math.cos(math.radians(a[0]))
        return math.sqrt(dlat**2 + dlon**2)

    @staticmethod
    def haversine_km(a: Node, b: Node) -> float:
        """Distance Haversine précise en km"""
        R = 6371.0
        lat1, lon1 = math.radians(a[0]), math.radians(a[1])
        lat2, lon2 = math.radians(b[0]), math.radians(b[1])

        dlat = lat2 - lat1
        dlon = lon2 - lon1

        a_val = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a_val))

        return R * c