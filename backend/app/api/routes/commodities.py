"""Commodities – uses Alpha Vantage if configured, otherwise returns not configured."""
from fastapi import APIRouter
from app.core.config import settings
import httpx

router = APIRouter()

COMMODITY_FUNCTIONS = {
    "OIL (WTI)": "WTI",
    "BRENT": "BRENT",
    "NATURAL_GAS": "NATURAL_GAS",
    "COPPER": "COPPER",
    "ALUMINUM": "ALUMINUM",
    "WHEAT": "WHEAT",
    "CORN": "CORN",
}


@router.get("/prices")
async def commodity_prices():
    if not settings.ALPHA_VANTAGE_API_KEY:
        return {
            "configured": False,
            "message": "Alpha Vantage API key not configured. Add ALPHA_VANTAGE_API_KEY to your .env to enable live commodity prices.",
            "config_url": "/settings",
            "commodities": [],
            "alternative": "Free commodity data can be fetched from commodity-price-api.com or financialmodelingprep.com with their free tiers.",
        }
    
    results = []
    # Alpha Vantage free tier limits to 25 requests/day. So let's only fetch a subset to avoid hitting rate limits instantly.
    subset = {"OIL (WTI)": "WTI", "COPPER": "COPPER", "WHEAT": "WHEAT"}
    
    async with httpx.AsyncClient(timeout=15) as client:
        for name, func in subset.items():
            try:
                r = await client.get(
                    "https://www.alphavantage.co/query",
                    params={
                        "function": func,
                        "interval": "monthly",
                        "apikey": settings.ALPHA_VANTAGE_API_KEY
                    },
                )
                r.raise_for_status()
                data = r.json()
                
                # Check for rate limit message
                if "Information" in data:
                    results.append({"name": name, "symbol": func, "error": data["Information"]})
                    continue

                if "data" in data and len(data["data"]) > 0:
                    latest = data["data"][0]
                    results.append({
                        "name": name,
                        "symbol": func,
                        "price_usd": latest.get("value"),
                        "unit": data.get("unit"),
                        "last_updated": latest.get("date"),
                        "source": "Alpha Vantage",
                    })
                else:
                    results.append({"name": name, "symbol": func, "error": "No data returned"})
            except Exception as e:
                results.append({"name": name, "symbol": func, "error": str(e)})
                
    return {"configured": True, "commodities": results, "source": "Alpha Vantage"}
