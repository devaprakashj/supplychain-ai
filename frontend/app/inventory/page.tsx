"use client";
import { useFetch } from "@/hooks/useFetch";
import { api } from "@/lib/api/client";
import SectionHeader from "@/components/ui/SectionHeader";
import NoDataCard from "@/components/ui/NoDataCard";
import { motion } from "framer-motion";
import { Package, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";

// Commodity-driven inventory signals
export default function InventoryPage() {
  const commodityFetch = useFetch(() => api.commodities.prices());
  const exchangeFetch  = useFetch(() => api.exchange.rates());
  const disasterFetch  = useFetch(() => api.disasters.all());

  const commodities = commodityFetch.data as any;
  const exchange    = exchangeFetch.data as any;
  const disasters   = disasterFetch.data as any;

  const activeCyclones = (disasters?.natural_events?.events ?? []).filter((e: any) =>
    e.categories?.includes("Tropical Cyclones")
  ).length;
  const activeWildfires = (disasters?.natural_events?.events ?? []).filter((e: any) =>
    e.categories?.includes("Wildfires")
  ).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold font-display gradient-text">Inventory Intelligence</h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          Commodity-driven demand signals · Disaster-based supply risk · Live exchange rates
        </p>
      </div>

      {/* Live supply signals */}
      <div className="glass-card p-5">
        <SectionHeader title="Live Supply Risk Signals" subtitle="Derived from real NASA EONET + USGS data" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              label: "Active Cyclones",
              value: disasterFetch.loading ? null : activeCyclones,
              unit: "events",
              icon: <AlertTriangle size={16} />,
              color: activeCyclones > 0 ? "#ef4444" : "#10b981",
              risk: activeCyclones > 0 ? "Supply disruption risk" : "No cyclone disruption",
              source: "NASA EONET",
            },
            {
              label: "Active Wildfires",
              value: disasterFetch.loading ? null : activeWildfires,
              unit: "events",
              icon: <Package size={16} />,
              color: activeWildfires > 5 ? "#f59e0b" : "#10b981",
              risk: activeWildfires > 5 ? "Agricultural supply risk" : "Nominal wildfire activity",
              source: "NASA EONET",
            },
            {
              label: "Currencies vs USD",
              value: exchangeFetch.loading ? null : Object.keys(exchange?.rates ?? {}).length,
              unit: "tracked",
              icon: <TrendingUp size={16} />,
              color: "#06b6d4",
              risk: "Import cost analysis available",
              source: "open.er-api.com",
            },
          ].map((sig) => (
            <div key={sig.label} className="p-4 rounded-xl"
              style={{ background: `${sig.color}08`, border: `1px solid ${sig.color}20` }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: `${sig.color}18`, color: sig.color }}>
                  {sig.icon}
                </div>
                <p className="text-[11px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{sig.label}</p>
              </div>
              {sig.value === null ? (
                <div className="skeleton h-7 w-16 rounded mb-1" />
              ) : (
                <p className="text-2xl font-bold font-display mb-1" style={{ color: sig.color }}>{sig.value}</p>
              )}
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{sig.unit}</p>
              <p className="text-[11px] mt-2" style={{ color: "var(--text-secondary)" }}>{sig.risk}</p>
              <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>Source: {sig.source}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Commodities panel */}
      <div className="glass-card p-5">
        <SectionHeader title="Commodity Prices" subtitle="Affects raw material inventory costs" />
        {commodityFetch.loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
          </div>
        ) : commodities && !commodities.configured ? (
          <NoDataCard
            reason={commodities.message}
            configRequired={true}
            configUrl="/settings"
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {(commodities?.commodities ?? []).map((c: any) => (
              <div key={c.name} className="p-3 rounded-xl"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{c.name}</p>
                {c.price_usd ? (
                  <p className="text-base font-bold mt-1" style={{ color: "var(--accent-cyan)" }}>
                    ${parseFloat(c.price_usd).toFixed(2)}
                  </p>
                ) : (
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>No price data</p>
                )}
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Alpha Vantage</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Exchange rate impact on import costs */}
      <div className="glass-card p-5">
        <SectionHeader title="Import Cost Impact" subtitle="Currency movements affecting inventory procurement costs · open.er-api.com" />
        {exchangeFetch.loading ? (
          <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-10 rounded-xl" />)}</div>
        ) : exchangeFetch.error ? (
          <NoDataCard reason={exchangeFetch.error} compact />
        ) : (
          <div className="space-y-2">
            {[
              { currency: "CNY", name: "China imports", flag: "🇨🇳" },
              { currency: "EUR", name: "European suppliers", flag: "🇪🇺" },
              { currency: "JPY", name: "Japan components", flag: "🇯🇵" },
              { currency: "INR", name: "India manufacturing", flag: "🇮🇳" },
            ].map(({ currency, name, flag }) => {
              const rate = exchange?.rates?.[currency];
              return (
                <div key={currency} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <span className="text-base">{flag}</span>
                  <div className="flex-1">
                    <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{name}</p>
                    <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>1 USD = {rate?.toFixed(4) ?? "—"} {currency}</p>
                  </div>
                  <span className="badge badge-info text-[10px]">Live Rate</span>
                </div>
              );
            })}
            <p className="text-[10px] pt-1" style={{ color: "var(--text-muted)" }}>Source: open.er-api.com</p>
          </div>
        )}
      </div>
    </div>
  );
}
