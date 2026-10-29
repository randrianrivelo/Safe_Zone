from sqlalchemy.orm import Session
from typing import Optional
from app.repositories.shelter_repository import ShelterRepository
from app.repositories.road_repository import RoadRepository
from app.algorithms.pathfinder import pathfinder
from app.core.constants import RouteMode
from app.core.exceptions import (
    NotFoundException, NoPathFoundException, ShelterFullException
)
from app.core.validators import validate_gps
from app.services.cache_service import CacheService
from app.utils.logger import logger
import json


class RouteService:

    def __init__(self, db: Session):
        self.shelter_repo = ShelterRepository(db)
        self.road_repo    = RoadRepository(db)
        self.cache        = CacheService()

    def _build_graph(self) -> None:
        roads = self.road_repo.get_all()
        pathfinder.build(roads)

    def find_best_shelter(
        self,
        user_lat: float,
        user_lon: float,
        mode: str = RouteMode.NORMAL
    ) -> dict:
        validate_gps(user_lat, user_lon)

        cache_key = f"route:best:{round(user_lat,3)}:{round(user_lon,3)}:{mode}"
        cached    = self.cache.get(cache_key)
        if cached:
            logger.info("Resultat itineraire servi depuis le cache")
            return cached

        shelters = self.shelter_repo.get_available()
        if not shelters:
            raise ShelterFullException()

        self._build_graph()

        result = pathfinder.find_best_shelter(
            user_lat, user_lon, shelters, mode
        )

        if not result:
            raise NoPathFoundException()

        best      = result["best"]
        shelter   = best["shelter"]
        response  = {
            "best_shelter": {
                "id":             shelter.id,
                "name":           shelter.name,
                "address":        shelter.address,
                "latitude":       shelter.latitude,
                "longitude":      shelter.longitude,
                "available_spots":shelter.available_spots,
                "has_medical":    shelter.has_medical,
                "has_water":      shelter.has_water,
                "has_food":       shelter.has_food,
                "contact_phone":  shelter.contact_phone,
                "score":          best["score"]
            },
            "path":               best["path"],
            "total_distance_km":  best["total_distance_km"],
            "estimated_time_min": best["estimated_time_min"],
            "algorithm":          best["algorithm"],
            "mode":               mode,
            "alternatives": [
                {
                    "shelter_name":       alt["shelter"].name,
                    "shelter_id":         alt["shelter"].id,
                    "available_spots":    alt["shelter"].available_spots,
                    "total_distance_km":  alt["total_distance_km"],
                    "estimated_time_min": alt["estimated_time_min"],
                    "score":              alt["score"]
                }
                for alt in result.get("alternatives", [])
            ]
        }

        self.cache.set(cache_key, response, expire=120)
        return response

    def path_to_shelter(
        self,
        user_lat: float,
        user_lon: float,
        shelter_id: int,
        mode: str = RouteMode.NORMAL
    ) -> dict:
        validate_gps(user_lat, user_lon)

        shelter = self.shelter_repo.get_by_id(shelter_id)
        if not shelter:
            raise NotFoundException("Refuge")

        self._build_graph()

        result = pathfinder.path_to_shelter(
            user_lat, user_lon,
            shelter.latitude, shelter.longitude,
            mode
        )

        if not result:
            raise NoPathFoundException()

        return {
            "shelter": {
                "id":             shelter.id,
                "name":           shelter.name,
                "address":        shelter.address,
                "available_spots":shelter.available_spots,
                "has_medical":    shelter.has_medical,
                "contact_phone":  shelter.contact_phone
            },
            "path":               result["path"],
            "total_distance_km":  result["total_distance_km"],
            "estimated_time_min": result["estimated_time_min"],
            "algorithm":          result["algorithm"],
            "mode":               mode
        }

    def compare_routes(
        self,
        user_lat: float,
        user_lon: float,
        shelter_id: int
    ) -> dict:
        validate_gps(user_lat, user_lon)

        shelter = self.shelter_repo.get_by_id(shelter_id)
        if not shelter:
            raise NotFoundException("Refuge")

        self._build_graph()

        result = pathfinder.compare_paths(
            user_lat, user_lon,
            shelter.latitude, shelter.longitude
        )

        return {
            "shelter_name":  shelter.name,
            "dijkstra":      result["dijkstra"],
            "astar":         result["astar"],
            "recommendation":result["recommendation"]
        }