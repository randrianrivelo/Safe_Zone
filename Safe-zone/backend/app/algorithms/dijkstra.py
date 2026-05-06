# app/algorithms/dijkstra.py
import heapq
from typing import Dict, List, Tuple, Optional
from .graph import Graph


class Dijkstra:
    """Algorithme de Dijkstra — plus court chemin garanti."""

    @staticmethod
    def shortest_path(
        graph: Graph,
        start: int,
        end: int
    ) -> Tuple[List[int], float]:

        dist: Dict[int, float] = {n: float("inf") for n in graph.nodes}
        dist[start] = 0
        prev: Dict[int, Optional[int]] = {n: None for n in graph.nodes}
        pq = [(0.0, start)]
        visited = set()

        while pq:
            d, u = heapq.heappop(pq)
            if u == end:
                break
            if u in visited:
                continue
            visited.add(u)

            for v, w, _ in graph.get_neighbors(u):
                if v in visited:
                    continue
                nd = d + w
                if nd < dist[v]:
                    dist[v] = nd
                    prev[v] = u
                    heapq.heappush(pq, (nd, v))

        if dist[end] == float("inf"):
            return [], float("inf")

        path, cur = [], end
        while cur is not None:
            path.append(cur)
            cur = prev.get(cur)
        path.reverse()
        return path, dist[end]