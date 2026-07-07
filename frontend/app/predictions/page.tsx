"use client";
import { useFetch } from "@/hooks/useFetch";
import { api } from "@/lib/api/client";
import SectionHeader from "@/components/ui/SectionHeader";
import NoDataCard from "@/components/ui/NoDataCard";
import { motion } from "framer-motion";
import { Brain, AlertTriangle, CloudRain, Zap, CheckCircle } from "lucide-react";
import { format } from "date-fns";

export default function PredictionsPage() {
  const riskFetch     = useFetch(() => api.risk.score(),        { refreshInterval: 5 * 60 * 1000 });
  const weatherFetch  = useFetch(() => api.weather.tradeHubs(), { refreshInterval: 10 * 60 * 1000 });
  const disasterFetch = useFetch(() => api.disasters.all(),     { refreshInterval: 5 * 60 * 1000 });

  const risk      = riskFetch.data as any;
  const weather   = weatherFetch.data as any;
  const disasters = disasterFetch.data as any;

  // Build delay risk signals from live data
  const severeWeatherHubs = (weather?.hubs ?? []).filter((h: any) =>
    !h.error && (h.weather_code >= 80 || h.wind_speed_ms > 12)
  );

  const majorEarthquakes = (disasters?.earthquakes?.events ?? []).filter((e: any) => e.magnitude >= 6.0);
  const activeCyclones   = (disasters?.natural_events?.events ?? []).filter((e: any) =>
    e.categories?.includes("Tropical Cyclones")
  );
  const activeWildfires  = (disasters?.natural_events?.events ?? []).filter((e: any) =>
    e.categories?.includes("Wildfires")
  );

  const overallLoading = riskFetch.loading || weatherFetch.loading || disasterFetch.loading;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold font-display gradient-text">AI Delay Predictions</h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          Risk signals derived from live USGS · NASA EONET · Open-Meteo data. No fabricated predictions.
        </p>
      </div>

      {/* Live Risk Signal Summary */}
      <div className="glass-card p-5">
        <SectionHeader
          title="Live Risk Signals"
          subtitle={`Computed at ${riskFetch.lastUpdated ? format(riskFetch.lastUpdated, "HH:mm:ss") : "—"}`}
          onRefresh={() => { riskFetch.refetch(); weatherFetch.refetch(); disasterFetch.refetch(); }}
          loading={overallLoading}
          lastUpdated={riskFetch.lastUpdated}
        />

        {overallLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Severe Weather at Hubs",
                value: severeWeatherHubs.length,
                unit: "hubs affected",
                icon: <CloudRain size={16} />,
                color: severeWeatherHubs.length > 2 ? "#ef4444" : severeWeatherHubs.length > 0 ? "#f59e0b" : "#10b981",
                risk: severeWeatherHubs.length > 2 ? "High" : severeWeatherHubs.length > 0 ? "Moderate" : "Low",
                source: "Open-Meteo",
              },
              {
                label: "Major Earthquakes (M6+)",
                value: majorEarthquakes.length,
                unit: "events (7d)",
                icon: <Zap size={16} />,
                color: majorEarthquakes.length > 3 ? "#ef4444" : majorEarthquakes.length > 0 ? "#f59e0b" : "#10b981",
                risk: majorEarthquakes.length > 3 ? "High" : majorEarthquakes.length > 0 ? "Moderate" : "Low",
                source: "USGS",
              },
              {
                label: "Active Cyclones",
                value: activeCyclones.length,
                unit: "open events",
                icon: <AlertTriangle size={16} />,
                color: activeCyclones.length > 1 ? "#ef4444" : activeCyclones.length > 0 ? "#f59e0b" : "#10b981",
                risk: activeCyclones.length > 1 ? "Critical" : activeCyclones.length > 0 ? "High" : "Low",
                source: "NASA EONET",
              },
              {
                label: "Global Risk Score",
                value: risk?.global_risk_score ?? "—",
                unit: "/ 100",
                icon: <Brain size={16} />,
                color: (risk?.global_risk_score ?? 0) >= 75 ? "#ef4444" : (risk?.global_risk_score ?? 0) >= 50 ? "#f59e0b" : "#10b981",
                risk: risk?.risk_level ?? "Unknown",
                source: "Multi-source",
              },
            ].map((sig) => (
              <motion.div key={sig.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl"
                style={{ background: `${sig.color}08`, border: `1px solid ${sig.color}25` }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: `${sig.color}18`, color: sig.color }}>
                    {sig.icon}
                  </div>
                  <p className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                    {sig.label}
                  </p>
                </div>
                <p className="text-2xl font-bold font-display" style={{ color: sig.color }}>
                  {sig.value}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>{sig.unit}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="badge text-[9px]"
                    style={{ background: `${sig.color}15`, color: sig.color, border: `1px solid ${sig.color}30` }}>
                    {sig.risk} Risk
                  </span>
                  <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>{sig.source}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Severe Weather Hubs Detail */}
      <div className="glass-card p-5">
        <SectionHeader title="Severe Weather at Trade Hubs" subtitle="Hubs with storm / high-wind / heavy rain alerts" />
        {weatherFetch.loading ? (
          <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}</div>
        ) : !severeWeatherHubs.length ? (
          <div className="flex items-center gap-2 py-4">
            <CheckCircle size={16} className="text-emerald-400" />
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              No severe weather at major trade hubs · Source: Open-Meteo
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {severeWeatherHubs.map((hub: any) => (
              <div key={hub.city} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}>
                <AlertTriangle size={14} className="text-red-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                    {hub.city}, {hub.country}
                  </p>
                  <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                    {hub.description} · {hub.temp_c?.toFixed(0)}°C · Wind {hub.wind_speed_ms?.toFixed(1)} m/s
                  </p>
                </div>
                <span className="badge badge-danger">Delay Risk</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Cyclones */}
      {!disasterFetch.loading && activeCyclones.length > 0 && (
        <div className="glass-card p-5">
          <SectionHeader title="Active Tropical Cyclones" subtitle="NASA EONET open events – potential major shipping disruption" />
          <div className="space-y-2">
            {activeCyclones.map((ev: any) => (
              <div key={ev.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <AlertTriangle size={14} className="text-red-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{ev.title}</p>
                  {ev.date && <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{format(new Date(ev.date), "MMM d, yyyy")}</p>}
                </div>
                <span className="badge badge-danger">Critical</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI analysis note */}
      <div className="glass-card p-4">
        <div className="flex items-start gap-3">
          <Brain size={16} style={{ color: "var(--accent-blue)" }} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>About AI Predictions</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              Delay risk signals are derived from real USGS seismic data, NASA EONET natural events, and Open-Meteo weather.
              For full AI-powered analysis and natural language explanations, configure your OpenAI API key in Settings and use the AI Copilot.
              This system never invents delay probabilities without data backing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
