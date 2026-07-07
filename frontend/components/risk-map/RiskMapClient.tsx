"use client";
import { MapContainer, TileLayer, CircleMarker, Popup, LayerGroup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { format } from "date-fns";

interface RiskMapClientProps {
  earthquakes: any[];
  eonetEvents: any[];
  riskScore?: number;
}

function eqColor(mag: number) {
  if (mag >= 7) return "#ef4444";
  if (mag >= 6) return "#f97316";
  if (mag >= 5) return "#f59e0b";
  return "#fbbf24";
}

const EONET_COLORS: Record<string, string> = {
  "Severe Storms": "#f59e0b", "Tropical Cyclones": "#ef4444",
  "Wildfires": "#f97316", "Floods": "#06b6d4", "Volcanoes": "#dc2626",
  "default": "#a78bfa",
};

export default function RiskMapClient({ earthquakes, eonetEvents, riskScore }: RiskMapClientProps) {
  return (
    <div className="relative rounded-xl overflow-hidden h-96 w-full">
      <MapContainer center={[20, 0]} zoom={2} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
        />
        <LayerGroup>
          {earthquakes.map((eq: any) => (
            <CircleMarker key={eq.id} center={[eq.latitude, eq.longitude]}
              radius={Math.max(4, (eq.magnitude - 3) * 5)}
              pathOptions={{ color: eqColor(eq.magnitude), fillColor: eqColor(eq.magnitude), fillOpacity: 0.75, weight: 1 }}>
              <Popup>
                <div style={{ fontFamily: "Inter, sans-serif", minWidth: 180, fontSize: 12 }}>
                  <p style={{ color: "#f1f5f9", fontWeight: 700, marginBottom: 4 }}>🌍 M{eq.magnitude} Earthquake</p>
                  <p style={{ color: "#94a3b8" }}>{eq.place}</p>
                  <p style={{ color: "#475569" }}>Depth: {eq.depth_km?.toFixed(1)} km</p>
                  {eq.time && <p style={{ color: "#475569" }}>{format(new Date(eq.time), "MMM d, HH:mm UTC")}</p>}
                  <a href={eq.url} target="_blank" rel="noreferrer" style={{ color: "#60a5fa" }}>USGS →</a>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </LayerGroup>
        <LayerGroup>
          {eonetEvents.map((ev: any) => {
            if (!ev.coordinates || !Array.isArray(ev.coordinates)) return null;
            const [lon, lat] = ev.coordinates;
            if (typeof lat !== "number" || typeof lon !== "number") return null;
            const cat = ev.categories?.[0] ?? "default";
            const color = EONET_COLORS[cat] ?? EONET_COLORS["default"];
            return (
              <CircleMarker key={ev.id} center={[lat, lon]} radius={9}
                pathOptions={{ color, fillColor: color, fillOpacity: 0.6, weight: 2, dashArray: "4,2" }}>
                <Popup>
                  <div style={{ fontFamily: "Inter, sans-serif", minWidth: 180, fontSize: 12 }}>
                    <p style={{ color: "#f1f5f9", fontWeight: 700, marginBottom: 4 }}>⚠️ {ev.title}</p>
                    <p style={{ color: "#94a3b8" }}>{ev.categories?.join(", ")}</p>
                    <p style={{ color: "#60a5fa" }}>NASA EONET</p>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </LayerGroup>
      </MapContainer>
      {/* Risk score overlay */}
      {riskScore !== undefined && riskScore !== null && (
        <div className="absolute top-3 right-3 z-[1000] px-3 py-2 rounded-xl"
          style={{ background: "rgba(10,15,30,0.95)", border: "1px solid rgba(59,130,246,0.3)", backdropFilter: "blur(10px)" }}>
          <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Risk Score</p>
          <p className="text-2xl font-bold font-display"
            style={{ color: riskScore >= 75 ? "#ef4444" : riskScore >= 50 ? "#f59e0b" : "#10b981" }}>
            {riskScore}
          </p>
          <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>/ 100</p>
        </div>
      )}
      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] px-3 py-2 rounded-xl"
        style={{ background: "rgba(10,15,30,0.92)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(10px)" }}>
        <div className="space-y-1">
          {[{ color: "#ef4444", label: "M7+ Earthquake" }, { color: "#f59e0b", label: "M4.5+ Earthquake" }, { color: "#a78bfa", label: "EONET Event" }].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: color }} />
              <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
