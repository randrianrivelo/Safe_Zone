# app/utils.py
import math
from typing import Tuple


def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calcule la distance en mètres entre deux points GPS."""
    R = 6371000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def meters_to_km(meters: float) -> float:
    return round(meters / 1000, 2)


def walking_time_minutes(meters: float, speed_kmh: float = 4.5) -> float:
    return round((meters / 1000) / speed_kmh * 60, 1)


def format_distance(meters: float) -> str:
    if meters < 1000:
        return f"{int(meters)} m"
    return f"{meters_to_km(meters)} km"