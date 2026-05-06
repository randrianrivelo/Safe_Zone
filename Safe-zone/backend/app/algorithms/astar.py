# app/algorithms/astar.py
import heapq
from typing import Dict, List, Tuple, Optional
from .graph import Graph


class AStar:
    """Algorithme A* — pathfinding optimisé avec heuristique."""

    @staticmethod
    def heuristic(graph: Graph, node: int, goal: int) -> float:
        n = graph.nodes[node]
        g = graph.nodes[goal]
        return Graph.haversine(n["latitude"], n["longitude"], g["latitude"], g["longitude"])

    @staticmethod
    def find_path(
        graph: Graph,
        start: int,
        end: int
    ) -> Tuple[List[int], float]:

        g_score: Dict[int, float] = {n: float("inf") for n in graph.nodes}
        g_score[start] = 0
        f_score: Dict[int, float] = {n: float("inf") for n in graph.nodes}
        f_score[start] = AStar.heuristic(graph, start, end)

        came_from: Dict[int, Optional[int]] = {}
        open_set = [(f_score[start], start)]
        open_hash = {start}

        while open_set:
            _, cur = heapq.heappop(open_set)
            open_hash.discard(cur)

            if cur == end:
                path = []
                while cur in came_from:
                    path.append(cur)
                    cur = came_from[cur]
                path.append(start)
                path.reverse()
                return path, g_score[end]

            for nb, w, _ in graph.get_neighbors(cur):
                tg = g_score[cur] + w
                if tg < g_score[nb]:
                    came_from[nb] = cur
                    g_score[nb] = tg
                    f_score[nb] = tg + AStar.heuristic(graph, nb, end)
                    if nb not in open_hash:
                        heapq.heappush(open_set, (f_score[nb], nb))
                        open_hash.add(nb)

        return [], float("inf")