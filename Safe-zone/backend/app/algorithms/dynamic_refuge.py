# app/algorithms/dynamic_refuge.py
from typing import List, Dict
from .graph import Graph
from .dijkstra import Dijkstra


class DynamicRefugeAllocator:
    """
    Programmation dynamique pour trouver le meilleur refuge.
    Score = 50% distance + 30% capacité disponible + 20% équipements
    """

    @staticmethod
    def find_best_refuges(
        graph: Graph,
        user_node: int,
        refuges: List[Dict],
        max_results: int = 3
    ) -> List[Dict]:

        results = []

        for refuge in refuges:
            if refuge["current_occupancy"] >= refuge["capacity"]:
                continue

            path, dist = Dijkstra.shortest_path(graph, user_node, refuge["node_id"])

            if dist == float("inf") or not path:
                continue

            available_ratio = (
                (refuge["capacity"] - refuge["current_occupancy"]) / refuge["capacity"]
            )

            equip_score = sum([
                refuge.get("has_water", False),
                refuge.get("has_electricity", False),
                refuge.get("has_medical", False)
            ]) / 3.0

            score = (
                0.5 * (1.0 / max(dist, 1)) * 10_000 +
                0.3 * available_ratio +
                0.2 * equip_score
            )

            km = round(dist / 1000, 2)
            minutes = round(km / 4.5 * 60, 1)

            results.append({
                "refuge_id":               refuge["id"],
                "refuge_name":             refuge["name"],
                "path":                    path,
                "distance_meters":         dist,
                "distance_km":             km,
                "estimated_time_minutes":  minutes,
                "available_spots":         refuge["capacity"] - refuge["current_occupancy"],
                "score":                   round(score, 4),
                "has_water":               refuge.get("has_water", False),
                "has_electricity":         refuge.get("has_electricity", False),
                "has_medical":             refuge.get("has_medical", False)
            })

        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:max_results]