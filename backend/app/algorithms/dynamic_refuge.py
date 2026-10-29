from typing import List, Optional, Dict
from app.algorithms.graph import Graph
from app.algorithms.dijkstra import Dijkstra
from app.algorithms.astar import AStar
from app.core.constants import RefugeWeights, RouteMode
from app.utils.logger import logger


class DynamicRefuge:
    """Compatibilité tests (ancien nom)."""


DynamicRefugeAllocator = DynamicRefuge


class DynamicRefugeAllocator:

    """
    Programmation dynamique pour choisir le MEILLEUR refuge

    Score = somme pondérée de plusieurs critères :
        - Distance        (poids 10) — le plus important
        - Capacité libre  (poids 9)
        - Eau potable     (poids 8)
        - Services médic. (poids 7)
        - Sécurité route  (poids 6)
        - Électricité     (poids 5)

    Chaque critère est normalisé entre 0 et 1
    Score final entre 0 et 100
    """

    MAX_DISTANCE_KM = 20.0  # Distance max considérée

    def __init__(self, graph: Graph):
        self.graph    = graph
        self.dijkstra = Dijkstra(graph)
        self.astar    = AStar(graph)

    def find_best_refuge(
        self,
        user_pos: tuple,
        shelters: list,
        mode: str = RouteMode.NORMAL
    ) -> Optional[Dict]:
        """
        Évalue tous les refuges disponibles
        Retourne le meilleur avec son chemin
        """
        if not shelters:
            logger.warning("DynamicRefuge : aucun refuge disponible")
            return None

        candidates = []

        for shelter in shelters:
            # Ignorer les refuges pleins ou fermés
            if shelter.is_full or shelter.status != "ouvert":
                continue

            shelter_pos = (
                round(shelter.latitude, 6),
                round(shelter.longitude, 6)
            )
            self.graph.connect_external_point(shelter_pos)

            # Calculer le chemin selon le mode
            if mode == RouteMode.URGENCE:
                path_result = self.astar.run(user_pos, shelter_pos)
            else:
                path_result = self.dijkstra.run(user_pos, shelter_pos)

            if not path_result:
                continue

            distance = path_result["total_distance_km"]

            # Calculer le score pondéré
            score = self._compute_score(shelter, distance)

            candidates.append({
                "shelter":            shelter,
                "path":               path_result["path"],
                "total_distance_km":  distance,
                "estimated_time_min": path_result["estimated_time_min"],
                "algorithm":          path_result["algorithm"],
                "score":              score
            })

            logger.debug(
                f"Refuge '{shelter.name}' — "
                f"dist={distance}km, score={score}"
            )

        if not candidates:
            logger.warning("DynamicRefuge : aucun chemin trouvé")
            return None

        # Trier par score décroissant
        candidates.sort(key=lambda x: x["score"], reverse=True)

        best = candidates[0]
        logger.info(
            f"Meilleur refuge : '{best['shelter'].name}' "
            f"score={best['score']}, dist={best['total_distance_km']}km"
        )

        return {
            "best": best,
            "alternatives": candidates[1:3]  # 2 alternatives
        }

    def _compute_score(self, shelter, distance_km: float) -> float:
        """
        Calcule le score pondéré d'un refuge
        Retourne un score entre 0 et 100
        """
        W = RefugeWeights

        # 1. Score distance (inverse : plus proche = mieux)
        dist_ratio    = max(0, 1 - (distance_km / self.MAX_DISTANCE_KM))
        score_dist    = W.DISTANCE * dist_ratio

        # 2. Score capacité (ratio places libres)
        cap_ratio     = shelter.available_spots / max(1, shelter.capacity_total)
        score_cap     = W.CAPACITY * cap_ratio

        # 3. Score eau
        score_water   = W.WATER * (1 if shelter.has_water else 0)

        # 4. Score médical
        score_medical = W.MEDICAL * (1 if shelter.has_medical else 0)

        # 5. Score électricité
        score_elec    = W.ELECTRICITY * (1 if shelter.has_electricity else 0)

        # 6. Bonus nourriture
        score_food    = 3 * (1 if shelter.has_food else 0)

        total = (
            score_dist + score_cap + score_water +
            score_medical + score_elec + score_food
        )

        # Normaliser sur 100
        max_possible = (
            W.DISTANCE + W.CAPACITY + W.WATER +
            W.MEDICAL + W.ELECTRICITY + 3
        )
        return round((total / max_possible) * 100, 2)