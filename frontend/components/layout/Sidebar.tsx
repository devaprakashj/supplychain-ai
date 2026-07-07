"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Ship, Brain, Building2, Route, Package,
  Anchor, Globe2, FileBarChart, Bot, Settings, ChevronLeft,
  ChevronRight, Zap, TrendingUp,
} from "lucide-react";
import { useSidebar } from "./SidebarContext";
import { clsx } from "clsx";

const NAV_ITEMS = [
  { label: "Dashboard",           href: "/",              icon: LayoutDashboard, group: "main" },
  { label: "Live Shipments",      href: "/shipments",     icon: Ship,            group: "main" },
  { label: "AI Predictions",      href: "/predictions",   icon: Brain,           group: "intelligence" },
  { label: "Supplier Intel",      href: "/suppliers",     icon: Building2,       group: "intelligence" },
  { label: "Route Optimizer",     href: "/routes",        icon: Route,           group: "intelligence" },
  { label: "Inventory Forecast",  href: "/inventory",     icon: Package,         group: "operations" },
  { label: "Port Analytics",      href: "/ports",         icon: Anchor,          group: "operations" },
  { label: "Global Risk Map",     href: "/risk-map",      icon: Globe2,          group: "operations" },
  { label: "Reports",             href: "/reports",       icon: FileBarChart,    group: "analytics" },
  { label: "AI Copilot",          href: "/copilot",       icon: Bot,             group: "analytics" },
  { label: "Settings",            href: "/settings",      icon: Settings,        group: "system" },
];

const GROUP_LABELS: Record<string, string> = {
  main: "Overview",
  intelligence: "AI Intelligence",
  operations: "Operations",
  analytics: "Analytics",
  system: "System",
};

export default function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();

  const groups = Array.from(new Set(NAV_ITEMS.map((i) => i.group)));

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex-shrink-0 flex flex-col h-screen overflow-hidden z-30"
      style={{
        background: "linear-gradient(180deg, #0a0f1e 0%, #040810 100%)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">
        <div className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}>
          <Zap size={14} className="text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <p className="text-sm font-bold font-display text-white leading-none">SupplyChain</p>
              <p className="text-[10px] font-medium mt-0.5" style={{ color: "var(--accent-blue)" }}>AI Platform</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 space-y-1">
        {groups.map((group) => {
          const items = NAV_ITEMS.filter((i) => i.group === group);
          return (
            <div key={group} className="mb-2">
              {!collapsed && (
                <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest"
                  style={{ color: "var(--text-muted)" }}>
                  {GROUP_LABELS[group]}
                </p>
              )}
              {items.map((item) => {
                const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <Link key={item.href} href={item.href} title={collapsed ? item.label : undefined}>
                    <motion.div
                      whileHover={{ x: 2 }}
                      className={clsx("sidebar-item", isActive && "active")}
                    >
                      <item.icon size={16} className="flex-shrink-0" />
                      <AnimatePresence>
                        {!collapsed && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="whitespace-nowrap text-[13px]"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      {isActive && !collapsed && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="ml-auto w-1.5 h-1.5 rounded-full"
                          style={{ background: "var(--accent-blue)" }}
                        />
                      )}
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Live status */}
      <div className="px-3 py-3 border-t border-white/5">
        {!collapsed ? (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)" }}>
            <span className="live-dot" />
            <span className="text-[11px] font-medium text-emerald-400">Live Data Active</span>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="live-dot" />
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggle}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 z-10"
        style={{
          background: "#1a2540",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          color: "var(--text-muted)",
        }}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </motion.aside>
  );
}
