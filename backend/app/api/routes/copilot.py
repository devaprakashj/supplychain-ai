"""AI Copilot route"""
import asyncio
from fastapi import APIRouter
from pydantic import BaseModel
from app.services.ai_service import chat_with_copilot
from app.services.disaster_service import get_all_live_disasters
from app.services.exchange_service import get_exchange_rates
from app.services.news_service import get_logistics_news
from app.services.risk_service import compute_global_risk_score
from datetime import datetime, timezone

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None


@router.post("/chat")
async def copilot_chat(req: ChatRequest):
    """Chat with the AI copilot. Live data is fetched and injected as context."""
    # Fetch live context concurrently
    disasters, exchange_rates, news, risk = await asyncio.gather(
        get_all_live_disasters(),
        get_exchange_rates(),
        get_logistics_news(page_size=10),
        compute_global_risk_score(),
    )
    live_context = {
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "risk": risk,
        "disasters": disasters,
        "exchange_rates": exchange_rates,
        "news": news,
    }
    return await chat_with_copilot(req.message, live_context)
