from sqlalchemy.orm import Session
from app.services.route_service import RouteService
from app.core.constants import RouteMode


class RouteController:

    def __init__(self, db: Session):
        self.service = RouteService(db)

    def find_best(
        self,
        user_lat: float,
        user_lon: float,
        mode: str = RouteMode.NORMAL
    ) -> dict:
        return self.service.find_best_shelter(user_lat, user_lon, mode)

    def path_to(
        self,
        user_lat: float,
        user_lon: float,
        shelter_id: int,
        mode: str = RouteMode.NORMAL
    ) -> dict:
        return self.service.path_to_shelter(
            user_lat, user_lon, shelter_id, mode
        )

    def compare(
        self,
        user_lat: float,
        user_lon: float,
        shelter_id: int
    ) -> dict:
        return self.service.compare_routes(user_lat, user_lon, shelter_id)