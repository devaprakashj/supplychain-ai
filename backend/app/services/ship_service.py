"""
Ship tracking service – AISStream WebSocket feed (free, key required).

AISStream: https://aisstream.io
- Free tier: unlimited vessels via WebSocket
- Requires a free API key (register at aisstream.io)
- Streams NMEA AIS messages as JSON over WebSocket

Usage: Connect to wss://stream.aisstream.io/v0/stream with a subscription message.
We use a short-lived connection to grab a snapshot of vessels in a bounding box.
"""
import asyncio
import json
import logging
from typing import Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

# Major shipping lanes bounding boxes [min_lon, min_lat, max_lon, max_lat]
DEFAULT_BOUNDING_BOXES = [
    # English Channel / North Sea
    [[49.0, -5.0], [52.0, 10.0]],
    # Strait of Malacca / Singapore
    [[1.0, 100.0], [6.0, 106.0]],
    # Red Sea / Suez approach
    [[11.0, 32.0], [22.0, 44.0]],
    # Gulf of Aden
    [[10.0, 43.0], [16.0, 55.0]],
]

AISSTREAM_WS_URL = "wss://stream.aisstream.io/v0/stream"


async def get_live_ships_snapshot(
    bounding_boxes: list | None = None,
    snapshot_duration_seconds: float = 5.0,
    max_vessels: int = 100,
) -> dict:
    """
    Connect to AISStream WebSocket for a short snapshot of live vessel positions.
    Returns vessel data or a 'not configured' response if no key is set.
    """
    if not settings.AISSTREAM_API_KEY:
        return {
            "configured": False,
            "message": (
                "Live AIS ship tracking is powered by AISStream.io (free). "
                "Register for a free API key at https://aisstream.io and add "
                "AISSTREAM_API_KEY to your backend/.env file."
            ),
            "config_url": "/settings",
            "ships": [],
            "provider": "AISStream",
            "provider_url": "https://aisstream.io",
            "why_free": "AISStream provides a free WebSocket AIS feed covering thousands of vessels worldwide.",
        }

    boxes = bounding_boxes or DEFAULT_BOUNDING_BOXES
    subscribe_msg = {
        "APIKey": settings.AISSTREAM_API_KEY,
        "BoundingBoxes": boxes,
        "FilterMessageTypes": ["PositionReport", "ShipStaticData"],
    }

    vessels: dict[str, dict] = {}

    try:
        import websockets  # optional dep – install with: pip install websockets
    except ImportError:
        return {
            "configured": True,
            "error": "The 'websockets' Python package is required for AISStream. Run: pip install websockets",
            "ships": [],
        }

    try:
        async with asyncio.timeout(snapshot_duration_seconds + 3):
            async with __import__("websockets").connect(AISSTREAM_WS_URL) as ws:
                await ws.send(json.dumps(subscribe_msg))
                deadline = asyncio.get_event_loop().time() + snapshot_duration_seconds
                while asyncio.get_event_loop().time() < deadline and len(vessels) < max_vessels:
                    try:
                        raw = await asyncio.wait_for(ws.recv(), timeout=1.0)
                        msg = json.loads(raw)
                        _process_ais_message(msg, vessels)
                    except asyncio.TimeoutError:
                        continue
    except asyncio.TimeoutError:
        pass  # Normal – snapshot window elapsed
    except Exception as e:
        logger.warning(f"AISStream connection error: {e}")
        return {
            "configured": True,
            "error": f"AISStream connection failed: {str(e)}",
            "ships": [],
        }

    ship_list = list(vessels.values())
    return {
        "configured": True,
        "ships": ship_list,
        "count": len(ship_list),
        "source": "AISStream",
        "source_url": "https://aisstream.io",
        "snapshot_seconds": snapshot_duration_seconds,
        "bounding_boxes": boxes,
    }


def _process_ais_message(msg: dict, vessels: dict) -> None:
    """Parse an AISStream message and update the vessel registry."""
    msg_type = msg.get("MessageType")
    meta = msg.get("MetaData", {})
    mmsi = str(meta.get("MMSI", ""))
    if not mmsi:
        return

    if msg_type == "PositionReport":
        pr = msg.get("Message", {}).get("PositionReport", {})
        vessels.setdefault(mmsi, {"mmsi": mmsi})
        vessels[mmsi].update({
            "latitude":  meta.get("latitude",  pr.get("Latitude")),
            "longitude": meta.get("longitude", pr.get("Longitude")),
            "sog":       pr.get("Sog"),            # Speed over ground (knots)
            "cog":       pr.get("Cog"),            # Course over ground (degrees)
            "heading":   pr.get("TrueHeading"),
            "nav_status": pr.get("NavigationalStatus"),
            "timestamp": meta.get("time_utc"),
        })
    elif msg_type == "ShipStaticData":
        sd = msg.get("Message", {}).get("ShipStaticData", {})
        vessels.setdefault(mmsi, {"mmsi": mmsi})
        vessels[mmsi].update({
            "name":        sd.get("Name", "").strip() or meta.get("ShipName", ""),
            "ship_type":   sd.get("Type"),
            "callsign":    sd.get("CallSign", "").strip(),
            "destination": sd.get("Destination", "").strip(),
            "draught":     sd.get("Draught"),
            "dim_a":       sd.get("DimensionToBow"),
            "dim_b":       sd.get("DimensionToStern"),
        })
