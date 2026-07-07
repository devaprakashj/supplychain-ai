"""Risk score route"""
from fastapi import APIRouter
from app.services.risk_service import compute_global_risk_score

router = APIRouter()


@router.get("/score")
async def global_risk_score():
    """Compute and return a live global supply chain risk score."""
    return await compute_global_risk_score()
