from app.config.settings import settings
from app.core.exceptions import InvalidCoordinatesException


def validate_gps(lat: float, lon: float) -> None:
    """Verifie que les coordonnees sont dans Analamanga"""
    if not (settings.LAT_MIN <= lat <= settings.LAT_MAX):
        raise InvalidCoordinatesException()
    if not (settings.LON_MIN <= lon <= settings.LON_MAX):
        raise InvalidCoordinatesException()


def validate_capacity(capacity: int, occupancy: int) -> None:
    """Verifie que l'occupation ne depasse pas la capacite"""
    if occupancy > capacity:
        raise ValueError(
            f"Occupation ({occupancy}) depasse la capacite ({capacity})"
        )