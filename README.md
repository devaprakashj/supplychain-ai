# SupplyChain AI – Enterprise Supply Chain Intelligence Platform

A world-class AI-powered Supply Chain Intelligence Platform built with **Next.js 14**, **FastAPI**, and **PostgreSQL**.

## 🌐 Live APIs Used

| API | Purpose | Key Required |
|-----|---------|--------------|
| USGS Earthquake API | Real-time seismic events | ❌ Free |
| NASA EONET | Natural disaster events (wildfires, cyclones, floods) | ❌ Free |
| Open-Meteo | Weather at trade hubs & ports | ❌ Free |
| Open Exchange Rates | Live currency rates | ❌ Free |
| OpenStreetMap | Interactive maps | ❌ Free |
| OpenWeatherMap | Enhanced weather data | ✅ Optional |
| NewsAPI | Logistics news & sentiment | ✅ Optional |
| OpenAI GPT-4o | AI Copilot & analysis | ✅ Optional |
| MarineTraffic | Live AIS ship tracking | ✅ Optional |
| AviationStack | Cargo flight data | ✅ Optional |
| Alpha Vantage | Commodity prices | ✅ Optional |

## 🚀 Quick Start

### Frontend Only (no backend required for basic demo)

```bash
cd frontend
npm install
npm run dev
# Open http://localhost:3000
```

### Full Stack with Backend

```bash
# 1. Set up backend
cd backend
cp .env.example .env
# Edit .env to add your API keys

# 2. Install Python dependencies
pip install -r requirements.txt

# 3. Start backend
uvicorn app.main:app --reload --port 8000

# 4. Start frontend (in new terminal)
cd frontend
npm run dev
```

### Docker (Full Stack)

```bash
cp backend/.env.example backend/.env
# Edit backend/.env to add your API keys
docker-compose up --build
```

## 📄 Pages

| Page | URL | Live Data |
|------|-----|-----------|
| Dashboard | `/` | USGS, EONET, Open-Meteo, Exchange Rates |
| Live Shipments | `/shipments` | Open-Meteo weather; AIS if key configured |
| AI Predictions | `/predictions` | USGS, EONET, Open-Meteo |
| Supplier Intel | `/suppliers` | USGS, Exchange Rates, NewsAPI |
| Route Optimizer | `/routes` | Open-Meteo, OpenStreetMap |
| Inventory | `/inventory` | EONET, Exchange Rates, Commodity prices |
| Port Analytics | `/ports` | Open-Meteo weather for 12 ports |
| Global Risk Map | `/risk-map` | USGS earthquakes, NASA EONET |
| Reports | `/reports` | All sources, downloadable JSON |
| AI Copilot | `/copilot` | All sources + OpenAI |
| Settings | `/settings` | API key configuration |

## 🔑 API Keys Configuration

Configure API keys via the **Settings** page at `/settings`.

Add them to `backend/.env`:

```env
OPENWEATHER_API_KEY=your_key
NEWS_API_KEY=your_key
OPENAI_API_KEY=sk-your_key
MARINE_TRAFFIC_API_KEY=your_key
AVIATION_STACK_API_KEY=your_key
ALPHA_VANTAGE_API_KEY=your_key
```

## 🛡️ Data Integrity

This platform enforces a **zero fake data policy**:
- Every metric is sourced from a verified live API
- Missing data shows "No live data available" — never fabricated values
- AI answers are grounded in fetched live data — never hallucinated

## 🏗️ Architecture

```
supplychain-ai/
├── frontend/          # Next.js 14 + TypeScript + Tailwind
│   ├── app/           # 11 pages (App Router)
│   ├── components/    # 25+ reusable components
│   ├── lib/api/       # Typed API client
│   └── hooks/         # useFetch hook with auto-refresh
└── backend/           # FastAPI + Python
    └── app/
        ├── api/routes/    # 11 route modules
        ├── services/      # Business logic + API clients
        └── core/          # Config, auth, database
```
