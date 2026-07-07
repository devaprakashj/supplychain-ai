"""Weather API routes"""
from fastapi import APIRouter, Query
from app.services.weather_service import get_weather_for_city, get_weather_for_coords

router = APIRouter()


@router.get("/{city}")
async def weather_for_city(city: str):
    return await get_weather_for_city(city)


@router.get("/coords/at")
async def weather_for_coords(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
):
    return await get_weather_for_coords(lat, lon)


@router.get("/hubs/all")
async def weather_for_trade_hubs():
    """Weather for the top global trade hub cities."""
    import asyncio
    cities = ["Shanghai", "Rotterdam", "Singapore", "Los Angeles", "Hamburg",
              "Dubai", "Hong Kong", "New York", "Tokyo", "Mumbai"]
    results = await asyncio.gather(*[get_weather_for_city(c) for c in cities])
    return {"hubs": list(results), "count": len(results)}
