"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, User, AlertCircle, Settings, Loader2, Database, Zap } from "lucide-react";
import { api } from "@/lib/api/client";
import Link from "next/link";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  sources?: string[];
  loading?: boolean;
  error?: boolean;
}

const SAMPLE_QUESTIONS = [
  "What are the biggest active natural disasters affecting logistics today?",
  "Explain the current global supply chain risk score.",
  "Which trade currencies are moving the most?",
  "What natural events are currently active near major shipping lanes?",
];

export default function CopilotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm the SupplyChain AI Copilot. I analyze live data from USGS earthquakes, NASA EONET natural events, Open-Meteo weather, and exchange rates to answer your supply chain questions.\n\nNote: Full AI analysis requires an OpenAI API key configured in Settings. You can configure it there.",
      sources: ["USGS", "NASA EONET", "Open-Meteo", "Open Exchange Rates"],
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || sending) return;
    setInput("");
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: msg };
    const loadingMsg: Message = { id: `loading-${Date.now()}`, role: "assistant", content: "", loading: true };
    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setSending(true);

    const result = await api.copilot.chat(msg);
    setSending(false);

    setMessages((prev) => {
      const updated = [...prev];
      const loadingIdx = updated.findLastIndex((m) => m.loading);
      if (loadingIdx === -1) return prev;

      if (result.error) {
        updated[loadingIdx] = {
          id: updated[loadingIdx].id,
          role: "assistant",
          content: `Connection error: ${result.error}`,
          error: true,
        };
        return updated;
      }

      const data = result.data as any;
      if (!data?.configured) {
        updated[loadingIdx] = {
          id: updated[loadingIdx].id,
          role: "system",
          content: data?.message || "OpenAI API key not configured.",
          sources: [],
        };
        return updated;
      }

      if (data?.error) {
        updated[loadingIdx] = {
          id: updated[loadingIdx].id,
          role: "assistant",
          content: data.error,
          error: true,
        };
        return updated;
      }

      updated[loadingIdx] = {
        id: updated[loadingIdx].id,
        role: "assistant",
        content: data.answer,
        sources: data.data_sources_used,
      };
      return updated;
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-fade-in">
      {/* Header */}
      <div className="flex-shrink-0 mb-4">
        <h1 className="text-xl font-bold font-display gradient-text">AI Supply Chain Copilot</h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          Answers grounded in live USGS · NASA EONET · Open-Meteo · Exchange Rate data · Requires OpenAI key for full analysis
        </p>
      </div>

      {/* Chat area */}
      <div className="flex-1 glass-card overflow-hidden flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                {/* Avatar */}
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-blue-600 to-purple-600"
                    : msg.role === "system"
                    ? "bg-amber-500/20"
                    : "bg-gradient-to-br from-purple-600 to-cyan-600"
                }`}>
                  {msg.role === "user" ? <User size={12} className="text-white" />
                    : msg.role === "system" ? <AlertCircle size={12} className="text-amber-400" />
                    : <Bot size={12} className="text-white" />}
                </div>

                {/* Bubble */}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "rounded-tr-sm"
                    : msg.error
                    ? "rounded-tl-sm"
                    : "rounded-tl-sm"
                }`}
                  style={{
                    background: msg.role === "user"
                      ? "linear-gradient(135deg, rgba(37,99,235,0.6), rgba(124,58,237,0.4))"
                      : msg.error
                      ? "rgba(239,68,68,0.08)"
                      : msg.role === "system"
                      ? "rgba(245,158,11,0.08)"
                      : "rgba(255,255,255,0.04)",
                    border: `1px solid ${
                      msg.role === "user" ? "rgba(59,130,246,0.4)"
                        : msg.error ? "rgba(239,68,68,0.2)"
                        : msg.role === "system" ? "rgba(245,158,11,0.2)"
                        : "rgba(255,255,255,0.07)"
                    }`,
                  }}
                >
                  {msg.loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin text-purple-400" />
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>Fetching live data & analyzing…</span>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed"
                        style={{ color: msg.error ? "#f87171" : msg.role === "system" ? "#fbbf24" : "var(--text-primary)" }}>
                        {msg.content}
                      </p>
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          <Database size={9} style={{ color: "var(--text-muted)" }} />
                          {msg.sources.map((s: string) => (
                            <span key={s} className="badge badge-info text-[9px] px-1.5 py-0">{s}</span>
                          ))}
                        </div>
                      )}
                      {msg.role === "system" && (
                        <Link href="/settings">
                          <button className="btn-primary mt-2 text-xs py-1.5 px-2.5">
                            <Settings size={11} /> Configure OpenAI Key
                          </button>
                        </Link>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* Suggested questions */}
        <div className="flex-shrink-0 px-4 py-2 border-t border-white/5">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {SAMPLE_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                disabled={sending}
                className="flex-shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all whitespace-nowrap"
                style={{
                  background: "rgba(59,130,246,0.08)",
                  border: "1px solid rgba(59,130,246,0.2)",
                  color: "var(--text-secondary)",
                }}
              >
                {q.length > 50 ? q.slice(0, 50) + "…" : q}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="flex-shrink-0 px-4 py-3 border-t border-white/5">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Ask about live supply chain conditions, risks, or weather impacts…"
              className="input-field flex-1"
              disabled={sending}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || sending}
              className="btn-primary flex-shrink-0 px-3 py-2.5"
            >
              {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            </button>
          </div>
          <p className="text-[10px] mt-1.5" style={{ color: "var(--text-muted)" }}>
            <Zap size={9} className="inline mr-1" />
            Live data injected before every AI response · No hallucinated facts
          </p>
        </div>
      </div>
    </div>
  );
}
