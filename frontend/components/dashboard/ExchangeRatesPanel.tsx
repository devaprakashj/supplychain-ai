"use client";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import NoDataCard from "@/components/ui/NoDataCard";

interface ExchangeRatesPanelProps {
  data: any;
  loading: boolean;
  error: string | null;
}

const KEY_CURRENCIES = [
  { code: "EUR", name: "Euro", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", flag: "🇬🇧" },
  { code: "JPY", name: "Japanese Yen", flag: "🇯🇵" },
  { code: "CNY", name: "Chinese Yuan", flag: "🇨🇳" },
  { code: "INR", name: "Indian Rupee", flag: "🇮🇳" },
  { code: "AUD", name: "Australian Dollar", flag: "🇦🇺" },
  { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦" },
  { code: "SGD", name: "Singapore Dollar", flag: "🇸🇬" },
  { code: "AED", name: "UAE Dirham", flag: "🇦🇪" },
  { code: "BRL", name: "Brazilian Real", flag: "🇧🇷" },
];

// Reference rates for approximate change calculation
const REF_RATES: Record<string, number> = {
  EUR: 0.92, GBP: 0.79, JPY: 149.0, CNY: 7.25, INR: 83.0,
  AUD: 1.53, CAD: 1.36, SGD: 1.34, AED: 3.67, BRL: 4.97,
};

export default function ExchangeRatesPanel({ data, loading, error }: ExchangeRatesPanelProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-10 rounded-xl" />)}
      </div>
    );
  }
  if (error) return <NoDataCard reason={error} />;
  if (!data?.rates) return <NoDataCard reason="No exchange rate data available" />;

  return (
    <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
      {KEY_CURRENCIES.map((cur, i) => {
        const rate = data.rates[cur.code];
        if (!rate) return null;
        const ref = REF_RATES[cur.code];
        const changePct = ref ? ((rate - ref) / ref) * 100 : 0;
        const isUp = changePct > 0;

        return (
          <motion.div
            key={cur.code}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center gap-3 px-3 py-2 rounded-xl"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
          >
            <span className="text-base w-5 flex-shrink-0">{cur.flag}</span>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{cur.code}</span>
              <span className="text-[10px] ml-1.5" style={{ color: "var(--text-muted)" }}>{cur.name}</span>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-xs font-mono font-semibold" style={{ color: "var(--text-primary)" }}>
                {rate.toFixed(4)}
              </span>
              <div className={`flex items-center gap-0.5 text-[10px] font-medium ${isUp ? "text-red-400" : "text-emerald-400"}`}>
                {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {Math.abs(changePct).toFixed(2)}%
              </div>
            </div>
          </motion.div>
        );
      })}
      <p className="text-[10px] pt-1" style={{ color: "var(--text-muted)" }}>
        1 USD = X · Updated: {data.time_last_update_utc?.split("T")[0]} · Source: open.er-api.com
      </p>
    </div>
  );
}
