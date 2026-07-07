"""
Risk score engine – computes a live supply chain risk score
from USGS earthquakes, NASA EONET events, weather data, and news.
ZERO fake data. All factors derived from real API responses.
"""
import asyncio
from app.services.disaster_service import get_all_live_disasters
from app.services.weather_service import get_weather_for_city
from app.services.news_service import get_logistics_news


# Major trade hub cities used for weather risk assessment
TRADE_HUB_CITIES = [
    "Shanghai", "Rotterdam", "Singapore", "Los Angeles", "Hamburg",
    "Dubai", "Hong Kong", "New York", "Tokyo", "Mumbai",
]


async def compute_global_risk_score() -> dict:
    """
    Compute a 0-100 global supply chain risk score from live data.
    Returns score, breakdown by category, and full explanation.
    """
    disasters_data, news_data = await asyncio.gather(
        get_all_live_disasters(),
        get_logistics_news(page_size=10),
    )

    factors = []
    total_weight = 0.0
    weighted_score = 0.0

    # ── Factor 1: Earthquake severity (USGS) ─────────────────────────────────
    eq_data = disasters_data.get("earthquakes", {})
    if "error" not in eq_data:
        eq_events = eq_data.get("events", [])
        severe_eq = [e for e in eq_events if e.get("magnitude", 0) >= 6.0]
        major_eq  = [e for e in eq_events if 5.0 <= e.get("magnitude", 0) < 6.0]
        eq_score = min(100, len(severe_eq) * 15 + len(major_eq) * 5)
        factors.append({
            "factor": "Seismic Activity",
            "score": eq_score,
            "weight": 0.25,
            "detail": f"{len(severe_eq)} severe (M6+) and {len(major_eq)} major (M5+) earthquakes in past 7 days",
            "source": "USGS Earthquake Hazards Program",
            "data_available": True,
        })
        weighted_score += eq_score * 0.25
        total_weight += 0.25
    else:
        factors.append({
            "factor": "Seismic Activity",
            "score": None,
            "weight": 0.25,
            "detail": f"Data unavailable: {eq_data.get('error', 'Unknown error')}",
            "source": "USGS",
            "data_available": False,
        })

    # ── Factor 2: Natural events severity (NASA EONET) ───────────────────────
    eonet_data = disasters_data.get("natural_events", {})
    if "error" not in eonet_data:
        eonet_events = eonet_data.get("events", [])
        # Category weights
        high_risk_cats = {"Severe Storms", "Tropical Cyclones", "Wildfires", "Floods", "Volcanoes"}
        high_risk_count = sum(
            1 for e in eonet_events
            if any(c in high_risk_cats for c in e.get("categories", []))
        )
        eonet_score = min(100, high_risk_count * 8)
        factors.append({
            "factor": "Active Natural Disasters",
            "score": eonet_score,
            "weight": 0.30,
            "detail": f"{high_risk_count} high-risk events active (storms, cyclones, wildfires, floods)",
            "source": "NASA EONET",
            "data_available": True,
        })
        weighted_score += eonet_score * 0.30
        total_weight += 0.30
    else:
        factors.append({
            "factor": "Active Natural Disasters",
            "score": None,
            "weight": 0.30,
            "detail": f"Data unavailable: {eonet_data.get('error', 'Unknown error')}",
            "source": "NASA EONET",
            "data_available": False,
        })

    # ── Factor 3: News disruption signals ────────────────────────────────────
    if news_data.get("configured") and "error" not in news_data:
        articles = news_data.get("articles", [])
        disruption_keywords = ["disruption", "delay", "strike", "congestion", "shortage", "crisis", "blocked"]
        disruption_count = sum(
            1 for a in articles
            if any(kw in (a.get("title", "") + a.get("description", "")).lower() for kw in disruption_keywords)
        )
        news_score = min(100, disruption_count * 12)
        factors.append({
            "factor": "News Disruption Signals",
            "score": news_score,
            "weight": 0.25,
            "detail": f"{disruption_count} disruption-related articles in latest logistics news",
            "source": "NewsAPI",
            "data_available": True,
        })
        weighted_score += news_score * 0.25
        total_weight += 0.25
    else:
        factors.append({
            "factor": "News Disruption Signals",
            "score": None,
            "weight": 0.25,
            "detail": "NewsAPI not configured. Add NEWS_API_KEY to enable.",
            "source": "NewsAPI",
            "data_available": False,
            "config_required": True,
        })

    # ── Factor 4: Weather extremes at trade hubs (Open-Meteo free) ───────────
    weather_tasks = [get_weather_for_city(city) for city in TRADE_HUB_CITIES[:5]]
    weather_results = await asyncio.gather(*weather_tasks, return_exceptions=True)
    severe_weather_count = 0
    weather_details = []
    for city, result in zip(TRADE_HUB_CITIES[:5], weather_results):
        if isinstance(result, Exception) or "error" in result:
            continue
        code = result.get("weather_code", 0)
        wind = result.get("wind_speed_ms", 0)
        precip = result.get("precipitation_mm", 0)
        is_severe = code in {95, 96, 99} or wind > 15 or precip > 10
        if is_severe:
            severe_weather_count += 1
            weather_details.append(f"{result['city']}: {result['description']}")
    weather_score = min(100, severe_weather_count * 20)
    factors.append({
        "factor": "Weather at Trade Hubs",
        "score": weather_score,
        "weight": 0.20,
        "detail": f"{severe_weather_count} major trade hubs experiencing severe weather"
                  + (f": {', '.join(weather_details)}" if weather_details else ""),
        "source": "Open-Meteo",
        "data_available": True,
    })
    weighted_score += weather_score * 0.20
    total_weight += 0.20

    # ── Final score ───────────────────────────────────────────────────────────
    if total_weight > 0:
        final_score = round(weighted_score / total_weight)
    else:
        final_score = None

    risk_level = _score_to_level(final_score)

    return {
        "global_risk_score": final_score,
        "risk_level": risk_level,
        "factors": factors,
        "data_coverage_pct": round((total_weight / 1.0) * 100),
        "explanation": _build_explanation(final_score, factors, risk_level),
        "sources": ["USGS", "NASA EONET", "Open-Meteo"],
        "computed_at": _now_iso(),
    }


def _score_to_level(score: int | None) -> str:
    if score is None:
        return "Unknown"
    if score >= 75:
        return "Critical"
    if score >= 50:
        return "High"
    if score >= 25:
        return "Moderate"
    return "Low"


def _build_explanation(score, factors, level) -> str:
    available = [f for f in factors if f["data_available"]]
    missing = [f for f in factors if not f["data_available"]]
    lines = [f"Global Risk Level: {level} (Score: {score}/100)" if score is not None else "Score could not be computed."]
    lines.append(f"Based on {len(available)} live data source(s).")
    for f in available:
        lines.append(f"• {f['factor']} [{f['score']}/100]: {f['detail']}")
    if missing:
        lines.append(f"Missing data from: {', '.join(f['factor'] for f in missing)}")
    return " ".join(lines)


def _now_iso() -> str:
    from datetime import datetime, timezone
    return datetime.now(timezone.utc).isoformat()
