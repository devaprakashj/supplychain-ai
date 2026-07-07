"use client";
import { useFetch } from "@/hooks/useFetch";
import { api } from "@/lib/api/client";
import SectionHeader from "@/components/ui/SectionHeader";
import NoDataCard from "@/components/ui/NoDataCard";
import { motion } from "framer-motion";
import { FileBarChart, Download, Globe2, AlertTriangle, Thermometer, Activity, Clock } from "lucide-react";
import { format } from "date-fns";

export default function ReportsPage() {
  const reportFetch = useFetch(() => api.reports.data());
  const report = reportFetch.data as any;

  const handleDownload = () => {
    const url = api.reports.downloadUrl();
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold font-display gradient-text">Reports</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Auto-generated from live API data · USGS · NASA EONET · Open-Meteo · Exchange Rates
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={reportFetch.refetch}
            disabled={reportFetch.loading}
            className="btn-secondary"
          >
            {reportFetch.loading ? "Generating…" : "Refresh Data"}
          </button>
          <button onClick={handleDownload} className="btn-primary">
            <Download size={14} />
            Download JSON Report
          </button>
        </div>
      </div>

      {reportFetch.loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-36 rounded-2xl" />)}
        </div>
      ) : reportFetch.error ? (
        <NoDataCard reason={reportFetch.error} />
      ) : !report ? (
        <NoDataCard reason="No report data available" />
      ) : (
        <>
          {/* Report header */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.3), rgba(124,58,237,0.2))", border: "1px solid rgba(59,130,246,0.3)" }}>
                <FileBarChart size={18} style={{ color: "var(--accent-blue)" }} />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                  Daily Supply Chain Intelligence Report
                </p>
                <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                  Generated: {report.generated_at ? format(new Date(report.generated_at), "PPpp") : "—"}
                </p>
              </div>
              <span className="ml-auto badge badge-success">Live Data</span>
            </div>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              {report.data_integrity}
            </p>
          </div>

          {/* Risk Score Section */}
          {report.risk_score && (
            <div className="glass-card p-5">
              <SectionHeader title="Global Risk Assessment" subtitle={`Score: ${report.risk_score.global_risk_score}/100 · Level: ${report.risk_score.risk_level}`} />
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {report.risk_score.explanation}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                {(report.risk_score.factors ?? []).map((f: any) => (
                  <div key={f.factor} className="p-3 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-primary)" }}>{f.factor}</p>
                    <p className="text-lg font-bold" style={{ color: f.data_available ? "#3b82f6" : "#6b7280" }}>
                      {f.data_available ? `${f.score}/100` : "No data"}
                    </p>
                    <p className="text-[10px] mt-1 line-clamp-2" style={{ color: "var(--text-muted)" }}>{f.detail}</p>
                    <p className="text-[10px] mt-1" style={{ color: "var(--accent-blue)" }}>{f.source}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Earthquake Section */}
          {report.disasters?.earthquakes && (
            <div className="glass-card p-5">
              <SectionHeader
                title="Seismic Activity Report"
                subtitle={`${report.disasters.earthquakes.count} M4.5+ earthquakes · Past 7 days · USGS`}
              />
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {(report.disasters.earthquakes.events ?? []).slice(0, 10).map((eq: any) => (
                  <div key={eq.id} className="flex items-center gap-3 px-3 py-2 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <Activity size={12} style={{ color: eq.magnitude >= 6 ? "#ef4444" : "#f59e0b" }} />
                    <span className="text-xs font-mono font-bold" style={{ color: eq.magnitude >= 6 ? "#ef4444" : "#f59e0b" }}>
                      M{eq.magnitude}
                    </span>
                    <span className="text-xs flex-1 truncate" style={{ color: "var(--text-secondary)" }}>{eq.place}</span>
                    <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                      {eq.time ? format(new Date(eq.time), "MMM d") : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trade Hub Weather */}
          {report.trade_hub_weather?.length > 0 && (
            <div className="glass-card p-5">
              <SectionHeader
                title="Trade Hub Weather Conditions"
                subtitle="Live weather at major ports · Open-Meteo"
              />
              <div className="overflow-x-auto">
                <table className="data-table w-full">
                  <thead>
                    <tr>
                      <th>City</th>
                      <th>Temp</th>
                      <th>Wind</th>
                      <th>Humidity</th>
                      <th>Conditions</th>
                      <th>Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.trade_hub_weather.map((h: any) => (
                      <tr key={h.city}>
                        <td className="font-medium" style={{ color: "var(--text-primary)" }}>{h.city}, {h.country}</td>
                        <td>{h.temp_c?.toFixed(1)}°C</td>
                        <td>{h.wind_speed_ms?.toFixed(1)} m/s</td>
                        <td>{h.humidity_pct}%</td>
                        <td>{h.description}</td>
                        <td><span className="badge badge-info text-[10px]">{h.source}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Exchange Rates */}
          {report.exchange_rates?.rates && (
            <div className="glass-card p-5">
              <SectionHeader title="Exchange Rate Snapshot" subtitle={`Base: USD · ${report.exchange_rates.time_last_update_utc ?? ""}`} />
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                {Object.entries(report.exchange_rates.rates as Record<string, number>).slice(0, 15).map(([cur, rate]) => (
                  <div key={cur} className="p-2 rounded-xl text-center"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <p className="text-[11px] font-semibold" style={{ color: "var(--text-primary)" }}>{cur}</p>
                    <p className="text-sm font-mono font-bold mt-0.5" style={{ color: "var(--accent-cyan)" }}>
                      {(rate as number).toFixed(3)}
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-[10px] mt-2" style={{ color: "var(--text-muted)" }}>Source: open.er-api.com</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
