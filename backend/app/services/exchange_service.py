"""Exchange rate service – Open Exchange Rates API (free, no key needed for base endpoint)"""
import httpx
from app.core.config import settings


async def get_exchange_rates(base: str = "USD") -> dict:
    """Fetch live exchange rates. Uses open.er-api.com free tier (no key)."""
    url = f"{settings.EXCHANGE_RATE_BASE_URL}/{base}"
    async with httpx.AsyncClient(timeout=10) as client:
        try:
            r = await client.get(url)
            r.raise_for_status()
            data = r.json()
            # Key currencies for supply chain / trade finance
            key_currencies = ["EUR", "GBP", "JPY", "CNY", "INR", "AUD", "CAD", "SGD",
                               "HKD", "KRW", "BRL", "MXN", "AED", "SAR", "NOK", "SEK"]
            filtered = {k: v for k, v in data["rates"].items() if k in key_currencies}
            return {
                "base": base,
                "rates": filtered,
                "all_rates": data["rates"],
                "time_last_update_utc": data.get("time_last_update_utc"),
                "time_next_update_utc": data.get("time_next_update_utc"),
                "source": "Open Exchange Rates (open.er-api.com)",
                "source_url": "https://open.er-api.com",
            }
        except httpx.HTTPError as e:
            return {"error": str(e), "base": base, "source": "open.er-api.com"}


async def get_trade_impact(base: str = "USD") -> dict:
    """Get exchange rates and compute basic import/export cost impact."""
    rates = await get_exchange_rates(base)
    if "error" in rates:
        return rates

    # Simple impact: if USD strengthened vs key trading partners
    impacts = []
    reference = {
        "EUR": 0.92, "GBP": 0.79, "CNY": 7.25, "JPY": 149.0, "INR": 83.0,
    }
    for currency, ref_rate in reference.items():
        current = rates["all_rates"].get(currency)
        if current is None:
            continue
        change_pct = ((current - ref_rate) / ref_rate) * 100
        impacts.append({
            "currency": currency,
            "current_rate": current,
            "reference_rate": ref_rate,
            "change_pct": round(change_pct, 2),
            "import_impact": "More expensive" if change_pct > 0 else "Cheaper",
            "export_impact": "Less competitive" if change_pct > 0 else "More competitive",
        })

    rates["trade_impact"] = impacts
    return rates
