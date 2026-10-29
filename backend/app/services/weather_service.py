import httpx
import os
from datetime import datetime
from app.utils.logger import logger
from dotenv import load_dotenv

from pathlib import Path

env_path = Path(__file__).resolve().parents[2] / '.env'
load_dotenv(env_path)

API_KEY = os.getenv("OPENWEATHER_API_KEY", "")

# Debug — affiche la clé au démarrage
if API_KEY:
    print(f"[METEO] Cle API trouvee : {API_KEY[:8]}...")
else:
    print("[METEO] Cle API MANQUANTE — mode simulation")
BASE_URL = "https://api.openweathermap.org/data/2.5"

PROVINCES = {
    "antananarivo": {
        "name":     "Antananarivo",
        "name_mg":  "Antananarivo",
        "lat":      -18.9137,
        "lon":      47.5361,
        "region":   "Hauts Plateaux",
        "coastal":  False
    },
    "toamasina": {
        "name":     "Toamasina",
        "name_mg":  "Toamasina",
        "lat":      -18.1492,
        "lon":      49.4023,
        "region":   "Cote Est",
        "coastal":  True
    },
    "mahajanga": {
        "name":     "Mahajanga",
        "name_mg":  "Mahajanga",
        "lat":      -15.7167,
        "lon":      46.3167,
        "region":   "Nord-Ouest",
        "coastal":  True
    },
    "fianarantsoa": {
        "name":     "Fianarantsoa",
        "name_mg":  "Fianarantsoa",
        "lat":      -21.4535,
        "lon":      47.0855,
        "region":   "Hauts Plateaux Sud",
        "coastal":  False
    },
    "toliara": {
        "name":     "Toliara",
        "name_mg":  "Toliara",
        "lat":      -23.3568,
        "lon":      43.6917,
        "region":   "Sud",
        "coastal":  True
    },
    "antsiranana": {
        "name":     "Antsiranana",
        "name_mg":  "Antsiranana",
        "lat":      -12.3632,
        "lon":      49.2992,
        "region":   "Nord",
        "coastal":  True
    }
}

# Traduction conditions meteo
CONDITION_MAP = {
    "Clear":        {"fr": "Ensoleille",       "mg": "Mazava",          "icon": "bi-sun-fill"},
    "Clouds":       {"fr": "Nuageux",          "mg": "Rahona",          "icon": "bi-cloud-fill"},
    "Rain":         {"fr": "Pluie",            "mg": "Ranonorana",      "icon": "bi-cloud-rain-fill"},
    "Drizzle":      {"fr": "Bruine",           "mg": "Ranonorana kely", "icon": "bi-cloud-drizzle-fill"},
    "Thunderstorm": {"fr": "Orage",            "mg": "Kotroka",        "icon": "bi-cloud-lightning-rain-fill"},
    "Snow":         {"fr": "Neige",            "mg": "Oram-panala",    "icon": "bi-cloud-snow-fill"},
    "Mist":         {"fr": "Brume",            "mg": "Zavona",         "icon": "bi-cloud-haze-fill"},
    "Fog":          {"fr": "Brouillard",       "mg": "Zavona matevina", "icon": "bi-cloud-fog-fill"},
    "Haze":         {"fr": "Brume seche",      "mg": "Zavona",         "icon": "bi-cloud-haze-fill"},
    "Dust":         {"fr": "Poussiere",        "mg": "Vovoka",         "icon": "bi-cloud-haze-fill"},
    "Tornado":      {"fr": "Tornade",          "mg": "Rivo-doza",      "icon": "bi-tornado"},
}


def get_risk_level(wind_speed, rain_mm=0, condition=""):
    """Calcule le niveau de risque selon le vent et la pluie"""
    if wind_speed > 100 or condition in ["Tornado"]:
        return "critique"
    if wind_speed > 60 or rain_mm > 50:
        return "eleve"
    if wind_speed > 30 or rain_mm > 20 or condition in ["Thunderstorm"]:
        return "moyen"
    return "faible"


def get_wave_info(wind_speed, coastal):
    """Calcule les infos sur les vagues pour les zones cotieres"""
    if not coastal:
        return None

    # Estimation hauteur vagues selon le vent (formule simplifiee)
    if wind_speed > 80:
        height = round(wind_speed * 0.06, 1)
        state  = "Tres agitee"
        state_mg = "Misamboaravoara be"
        danger = True
        color  = "#ff3b30"
    elif wind_speed > 50:
        height = round(wind_speed * 0.04, 1)
        state  = "Agitee"
        state_mg = "Misamboaravoara"
        danger = True
        color  = "#ff9500"
    elif wind_speed > 25:
        height = round(wind_speed * 0.025, 1)
        state  = "Peu agitee"
        state_mg = "Somary misamboaravoara"
        danger = False
        color  = "#ffd60a"
    else:
        height = round(wind_speed * 0.015, 1)
        state  = "Calme"
        state_mg = "Tony"
        danger = False
        color  = "#39ff88"

    return {
        "height_m":    height,
        "state_fr":    state,
        "state_mg":    state_mg,
        "danger":      danger,
        "color":       color,
        "advisory_fr": f"Vagues de {height}m - {'Navigation dangereuse' if danger else 'Navigation possible'}",
        "advisory_mg": f"Onja {height}m - {'Fandehanan-tsambo mampidi-doza' if danger else 'Azo andehanana sambo'}"
    }


