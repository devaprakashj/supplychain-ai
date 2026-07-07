"""
Flight tracking service – OpenSky Network (100% free, no API key required).

OpenSky Network: https://opensky-network.org
- Completely free REST API
- Live aircraft state vectors (position, altitude, velocity, callsign)
- No payment, no signup required for anonymous access
- Rate limit: 400 requests/day anonymous; 4000/day with (free) account
- Returns live data from a global network of ADS-B receivers

Endpoints used:
  GET /states/all       – All current aircraft (or filtered by area)
  GET /states/all?...   – Aircraft in a bounding box
"""
import httpx
from app.core.config import settings

OPENSKY_BASE = settings.OPENSKY_BASE_URL


# Bounding boxes for major cargo flight corridors
CARGO_REGIONS = {
    "north_atlantic": {"lamin": 40.0, "lomin": -75.0, "lamax": 65.0, "lomax": -10.0},
    "europe":         {"lamin": 35.0, "lomin": -10.0, "lamax": 70.0, "lomax": 40.0},
    "asia_pacific":   {"lamin": -10.0, "lomin": 100.0, "lamax": 50.0, "lomax": 145.0},
    "middle_east":    {"lamin": 10.0,  "lomin": 30.0,  "lamax": 40.0, "lomax": 70.0},
}

# OpenSky state vector field indices
_FIELDS = [
    "icao24", "callsign", "origin_country", "time_position",
    "last_contact", "longitude", "latitude", "baro_altitude",
    "on_ground", "velocity", "true_track", "vertical_rate",
    "sensors", "geo_altitude", "squawk", "spi", "position_source",
]


def _parse_state(state: list) -> dict:
    """Convert OpenSky state array to a labelled dict."""
    d = {}
    for i, field in enumerate(_FIELDS):
        d[field] = state[i] if i < len(state) else None
    return d


async def get_live_flights(
    region: str = "north_atlantic",
    limit: int = 50,
    only_airborne: bool = True,
) -> dict:
    """
    Fetch live aircraft state vectors from OpenSky Network (free, no key needed).
    Optionally filter to a geographic bounding box.
    """
    bbox = CARGO_REGIONS.get(region, CARGO_REGIONS["north_atlantic"])
    params = {k: v for k, v in bbox.items()}

    async with httpx.AsyncClient(timeout=20) as client:
        try:
            r = await client.get(f"{OPENSKY_BASE}/states/all", params=params)
            r.raise_for_status()
            data = r.json()

            states = data.get("states") or []
            flights = []
            for state in states:
                parsed = _parse_state(state)
                if only_airborne and parsed.get("on_ground"):
                    continue
                # Only include aircraft with valid position
                if parsed.get("latitude") is None or parsed.get("longitude") is None:
                    continue
                flights.append({
                    "icao24":         parsed["icao24"],
                    "callsign":       (parsed["callsign"] or "").strip(),
                    "country":        parsed["origin_country"],
                    "latitude":       parsed["latitude"],
                    "longitude":      parsed["longitude"],
                    "altitude_m":     parsed["baro_altitude"],
                    "geo_altitude_m": parsed["geo_altitude"],
                    "velocity_ms":    parsed["velocity"],
                    "heading_deg":    parsed["true_track"],
                    "vertical_rate":  parsed["vertical_rate"],
                    "on_ground":      parsed["on_ground"],
                    "squawk":         parsed["squawk"],
                    "last_contact":   parsed["last_contact"],
                })
                if len(flights) >= limit:
                    break

            return {
                "configured": True,
                "flights": flights,
                "count": len(flights),
                "total_in_region": len(states),
                "region": region,
                "bounding_box": bbox,
                "time": data.get("time"),
                "source": "OpenSky Network",
                "source_url": "https://opensky-network.org",
                "note": "Free, no API key required. Anonymous access limited to 400 req/day.",
            }

        except httpx.HTTPStatusError as e:
            if e.response.status_code == 429:
                return {
                    "configured": True,
                    "error": "OpenSky rate limit reached (400 req/day anonymous). Try again later or create a free account.",
                    "flights": [],
                    "source": "OpenSky Network",
                }
            return {
                "configured": True,
                "error": f"OpenSky API error: {e.response.status_code}",
                "flights": [],
            }
        except httpx.HTTPError as e:
            return {
                "configured": True,
                "error": f"Connection error: {str(e)}",
                "flights": [],
                "source": "OpenSky Network",
            }


async def get_flights_all_regions(limit_per_region: int = 25) -> dict:
    """Fetch aircraft across all monitored cargo regions."""
    import asyncio
    tasks = {
        region: get_live_flights(region=region, limit=limit_per_region)
        for region in CARGO_REGIONS
    }
    results = await asyncio.gather(*tasks.values(), return_exceptions=True)
    combined: list = []
    region_summary = {}
    for region, result in zip(tasks.keys(), results):
        if isinstance(result, Exception):
            region_summary[region] = {"error": str(result), "count": 0}
            continue
        flights = result.get("flights", [])
        combined.extend(flights)
        region_summary[region] = {
            "count": result.get("count", 0),
            "total_in_region": result.get("total_in_region", 0),
        }

    return {
        "configured": True,
        "flights": combined,
        "count": len(combined),
        "regions": region_summary,
        "source": "OpenSky Network",
        "source_url": "https://opensky-network.org",
        "note": "Free, no API key required.",
    }
