"use client";
import { motion } from "framer-motion";
import { ExternalLink, Newspaper } from "lucide-react";
import NoDataCard from "@/components/ui/NoDataCard";
import { format } from "date-fns";

interface NewsPanelProps {
  data: any;
  loading: boolean;
  error: string | null;
}

export default function NewsPanel({ data, loading, error }: NewsPanelProps) {
  if (loading) {
    return <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>;
  }
  if (error) return <NoDataCard reason={error} compact />;

  if (!data?.configured) {
    return (
      <NoDataCard
        reason={data?.message || "NewsAPI key not configured."}
        configRequired={true}
        configUrl="/settings"
      />
    );
  }

  if (!data?.articles?.length) {
    return <NoDataCard reason="No logistics news available" compact />;
  }

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
      {data.articles.map((article: any, i: number) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="px-3 py-2.5 rounded-xl group cursor-pointer transition-colors"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div className="flex items-start gap-2">
            <Newspaper size={12} className="flex-shrink-0 mt-0.5" style={{ color: "var(--accent-blue)" }} />
            <div className="flex-1 min-w-0">
              <a href={article.url} target="_blank" rel="noreferrer" className="block">
                <p className="text-xs font-medium line-clamp-2 group-hover:text-blue-400 transition-colors"
                  style={{ color: "var(--text-primary)" }}>
                  {article.title}
                </p>
              </a>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-medium" style={{ color: "var(--accent-blue)" }}>
                  {article.source}
                </span>
                {article.published_at && (
                  <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                    {format(new Date(article.published_at), "MMM d")}
                  </span>
                )}
              </div>
            </div>
            <ExternalLink size={10} className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: "var(--text-muted)" }} />
          </div>
        </motion.div>
      ))}
      <p className="text-[10px] pt-1" style={{ color: "var(--text-muted)" }}>
        {data.total} total articles · Source: NewsAPI.org
      </p>
    </div>
  );
}
