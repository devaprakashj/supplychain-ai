"""
Flights route – powered by OpenSky Network (100% free, no API key required).

OpenSky Network: https://opensky-network.org
- Completely free REST API
- Live ADS-B aircraft positions from a global receiver network
- No payment, no signup required (anonymous access)
- Rate limited to 400 req/day anonymous (4000/day with free account)
"""
from fastapi import APIRouter, Query
from app.services.flight_service import get_live_flights, get_flights_all_regions

router = APIRouter()


@router.get("/live")
async def live_flights(
    region: str = Query(
        default="north_atlantic",
        description="Region to query: north_atlantic | europe | asia_pacific | middle_east",
    ),
    limit: int = Query(default=50, ge=1, le=200),
    only_airborne: bool = Query(default=True),
):
    """
    Live aircraft state vectors from OpenSky Network (free, no key needed).
    Returns position, altitude, speed, and heading for airborne aircraft.
    """
    return await get_live_flights(region=region, limit=limit, only_airborne=only_airborne)


@router.get("/all-regions")
async def flights_all_regions(
    limit_per_region: int = Query(default=25, ge=1, le=100),
):
    """Fetch aircraft across all 4 monitored cargo regions simultaneously."""
    return await get_flights_all_regions(limit_per_region=limit_per_region)


@router.get("/info")
async def provider_info():
    """Return information about the flight data provider."""
    return {
        "provider": "OpenSky Network",
        "provider_url": "https://opensky-network.org",
        "cost": "Free",
        "protocol": "REST (JSON)",
        "api_base": "https://opensky-network.org/api",
        "description": (
            "OpenSky Network is a non-profit research project providing free "
            "real-time and historical ADS-B flight data. No API key or payment required. "
            "Anonymous access is rate-limited to 400 requests/day."
        ),
        "key_required": False,
        "rate_limit_anonymous": "400 requests/day",
        "rate_limit_with_free_account": "4000 requests/day",
        "replaces": "AviationStack (paid) – OpenSky Network is completely free",
        "regions_monitored": ["north_atlantic", "europe", "asia_pacific", "middle_east"],
    }
