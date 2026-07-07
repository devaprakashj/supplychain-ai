"use client";
import { motion } from "framer-motion";
import { Flame, CloudLightning, Waves, Mountain, Wind } from "lucide-react";
import NoDataCard from "@/components/ui/NoDataCard";
import { format } from "date-fns";

interface DisastersListProps {
  data: any;
  loading: boolean;
  error: string | null;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "Wildfires":         <Flame size={12} />,
  "Severe Storms":     <CloudLightning size={12} />,
  "Tropical Cyclones": <Wind size={12} />,
  "Floods":            <Waves size={12} />,
  "Volcanoes":         <Mountain size={12} />,
};

const CATEGORY_COLORS: Record<string, string> = {
  "Wildfires":         "#f97316",
  "Severe Storms":     "#f59e0b",
  "Tropical Cyclones": "#ef4444",
  "Floods":            "#06b6d4",
  "Volcanoes":         "#dc2626",
};

export default function DisastersList({ data, loading, error }: DisastersListProps) {
  if (loading) {
    return <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>;
  }
  if (error) return <NoDataCard reason={error} compact />;
  if (!data?.events?.length) return <NoDataCard reason="No active natural events" compact />;

  const events = data.events.slice(0, 10);

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
      {events.map((ev: any, i: number) => {
        const category = ev.categories?.[0] ?? "Unknown";
        const color = CATEGORY_COLORS[category] ?? "#a78bfa";
        const icon = CATEGORY_ICONS[category] ?? <CloudLightning size={12} />;
        return (
          <motion.div
            key={ev.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-start gap-3 px-3 py-2.5 rounded-xl"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: `${color}18`, color }}>
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>{ev.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px]" style={{ color }}>{category}</span>
                {ev.date && (
                  <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                    {format(new Date(ev.date), "MMM d")}
                  </span>
                )}
              </div>
              {ev.sources?.length > 0 && (
                <a href={ev.sources[0]} target="_blank" rel="noreferrer"
                  className="text-[10px]" style={{ color: "var(--accent-blue)" }}>
                  View source →
                </a>
              )}
            </div>
          </motion.div>
        );
      })}
      <p className="text-[10px] pt-1" style={{ color: "var(--text-muted)" }}>
        {data.count} total events · Source: NASA EONET
      </p>
    </div>
  );
}
