"""
Application configuration – reads from environment variables.
All API keys are optional; missing keys are surfaced to the frontend
so the user can configure them via the Settings page.
"""
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # ── App ───────────────────────────────────────────────────────────────────
    APP_NAME: str = "SupplyChain AI"
    APP_ENV: str = "development"
    SECRET_KEY: str = "change-me-in-production-use-a-secure-random-string"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # ── Database ──────────────────────────────────────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/supplychain"

    # ── CORS ──────────────────────────────────────────────────────────────────
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    # ── External APIs (all optional – None = not configured) ─────────────────
    OPENWEATHER_API_KEY: str | None = None      # https://openweathermap.org/api
    NEWS_API_KEY: str | None = None             # https://newsapi.org/
    OPENAI_API_KEY: str | None = None           # https://platform.openai.com/
    AISSTREAM_API_KEY: str | None = None        # https://aisstream.io/ (free WebSocket AIS)
    ALPHA_VANTAGE_API_KEY: str | None = None    # https://www.alphavantage.co/ (commodities)
    EXCHANGE_RATE_API_KEY: str | None = None    # https://exchangeratesapi.io/ (optional)

    # ── Free APIs (no key needed) ─────────────────────────────────────────────
    USGS_BASE_URL: str = "https://earthquake.usgs.gov/earthquakes/feed/v1.0"
    NASA_EONET_BASE_URL: str = "https://eonet.gsfc.nasa.gov/api/v3"
    EXCHANGE_RATE_BASE_URL: str = "https://open.er-api.com/v6/latest"
    OPEN_METEO_BASE_URL: str = "https://api.open-meteo.com/v1"
    # OpenSky Network – completely free, no key required
    OPENSKY_BASE_URL: str = "https://opensky-network.org/api"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()


def get_configured_apis() -> dict:
    """Return which APIs are configured vs not."""
    return {
        "openweather": settings.OPENWEATHER_API_KEY is not None,
        "newsapi": settings.NEWS_API_KEY is not None,
        "openai": settings.OPENAI_API_KEY is not None,
        "aisstream": settings.AISSTREAM_API_KEY is not None,
        "alpha_vantage": settings.ALPHA_VANTAGE_API_KEY is not None,
        # Free APIs – always available
        "usgs": True,
        "nasa_eonet": True,
        "exchange_rates": True,
        "open_meteo": True,
        "opensky": True,       # OpenSky Network is always free, no key
    }
