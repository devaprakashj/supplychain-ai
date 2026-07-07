"""Disaster service – USGS Earthquakes (free) + NASA EONET (free)"""
import httpx
from app.core.config import settings


async def get_live_earthquakes(min_magnitude: float = 4.5, period: str = "week") -> dict:
    """Fetch real earthquake data from USGS. No API key needed."""
    url = f"{settings.USGS_BASE_URL}/summary/{_mag_label(min_magnitude)}_{period}.geojson"
    async with httpx.AsyncClient(timeout=15) as client:
        try:
            r = await client.get(url)
            r.raise_for_status()
            data = r.json()
            features = data.get("features", [])
            events = []
            for f in features[:50]:  # cap at 50
                props = f["properties"]
                coords = f["geometry"]["coordinates"]
                events.append({
                    "id": f["id"],
                    "magnitude": props["mag"],
                    "place": props["place"],
                    "time": props["time"],
                    "longitude": coords[0],
                    "latitude": coords[1],
                    "depth_km": coords[2],
                    "url": props["url"],
                    "alert": props.get("alert"),
                    "status": props.get("status"),
                })
            return {
                "count": len(events),
                "events": events,
                "source": "USGS Earthquake Hazards Program",
                "source_url": "https://earthquake.usgs.gov",
                "period": period,
                "min_magnitude": min_magnitude,
            }
        except httpx.HTTPError as e:
            return {"error": str(e), "source": "USGS"}


async def get_nasa_eonet_events(category: str | None = None, limit: int = 30) -> dict:
    """Fetch natural disaster events from NASA EONET. No API key needed."""
    url = f"{settings.NASA_EONET_BASE_URL}/events"
    params: dict = {"limit": limit, "status": "open"}
    if category:
        params["category"] = category
    async with httpx.AsyncClient(timeout=15) as client:
        try:
            r = await client.get(url, params=params)
            r.raise_for_status()
            data = r.json()
            events = []
            for ev in data.get("events", []):
                geometry = ev.get("geometry", [])
                latest_geo = geometry[-1] if geometry else None
                events.append({
                    "id": ev["id"],
                    "title": ev["title"],
                    "description": ev.get("description", ""),
                    "categories": [c["title"] for c in ev.get("categories", [])],
                    "sources": [s["url"] for s in ev.get("sources", [])],
                    "date": latest_geo["date"] if latest_geo else None,
                    "coordinates": latest_geo["coordinates"] if latest_geo else None,
                    "geometry_type": latest_geo["type"] if latest_geo else None,
                })
            return {
                "count": len(events),
                "events": events,
                "source": "NASA Earth Observatory Natural Event Tracker (EONET)",
                "source_url": "https://eonet.gsfc.nasa.gov",
            }
        except httpx.HTTPError as e:
            return {"error": str(e), "source": "NASA EONET"}


async def get_all_live_disasters() -> dict:
    """Aggregate disasters from all free sources."""
    earthquakes_task = get_live_earthquakes(min_magnitude=4.5, period="week")
    eonet_task = get_nasa_eonet_events(limit=40)

    import asyncio
    earthquakes, eonet = await asyncio.gather(earthquakes_task, eonet_task)
    return {
        "earthquakes": earthquakes,
        "natural_events": eonet,
        "sources": ["USGS", "NASA EONET"],
    }


def _mag_label(mag: float) -> str:
    if mag >= 4.5:
        return "4.5"
    if mag >= 2.5:
        return "2.5"
    return "all"
