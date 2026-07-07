"""
Ships / AIS route – powered by AISStream (free WebSocket AIS provider).

AISStream: https://aisstream.io
- Free tier, register for an API key
- Real-time WebSocket AIS feed covering thousands of vessels
- No billing required
"""
from fastapi import APIRouter, Query
from app.services.ship_service import get_live_ships_snapshot

router = APIRouter()


@router.get("/live")
async def live_ships(
    duration: float = Query(default=5.0, ge=1.0, le=30.0, description="Snapshot duration in seconds"),
    max_vessels: int = Query(default=100, ge=1, le=500),
):
    """
    Stream a short AISStream WebSocket snapshot and return live vessel positions.
    Requires AISSTREAM_API_KEY in .env (free at aisstream.io).
    """
    return await get_live_ships_snapshot(
        snapshot_duration_seconds=duration,
        max_vessels=max_vessels,
    )


@router.get("/info")
async def provider_info():
    """Return information about the AIS data provider."""
    return {
        "provider": "AISStream",
        "provider_url": "https://aisstream.io",
        "cost": "Free",
        "protocol": "WebSocket",
        "description": (
            "AISStream provides a free real-time WebSocket AIS feed. "
            "It aggregates AIS data from a global network of receivers, "
            "covering commercial vessels, cargo ships, tankers, and more."
        ),
        "key_required": True,
        "get_key_url": "https://aisstream.io",
        "replaces": "MarineTraffic (paid) – AISStream is a completely free alternative",
    }
