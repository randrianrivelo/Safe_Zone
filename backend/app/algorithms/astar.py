import heapq
import math
from typing import Optional, Dict, List, Tuple
from app.algorithms.graph import Graph, Node
from app.utils.logger import logger


def astar(graph: Graph, start_id: int, end_id: int):
    """
    Compatibilité avec les tests.
    Les tests attendent : astar(graph, start_id, end_id) -> list[int] | None.
    """
    # Récupérer les noeuds par leur ID (si les noeuds sont des tuples (lat, lon))
    # Solution: le graphe doit avoir un mapping ID -> Node
    if not hasattr(graph, 'node_by_id'):
        # Fallback: utiliser l'adjacency
        start_node = next((n for n in graph.adjacency.keys() if getattr(n, 'id', None) == start_id), None)
        end_node = next((n for n in graph.adjacency.keys() if getattr(n, 'id', None) == end_id), None)
    else:
        start_node = graph.node_by_id.get(start_id)
        end_node = graph.node_by_id.get(end_id)

    if start_node is None or end_node is None:
        logger.warning(f"A*: noeuds introuvables start_id={start_id}, end_id={end_id}")
        return None

    algo = AStar(graph)
    res = algo.run(start_node, end_node)
    if not res:
        return None

    # Retourner une liste d'IDs (compatible avec les tests)
    # Si les noeuds ont un attribut 'id', on le retourne
    path_ids = []
    for p in res['path']:
        if isinstance(p, dict) and 'id' in p:
            path_ids.append(p['id'])
        elif hasattr(p, 'id'):
            path_ids.append(p.id)
        else:
            # Fallback: retourner les coordonnées comme int (pour compatibilité)
            path_ids.append(int(p[0] * 1000000))  # Convertir lat en ID unique
    return path_ids if path_ids else None


class AStar:
    """
    Algorithme A* (A-Star)
    Chemin le plus RAPIDE grâce à une heuristique
    Utilisé en mode URGENCE
    Plus rapide que Dijkstra car guidé vers la destination
    """

    AVERAGE_SPEED_KMH = 50.0  # Vitesse moyenne voiture/secours

    def __init__(self, graph: Graph):
        self.graph = graph

    def run(
        self,
        start: Node,
        end: Node
    ) -> Optional[Dict]:
        """
        Calcule le chemin le plus rapide entre start et end
        f(n) = g(n) + h(n)
            g(n) = coût réel depuis le départ
            h(n) = heuristique (distance vol d'oiseau vers destination)
        """
        if not self.graph.has_node(start) or not self.graph.has_node(end):
            logger.warning(f"A* : noeud absent — start={start}, end={end}")
            return None

        # File de priorité : (f_score, noeud)
        heap = [(self._heuristic(start, end), start)]

        # Coût réel depuis le départ (g_score)
        g_score: Dict[Node, float] = {start: 0.0}

        # Noeud précédent
        previous: Dict[Node, Optional[Node]] = {start: None}

        visited = set()
        nodes_explored = 0

        while heap:
            f_score, current_node = heapq.heappop(heap)
            nodes_explored += 1

            if current_node in visited:
                continue
            visited.add(current_node)

            # Destination atteinte
            if current_node == end:
                path = self._rebuild_path(previous, end)
                distance = round(g_score[end], 3)
                time_min = round((distance / self.AVERAGE_SPEED_KMH) * 60, 1)

                logger.info(
                    f"A* — chemin trouvé : "
                    f"{distance} km, ~{time_min} min (urgence), "
                    f"{len(visited)} noeuds explorés"
                )
                return {
                    "path": path,
                    "total_distance_km": distance,
                    "estimated_time_min": time_min,
                    "algorithm": "astar",
                    "nodes_visited": len(visited)
                }

            for weight, neighbor in self.graph.get_neighbors(current_node):
                tentative_g = g_score[current_node] + weight

                if neighbor not in g_score or tentative_g < g_score[neighbor]:
                    g_score[neighbor] = tentative_g
                    previous[neighbor] = current_node
                    f_new = tentative_g + self._heuristic(neighbor, end)
                    heapq.heappush(heap, (f_new, neighbor))

        logger.warning(f"A* — aucun chemin entre {start} et {end}")
        return None

    def _heuristic(self, node: Node, goal: Node) -> float:
        """
        Distance de vol d'oiseau en km (formule Haversine précise)
        Admissible : ne surestime jamais le coût réel
        """
        # Conversion des tuples en coordonnées si nécessaire
        lat1 = node[0] if isinstance(node, tuple) else node.lat
        lon1 = node[1] if isinstance(node, tuple) else node.lon
        lat2 = goal[0] if isinstance(goal, tuple) else goal.lat
        lon2 = goal[1] if isinstance(goal, tuple) else goal.lon

        return self._haversine_distance(lat1, lon1, lat2, lon2)

    def _haversine_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Distance Haversine précise en km"""
        R = 6371.0  # Rayon terrestre en km

        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)

        a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))

        return R * c

    def _rebuild_path(self, previous: Dict, end: Node) -> List[Dict]:
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