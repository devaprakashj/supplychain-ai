"use client";
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface PortsMapClientProps {
  ports: any[];
}

const RISK_COLORS: Record<string, string> = {
  Low: "#10b981",
  Moderate: "#f59e0b",
  Severe: "#ef4444",
  Unknown: "#6b7280",
};

export default function PortsMapClient({ ports }: PortsMapClientProps) {
  return (
    <div className="rounded-xl overflow-hidden h-64 w-full">
      <MapContainer center={[20, 0]} zoom={2} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
        />
        {ports.map((port) => {
          const color = RISK_COLORS[port.weather_risk] ?? "#6b7280";
          const w = port.weather ?? {};
          return (
            <CircleMarker
              key={port.name}
              center={[port.lat, port.lon]}
              radius={10}
              pathOptions={{ color, fillColor: color, fillOpacity: 0.7, weight: 2 }}
            >
              <Tooltip permanent={false} direction="top">
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "#f1f5f9" }}>
                  {port.name}
                </span>
              </Tooltip>
              <Popup>
                <div style={{ fontFamily: "Inter, sans-serif", minWidth: 160 }}>
                  <p style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
                    ⚓ {port.name}
                  </p>
                  <p style={{ color: "#94a3b8", fontSize: 11 }}>{port.country}</p>
                  {!w.error && (
                    <>
                      <p style={{ color: "#94a3b8", fontSize: 11, marginTop: 4 }}>
                        🌡 {w.temp_c?.toFixed(0)}°C · 💨 {w.wind_speed_ms?.toFixed(1)} m/s
                      </p>
                      <p style={{ color: "#94a3b8", fontSize: 11 }}>{w.description}</p>
                    </>
                  )}
                  <p style={{ color, fontSize: 11, fontWeight: 600, marginTop: 4 }}>
                    Risk: {port.weather_risk}
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
