"""News routes"""
from fastapi import APIRouter, Query
from app.services.news_service import get_logistics_news, get_supplier_news

router = APIRouter()


@router.get("/logistics")
async def logistics_news(page_size: int = Query(20, le=50)):
    return await get_logistics_news(page_size)


@router.get("/supplier/{supplier_name}")
async def supplier_news(supplier_name: str):
    return await get_supplier_news(supplier_name)
