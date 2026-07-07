"use client";
import { motion } from "framer-motion";
import { Thermometer, Wind, Droplets, AlertTriangle } from "lucide-react";
import NoDataCard from "@/components/ui/NoDataCard";

interface WeatherHubsPanelProps {
  data: any;
  loading: boolean;
  error: string | null;
}

const WMO_RISK: Record<number, "Low" | "Moderate" | "Severe"> = {
  95: "Severe", 96: "Severe", 99: "Severe",
  61: "Moderate", 63: "Moderate", 65: "Moderate",
  80: "Moderate", 81: "Moderate", 82: "Severe",
};

const RISK_COLORS = { Low: "#10b981", Moderate: "#f59e0b", Severe: "#ef4444" };

export default function WeatherHubsPanel({ data, loading, error }: WeatherHubsPanelProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="skeleton h-12 rounded-xl" />
        ))}
      </div>
    );
  }
  if (error) return <NoDataCard reason={error} />;
  if (!data?.hubs?.length) return <NoDataCard reason="No weather data available" />;

  return (
    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
      {data.hubs.map((hub: any, i: number) => {
        if (hub.error) return null;
        const riskCode = WMO_RISK[hub.weather_code] ?? "Low";
        const riskColor = RISK_COLORS[riskCode];
        const windRisk = hub.wind_speed_ms > 15 ? "Severe" : hub.wind_speed_ms > 10 ? "Moderate" : "Low";
        const finalRisk = riskCode === "Severe" || windRisk === "Severe" ? "Severe"
          : riskCode === "Moderate" || windRisk === "Moderate" ? "Moderate" : "Low";
        const finalColor = RISK_COLORS[finalRisk];

        return (
          <motion.div
            key={hub.city}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{hub.city}</span>
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{hub.country}</span>
              </div>
              <span className="text-[10px] truncate" style={{ color: "var(--text-muted)" }}>{hub.description}</span>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="flex items-center gap-1">
                <Thermometer size={10} style={{ color: "var(--text-muted)" }} />
                <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                  {hub.temp_c?.toFixed(0)}°C
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Wind size={10} style={{ color: "var(--text-muted)" }} />
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  {hub.wind_speed_ms?.toFixed(1)}m/s
                </span>
              </div>
              <span className="badge text-[10px] px-1.5 py-0.5 rounded-lg"
                style={{ background: `${finalColor}15`, color: finalColor, border: `1px solid ${finalColor}30` }}>
                {finalRisk}
              </span>
            </div>
          </motion.div>
        );
      })}
      <p className="text-[10px] pt-1" style={{ color: "var(--text-muted)" }}>
        Source: Open-Meteo (open-meteo.com)
      </p>
    </div>
  );
}
