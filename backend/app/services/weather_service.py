"""Weather service – OpenWeatherMap (keyed) + Open-Meteo (free fallback)"""
import httpx
from typing import Optional
from app.core.config import settings


OPENWEATHER_BASE = "https://api.openweathermap.org/data/2.5"
OPEN_METEO_BASE = settings.OPEN_METEO_BASE_URL
GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search"


async def get_weather_for_city(city: str) -> dict:
    """Fetch current weather. Uses OpenWeatherMap if key configured, else Open-Meteo."""
    if settings.OPENWEATHER_API_KEY:
        return await _owm_weather(city)
    return await _open_meteo_weather(city)


async def _owm_weather(city: str) -> dict:
    url = f"{OPENWEATHER_BASE}/weather"
    params = {"q": city, "appid": settings.OPENWEATHER_API_KEY, "units": "metric"}
    async with httpx.AsyncClient(timeout=10) as client:
        try:
            r = await client.get(url, params=params)
            r.raise_for_status()
            d = r.json()
            return {
                "city": d["name"],
                "country": d["sys"]["country"],
                "temp_c": d["main"]["temp"],
                "feels_like_c": d["main"]["feels_like"],
                "humidity_pct": d["main"]["humidity"],
                "wind_speed_ms": d["wind"]["speed"],
                "description": d["weather"][0]["description"],
                "icon": d["weather"][0]["icon"],
                "visibility_m": d.get("visibility"),
                "pressure_hpa": d["main"]["pressure"],
                "source": "OpenWeatherMap",
                "source_url": "https://openweathermap.org",
            }
        except httpx.HTTPError as e:
            return {"error": str(e), "city": city, "source": "OpenWeatherMap"}


async def _open_meteo_weather(city: str) -> dict:
    """Geocode city then fetch weather from Open-Meteo (free, no key)."""
    async with httpx.AsyncClient(timeout=10) as client:
        try:
            # Step 1: geocode
            geo_r = await client.get(GEOCODE_URL, params={"name": city, "count": 1, "language": "en", "format": "json"})
            geo_r.raise_for_status()
            geo = geo_r.json()
            if not geo.get("results"):
                return {"error": f"City '{city}' not found", "city": city}
            loc = geo["results"][0]
            lat, lon = loc["latitude"], loc["longitude"]
            country = loc.get("country_code", "")

            # Step 2: weather
            weather_r = await client.get(
                f"{OPEN_METEO_BASE}/forecast",
                params={
                    "latitude": lat,
                    "longitude": lon,
                    "current": "temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weather_code,surface_pressure,apparent_temperature",
                    "timezone": "auto",
                },
            )
            weather_r.raise_for_status()
            wd = weather_r.json()["current"]

            return {
                "city": loc["name"],
                "country": country.upper(),
                "latitude": lat,
                "longitude": lon,
                "temp_c": wd["temperature_2m"],
                "feels_like_c": wd["apparent_temperature"],
                "humidity_pct": wd["relative_humidity_2m"],
                "wind_speed_ms": round(wd["wind_speed_10m"] / 3.6, 2),  # km/h → m/s
                "precipitation_mm": wd["precipitation"],
                "pressure_hpa": wd["surface_pressure"],
                "weather_code": wd["weather_code"],
                "description": _wmo_description(wd["weather_code"]),
                "source": "Open-Meteo",
                "source_url": "https://open-meteo.com",
            }
        except httpx.HTTPError as e:
            return {"error": str(e), "city": city, "source": "Open-Meteo"}


async def get_weather_for_coords(lat: float, lon: float) -> dict:
    """Fetch weather for lat/lon coordinates using Open-Meteo."""
    async with httpx.AsyncClient(timeout=10) as client:
        try:
            r = await client.get(
                f"{OPEN_METEO_BASE}/forecast",
                params={
                    "latitude": lat,
                    "longitude": lon,
                    "current": "temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weather_code,surface_pressure",
                    "timezone": "auto",
                },
            )
            r.raise_for_status()
            wd = r.json()["current"]
            return {
                "latitude": lat,
                "longitude": lon,
                "temp_c": wd["temperature_2m"],
                "humidity_pct": wd["relative_humidity_2m"],
                "wind_speed_ms": round(wd["wind_speed_10m"] / 3.6, 2),
                "precipitation_mm": wd["precipitation"],
                "weather_code": wd["weather_code"],
                "description": _wmo_description(wd["weather_code"]),
                "source": "Open-Meteo",
            }
        except httpx.HTTPError as e:
            return {"error": str(e), "latitude": lat, "longitude": lon}


def _wmo_description(code: int) -> str:
    """Map WMO weather interpretation codes to human-readable descriptions."""
    codes = {
        0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
        45: "Fog", 48: "Depositing rime fog",
        51: "Drizzle: light", 53: "Drizzle: moderate", 55: "Drizzle: dense",
        61: "Rain: slight", 63: "Rain: moderate", 65: "Rain: heavy",
        71: "Snow fall: slight", 73: "Snow fall: moderate", 75: "Snow fall: heavy",
        80: "Rain showers: slight", 81: "Rain showers: moderate", 82: "Rain showers: violent",
        85: "Snow showers: slight", 86: "Snow showers: heavy",
        95: "Thunderstorm: slight/moderate", 96: "Thunderstorm with hail", 99: "Thunderstorm with heavy hail",
    }
    return codes.get(code, f"Weather code {code}")
