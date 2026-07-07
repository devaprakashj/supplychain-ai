"""News service – NewsAPI (keyed) with fallback messaging"""
import httpx
from app.core.config import settings

NEWSAPI_BASE = "https://newsapi.org/v2"
LOGISTICS_QUERIES = [
    "supply chain disruption", "shipping delay", "port congestion",
    "logistics freight", "cargo shortage", "trade war tariff",
]


async def get_logistics_news(page_size: int = 20) -> dict:
    """Fetch logistics-related news from NewsAPI if key is configured."""
    if not settings.NEWS_API_KEY:
        return {
            "configured": False,
            "message": "NewsAPI key not configured. Add NEWS_API_KEY to your .env to enable live news.",
            "config_url": "/settings",
            "articles": [],
        }

    query = " OR ".join(f'"{q}"' for q in LOGISTICS_QUERIES[:3])
    async with httpx.AsyncClient(timeout=15) as client:
        try:
            r = await client.get(
                f"{NEWSAPI_BASE}/everything",
                params={
                    "q": query,
                    "language": "en",
                    "sortBy": "publishedAt",
                    "pageSize": page_size,
                    "apiKey": settings.NEWS_API_KEY,
                },
            )
            r.raise_for_status()
            data = r.json()
            articles = []
            for a in data.get("articles", []):
                articles.append({
                    "title": a["title"],
                    "description": a.get("description"),
                    "url": a["url"],
                    "source": a["source"]["name"],
                    "published_at": a["publishedAt"],
                    "image_url": a.get("urlToImage"),
                })
            return {
                "configured": True,
                "total": data.get("totalResults", 0),
                "articles": articles,
                "source": "NewsAPI",
                "source_url": "https://newsapi.org",
            }
        except httpx.HTTPError as e:
            return {"configured": True, "error": str(e), "articles": [], "source": "NewsAPI"}


async def get_supplier_news(supplier_name: str) -> dict:
    """Fetch news about a specific supplier/company."""
    if not settings.NEWS_API_KEY:
        return {
            "configured": False,
            "message": "NewsAPI key not configured.",
            "articles": [],
        }
    async with httpx.AsyncClient(timeout=15) as client:
        try:
            r = await client.get(
                f"{NEWSAPI_BASE}/everything",
                params={
                    "q": f'"{supplier_name}" supply OR logistics OR shipping',
                    "language": "en",
                    "sortBy": "publishedAt",
                    "pageSize": 5,
                    "apiKey": settings.NEWS_API_KEY,
                },
            )
            r.raise_for_status()
            data = r.json()
            return {
                "configured": True,
                "supplier": supplier_name,
                "articles": data.get("articles", [])[:5],
                "source": "NewsAPI",
            }
        except httpx.HTTPError as e:
            return {"configured": True, "error": str(e), "articles": []}
