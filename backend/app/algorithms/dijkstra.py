import heapq
from typing import Optional, Dict, List, Tuple
from app.algorithms.graph import Graph, Node
from app.utils.logger import logger


def dijkstra(graph: Graph, start_id: int, end_id: int):
    """Compatibilité avec les tests.
    Les tests attendent : dijkstra(graph, start_id, end_id) -> list[int] | None.
    """
    # Récupérer les noeuds par leur ID
    if not hasattr(graph, 'node_by_id'):
        start_node = next((n for n in graph.adjacency.keys() if getattr(n, 'id', None) == start_id), None)
        end_node = next((n for n in graph.adjacency.keys() if getattr(n, 'id', None) == end_id), None)
    else:
        start_node = graph.node_by_id.get(start_id)
        end_node = graph.node_by_id.get(end_id)

    if start_node is None or end_node is None:
        logger.warning(f"Dijkstra: noeuds introuvables start_id={start_id}, end_id={end_id}")
        return None

    algo = Dijkstra(graph)
    res = algo.run(start_node, end_node)
    if not res:
        return None

    # Retourner une liste d'IDs
    path_ids = []
    for p in res['path']:
        if isinstance(p, dict) and 'id' in p:
            path_ids.append(p['id'])
        elif hasattr(p, 'id'):
            path_ids.append(p.id)
        else:
            path_ids.append(int(p[0] * 1000000))
    return path_ids if path_ids else None


class Dijkstra:
    """
    Algorithme de Dijkstra
    Garantit le chemin de DISTANCE MINIMALE
    Utilisé en mode NORMAL
    """

    AVERAGE_SPEED_WALKING_KMH = 5.0  # Vitesse moyenne piéton

    def __init__(self, graph: Graph):
        self.graph = graph

    def run(
        self,
        start: Node,
        end: Node
    ) -> Optional[Dict]:
        """
        Calcule le chemin le plus court entre start et end
        Retourne : dict avec path, distance, temps estimé
        """
        if not self.graph.has_node(start) or not self.graph.has_node(end):
            logger.warning(
                f"Dijkstra : noeud absent — start={start}, end={end}"
            )
            return None

        # File de priorité (min-heap) : (distance, noeud)
        heap = [(0.0, start)]

        # Distance minimale connue par noeud
        dist_map: Dict[Node, float] = {start: 0.0}

        # Noeud précédent (pour reconstruire le chemin)
        previous: Dict[Node, Optional[Node]] = {start: None}

        visited = set()

        while heap:
            current_dist, current_node = heapq.heappop(heap)

            if current_node in visited:
                continue
            visited.add(current_node)

            # Destination atteinte
            if current_node == end:
                path = self._rebuild_path(previous, end)
                distance = round(current_dist, 3)
                time_min = round((distance / self.AVERAGE_SPEED_WALKING_KMH) * 60, 1)

                logger.info(
                    f"Dijkstra — chemin trouvé : "
                    f"{distance} km, ~{time_min} min, "
                    f"{len(path)} points"
                )
                return {
                    "path": path,
                    "total_distance_km": distance,
                    "estimated_time_min": time_min,
                    "algorithm": "dijkstra",
                    "nodes_visited": len(visited)
                }

            # Explorer les voisins
            for weight, neighbor in self.graph.get_neighbors(current_node):
                new_dist = current_dist + weight

                if neighbor not in dist_map or new_dist < dist_map[neighbor]:
                    dist_map[neighbor] = new_dist
                    previous[neighbor] = current_node
                    heapq.heappush(heap, (new_dist, neighbor))

        logger.warning(f"Dijkstra — aucun chemin entre {start} et {end}")
        return None

    def _rebuild_path(
        self,
        previous: Dict,
        end: Node
    ) -> List[Dict]:
        """Reconstruit le chemin avec les coordonnées GPS"""
        path = []
        current = end
        while current is not None:
            if isinstance(current, tuple):
                path.append({"lat": current[0], "lon": current[1]})
            else:
                path.append({"lat": current.lat, "lon": current.lon})
            current = previous.get(current)
        path.reverse()
        return path