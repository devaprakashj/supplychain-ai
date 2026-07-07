"use client";
import { useFetch } from "@/hooks/useFetch";
import { api } from "@/lib/api/client";
import SectionHeader from "@/components/ui/SectionHeader";
import NoDataCard from "@/components/ui/NoDataCard";
import { motion } from "framer-motion";
import { Anchor, Wind, Thermometer, Droplets, AlertTriangle } from "lucide-react";
import dynamic from "next/dynamic";

const PortsMap = dynamic(() => import("@/components/ports/PortsMapClient"), { ssr: false, loading: () => <div className="skeleton rounded-xl h-64 w-full" /> });

export default function PortsPage() {
  const portsFetch = useFetch(() => api.ports.all(), { refreshInterval: 10 * 60 * 1000 });
  const ports = portsFetch.data as any;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold font-display gradient-text">Port Analytics</h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          Live weather conditions at 12 major global ports · Open-Meteo
        </p>
      </div>

      {/* Ports Map */}
      <div className="glass-card p-5">
        <SectionHeader title="Global Port Map" subtitle="Live weather risk overlay"
          onRefresh={portsFetch.refetch} loading={portsFetch.loading} lastUpdated={portsFetch.lastUpdated} />
        {portsFetch.loading ? <div className="skeleton h-64 rounded-xl" /> :
          portsFetch.error ? <NoDataCard reason={portsFetch.error} /> :
          <PortsMap ports={ports?.ports ?? []} />}
      </div>

      {/* Port Cards Grid */}
      <div>
        <SectionHeader title="Port Status" subtitle={`${ports?.count ?? 0} major ports monitored`}
          onRefresh={portsFetch.refetch} loading={portsFetch.loading} lastUpdated={portsFetch.lastUpdated} />
        {portsFetch.loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-36 rounded-2xl" />)}
          </div>
        ) : portsFetch.error ? <NoDataCard reason={portsFetch.error} /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {(ports?.ports ?? []).map((port: any, i: number) => {
              const riskColor = port.weather_risk === "Severe" ? "#ef4444"
                : port.weather_risk === "Moderate" ? "#f59e0b" : "#10b981";
              const w = port.weather ?? {};
              return (
                <motion.div key={port.name}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Anchor size={14} style={{ color: "var(--accent-blue)" }} />
                        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{port.name}</p>
                      </div>
                      <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {port.country} · {port.lat?.toFixed(2)}°, {port.lon?.toFixed(2)}°
                      </p>
                    </div>
                    <span className="badge text-[10px]"
                      style={{ background: `${riskColor}15`, color: riskColor, border: `1px solid ${riskColor}30` }}>
                      {port.weather_risk} Risk
                    </span>
                  </div>

                  {w.error ? (
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>Weather unavailable</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                        <Thermometer size={12} className="mx-auto mb-0.5" style={{ color: "#60a5fa" }} />
                        <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                          {w.temp_c?.toFixed(0)}°C
                        </p>
                        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Temp</p>
                      </div>
                      <div className="text-center p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                        <Wind size={12} className="mx-auto mb-0.5" style={{ color: "#06b6d4" }} />
                        <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                          {w.wind_speed_ms?.toFixed(1)}
                        </p>
                        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>m/s wind</p>
                      </div>
                      <div className="text-center p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                        <Droplets size={12} className="mx-auto mb-0.5" style={{ color: "#a78bfa" }} />
                        <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                          {w.humidity_pct}%
                        </p>
                        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Humidity</p>
                      </div>
                    </div>
                  )}

                  {!w.error && (
                    <p className="text-[10px] mt-2" style={{ color: "var(--text-muted)" }}>
                      {w.description} · {w.source}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
