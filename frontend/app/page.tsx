"use client";
import { motion } from "framer-motion";
import {
  Activity, AlertTriangle, Globe2, Zap, TrendingUp,
  Wind, Droplets, Thermometer, CloudLightning,
} from "lucide-react";
import { useFetch } from "@/hooks/useFetch";
import { api } from "@/lib/api/client";
import KPICard from "@/components/ui/KPICard";
import SectionHeader from "@/components/ui/SectionHeader";
import NoDataCard from "@/components/ui/NoDataCard";
import DisasterMap from "@/components/dashboard/DisasterMap";
import RiskScoreGauge from "@/components/dashboard/RiskScoreGauge";
import WeatherHubsPanel from "@/components/dashboard/WeatherHubsPanel";
import DisastersList from "@/components/dashboard/DisastersList";
import ExchangeRatesPanel from "@/components/dashboard/ExchangeRatesPanel";
import NewsPanel from "@/components/dashboard/NewsPanel";

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

const stagger = {
  container: { transition: { staggerChildren: 0.08 } },
  item: { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } },
};

export default function DashboardPage() {
  const riskFetch    = useFetch(() => api.risk.score(),       { refreshInterval: REFRESH_INTERVAL });
  const disasterFetch = useFetch(() => api.disasters.all(),  { refreshInterval: REFRESH_INTERVAL });
  const exchangeFetch = useFetch(() => api.exchange.rates(), { refreshInterval: REFRESH_INTERVAL });
  const weatherFetch  = useFetch(() => api.weather.tradeHubs(), { refreshInterval: REFRESH_INTERVAL });
  const newsFetch     = useFetch(() => api.news.logistics(10), { refreshInterval: REFRESH_INTERVAL });

  const risk      = riskFetch.data as any;
  const disasters = disasterFetch.data as any;
  const exchange  = exchangeFetch.data as any;
  const weather   = weatherFetch.data as any;
  const news      = newsFetch.data as any;

  // Derived KPI values from real data
  const earthquakeCount = disasters?.earthquakes?.count ?? null;
  const eonetCount      = disasters?.natural_events?.count ?? null;
  const riskScore       = risk?.global_risk_score ?? null;
  const riskLevel       = risk?.risk_level ?? null;
  const eurRate         = exchange?.rates?.EUR ?? null;
  const cnyRate         = exchange?.rates?.CNY ?? null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-display gradient-text">Supply Chain Intelligence</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Live data from USGS · NASA EONET · Open-Meteo · Open Exchange Rates
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
          style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)" }}>
          <span className="live-dot" />
          <span className="text-xs font-medium text-emerald-400">Live Dashboard</span>
        </div>
      </div>

      {/* KPI Cards — derived from live API data */}
      <motion.div
        variants={stagger.container}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        <KPICard
          title="Global Risk Score"
          value={riskScore}
          unit="/100"
          icon={<AlertTriangle size={16} />}
          accent={riskScore >= 75 ? "red" : riskScore >= 50 ? "amber" : riskScore >= 25 ? "amber" : "green"}
          loading={riskFetch.loading}
          error={riskFetch.error}
          source="USGS + EONET + Open-Meteo"
          badge={riskLevel}
          badgeColor={riskLevel === "Critical" ? "danger" : riskLevel === "High" ? "warning" : "success"}
        />
        <KPICard
          title="Active Earthquakes"
          value={earthquakeCount}
          unit="(M4.5+, 7d)"
          icon={<Activity size={16} />}
          accent="red"
          loading={disasterFetch.loading}
          error={disasterFetch.error}
          source="USGS"
        />
        <KPICard
          title="NASA EONET Events"
          value={eonetCount}
          unit="active"
          icon={<Globe2 size={16} />}
          accent="amber"
          loading={disasterFetch.loading}
          error={disasterFetch.error}
          source="NASA EONET"
        />
        <KPICard
          title="USD → EUR"
          value={eurRate ? eurRate.toFixed(4) : null}
          icon={<TrendingUp size={16} />}
          accent="cyan"
          loading={exchangeFetch.loading}
          error={exchangeFetch.error}
          source="Open Exchange Rates"
        />
        <KPICard
          title="USD → CNY"
          value={cnyRate ? cnyRate.toFixed(4) : null}
          icon={<TrendingUp size={16} />}
          accent="purple"
          loading={exchangeFetch.loading}
          error={exchangeFetch.error}
          source="Open Exchange Rates"
        />
        <KPICard
          title="Trade Hub Weather"
          value={weather?.count ?? null}
          unit="hubs monitored"
          icon={<Wind size={16} />}
          accent="blue"
          loading={weatherFetch.loading}
          error={weatherFetch.error}
          source="Open-Meteo"
        />
        <KPICard
          title="Data Coverage"
          value={risk?.data_coverage_pct ?? null}
          unit="%"
          icon={<Zap size={16} />}
          accent="green"
          loading={riskFetch.loading}
          error={riskFetch.error}
          source="Multi-source"
        />
        <KPICard
          title="News Signals"
          value={news?.configured ? (news?.total ?? null) : null}
          unit={news?.configured ? "articles" : undefined}
          icon={<CloudLightning size={16} />}
          accent="blue"
          loading={newsFetch.loading}
          error={newsFetch.error}
          source={news?.configured ? "NewsAPI" : undefined}
          badge={!news?.configured && !newsFetch.loading ? "Key Required" : undefined}
          badgeColor="warning"
        />
      </motion.div>

      {/* Risk Score + Disaster Map Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Risk Score Gauge */}
        <div className="glass-card p-5">
          <SectionHeader
            title="Global Risk Score"
            subtitle="Computed from live USGS + EONET + weather data"
            onRefresh={riskFetch.refetch}
            loading={riskFetch.loading}
            lastUpdated={riskFetch.lastUpdated}
          />
          <RiskScoreGauge data={risk} loading={riskFetch.loading} error={riskFetch.error} />
        </div>

        {/* Interactive Disaster Map */}
        <div className="glass-card p-5 xl:col-span-2">
          <SectionHeader
            title="Live Disaster Map"
            subtitle="Real-time USGS earthquakes + NASA EONET natural events"
            onRefresh={disasterFetch.refetch}
            loading={disasterFetch.loading}
            lastUpdated={disasterFetch.lastUpdated}
          />
          <DisasterMap data={disasters} loading={disasterFetch.loading} error={disasterFetch.error} />
        </div>
      </div>

      {/* Weather + Exchange Rates Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <SectionHeader
            title="Trade Hub Weather"
            subtitle="Live weather at top global shipping ports (Open-Meteo)"
            onRefresh={weatherFetch.refetch}
            loading={weatherFetch.loading}
            lastUpdated={weatherFetch.lastUpdated}
          />
          <WeatherHubsPanel data={weather} loading={weatherFetch.loading} error={weatherFetch.error} />
        </div>
        <div className="glass-card p-5">
          <SectionHeader
            title="Live Exchange Rates"
            subtitle="Key trade currencies vs USD (open.er-api.com)"
            onRefresh={exchangeFetch.refetch}
            loading={exchangeFetch.loading}
            lastUpdated={exchangeFetch.lastUpdated}
          />
          <ExchangeRatesPanel data={exchange} loading={exchangeFetch.loading} error={exchangeFetch.error} />
        </div>
      </div>

      {/* Active Disasters + News Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <SectionHeader
            title="Active Disaster Events"
            subtitle="NASA EONET open events"
            onRefresh={disasterFetch.refetch}
            loading={disasterFetch.loading}
          />
          <DisastersList data={disasters?.natural_events} loading={disasterFetch.loading} error={disasterFetch.error} />
        </div>
        <div className="glass-card p-5">
          <SectionHeader
            title="Logistics News"
            subtitle={news?.configured ? `${news?.total ?? 0} articles from NewsAPI` : "NewsAPI not configured"}
            onRefresh={newsFetch.refetch}
            loading={newsFetch.loading}
          />
          <NewsPanel data={news} loading={newsFetch.loading} error={newsFetch.error} />
        </div>
      </div>
    </div>
  );
}
