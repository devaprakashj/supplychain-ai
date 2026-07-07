"use client";
import { MapContainer, TileLayer, CircleMarker, Popup, LayerGroup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { format } from "date-fns";

interface DisasterMapClientProps {
  data: any;
}

const CATEGORY_COLORS: Record<string, string> = {
  "Severe Storms":       "#f59e0b",
  "Tropical Cyclones":   "#ef4444",
  "Wildfires":           "#f97316",
  "Floods":              "#06b6d4",
  "Volcanoes":           "#dc2626",
  "Sea and Lake Ice":    "#818cf8",
  "Drought":             "#d97706",
  "default":             "#a78bfa",
};

function getEqColor(mag: number): string {
  if (mag >= 7)   return "#ef4444";
  if (mag >= 6)   return "#f97316";
  if (mag >= 5)   return "#f59e0b";
  return "#fbbf24";
}

function getEqRadius(mag: number): number {
  return Math.max(4, (mag - 3) * 4);
}

export default function DisasterMapClient({ data }: DisasterMapClientProps) {
  const earthquakes = data?.earthquakes?.events ?? [];
  const eonetEvents = data?.natural_events?.events ?? [];

  return (
    <div className="rounded-xl overflow-hidden h-72 w-full">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
        />

        {/* USGS Earthquakes */}
        <LayerGroup>
          {earthquakes.map((eq: any) => (
            <CircleMarker
              key={eq.id}
              center={[eq.latitude, eq.longitude]}
              radius={getEqRadius(eq.magnitude)}
              pathOptions={{
                color: getEqColor(eq.magnitude),
                fillColor: getEqColor(eq.magnitude),
                fillOpacity: 0.7,
                weight: 1,
              }}
            >
              <Popup>
                <div style={{ minWidth: 180, fontFamily: "Inter, sans-serif" }}>
                  <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
                    🌍 Earthquake M{eq.magnitude}
                  </div>
                  <p style={{ color: "#94a3b8", fontSize: 11, marginBottom: 4 }}>{eq.place}</p>
                  <p style={{ color: "#475569", fontSize: 10 }}>
                    Depth: {eq.depth_km?.toFixed(1)} km
                  </p>
                  <p style={{ color: "#475569", fontSize: 10 }}>
                    {eq.time ? format(new Date(eq.time), "MMM d, HH:mm") : ""}
                  </p>
                  <a
                    href={eq.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "#60a5fa", fontSize: 10, textDecoration: "none" }}
                  >
                    USGS Details →
                  </a>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </LayerGroup>

        {/* NASA EONET Events */}
        <LayerGroup>
          {eonetEvents.map((ev: any) => {
            if (!ev.coordinates || !Array.isArray(ev.coordinates)) return null;
            const [lon, lat] = ev.coordinates;
            if (typeof lat !== "number" || typeof lon !== "number") return null;
            const category = ev.categories?.[0] ?? "default";
            const color = CATEGORY_COLORS[category] ?? CATEGORY_COLORS["default"];
            return (
              <CircleMarker
                key={ev.id}
                center={[lat, lon]}
                radius={8}
                pathOptions={{ color, fillColor: color, fillOpacity: 0.6, weight: 2, dashArray: "4,2" }}
              >
                <Popup>
                  <div style={{ minWidth: 180, fontFamily: "Inter, sans-serif" }}>
                    <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
                      ⚠️ {ev.title}
                    </div>
                    <p style={{ color: "#94a3b8", fontSize: 11, marginBottom: 4 }}>
                      {ev.categories?.join(", ")}
                    </p>
                    {ev.date && (
                      <p style={{ color: "#475569", fontSize: 10 }}>
                        {format(new Date(ev.date), "MMM d, yyyy")}
                      </p>
                    )}
                    <p style={{ color: "#60a5fa", fontSize: 10 }}>NASA EONET</p>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </LayerGroup>
      </MapContainer>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#ef4444" }} />
          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>M7+ Earthquake</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#f59e0b" }} />
          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>M4.5+ Earthquake</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full border border-dashed" style={{ background: "#f97316", borderColor: "#f97316" }} />
          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>EONET Event</span>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
            {data?.earthquakes?.count ?? 0} earthquakes · {data?.natural_events?.count ?? 0} events
          </span>
        </div>
      </div>
    </div>
  );
}
