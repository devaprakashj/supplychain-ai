"use client";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { format } from "date-fns";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  loading?: boolean;
  lastUpdated?: Date | null;
  actions?: React.ReactNode;
}

export default function SectionHeader({
  title, subtitle, onRefresh, loading, lastUpdated, actions,
}: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-5">
      <div>
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="section-subtitle mt-0.5">{subtitle}</p>}
        {lastUpdated && (
          <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>
            Last updated: {format(lastUpdated, "HH:mm:ss")}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {actions}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="btn-secondary py-2 px-3 text-xs"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            {!loading ? "Refresh" : "Loading…"}
          </button>
        )}
      </div>
    </div>
  );
}
