from sqlalchemy.orm import Session
from app.services.weather_service import WeatherService


class WeatherController:

    def __init__(self, db: Session = None):
        self.service = WeatherService()

    def get_provinces(self):
        """Récupère la liste des provinces et zones"""
        return self.service.get_provinces()

    async def get_current(self, province: str):
        """Récupère la météo actuelle pour une province"""
        return await self.service.get_current_async(province)

    async def get_forecast(self, province: str, days: int = 7):
        """Récupère les prévisions pour N jours"""
        if days < 1 or days > 7:
            days = 7
        return await self.service.get_forecast_async(province, days)

    def get_risk_levels(self):
        """Classification des risques météorologiques"""
        return {
            "faible": {"label": "Faible risque", "color": "#39ff88", "icon": "bi-cloud-sun"},
            "moyen": {"label": "Risque modéré", "color": "#ffd60a", "icon": "bi-cloud"},
            "eleve": {"label": "Risque élevé", "color": "#ff9500", "icon": "bi-cloud-lightning"},
            "critique": {"label": "Risque critique", "color": "#ff3b30", "icon": "bi-cloud-lightning-rain-fill"}
        }
