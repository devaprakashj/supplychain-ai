"""Reports route – generates data reports from live API data"""
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import asyncio, io
from app.services.disaster_service import get_all_live_disasters
from app.services.exchange_service import get_exchange_rates
from app.services.weather_service import get_weather_for_city
from app.services.risk_service import compute_global_risk_score
from datetime import datetime, timezone

router = APIRouter()

REPORT_CITIES = ["Shanghai", "Rotterdam", "Singapore", "Los Angeles", "Hamburg"]


@router.get("/data")
async def report_data():
    """Fetch all report data from live APIs."""
    risk, disasters, exchange, weather_results = await asyncio.gather(
        compute_global_risk_score(),
        get_all_live_disasters(),
        get_exchange_rates(),
        asyncio.gather(*[get_weather_for_city(c) for c in REPORT_CITIES]),
    )
    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "risk_score": risk,
        "disasters": disasters,
        "exchange_rates": exchange,
        "trade_hub_weather": list(weather_results),
        "data_integrity": "All data sourced from live public APIs. No fabricated values.",
    }


@router.get("/download/json")
async def download_report_json():
    """Download a JSON report of live supply chain data."""
    data = await report_data()
    import json
    content = json.dumps(data, indent=2, default=str)
    return StreamingResponse(
        io.BytesIO(content.encode()),
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=supplychain_report.json"},
    )
