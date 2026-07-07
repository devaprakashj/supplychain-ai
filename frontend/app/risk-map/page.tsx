"use client";
import { useFetch } from "@/hooks/useFetch";
import { api } from "@/lib/api/client";
import SectionHeader from "@/components/ui/SectionHeader";
import NoDataCard from "@/components/ui/NoDataCard";
import { motion } from "framer-motion";
import { Globe2, AlertTriangle, Flame, CloudLightning, Activity, Waves } from "lucide-react";
import dynamic from "next/dynamic";

const RiskMap = dynamic(() => import("@/components/risk-map/RiskMapClient"), { ssr: false, loading: () => <div className="skeleton rounded-xl h-96 w-full" /> });

export default function RiskMapPage() {
  const disasterFetch = useFetch(() => api.disasters.all(), { refreshInterval: 5 * 60 * 1000 });
  const riskFetch     = useFetch(() => api.risk.score());
  const disasters = disasterFetch.data as any;
  const risk = riskFetch.data as any;

  const eqEvents = disasters?.earthquakes?.events ?? [];
  const eonetEvents = disasters?.natural_events?.events ?? [];

  // Group EONET by category
  const groupedByCategory: Record<string, number> = {};
  for (const ev of eonetEvents) {
    for (const cat of (ev.categories ?? [])) {
      groupedByCategory[cat] = (groupedByCategory[cat] ?? 0) + 1;
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold font-display gradient-text">Global Supply Chain Risk Map</h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          Live disaster data · USGS Earthquakes · NASA EONET Natural Events
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Earthquakes", value: disasters?.earthquakes?.count, icon: <Activity size={14} />, color: "#ef4444", source: "USGS" },
          { label: "Open EONET Events", value: disasters?.natural_events?.count, icon: <Globe2 size={14} />, color: "#f59e0b", source: "NASA EONET" },
          { label: "Risk Level", value: risk?.risk_level, icon: <AlertTriangle size={14} />, color: "#8b5cf6", source: "Computed" },
          { label: "Data Coverage", value: risk ? `${risk.data_coverage_pct}%` : null, icon: <Waves size={14} />, color: "#06b6d4", source: "Multi-source" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: `${stat.color}18`, color: stat.color }}>
                {stat.icon}
              </div>
              <p className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                {stat.label}
              </p>
            </div>
            {disasterFetch.loading || riskFetch.loading ? (
              <div className="skeleton h-6 w-16 rounded" />
            ) : stat.value !== null && stat.value !== undefined ? (
              <p className="text-xl font-bold font-display" style={{ color: stat.color }}>{stat.value}</p>
            ) : (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No data</p>
            )}
            <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>via {stat.source}</p>
          </div>
        ))}
      </div>

      {/* Main Risk Map */}
      <div className="glass-card p-5">
        <SectionHeader
          title="Live Disaster & Risk Map"
          subtitle="Real USGS seismic events + NASA EONET natural disasters"
          onRefresh={disasterFetch.refetch}
          loading={disasterFetch.loading}
          lastUpdated={disasterFetch.lastUpdated}
        />
        {disasterFetch.loading ? <div className="skeleton h-96 rounded-xl" /> :
          disasterFetch.error ? <NoDataCard reason={disasterFetch.error} height="h-96" /> :
          <RiskMap earthquakes={eqEvents} eonetEvents={eonetEvents} riskScore={risk?.global_risk_score} />}
      </div>

      {/* Event category breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <SectionHeader title="Events by Category" subtitle="NASA EONET open events breakdown" />
          {disasterFetch.loading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-8 rounded-xl" />)}</div>
          ) : !Object.keys(groupedByCategory).length ? (
            <NoDataCard reason="No category data" compact />
          ) : (
            <div className="space-y-2">
              {Object.entries(groupedByCategory).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
                <div key={cat} className="flex items-center gap-3">
                  <span className="text-xs font-medium w-36 flex-shrink-0" style={{ color: "var(--text-secondary)" }}>{cat}</span>
                  <div className="flex-1 progress-bar">
                    <motion.div
                      className="progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (count / (disasters?.natural_events?.count ?? 1)) * 100)}%` }}
                      transition={{ duration: 0.8 }}
                      style={{ background: "linear-gradient(90deg, #3b82f6, #8b5cf6)" }}
                    />
                  </div>
                  <span className="text-xs font-mono font-bold w-6 text-right" style={{ color: "var(--text-primary)" }}>{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Earthquake magnitude distribution */}
        <div className="glass-card p-5">
          <SectionHeader title="Earthquake Severity" subtitle="USGS 7-day M4.5+ events by magnitude" />
          {disasterFetch.loading ? (
            <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-8 rounded-xl" />)}</div>
          ) : !eqEvents.length ? (
            <NoDataCard reason="No earthquake data" compact />
          ) : (
            <div className="space-y-3">
              {[
                { label: "M7.0+", filter: (m: number) => m >= 7.0, color: "#ef4444" },
                { label: "M6.0 – 6.9", filter: (m: number) => m >= 6.0 && m < 7.0, color: "#f97316" },
                { label: "M5.0 – 5.9", filter: (m: number) => m >= 5.0 && m < 6.0, color: "#f59e0b" },
                { label: "M4.5 – 4.9", filter: (m: number) => m >= 4.5 && m < 5.0, color: "#fbbf24" },
              ].map(({ label, filter, color }) => {
                const count = eqEvents.filter((e: any) => filter(e.magnitude ?? 0)).length;
                return (
                  <div key={label} className="flex items-center gap-3">
                    <span className="text-xs font-mono w-24 flex-shrink-0" style={{ color }}>
                      {label}
                    </span>
                    <div className="flex-1 progress-bar">
                      <motion.div
                        className="progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (count / Math.max(1, eqEvents.length)) * 100)}%` }}
                        transition={{ duration: 0.8 }}
                        style={{ background: color }}
                      />
                    </div>
                    <span className="text-xs font-bold w-6 text-right" style={{ color: "var(--text-primary)" }}>{count}</span>
                  </div>
                );
              })}
              <p className="text-[10px] pt-1" style={{ color: "var(--text-muted)" }}>
                {eqEvents.length} total events · Source: USGS
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
