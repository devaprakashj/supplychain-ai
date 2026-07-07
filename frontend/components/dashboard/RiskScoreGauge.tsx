"use client";
import { motion } from "framer-motion";
import NoDataCard from "@/components/ui/NoDataCard";

interface RiskScoreGaugeProps {
  data: any;
  loading: boolean;
  error: string | null;
}

export default function RiskScoreGauge({ data, loading, error }: RiskScoreGaugeProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="skeleton w-40 h-40 rounded-full" />
        <div className="w-full space-y-2">
          {[1,2,3].map(i => <div key={i} className="skeleton h-10 rounded-xl" />)}
        </div>
      </div>
    );
  }
  if (error) return <NoDataCard reason={error} />;
  if (!data) return <NoDataCard reason="No live data available" />;

  const score = data.global_risk_score ?? 0;
  const level = data.risk_level ?? "Unknown";
  const factors = data.factors ?? [];

  const levelColors: Record<string, string> = {
    Low: "#10b981", Moderate: "#f59e0b", High: "#f97316", Critical: "#ef4444", Unknown: "#6b7280",
  };
  const color = levelColors[level] ?? "#6b7280";

  // SVG gauge
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference * 0.75; // 270 degree arc
  const dashOffset = circumference - filled;

  return (
    <div className="space-y-4">
      {/* Circular gauge */}
      <div className="flex flex-col items-center">
        <div className="relative w-36 h-36">
          <svg viewBox="0 0 140 140" className="w-full h-full -rotate-[135deg]">
            {/* Background arc */}
            <circle cx="70" cy="70" r={radius} fill="none" strokeWidth="10"
              stroke="rgba(255,255,255,0.06)"
              strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
              strokeLinecap="round"
            />
            {/* Score arc */}
            <motion.circle
              cx="70" cy="70" r={radius} fill="none" strokeWidth="10"
              stroke={color}
              strokeDasharray={`${filled} ${circumference - filled + circumference * 0.25}`}
              strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 8px ${color}60)` }}
              initial={{ strokeDasharray: `0 ${circumference}` }}
              animate={{ strokeDasharray: `${filled} ${circumference - filled + circumference * 0.25}` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-3xl font-bold font-display"
              style={{ color }}
            >
              {score}
            </motion.span>
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              {level}
            </span>
          </div>
        </div>
        <p className="text-xs mt-2 text-center" style={{ color: "var(--text-muted)" }}>
          {data.data_coverage_pct}% data coverage
        </p>
      </div>

      {/* Factor breakdown */}
      <div className="space-y-2">
        {factors.map((f: any, i: number) => (
          <motion.div
            key={f.factor}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="p-3 rounded-xl"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{f.factor}</span>
              {f.data_available ? (
                <span className="text-xs font-bold" style={{ color: f.score >= 75 ? "#ef4444" : f.score >= 50 ? "#f59e0b" : "#10b981" }}>
                  {f.score}/100
                </span>
              ) : (
                <span className="badge badge-warning">No data</span>
              )}
            </div>
            {f.data_available && (
              <div className="progress-bar">
                <motion.div
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${f.score}%` }}
                  transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                  style={{
                    background: f.score >= 75 ? "linear-gradient(90deg,#f97316,#ef4444)"
                      : f.score >= 50 ? "linear-gradient(90deg,#f59e0b,#f97316)"
                      : "linear-gradient(90deg,#10b981,#06b6d4)",
                  }}
                />
              </div>
            )}
            <p className="text-[10px] mt-1.5 line-clamp-2" style={{ color: "var(--text-muted)" }}>{f.detail}</p>
            <p className="text-[10px] mt-0.5" style={{ color: "var(--accent-blue)" }}>↗ {f.source}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
