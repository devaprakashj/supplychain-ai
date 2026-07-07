import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Brand palette
        brand: {
          50:  "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        purple: {
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
        },
        cyan: {
          400: "#22d3ee",
          500: "#06b6d4",
        },
        // Dark UI
        surface: {
          900: "#040810",
          800: "#0a0f1e",
          700: "#0d1528",
          600: "#111b33",
          500: "#1a2540",
          400: "#1e2d4f",
          300: "#243360",
          200: "#2d3f78",
          100: "#3a4f94",
        },
        // Status
        success: "#10b981",
        warning: "#f59e0b",
        danger:  "#ef4444",
        info:    "#3b82f6",
      },
      fontFamily: {
        sans:    ["Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "system-ui", "sans-serif"],
        mono:    ["JetBrains Mono", "monospace"],
      },
      backgroundImage: {
        "gradient-radial":  "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":   "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "mesh-gradient":    "radial-gradient(at 40% 20%, hsla(228,100%,74%,0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(264,100%,74%,0.15) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355,100%,74%,0.05) 0px, transparent 50%)",
      },
      animation: {
        "fade-in":      "fadeIn 0.5s ease-in-out",
        "slide-up":     "slideUp 0.4s ease-out",
        "slide-left":   "slideLeft 0.4s ease-out",
        "pulse-slow":   "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float":        "float 6s ease-in-out infinite",
        "glow":         "glow 2s ease-in-out infinite alternate",
        "spin-slow":    "spin 8s linear infinite",
        "bounce-slow":  "bounce 3s infinite",
        "shimmer":      "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn:  { "0%": { opacity: "0" },                              "100%": { opacity: "1" } },
        slideUp: { "0%": { opacity: "0", transform: "translateY(20px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        slideLeft: { "0%": { opacity: "0", transform: "translateX(-20px)" }, "100%": { opacity: "1", transform: "translateX(0)" } },
        float:   { "0%, 100%": { transform: "translateY(0px)" },        "50%": { transform: "translateY(-10px)" } },
        glow:    { "from": { boxShadow: "0 0 10px #3b82f660" },         "to": { boxShadow: "0 0 30px #3b82f6a0, 0 0 60px #8b5cf640" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" },              "100%": { backgroundPosition: "200% 0" } },
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        "glow-blue":   "0 0 20px rgba(59, 130, 246, 0.35)",
        "glow-purple": "0 0 20px rgba(139, 92, 246, 0.35)",
        "glow-cyan":   "0 0 20px rgba(6, 182, 212, 0.35)",
        "card":        "0 8px 32px rgba(0, 0, 0, 0.4)",
        "card-hover":  "0 16px 48px rgba(0, 0, 0, 0.6)",
        "glass":       "inset 0 1px 0 rgba(255,255,255,0.05), 0 8px 32px rgba(0,0,0,0.4)",
      },
    },
  },
  plugins: [],
};

export default config;
