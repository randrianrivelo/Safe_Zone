from fastapi import HTTPException


class SafeZoneException(HTTPException):
    """Exception de base du projet"""
    def __init__(self, message: str, status_code: int = 400):
        super().__init__(status_code=status_code, detail=message)


class NotFoundException(SafeZoneException):
    def __init__(self, resource: str):
        super().__init__(f"{resource} introuvable", 404)


class UnauthorizedException(SafeZoneException):
    def __init__(self):
        super().__init__("Non autorisé — connexion requise", 401)


class ForbiddenException(SafeZoneException):
    def __init__(self):
        super().__init__("Accès refusé — droits insuffisants", 403)


class NoPathFoundException(SafeZoneException):
    def __init__(self):
        super().__init__(
            "Aucun chemin praticable trouvé vers un refuge", 404
        )


class InvalidCoordinatesException(SafeZoneException):
    def __init__(self):
        super().__init__(
            "Coordonnées GPS invalides ou hors de la région Analamanga", 422
        )


class ShelterFullException(SafeZoneException):
    def __init__(self):
        super().__init__("Tous les refuges sont saturés", 409)