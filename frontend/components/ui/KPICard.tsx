"use client";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react";
import { clsx } from "clsx";

interface KPICardProps {
  title: string;
  value: string | number | null;
  unit?: string;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  accent?: "blue" | "purple" | "cyan" | "green" | "amber" | "red";
  loading?: boolean;
  error?: string | null;
  source?: string;
  badge?: string;
  badgeColor?: "success" | "warning" | "danger" | "info";
}

const ACCENT_STYLES = {
  blue:   { gradient: "from-blue-500/20 to-blue-600/5",   text: "#60a5fa", glow: "rgba(59,130,246,0.15)"   },
  purple: { gradient: "from-purple-500/20 to-purple-600/5", text: "#a78bfa", glow: "rgba(139,92,246,0.15)"  },
  cyan:   { gradient: "from-cyan-500/20 to-cyan-600/5",   text: "#22d3ee", glow: "rgba(6,182,212,0.15)"    },
  green:  { gradient: "from-emerald-500/20 to-emerald-600/5", text: "#34d399", glow: "rgba(16,185,129,0.15)" },
  amber:  { gradient: "from-amber-500/20 to-amber-600/5", text: "#fbbf24", glow: "rgba(245,158,11,0.15)"   },
  red:    { gradient: "from-red-500/20 to-red-600/5",     text: "#f87171", glow: "rgba(239,68,68,0.15)"    },
};

export default function KPICard({
  title, value, unit, change, changeLabel, icon, accent = "blue",
  loading, error, source, badge, badgeColor = "info",
}: KPICardProps) {
  const style = ACCENT_STYLES[accent];

  return (
    <motion.div
      className="kpi-card flex flex-col gap-3"
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            {title}
          </p>
          {badge && (
            <span className={`badge badge-${badgeColor} mt-1`}>{badge}</span>
          )}
        </div>
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br ${style.gradient}`}
          style={{ boxShadow: `0 0 16px ${style.glow}`, color: style.text }}
        >
          {icon}
        </div>
      </div>

      {/* Value */}
      <div className="flex-1">
        {loading ? (
          <div className="space-y-2">
            <div className="skeleton h-8 w-24 rounded-lg" />
            <div className="skeleton h-3 w-16 rounded" />
          </div>
        ) : error ? (
          <div className="flex items-center gap-1.5">
            <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
            <p className="text-xs text-red-400 line-clamp-2">Error loading data</p>
          </div>
        ) : value === null || value === undefined ? (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>No live data available</p>
        ) : (
          <div className="flex items-baseline gap-1">
            <motion.span
              key={String(value)}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold font-display"
              style={{ color: "var(--text-primary)" }}
            >
              {typeof value === "number" ? value.toLocaleString() : value}
            </motion.span>
            {unit && <span className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>{unit}</span>}
          </div>
        )}
      </div>

      {/* Change indicator */}
      {!loading && !error && change !== undefined && (
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-1 text-xs font-medium ${
            change > 0 ? "text-emerald-400" : change < 0 ? "text-red-400" : "text-slate-400"
          }`}>
            {change > 0 ? <TrendingUp size={11} /> : change < 0 ? <TrendingDown size={11} /> : <Minus size={11} />}
            <span>{change > 0 ? "+" : ""}{change.toFixed(1)}%</span>
            {changeLabel && <span style={{ color: "var(--text-muted)" }}>· {changeLabel}</span>}
          </div>
          {source && (
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              via {source}
            </p>
          )}
        </div>
      )}

      {source && (change === undefined) && !loading && !error && (
        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Source: {source}</p>
      )}
    </motion.div>
  );
}
