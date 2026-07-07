"""AI Copilot service – OpenAI (key required) with live data context injection"""
import json
import httpx
from app.core.config import settings


async def chat_with_copilot(user_message: str, live_context: dict) -> dict:
    """Send a message to the AI copilot with live data context."""
    if not settings.OPENAI_API_KEY:
        return {
            "configured": False,
            "message": "OpenAI API key not configured. Add OPENAI_API_KEY to your .env to enable the AI Copilot.",
            "config_url": "/settings",
        }

    # Build system prompt with injected live data
    system_prompt = f"""You are SupplyChain AI Copilot, an enterprise supply chain intelligence assistant.

You ONLY answer based on the live data provided below. If the data is insufficient to answer a question,
respond with: "Insufficient live data to generate a reliable analysis for this query."

Never invent data, statistics, or predictions not supported by the live data.

LIVE DATA CONTEXT (fetched at {live_context.get('fetched_at', 'now')}):

GLOBAL RISK SCORE:
{json.dumps(live_context.get('risk', {}), indent=2)[:2000]}

ACTIVE DISASTERS (USGS + NASA EONET):
{json.dumps(live_context.get('disasters', {}), indent=2)[:2000]}

EXCHANGE RATES:
{json.dumps(live_context.get('exchange_rates', {}), indent=2)[:1000]}

NEWS (if available):
{json.dumps(live_context.get('news', {}), indent=2)[:1500]}

Answer concisely. Cite which data source supports your answer.
"""

    headers = {
        "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
        "max_tokens": 800,
        "temperature": 0.3,
    }

    async with httpx.AsyncClient(timeout=30) as client:
        try:
            r = await client.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
            r.raise_for_status()
            data = r.json()
            answer = data["choices"][0]["message"]["content"]
            return {
                "configured": True,
                "answer": answer,
                "model": data["model"],
                "usage": data.get("usage", {}),
                "data_sources_used": list(live_context.keys()),
            }
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 401:
                return {"configured": True, "error": "Invalid OpenAI API key. Please check your configuration."}
            if e.response.status_code == 429:
                return {"configured": True, "error": "OpenAI rate limit reached. Please try again in a moment."}
            return {"configured": True, "error": f"OpenAI error: {e.response.status_code}"}
        except httpx.HTTPError as e:
            return {"configured": True, "error": f"Connection error: {str(e)}"}
