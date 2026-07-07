"""Health check and API configuration status route"""
from fastapi import APIRouter
from app.core.config import get_configured_apis, settings

router = APIRouter()


@router.get("/health")
async def health_check():
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "version": "1.0.0",
        "environment": settings.APP_ENV,
    }


@router.get("/api-status")
async def api_status():
    """Return which external APIs are configured."""
    return {
        "configured_apis": get_configured_apis(),
        "message": "APIs marked as false require an API key to be set in environment variables.",
        "settings_url": "/settings",
    }
