"use client";
import { useState } from "react";
import { useFetch } from "@/hooks/useFetch";
import { api } from "@/lib/api/client";
import SectionHeader from "@/components/ui/SectionHeader";
import NoDataCard from "@/components/ui/NoDataCard";
import { Ship, Plane, AlertTriangle, Settings, Wind, Thermometer, Globe2, Navigation } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const REGIONS = [
  { id: "north_atlantic", label: "North Atlantic" },
  { id: "europe",         label: "Europe" },
  { id: "asia_pacific",   label: "Asia Pacific" },
  { id: "middle_east",    label: "Middle East" },
];

export default function ShipmentsPage() {
  const [flightRegion, setFlightRegion] = useState("north_atlantic");

  const shipsFetch   = useFetch(() => api.ships.live(5, 50),                   { refreshInterval: 3 * 60 * 1000 });
  const flightsFetch = useFetch(() => api.flights.live(flightRegion, 60),       { refreshInterval: 2 * 60 * 1000 });
  const weatherFetch = useFetch(() => api.weather.tradeHubs(),                  { refreshInterval: 10 * 60 * 1000 });

  const ships   = shipsFetch.data as any;
  const flights = flightsFetch.data as any;
  const weather = weatherFetch.data as any;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold font-display gradient-text">Live Shipments & Flights</h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          Ships: AISStream (free WebSocket AIS) · Flights: OpenSky Network (free, no key) · Weather: Open-Meteo
        </p>
      </div>

      {/* ── AIS Ship Tracking ─────────────────────────────────────────────── */}
      <div className="glass-card p-6">
        <SectionHeader
          title="Live AIS Ship Positions"
          subtitle="AISStream WebSocket feed · Free, register at aisstream.io"
          onRefresh={shipsFetch.refetch}
          loading={shipsFetch.loading}
          lastUpdated={shipsFetch.lastUpdated}
        />

        {shipsFetch.loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
          </div>
        ) : ships && !ships.configured ? (
          /* AISStream not configured – show actionable setup card */
          <div className="flex flex-col items-center justify-center py-10 gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}>
              <Ship size={28} style={{ color: "var(--accent-blue)" }} />
            </div>
            <div className="text-center max-w-lg">
              <h3 className="text-base font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                AISStream API Key Not Configured
              </h3>
              <p className="text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
                {ships.message}
              </p>
              <p className="text-xs mb-3 leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {ships.why_free}
              </p>
              <div className="flex flex-col items-center gap-2">
                <a href="https://aisstream.io" target="_blank" rel="noreferrer"
                  className="btn-secondary text-xs py-1.5 px-3">
                  Register free at aisstream.io →
                </a>
                <Link href="/settings">
                  <button className="btn-primary text-xs py-1.5 px-3">
                    <Settings size={12} /> Add AISSTREAM_API_KEY in Settings
                  </button>
                </Link>
              </div>
            </div>
          </div>
        ) : ships?.error ? (
          <NoDataCard reason={ships.error} />
        ) : ships?.count > 0 ? (
          /* Vessel list */
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {ships.ships.map((vessel: any, i: number) => (
              <motion.div key={vessel.mmsi}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <Ship size={12} style={{ color: "var(--accent-blue)" }} className="flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                    {vessel.name || `MMSI ${vessel.mmsi}`}
                  </p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                    {vessel.callsign && `${vessel.callsign} · `}
                    {vessel.destination && `→ ${vessel.destination}`}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 text-[10px]" style={{ color: "var(--text-muted)" }}>
                  {vessel.latitude && vessel.longitude && (
                    <span>{vessel.latitude?.toFixed(2)}°, {vessel.longitude?.toFixed(2)}°</span>
                  )}
                  {vessel.sog != null && (
                    <span>{vessel.sog?.toFixed(1)} kn</span>
                  )}
                </div>
              </motion.div>
            ))}
            <p className="text-[10px] pt-1" style={{ color: "var(--text-muted)" }}>
              {ships.count} vessels · {ships.snapshot_seconds}s AISStream snapshot · Source: aisstream.io
            </p>
          </div>
        ) : (
          <NoDataCard reason="No vessels received in snapshot window" compact />
        )}
      </div>

      {/* ── Live Flights – OpenSky Network (Always Free) ──────────────────── */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <SectionHeader
              title="Live Aircraft Positions"
              subtitle="OpenSky Network · Free, no API key required · ADS-B receivers worldwide"
              onRefresh={flightsFetch.refetch}
              loading={flightsFetch.loading}
              lastUpdated={flightsFetch.lastUpdated}
            />
          </div>
          {/* Region selector */}
          <div className="flex gap-1.5 flex-shrink-0">
            {REGIONS.map((r) => (
              <button
                key={r.id}
                onClick={() => setFlightRegion(r.id)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all"
                style={{
                  background: flightRegion === r.id ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.04)",
                  border: flightRegion === r.id ? "1px solid rgba(59,130,246,0.4)" : "1px solid rgba(255,255,255,0.06)",
                  color: flightRegion === r.id ? "#60a5fa" : "var(--text-muted)",
                }}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {flightsFetch.loading ? (
          <div className="space-y-2">{[...Array(6)].map((_, i) => <div key={i} className="skeleton h-10 rounded-xl" />)}</div>
        ) : flightsFetch.error ? (
          <NoDataCard reason={flightsFetch.error} compact />
        ) : !flights?.flights?.length ? (
          <NoDataCard reason="No airborne aircraft in selected region" compact />
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: "Airborne in region", value: flights.count, icon: <Plane size={12} />, color: "#06b6d4" },
                { label: "Total detected", value: flights.total_in_region, icon: <Globe2 size={12} />, color: "#8b5cf6" },
                { label: "Source", value: "OpenSky", icon: <Navigation size={12} />, color: "#10b981" },
              ].map((stat) => (
                <div key={stat.label} className="p-3 rounded-xl text-center"
                  style={{ background: `${stat.color}08`, border: `1px solid ${stat.color}20` }}>
                  <div className="flex items-center justify-center gap-1 mb-1" style={{ color: stat.color }}>
                    {stat.icon}
                  </div>
                  <p className="text-base font-bold font-display" style={{ color: stat.color }}>{stat.value}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {flights.flights.slice(0, 40).map((ac: any, i: number) => (
                <motion.div key={ac.icao24}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <Plane size={11} style={{ color: "#06b6d4" }} className="flex-shrink-0" />
                  <span className="text-xs font-mono font-semibold w-16 flex-shrink-0"
                    style={{ color: "var(--text-primary)" }}>
                    {ac.callsign || ac.icao24}
                  </span>
                  <span className="text-[10px] flex-shrink-0 w-16" style={{ color: "var(--text-muted)" }}>
                    {ac.country?.slice(0, 10)}
                  </span>
                  <div className="flex items-center gap-3 ml-auto flex-shrink-0 text-[10px]" style={{ color: "var(--text-secondary)" }}>
                    {ac.altitude_m != null && (
                      <span>{(ac.altitude_m / 1000).toFixed(1)} km</span>
                    )}
                    {ac.velocity_ms != null && (
                      <span>{(ac.velocity_ms * 1.944).toFixed(0)} kn</span>
                    )}
                    {ac.latitude != null && (
                      <span className="hidden md:inline">
                        {ac.latitude.toFixed(1)}°, {ac.longitude?.toFixed(1)}°
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
            <p className="text-[10px] mt-2" style={{ color: "var(--text-muted)" }}>
              Source: OpenSky Network · opensky-network.org · Free, no API key required
            </p>
          </>
        )}
      </div>

      {/* ── Trade Hub Weather ─────────────────────────────────────────────── */}
      <div className="glass-card p-5">
        <SectionHeader
          title="Trade Hub Weather"
          subtitle="Live weather at key global shipping city hubs · Open-Meteo (free)"
          onRefresh={weatherFetch.refetch}
          loading={weatherFetch.loading}
          lastUpdated={weatherFetch.lastUpdated}
        />
        {weatherFetch.loading ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[...Array(10)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
          </div>
        ) : weatherFetch.error ? (
          <NoDataCard reason={weatherFetch.error} compact />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {(weather?.hubs ?? []).map((hub: any) => {
              if (hub.error) return null;
              const isAlert = hub.weather_code >= 80 || hub.wind_speed_ms > 12;
              return (
                <div key={hub.city}
                  className="p-3 rounded-xl text-center"
                  style={{
                    background: isAlert ? "rgba(239,68,68,0.06)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${isAlert ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.06)"}`,
                  }}>
                  {isAlert && <AlertTriangle size={10} className="mx-auto mb-1 text-amber-400" />}
                  <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{hub.city}</p>
                  <p className="text-base font-bold mt-1" style={{ color: "var(--text-primary)" }}>
                    {hub.temp_c?.toFixed(0)}°C
                  </p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                    {hub.wind_speed_ms?.toFixed(0)} m/s
                  </p>
                  <p className="text-[10px] mt-1 truncate"
                    style={{ color: isAlert ? "#f59e0b" : "var(--text-muted)" }}>
                    {hub.description}
                  </p>
                </div>
              );
            })}
          </div>
        )}
        <p className="text-[10px] mt-2" style={{ color: "var(--text-muted)" }}>Source: Open-Meteo · open-meteo.com · Free</p>
      </div>

      {/* Data integrity note */}
      <div className="glass-card p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Provider Selection — Why These Sources?
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              <strong className="text-emerald-400">Ships:</strong> AISStream replaces MarineTraffic (paid). AISStream is completely free with a simple WebSocket API, providing live AIS positions from thousands of vessels worldwide. Register at aisstream.io for a free API key.
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              <strong className="text-emerald-400">Flights:</strong> OpenSky Network replaces AviationStack (paid). OpenSky is a non-profit research project providing 100% free ADS-B flight data — no payment, no signup, no API key required.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
