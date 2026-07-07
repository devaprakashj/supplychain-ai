"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Port coordinates lookup
const PORT_COORDS: Record<string, [number, number]> = {
  "Shanghai, China": [31.22, 121.48],
  "Rotterdam, Netherlands": [51.92, 4.48],
  "Singapore": [1.26, 103.82],
  "Los Angeles, USA": [33.73, -118.27],
  "Hamburg, Germany": [53.54, 9.99],
  "Dubai, UAE": [24.99, 55.06],
  "Hong Kong, China": [22.30, 114.17],
  "Busan, South Korea": [35.10, 129.04],
  "Antwerp, Belgium": [51.22, 4.40],
  "Mumbai, India": [18.95, 72.94],
};

// Fix Leaflet marker icons in Next.js
const createIcon = (color: string) => L.divIcon({
  className: "",
  html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 8px ${color}80;"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

interface RouteMapClientProps {
  origin: string;
  destination: string;
}

export default function RouteMapClient({ origin, destination }: RouteMapClientProps) {
  const originCoords = PORT_COORDS[origin];
  const destCoords   = PORT_COORDS[destination];

  const center: [number, number] = originCoords && destCoords
    ? [(originCoords[0] + destCoords[0]) / 2, (originCoords[1] + destCoords[1]) / 2]
    : [20, 0];

  return (
    <div className="rounded-xl overflow-hidden h-64 w-full">
      <MapContainer center={center} zoom={3} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
        />
        {originCoords && (
          <Marker position={originCoords} icon={createIcon("#3b82f6")}>
            <Popup>
              <div style={{ fontFamily: "Inter, sans-serif" }}>
                <p style={{ color: "#3b82f6", fontWeight: 700, fontSize: 12 }}>📍 Origin</p>
                <p style={{ color: "#f1f5f9", fontSize: 11 }}>{origin}</p>
              </div>
            </Popup>
          </Marker>
        )}
        {destCoords && (
          <Marker position={destCoords} icon={createIcon("#10b981")}>
            <Popup>
              <div style={{ fontFamily: "Inter, sans-serif" }}>
                <p style={{ color: "#10b981", fontWeight: 700, fontSize: 12 }}>🏁 Destination</p>
                <p style={{ color: "#f1f5f9", fontSize: 11 }}>{destination}</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
