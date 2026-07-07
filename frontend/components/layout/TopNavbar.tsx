"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, ChevronDown, Sun, Moon, Building, RefreshCw, X } from "lucide-react";
import { useSidebar } from "./SidebarContext";

const COMPANIES = ["Acme Logistics Corp", "Global Trade Co", "Maritime Partners Ltd"];

const MOCK_NOTIFICATIONS = [
  { id: 1, type: "warning", title: "Port Congestion Alert", message: "Rotterdam port reports 40% above average wait times.", time: "2 min ago" },
  { id: 2, type: "danger",  title: "Severe Weather Warning", message: "Typhoon track intersects Singapore shipping lane.", time: "15 min ago" },
  { id: 3, type: "info",    title: "Exchange Rate Movement", message: "USD/CNY moved +1.2% — potential cost impact on Asia imports.", time: "1 hr ago" },
  { id: 4, type: "success", title: "Risk Score Updated", message: "Global risk score recomputed from live USGS + EONET data.", time: "2 hr ago" },
];

export default function TopNavbar() {
  const { collapsed } = useSidebar();
  const [search, setSearch] = useState("");
  const [company, setCompany] = useState(COMPANIES[0]);
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [darkMode] = useState(true);

  return (
    <header
      className="flex-shrink-0 flex items-center gap-3 px-4 lg:px-6 h-14 border-b"
      style={{
        background: "rgba(10,15,30,0.9)",
        borderColor: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Global Search */}
      <div className="flex-1 max-w-md relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
        <input
          type="text"
          placeholder="Search shipments, suppliers, ports..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-9 py-2 text-xs h-9"
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Company Selector */}
        <div className="relative hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl cursor-pointer transition-all"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <Building size={13} style={{ color: "var(--text-muted)" }} />
          <select
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="text-[12px] font-medium bg-transparent outline-none cursor-pointer"
            style={{ color: "var(--text-secondary)" }}
          >
            {COMPANIES.map((c) => <option key={c} value={c} className="bg-surface-800">{c}</option>)}
          </select>
        </div>

        {/* Live Refresh indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
          style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)" }}>
          <RefreshCw size={11} className="text-emerald-400 animate-spin-slow" />
          <span className="text-[11px] font-medium text-emerald-400">Live</span>
        </div>

        {/* Dark Mode Toggle */}
        <button className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--text-muted)" }}>
          {darkMode ? <Moon size={14} /> : <Sun size={14} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotif((v) => !v); setShowProfile(false); }}
            className="relative w-8 h-8 rounded-xl flex items-center justify-center transition-all"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--text-muted)" }}
          >
            <Bell size={14} />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-400" />
          </button>

          <AnimatePresence>
            {showNotif && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-10 w-80 z-50"
                style={{
                  background: "rgba(10,15,30,0.98)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "16px",
                  boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
                  backdropFilter: "blur(20px)",
                }}
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                  <p className="text-sm font-semibold text-white">Notifications</p>
                  <button onClick={() => setShowNotif(false)}><X size={14} style={{ color: "var(--text-muted)" }} /></button>
                </div>
                <div className="divide-y divide-white/5 max-h-80 overflow-y-auto">
                  {MOCK_NOTIFICATIONS.map((n) => (
                    <div key={n.id} className="px-4 py-3 hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-start gap-2">
                        <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                          n.type === "danger" ? "bg-red-400" : n.type === "warning" ? "bg-amber-400" : n.type === "success" ? "bg-emerald-400" : "bg-blue-400"
                        }`} />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white">{n.title}</p>
                          <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>{n.message}</p>
                          <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>{n.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-white/5">
                  <p className="text-[11px] text-center" style={{ color: "var(--accent-blue)" }}>View all notifications</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => { setShowProfile((v) => !v); setShowNotif(false); }}
            className="flex items-center gap-2 px-2 py-1 rounded-xl transition-all"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-white"
              style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}>
              SA
            </div>
            <span className="hidden md:block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
              Sarah Admin
            </span>
            <ChevronDown size={12} style={{ color: "var(--text-muted)" }} />
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-10 w-48 z-50"
                style={{
                  background: "rgba(10,15,30,0.98)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
                  backdropFilter: "blur(20px)",
                }}
              >
                <div className="px-4 py-3 border-b border-white/5">
                  <p className="text-xs font-semibold text-white">Sarah Admin</p>
                  <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>admin@supplychain.ai</p>
                </div>
                {["Profile", "Settings", "API Keys", "Sign Out"].map((item) => (
                  <button key={item} className="w-full text-left px-4 py-2 text-xs hover:bg-white/[0.03] transition-colors"
                    style={{ color: item === "Sign Out" ? "#ef4444" : "var(--text-secondary)" }}>
                    {item}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
