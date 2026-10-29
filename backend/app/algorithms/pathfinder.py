from typing import Optional, Dict, List
from app.algorithms.graph import Graph
from app.algorithms.dijkstra import Dijkstra
from app.algorithms.astar import AStar
from app.algorithms.dynamic_refuge import DynamicRefugeAllocator
from app.core.constants import RouteMode
from app.utils.logger import logger


class PathFinder:
    """
    Coordinateur principal de tous les algorithmes
    C'est lui qui est appelé par le service
    """

    def __init__(self):
        self.graph = Graph()
        self.dijkstra = None
        self.astar = None
        self.allocator = None
        self._built = False

    def build(self, roads: list) -> None:
        """Construit le graphe et initialise les algorithmes"""
        self.graph.build_from_roads(roads)
        self.dijkstra = Dijkstra(self.graph)
        self.astar = AStar(self.graph)
        self.allocator = DynamicRefugeAllocator(self.graph)
        self._built = True
        logger.info(f"PathFinder prêt — {self.graph.node_count} noeuds, {self.graph.edge_count} arêtes")

    def find_best_shelter(
        self,
        user_lat: float,
        user_lon: float,
        shelters: list,
        mode: str = RouteMode.NORMAL
    ) -> Optional[Dict]:
        """
        Point d'entrée principal
        Trouve le meilleur refuge selon le mode choisi
        """
        if not self._built:
            raise RuntimeError("PathFinder non initialisé — appelle build() d'abord")

        user_pos = (round(user_lat, 6), round(user_lon, 6))
        connected_user = self.graph.connect_external_point(user_pos)

        return self.allocator.find_best_refuge(connected_user, shelters, mode)

    def path_to_shelter(
        self,
        user_lat: float,
        user_lon: float,
        shelter_lat: float,
        shelter_lon: float,
        mode: str = RouteMode.NORMAL
    ) -> Optional[Dict]:
        """
        Calcule le chemin vers un refuge spécifique
        """
        if not self._built:
            raise RuntimeError("PathFinder non initialisé")

        user_pos = (round(user_lat, 6), round(user_lon, 6))
        shelter_pos = (round(shelter_lat, 6), round(shelter_lon, 6))

        connected_user = self.graph.connect_external_point(user_pos)
        connected_shelter = self.graph.connect_external_point(shelter_pos)

        logger.debug(f"Calcul d'itinéraire de {connected_user} vers {connected_shelter} en mode {mode}")

        if mode == RouteMode.URGENCE:
            return self.astar.run(connected_user, connected_shelter)
        else:
            return self.dijkstra.run(connected_user, connected_shelter)

    def compare_paths(
        self,
        user_lat: float,
        user_lon: float,
        shelter_lat: float,
        shelter_lon: float
    ) -> Dict:
        """
        Lance Dijkstra et A* en parallèle
        Retourne les deux résultats pour comparaison
        """
        dijkstra_result = self.path_to_shelter(
            user_lat, user_lon,
            shelter_lat, shelter_lon,
            RouteMode.NORMAL
        )
        astar_result = self.path_to_shelter(
            user_lat, user_lon,
            shelter_lat, shelter_lon,
            RouteMode.URGENCE
        )

        # Déterminer la recommandation
        recommendation = "dijkstra"
        if astar_result and dijkstra_result:
            if astar_result["estimated_time_min"] < dijkstra_result["estimated_time_min"]:
                recommendation = "astar"
        elif astar_result:
            recommendation = "astar"
        elif dijkstra_result:
            recommendation = "dijkstra"

        return {
            "dijkstra": dijkstra_result,
            "astar": astar_result,
            "recommendation": recommendation
        }


# Instance globale réutilisée par tous les services
pathfinder = PathFinder()