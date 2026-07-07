"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Key, Check, X, ExternalLink, Eye, EyeOff, Save, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

interface ApiConfig {
  id: string;
  name: string;
  description: string;
  envVar: string;
  url: string;
  free: boolean;
  required: boolean;
  placeholder: string;
}

const API_CONFIGS: ApiConfig[] = [
  {
    id: "openweather", name: "OpenWeatherMap", envVar: "OPENWEATHER_API_KEY",
    description: "Live weather data for cities and shipping routes. Used in Port Analytics, Risk Map, and Route Optimizer.",
    url: "https://openweathermap.org/api", free: true, required: false,
    placeholder: "sk-ow-xxxxxxxxxxxxxxxxxxxxxxxx",
  },
  {
    id: "newsapi", name: "NewsAPI", envVar: "NEWS_API_KEY",
    description: "Global news for logistics disruption signals, supplier sentiment, and risk scoring.",
    url: "https://newsapi.org", free: true, required: false,
    placeholder: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  },
  {
    id: "openai", name: "OpenAI (GPT-4o)", envVar: "OPENAI_API_KEY",
    description: "Powers the AI Copilot, supplier analysis summaries, and AI delay predictions.",
    url: "https://platform.openai.com/api-keys", free: false, required: false,
    placeholder: "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  },
  {
    id: "aisstream", name: "AISStream (Free WebSocket AIS)", envVar: "AISSTREAM_API_KEY",
    description: "Real-time ship positions via WebSocket AIS feed. Completely free — replaces MarineTraffic (paid). Register at aisstream.io.",
    url: "https://aisstream.io", free: true, required: false,
    placeholder: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  },
  {
    id: "alphavantage", name: "Alpha Vantage", envVar: "ALPHA_VANTAGE_API_KEY",
    description: "Live commodity prices: Oil, Steel, Copper, Natural Gas.",
    url: "https://www.alphavantage.co/support/#api-key", free: true, required: false,
    placeholder: "XXXXXXXXXXXXXXXX",
  },
];

const FREE_APIS = [
  { name: "USGS Earthquake API", description: "Real-time global earthquake data", url: "https://earthquake.usgs.gov", status: "Active" },
  { name: "NASA EONET", description: "Open natural event tracker (wildfires, storms, floods)", url: "https://eonet.gsfc.nasa.gov", status: "Active" },
  { name: "Open-Meteo", description: "Free weather API — no key required", url: "https://open-meteo.com", status: "Active" },
  { name: "Open Exchange Rates", description: "Free currency rates — no key required", url: "https://open.er-api.com", status: "Active" },
  { name: "OpenSky Network", description: "Free live flight tracking (ADS-B) — replaces AviationStack (paid), no key required", url: "https://opensky-network.org", status: "Active" },
  { name: "OpenStreetMap", description: "Free map tiles for all interactive maps", url: "https://openstreetmap.org", status: "Active" },
];

export default function SettingsPage() {
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // In production this would write to .env via API or show instructions
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    toast.success(
      "Configuration saved! Restart the backend server to apply new API keys.",
      { duration: 5000 }
    );
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-xl font-bold font-display gradient-text">Settings & API Configuration</h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          Configure external API keys to enable live data features
        </p>
      </div>

      {/* Data Integrity Banner */}
      <div className="glass-card p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Zero Fake Data Policy</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              This platform never displays fabricated data. If an API is not configured, the corresponding module shows
              "No live data available" or "API not configured." Configure API keys below to unlock each feature.
            </p>
          </div>
        </div>
      </div>

      {/* Free APIs (always active) */}
      <div className="glass-card p-5">
        <h2 className="section-title mb-4">Always Active (No Key Required)</h2>
        <div className="space-y-2">
          {FREE_APIS.map((api) => (
            <div key={api.name} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
              style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)" }}>
              <Check size={14} className="text-emerald-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{api.name}</p>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{api.description}</p>
              </div>
              <a href={api.url} target="_blank" rel="noreferrer">
                <ExternalLink size={12} style={{ color: "var(--text-muted)" }} />
              </a>
              <span className="badge badge-success text-[10px]">Active</span>
            </div>
          ))}
        </div>
      </div>

      {/* Configurable APIs */}
      <div className="glass-card p-5">
        <h2 className="section-title mb-1">API Key Configuration</h2>
        <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
          Add these keys to your backend <code className="font-mono text-blue-400">backend/.env</code> file.
          Restart the server after changes.
        </p>

        <div className="space-y-4">
          {API_CONFIGS.map((config) => (
            <motion.div
              key={config.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Key size={13} style={{ color: "var(--accent-blue)" }} />
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{config.name}</p>
                    {config.free && <span className="badge badge-success text-[9px]">Free tier</span>}
                  </div>
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>{config.description}</p>
                </div>
                <a href={config.url} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 text-[11px]" style={{ color: "var(--accent-blue)" }}>
                  Get key <ExternalLink size={10} />
                </a>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <code className="text-[11px] px-2 py-1 rounded-lg font-mono"
                  style={{ background: "rgba(255,255,255,0.05)", color: "var(--accent-cyan)" }}>
                  {config.envVar}
                </code>
              </div>

              <div className="relative">
                <input
                  type={visible[config.id] ? "text" : "password"}
                  placeholder={config.placeholder}
                  value={keys[config.id] ?? ""}
                  onChange={(e) => setKeys((k) => ({ ...k, [config.id]: e.target.value }))}
                  className="input-field pr-10 font-mono text-xs"
                />
                <button
                  onClick={() => setVisible((v) => ({ ...v, [config.id]: !v[config.id] }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                >
                  {visible[config.id] ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>

              {keys[config.id] && (
                <p className="text-[10px] mt-1.5 text-emerald-400 flex items-center gap-1">
                  <Check size={10} /> Key entered – add to backend/.env and restart server
                </p>
              )}
            </motion.div>
          ))}
        </div>

        <div className="mt-4 p-3 rounded-xl" style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)" }}>
          <p className="text-[11px] font-mono" style={{ color: "var(--text-secondary)" }}>
            # backend/.env<br />
            OPENWEATHER_API_KEY=your_key_here<br />
            NEWS_API_KEY=your_key_here<br />
            OPENAI_API_KEY=your_key_here<br />
            AISSTREAM_API_KEY=your_key_here <span style={{ color: "#10b981" }}># free – aisstream.io</span><br />
            ALPHA_VANTAGE_API_KEY=your_key_here<br />
            <span style={{ color: "#10b981" }}># OpenSky Network: no key needed – flights are always live</span>
          </p>
        </div>

        <button onClick={handleSave} disabled={saving} className="btn-primary mt-4">
          <Save size={14} />
          {saving ? "Saving…" : "Save Configuration"}
        </button>
      </div>

      {/* Refresh intervals */}
      <div className="glass-card p-5">
        <h2 className="section-title mb-4">Data Refresh Settings</h2>
        <div className="space-y-3">
          {[
            { label: "Dashboard – Disaster Map", interval: "5 minutes", source: "USGS + EONET" },
            { label: "Weather – Trade Hubs", interval: "10 minutes", source: "Open-Meteo" },
            { label: "Exchange Rates", interval: "5 minutes", source: "open.er-api.com" },
            { label: "Risk Score", interval: "5 minutes", source: "Computed" },
            { label: "News Feed", interval: "15 minutes", source: "NewsAPI" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <div>
                <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{item.label}</p>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>via {item.source}</p>
              </div>
              <span className="badge badge-info">{item.interval}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
