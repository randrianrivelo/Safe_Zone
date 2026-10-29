import math
from typing import Tuple, List, Dict
from app.utils.logger import logger


class DistanceService:
    """
    Service de calcul de distances géographiques
    Utilisé pour estimer les distances entre points GPS
    """

    EARTH_RADIUS_KM = 6371.0

    # Vitesses moyennes en km/h selon le contexte
    SPEED_WALKING_KMH  = 5.0   # Piéton normal
    SPEED_URGENCY_KMH  = 4.0   # Piéton en urgence (encombrement)
    SPEED_VEHICLE_KMH  = 40.0  # Voiture en ville / secours
    SPEED_RESCUE_KMH   = 60.0  # Véhicule de secours hors ville

    @classmethod
    def haversine(
        cls,
        lat1: float, lon1: float,
        lat2: float, lon2: float
    ) -> float:
        """
        Calcule la distance réelle entre 2 points GPS
        Formule Haversine — résultat en kilomètres

        Exemple :
            haversine(-18.9137, 47.5361, -18.9193, 47.5364)
            → 0.62 km
        """
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)

        a = (
            math.sin(dlat / 2) ** 2 +
            math.cos(math.radians(lat1)) *
            math.cos(math.radians(lat2)) *
            math.sin(dlon / 2) ** 2
        )

        c = 2 * math.asin(math.sqrt(a))
        return round(cls.EARTH_RADIUS_KM * c, 3)

    @classmethod
    def euclidean_approx(
        cls,
        lat1: float, lon1: float,
        lat2: float, lon2: float
    ) -> float:
        """
        Distance euclidienne approximative en km
        Plus rapide que Haversine — utilisée dans les algorithmes

        1 degré latitude  ≈ 111 km
        1 degré longitude ≈ 111 km * cos(latitude)
        """
        dlat = (lat2 - lat1) * 111.0
        dlon = (lon2 - lon1) * 111.0 * math.cos(math.radians(lat1))
        return round(math.sqrt(dlat ** 2 + dlon ** 2), 3)

    @classmethod
    def walking_time(cls, distance_km: float) -> float:
        """Temps de marche normal en minutes"""
        return round((distance_km / cls.SPEED_WALKING_KMH) * 60, 1)

    @classmethod
    def urgency_walking_time(cls, distance_km: float) -> float:
        """Temps de marche en situation d'urgence en minutes"""
        return round((distance_km / cls.SPEED_URGENCY_KMH) * 60, 1)

    @classmethod
    def vehicle_time(cls, distance_km: float) -> float:
        """Temps en voiture en minutes"""
        return round((distance_km / cls.SPEED_VEHICLE_KMH) * 60, 1)

    @classmethod
    def rescue_time(cls, distance_km: float) -> float:
        """Temps véhicule de secours en minutes"""
        return round((distance_km / cls.SPEED_RESCUE_KMH) * 60, 1)

    @classmethod
    def find_nearest(
        cls,
        user_lat: float,
        user_lon: float,
        points: List[Dict]
    ) -> Dict:
        """
        Trouve le point le plus proche parmi une liste

        points = [
            {"id": 1, "latitude": -18.91, "longitude": 47.53, ...},
            ...
        ]
        Retourne le point le plus proche avec sa distance
        """
        if not points:
            return None

        nearest      = None
        min_distance = float("inf")

        for point in points:
            dist = cls.haversine(
                user_lat, user_lon,
                point["latitude"], point["longitude"]
            )
            if dist < min_distance:
                min_distance = dist
                nearest      = point

        logger.debug(
            f"Point le plus proche : {nearest.get('name', 'inconnu')} "
            f"a {min_distance} km"
        )

        return {
            "point":       nearest,
            "distance_km": min_distance,
            "walk_time":   cls.walking_time(min_distance),
            "urgency_time":cls.urgency_walking_time(min_distance),
            "vehicle_time":cls.vehicle_time(min_distance)
        }

    @classmethod
    def sort_by_distance(
        cls,
        user_lat: float,
        user_lon: float,
        points: List[Dict]
    ) -> List[Dict]:
        """
        Trie une liste de points par distance croissante
        Ajoute la distance calculée à chaque point
        """
        result = []
        for point in points:
            dist = cls.haversine(
                user_lat, user_lon,
                point["latitude"], point["longitude"]
            )
            result.append({
                **point,
                "distance_km":  dist,
                "walk_time_min":cls.walking_time(dist)
            })

        result.sort(key=lambda x: x["distance_km"])
        return result

    @classmethod
    def is_within_radius(
        cls,
        user_lat: float,
        user_lon: float,
        center_lat: float,
        center_lon: float,
        radius_km: float
    ) -> bool:
        """
        Vérifie si un point est dans un rayon donné
        Utilisé pour détecter si l'utilisateur est dans une zone dangereuse
        """
        dist = cls.haversine(user_lat, user_lon, center_lat, center_lon)
        return dist <= radius_km

    @classmethod
    def check_danger_zones(
        cls,
        user_lat: float,
        user_lon: float,
        danger_zones: List[Dict]
    ) -> List[Dict]:
        """
        Vérifie si l'utilisateur est dans une zone dangereuse
        Retourne la liste des zones dangereuses où il se trouve
        """
        dangers_nearby = []

        for zone in danger_zones:
            if not zone.get("is_active"):
                continue

            in_zone = cls.is_within_radius(
                user_lat, user_lon,
                zone["center_lat"], zone["center_lon"],
                zone["radius_km"]
            )

            if in_zone:
                dist = cls.haversine(
                    user_lat, user_lon,
                    zone["center_lat"], zone["center_lon"]
                )
                dangers_nearby.append({
                    **zone,
                    "distance_from_user_km": dist
                })
                logger.warning(
                    f"Utilisateur dans zone dangereuse : "
                    f"{zone['name']} ({zone['severity']})"
                )

        return dangers_nearby

    @classmethod
    def format_distance(cls, distance_km: float) -> str:
        """Formate la distance pour l'affichage"""
        if distance_km < 1.0:
            return f"{int(distance_km * 1000)} m"
        return f"{round(distance_km, 1)} km"

    @classmethod
    def format_time(cls, minutes: float) -> str:
        """Formate le temps pour l'affichage"""
        if minutes < 60:
            return f"{int(minutes)} min"
        heures = int(minutes // 60)
        mins   = int(minutes % 60)
        return f"{heures}h{mins:02d}"