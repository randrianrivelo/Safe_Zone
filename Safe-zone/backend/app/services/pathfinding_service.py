# app/services/pathfinding_service.py
from sqlalchemy.orm import Session
from ..algorithms.graph import Graph
from ..algorithms.astar import AStar
from ..algorithms.dijkstra import Dijkstra
from ..algorithms.dynamic_refuge import DynamicRefugeAllocator
from ..models.route import Node, Edge
from ..models.refuge import Refuge


class PathfindingService:

    @staticmethod
    def build_graph(db: Session) -> Graph:
        graph = Graph()
        for node in db.query(Node).all():
            graph.add_node(node.id, node.latitude, node.longitude, node.name or "")
        for edge in db.query(Edge).all():
            graph.add_edge(
                edge.node_from, edge.node_to, edge.distance,
                is_passable=edge.is_passable,
                danger_level=edge.danger_level,
                metadata={"road_name": edge.road_name, "road_type": edge.road_type}
            )
        return graph

    @staticmethod
    def calculate_route(
        db: Session,
        user_lat: float,
        user_lon: float,
        refuge_id: int,
        algorithm: str = "astar"
    ) -> dict:
        graph = PathfindingService.build_graph(db)
        start = graph.find_nearest_node(user_lat, user_lon)
        refuge = db.query(Refuge).filter(Refuge.id == refuge_id).first()

        if not refuge:
            return {"error": "Refuge introuvable"}
        if start is None:
            return {"error": "Aucun noeud trouvé près de vous"}

        end = graph.find_nearest_node(refuge.latitude, refuge.longitude)

        if algorithm == "dijkstra":
            path, dist = Dijkstra.shortest_path(graph, start, end)
        else:
            path, dist = AStar.find_path(graph, start, end)

        if not path:
            return {"error": "Aucun chemin trouvé vers ce refuge"}

        path_coords = [{
            "latitude": graph.nodes[nid]["latitude"],
            "longitude": graph.nodes[nid]["longitude"],
            "name": graph.nodes[nid].get("name", "")
        } for nid in path]

        km = round(dist / 1000, 2)
        mins = round(km / 4.5 * 60, 1)

        return {
            "path":                    path_coords,
            "total_distance_km":       km,
            "estimated_time_minutes":  mins,
            "refuge_name":             refuge.name,
            "refuge_id":               refuge.id,
            "algorithm_used":          algorithm
        }

    @staticmethod
    def find_best_refuges(
        db: Session,
        user_lat: float,
        user_lon: float
    ) -> list:
        graph = PathfindingService.build_graph(db)
        start = graph.find_nearest_node(user_lat, user_lon)

        if start is None:
            return []

        refuges = db.query(Refuge).filter(Refuge.is_active == True).all()
        refuge_list = []
        for r in refuges:
            node_id = graph.find_nearest_node(r.latitude, r.longitude)
            if node_id is not None:
                refuge_list.append({
                    "id": r.id, "name": r.name,
                    "node_id": node_id,
                    "capacity": r.capacity,
                    "current_occupancy": r.current_occupancy,
                    "has_water": r.has_water,
                    "has_electricity": r.has_electricity,
                    "has_medical": r.has_medical
                })

        results = DynamicRefugeAllocator.find_best_refuges(graph, start, refuge_list)

        for result in results:
            result["path"] = [{
                "latitude": graph.nodes[nid]["latitude"],
                "longitude": graph.nodes[nid]["longitude"],
                "name": graph.nodes[nid].get("name", "")
            } for nid in result["path"]]

        return results