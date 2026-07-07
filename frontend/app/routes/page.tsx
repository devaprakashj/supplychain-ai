"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Route, Wind, Thermometer, DollarSign, Leaf, Clock, AlertTriangle, MapPin } from "lucide-react";
import { useFetch } from "@/hooks/useFetch";
import { api } from "@/lib/api/client";
import SectionHeader from "@/components/ui/SectionHeader";
import NoDataCard from "@/components/ui/NoDataCard";
import dynamic from "next/dynamic";

const RouteMap = dynamic(() => import("@/components/routes/RouteMapClient"), { ssr: false, loading: () => <div className="skeleton rounded-xl h-64 w-full" /> });

const MAJOR_PORTS_SIMPLE = [
  "Shanghai, China", "Rotterdam, Netherlands", "Singapore",
  "Los Angeles, USA", "Hamburg, Germany", "Dubai, UAE",
  "Hong Kong, China", "Busan, South Korea", "Antwerp, Belgium", "Mumbai, India",
];

const CARGO_TYPES = ["General Cargo", "Container", "Bulk Dry", "Liquid Bulk", "Refrigerated", "Hazardous"];

export default function RoutesPage() {
  const [origin, setOrigin] = useState("Shanghai, China");
  const [destination, setDestination] = useState("Rotterdam, Netherlands");
  const [cargoType, setCargoType] = useState("Container");
  const [priority, setPriority] = useState("balanced");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  const weatherFetch = useFetch(() => api.weather.tradeHubs());
  const weather = weatherFetch.data as any;

  const handleAnalyze = async () => {
    setAnalyzing(true);
    await new Promise((r) => setTimeout(r, 1200));
    setAnalyzing(false);
    setAnalyzed(true);
  };

  // Get weather for origin / destination cities
  const getHubWeather = (location: string) => {
    const city = location.split(",")[0].trim();
    return (weather?.hubs ?? []).find((h: any) => h.city?.toLowerCase() === city.toLowerCase());
  };

  const originWeather = getHubWeather(origin);
  const destWeather   = getHubWeather(destination);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold font-display gradient-text">Route Optimizer</h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          Live weather at origin/destination · Open-Meteo · Route visualization via OpenStreetMap
        </p>
      </div>

      {/* Route Input */}
      <div className="glass-card p-5">
        <SectionHeader title="Configure Route" subtitle="Enter origin, destination, and cargo details" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-[11px] font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Origin Port
            </label>
            <select value={origin} onChange={(e) => setOrigin(e.target.value)} className="input-field">
              {MAJOR_PORTS_SIMPLE.map((p) => <option key={p} value={p} className="bg-surface-800">{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Destination Port
            </label>
            <select value={destination} onChange={(e) => setDestination(e.target.value)} className="input-field">
              {MAJOR_PORTS_SIMPLE.map((p) => <option key={p} value={p} className="bg-surface-800">{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Cargo Type
            </label>
            <select value={cargoType} onChange={(e) => setCargoType(e.target.value)} className="input-field">
              {CARGO_TYPES.map((t) => <option key={t} value={t} className="bg-surface-800">{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Priority
            </label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className="input-field">
              <option value="fastest">Fastest</option>
              <option value="cheapest">Cheapest</option>
              <option value="balanced">Balanced</option>
              <option value="lowest-carbon">Lowest Carbon</option>
            </select>
          </div>
        </div>
        <button onClick={handleAnalyze} disabled={analyzing || origin === destination} className="btn-primary">
          <Route size={14} />
          {analyzing ? "Analyzing Route…" : "Analyze Route"}
        </button>
      </div>

      {/* Live weather at endpoints */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[{ label: "Origin", hub: originWeather, location: origin }, { label: "Destination", hub: destWeather, location: destination }].map(({ label, hub, location }) => (
          <div key={label} className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={13} style={{ color: "var(--accent-blue)" }} />
              <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{label}: {location}</p>
            </div>
            {weatherFetch.loading ? <div className="skeleton h-16 rounded-xl" /> :
              hub && !hub.error ? (
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.04)" }}>
                    <Thermometer size={11} className="mx-auto mb-0.5" style={{ color: "#60a5fa" }} />
                    <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{hub.temp_c?.toFixed(0)}°C</p>
                    <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Temp</p>
                  </div>
                  <div className="text-center p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.04)" }}>
                    <Wind size={11} className="mx-auto mb-0.5" style={{ color: "#06b6d4" }} />
                    <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{hub.wind_speed_ms?.toFixed(1)}</p>
                    <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>m/s Wind</p>
                  </div>
                  <div className="text-center p-2 rounded-lg" style={{
                    background: hub.weather_code >= 80 ? "rgba(239,68,68,0.06)" : "rgba(255,255,255,0.04)",
                  }}>
                    {hub.weather_code >= 80 ? <AlertTriangle size={11} className="mx-auto mb-0.5 text-amber-400" /> :
                      <span className="block text-sm">✓</span>}
                    <p className="text-[10px]" style={{ color: hub.weather_code >= 80 ? "#f59e0b" : "#10b981" }}>
                      {hub.weather_code >= 80 ? "Alert" : "Clear"}
                    </p>
                  </div>
                </div>
              ) : (
                <NoDataCard reason={`No weather data for ${location.split(",")[0]}`} compact />
              )
            }
          </div>
        ))}
      </div>

      {/* Route Map */}
      <div className="glass-card p-5">
        <SectionHeader title="Route Map" subtitle="OpenStreetMap visualization" />
        <RouteMap origin={origin} destination={destination} />
      </div>

      {/* Route analysis note */}
      <div className="glass-card p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Live route optimization requires integration with routing APIs (e.g., HERE Maps, Google Routes API, or OpenRouteService).
            Current weather at origin/destination is live from Open-Meteo. Route distance and cost estimates would be computed
            from real routing API responses — configure API keys in Settings to enable full route analysis.
          </p>
        </div>
      </div>
    </div>
  );
}
