"""Ports route – major global port weather and info"""
import asyncio
from fastapi import APIRouter
from app.services.weather_service import get_weather_for_city

router = APIRouter()

MAJOR_PORTS = [
    {"name": "Port of Shanghai", "city": "Shanghai", "country": "China", "lat": 31.22, "lon": 121.48, "type": "Sea"},
    {"name": "Port of Rotterdam", "city": "Rotterdam", "country": "Netherlands", "lat": 51.92, "lon": 4.48, "type": "Sea"},
    {"name": "Port of Singapore", "city": "Singapore", "country": "Singapore", "lat": 1.26, "lon": 103.82, "type": "Sea"},
    {"name": "Port of Los Angeles", "city": "Los Angeles", "country": "USA", "lat": 33.73, "lon": -118.27, "type": "Sea"},
    {"name": "Port of Hamburg", "city": "Hamburg", "country": "Germany", "lat": 53.54, "lon": 9.99, "type": "Sea"},
    {"name": "Port of Dubai (Jebel Ali)", "city": "Dubai", "country": "UAE", "lat": 24.99, "lon": 55.06, "type": "Sea"},
    {"name": "Port of Hong Kong", "city": "Hong Kong", "country": "China", "lat": 22.30, "lon": 114.17, "type": "Sea"},
    {"name": "Port of Busan", "city": "Busan", "country": "South Korea", "lat": 35.10, "lon": 129.04, "type": "Sea"},
    {"name": "Port of Antwerp", "city": "Antwerp", "country": "Belgium", "lat": 51.22, "lon": 4.40, "type": "Sea"},
    {"name": "Port of Mumbai (JNPT)", "city": "Mumbai", "country": "India", "lat": 18.95, "lon": 72.94, "type": "Sea"},
    {"name": "Port of Colombo", "city": "Colombo", "country": "Sri Lanka", "lat": 6.93, "lon": 79.84, "type": "Sea"},
    {"name": "Port of Felixstowe", "city": "Felixstowe", "country": "UK", "lat": 51.95, "lon": 1.35, "type": "Sea"},
]


@router.get("/all")
async def all_ports():
    """Return major ports with live weather data."""
    weather_results = await asyncio.gather(*[get_weather_for_city(p["city"]) for p in MAJOR_PORTS])
    ports = []
    for port, weather in zip(MAJOR_PORTS, weather_results):
        port_data = dict(port)
        port_data["weather"] = weather
        port_data["weather_risk"] = _assess_weather_risk(weather)
        ports.append(port_data)
    return {"ports": ports, "count": len(ports), "weather_source": "Open-Meteo"}


def _assess_weather_risk(weather: dict) -> str:
    if "error" in weather:
        return "Unknown"
    code = weather.get("weather_code", 0)
    wind = weather.get("wind_speed_ms", 0)
    precip = weather.get("precipitation_mm", 0)
    if code in {95, 96, 99} or wind > 20:
        return "Severe"
    if code in {61, 63, 65, 80, 81, 82} or wind > 12 or precip > 5:
        return "Moderate"
    return "Low"
