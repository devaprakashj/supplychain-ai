"""
SupplyChain AI – FastAPI Backend
Main application entry point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.api.routes import weather, news, commodities, exchange, disasters, risk, ships, flights, copilot, reports, ports, health

app = FastAPI(
    title="SupplyChain AI API",
    description="Enterprise Supply Chain Intelligence Platform – Backend API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS – allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(health.router,      prefix="/api", tags=["Health"])
app.include_router(weather.router,     prefix="/api/weather",     tags=["Weather"])
app.include_router(news.router,        prefix="/api/news",        tags=["News"])
app.include_router(commodities.router, prefix="/api/commodities", tags=["Commodities"])
app.include_router(exchange.router,    prefix="/api/exchange",    tags=["Exchange Rates"])
app.include_router(disasters.router,   prefix="/api/disasters",   tags=["Disasters"])
app.include_router(risk.router,        prefix="/api/risk",        tags=["Risk Score"])
app.include_router(ships.router,       prefix="/api/ships",       tags=["Ships"])
app.include_router(flights.router,     prefix="/api/flights",     tags=["Flights"])
app.include_router(copilot.router,     prefix="/api/copilot",     tags=["AI Copilot"])
app.include_router(reports.router,     prefix="/api/reports",     tags=["Reports"])
app.include_router(ports.router,       prefix="/api/ports",       tags=["Ports"])


@app.get("/", include_in_schema=False)
async def root():
    return JSONResponse({"message": "SupplyChain AI API", "version": "1.0.0", "docs": "/api/docs"})
