import math


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calcule la distance réelle entre 2 points GPS (formule Haversine)
    Retourne la distance en kilomètres
    """
    R    = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a    = (math.sin(dlat/2)**2 +
            math.cos(math.radians(lat1)) *
            math.cos(math.radians(lat2)) *
            math.sin(dlon/2)**2)
    return R * 2 * math.asin(math.sqrt(a))


def walking_time_minutes(distance_km: float) -> float:
    """Temps de marche à pied en urgence (~5 km/h)"""
    return round((distance_km / 5.0) * 60, 1)


def driving_time_minutes(distance_km: float) -> float:
    """Temps en voiture/secours (~40 km/h en urgence urbaine)"""
    return round((distance_km / 40.0) * 60, 1)