class WeatherService:

    @staticmethod
    def get_provinces():
        return [
            {
                "key":     key,
                "name":    data["name"],
                "name_mg": data["name_mg"],
                "region":  data["region"],
                "lat":     data["lat"],
                "lon":     data["lon"],
                "coastal": data["coastal"]
            }
            for key, data in PROVINCES.items()
        ]

    @staticmethod
    async def get_current_async(province: str):
        """Recupere la meteo actuelle via OpenWeatherMap API"""
        data = PROVINCES.get(province.lower())
        if not data:
            return None

        if not API_KEY:
            logger.warning("Cle API OpenWeatherMap manquante — mode simulation")
            return WeatherService._simulate_current(data)

        try:
            url = (
                f"{BASE_URL}/weather"
                f"?lat={data['lat']}&lon={data['lon']}"
                f"&appid={API_KEY}&units=metric&lang=fr"
            )

            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.get(url)
                response.raise_for_status()
                weather = response.json()

            main_condition = weather["weather"][0]["main"]
            cond_info      = CONDITION_MAP.get(main_condition, {
                "fr": main_condition, "mg": main_condition, "icon": "bi-cloud"
            })

            wind_speed = weather.get("wind", {}).get("speed", 0) * 3.6
            rain_1h    = weather.get("rain", {}).get("1h", 0)
            risk       = get_risk_level(wind_speed, rain_1h, main_condition)
            waves      = get_wave_info(wind_speed, data["coastal"])

            result = {
                "province":     data["name"],
                "province_mg":  data["name_mg"],
                "region":       data["region"],
                "coastal":      data["coastal"],
                "temperature":  round(weather["main"]["temp"]),
                "feels_like":   round(weather["main"]["feels_like"]),
                "temp_min":     round(weather["main"]["temp_min"]),
                "temp_max":     round(weather["main"]["temp_max"]),
                "humidity":     weather["main"]["humidity"],
                "pressure":     weather["main"]["pressure"],
                "wind_kmh":     round(wind_speed),
                "wind_dir":     weather.get("wind", {}).get("deg", 0),
                "visibility":   round(weather.get("visibility", 10000) / 1000, 1),
                "clouds":       weather.get("clouds", {}).get("all", 0),
                "rain_1h":      rain_1h,
                "condition":    cond_info["fr"],
                "condition_mg": cond_info["mg"],
                "icon":         cond_info["icon"],
                "risk_level":   risk,
                "waves":        waves,
                "sunrise":      datetime.fromtimestamp(weather["sys"]["sunrise"]).strftime("%H:%M"),
                "sunset":       datetime.fromtimestamp(weather["sys"]["sunset"]).strftime("%H:%M"),
                "updated_at":   datetime.now().isoformat(),
                "source":       "OpenWeatherMap"
            }

            logger.info(f"Meteo reelle chargee pour {data['name']}")
            return result

        except Exception as e:
            logger.error(f"Erreur API meteo: {e} — mode simulation")
            return WeatherService._simulate_current(data)

    @staticmethod
    def get_current(province: str):
        """Version synchrone — appelle la version async"""
        import asyncio
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                import concurrent.futures
                with concurrent.futures.ThreadPoolExecutor() as pool:
                    result = pool.submit(
                        asyncio.run,
                        WeatherService.get_current_async(province)
                    ).result()
                return result
            return asyncio.run(WeatherService.get_current_async(province))
        except Exception:
            data = PROVINCES.get(province.lower())
            if data:
                return WeatherService._simulate_current(data)
            return None

    @staticmethod
    async def get_forecast_async(province: str, days: int = 7):
        """Previsions meteo via OpenWeatherMap API"""
        data = PROVINCES.get(province.lower())
        if not data:
            return []

        if not API_KEY:
            return WeatherService._simulate_forecast(data, days)

        try:
            url = (
                f"{BASE_URL}/forecast"
                f"?lat={data['lat']}&lon={data['lon']}"
                f"&appid={API_KEY}&units=metric&lang=fr"
                f"&cnt={days * 8}"
            )

            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.get(url)
                response.raise_for_status()
                forecast_data = response.json()

            # Regrouper par jour
            daily = {}
            for item in forecast_data.get("list", []):
                date = item["dt_txt"].split(" ")[0]
                if date not in daily:
                    daily[date] = {
                        "temps": [], "winds": [], "rains": [],
                        "conditions": [], "humidities": []
                    }
                daily[date]["temps"].append(item["main"]["temp"])
                daily[date]["winds"].append(item["wind"]["speed"] * 3.6)
                daily[date]["rains"].append(item.get("rain", {}).get("3h", 0))
                daily[date]["conditions"].append(item["weather"][0]["main"])
                daily[date]["humidities"].append(item["main"]["humidity"])

            result = []
            for date, vals in list(daily.items())[:days]:
                avg_wind   = sum(vals["winds"]) / len(vals["winds"])
                avg_rain   = sum(vals["rains"]) / len(vals["rains"])
                main_cond  = max(set(vals["conditions"]), key=vals["conditions"].count)
                cond_info  = CONDITION_MAP.get(main_cond, {
                    "fr": main_cond, "mg": main_cond, "icon": "bi-cloud"
                })
                risk  = get_risk_level(avg_wind, avg_rain, main_cond)
                waves = get_wave_info(avg_wind, data["coastal"])

                result.append({
                    "date":         date,
                    "temp_min":     round(min(vals["temps"])),
                    "temp_max":     round(max(vals["temps"])),
                    "humidity":     round(sum(vals["humidities"]) / len(vals["humidities"])),
                    "wind_kmh":     round(avg_wind),
                    "rain_mm":      round(sum(vals["rains"]), 1),
                    "condition":    cond_info["fr"],
                    "condition_mg": cond_info["mg"],
                    "icon":         cond_info["icon"],
                    "risk_level":   risk,
                    "waves":        waves,
                    "source":       "OpenWeatherMap"
                })

            logger.info(f"Previsions chargees pour {data['name']}: {len(result)} jours")
            return result

        except Exception as e:
            logger.error(f"Erreur API previsions: {e}")
            return WeatherService._simulate_forecast(data, days)

    @staticmethod
    def get_forecast(province: str, days: int = 7):
        """Version synchrone"""
        import asyncio
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                import concurrent.futures
                with concurrent.futures.ThreadPoolExecutor() as pool:
                    result = pool.submit(
                        asyncio.run,
                        WeatherService.get_forecast_async(province)
                    ).result()
                return result
            return asyncio.run(WeatherService.get_forecast_async(province))
        except Exception:
            data = PROVINCES.get(province.lower())
            if data:
                return WeatherService._simulate_forecast(data, days)
            return []

    @staticmethod
    def _simulate_current(data):
        """Simulation si API indisponible"""
        import random
        wind = random.randint(5, 60)
        rain = random.choice([0, 0, 0, 5, 10, 20, 40])
        conditions = ["Clear", "Clouds", "Rain", "Thunderstorm", "Drizzle"]
        main_cond  = random.choice(conditions)
        cond_info  = CONDITION_MAP.get(main_cond, {"fr": main_cond, "mg": main_cond, "icon": "bi-cloud"})
        risk  = get_risk_level(wind, rain, main_cond)
        waves = get_wave_info(wind, data.get("coastal", False))

        return {
            "province":     data["name"],
            "province_mg":  data["name_mg"],
            "region":       data.get("region", ""),
            "coastal":      data.get("coastal", False),
            "temperature":  random.randint(16, 32),
            "feels_like":   random.randint(18, 35),
            "temp_min":     random.randint(14, 22),
            "temp_max":     random.randint(24, 34),
            "humidity":     random.randint(40, 95),
            "pressure":     random.randint(1005, 1020),
            "wind_kmh":     wind,
            "wind_dir":     random.randint(0, 360),
            "visibility":   random.choice([5, 8, 10, 15, 20]),
            "clouds":       random.randint(0, 100),
            "rain_1h":      rain,
            "condition":    cond_info["fr"],
            "condition_mg": cond_info["mg"],
            "icon":         cond_info["icon"],
            "risk_level":   risk,
            "waves":        waves,
            "sunrise":      "06:15",
            "sunset":       "17:45",
            "updated_at":   datetime.now().isoformat(),
            "source":       "Simulation"
        }

    @staticmethod
    def _simulate_forecast(data, days):
        """Previsions simulees"""
        import random
        from datetime import timedelta
        result = []
        for i in range(days):
            date = (datetime.now() + timedelta(days=i)).strftime("%Y-%m-%d")
            wind = random.randint(5, 60)
            rain = random.choice([0, 0, 5, 10, 25])
            conditions = ["Clear", "Clouds", "Rain", "Thunderstorm"]
            main_cond  = random.choice(conditions)
            cond_info  = CONDITION_MAP.get(main_cond, {"fr": main_cond, "mg": main_cond, "icon": "bi-cloud"})
            risk  = get_risk_level(wind, rain, main_cond)
            waves = get_wave_info(wind, data.get("coastal", False))

            result.append({
                "date":         date,
                "temp_min":     random.randint(14, 22),
                "temp_max":     random.randint(24, 34),
                "humidity":     random.randint(40, 95),
                "wind_kmh":     wind,
                "rain_mm":      rain,
                "condition":    cond_info["fr"],
                "condition_mg": cond_info["mg"],
                "icon":         cond_info["icon"],
                "risk_level":   risk,
                "waves":        waves,
                "source":       "Simulation"
            })
        return result