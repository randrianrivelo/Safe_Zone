from fastapi import APIRouter, Query
from app.services.weather_service import WeatherService

router = APIRouter()


@router.get("/provinces")
def get_provinces():
    return WeatherService.get_provinces()


@router.get("/current/{province}")
async def get_current(province: str):
    """Meteo actuelle — appel async direct"""
    data = await WeatherService.get_current_async(province)
    if not data:
        from app.core.exceptions import NotFoundException
        raise NotFoundException("Province")
    return data


@router.get("/forecast/{province}")
async def get_forecast(
    province: str,
    days: int = Query(7, ge=1, le=7)
):
    """Previsions — appel async direct"""
    data = await WeatherService.get_forecast_async(province, days)
    return data