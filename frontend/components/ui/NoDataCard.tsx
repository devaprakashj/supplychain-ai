"use client";
import { motion } from "framer-motion";
import { AlertCircle, WifiOff, Settings } from "lucide-react";
import Link from "next/link";

interface NoDataCardProps {
  reason?: string;
  configRequired?: boolean;
  configUrl?: string;
  height?: string;
  compact?: boolean;
}

export default function NoDataCard({
  reason,
  configRequired = false,
  configUrl = "/settings",
  height = "h-32",
  compact = false,
}: NoDataCardProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 py-4 px-3">
        <WifiOff size={14} className="text-slate-500 flex-shrink-0" />
        <p className="text-xs text-slate-500">{reason || "No live data available"}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`no-data-card ${height}`}
    >
      <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
        {configRequired ? (
          <Settings size={18} style={{ color: "var(--text-muted)" }} />
        ) : (
          <WifiOff size={18} style={{ color: "var(--text-muted)" }} />
        )}
      </div>
      <div>
        <p className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
          {configRequired ? "API Not Configured" : "No Live Data Available"}
        </p>
        {reason && (
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            {reason}
          </p>
        )}
      </div>
      {configRequired && (
        <Link href={configUrl}>
          <button className="btn-primary text-xs py-2 px-3">
            <Settings size={12} />
            Configure API Key
          </button>
        </Link>
      )}
    </motion.div>
  );
}
