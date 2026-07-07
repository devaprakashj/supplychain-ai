"""Exchange rate routes"""
from fastapi import APIRouter, Query
from app.services.exchange_service import get_exchange_rates, get_trade_impact

router = APIRouter()


@router.get("/rates")
async def exchange_rates(base: str = Query("USD", description="Base currency")):
    return await get_exchange_rates(base)


@router.get("/trade-impact")
async def trade_impact(base: str = Query("USD")):
    return await get_trade_impact(base)
