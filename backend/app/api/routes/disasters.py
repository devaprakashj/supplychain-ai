"""Disaster API routes – USGS + NASA EONET"""
from fastapi import APIRouter, Query
from app.services.disaster_service import get_live_earthquakes, get_nasa_eonet_events, get_all_live_disasters

router = APIRouter()


@router.get("/live")
async def all_disasters():
    return await get_all_live_disasters()


@router.get("/earthquakes")
async def earthquakes(
    min_magnitude: float = Query(4.5, description="Minimum magnitude"),
    period: str = Query("week", description="Time period: hour, day, week, month"),
):
    return await get_live_earthquakes(min_magnitude, period)


@router.get("/events")
async def natural_events(
    category: str | None = Query(None, description="EONET category slug"),
    limit: int = Query(30, le=100),
):
    return await get_nasa_eonet_events(category, limit)
