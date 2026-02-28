"use client";

import { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useRouter } from "next/navigation";
import { api } from "@/src/lib/api";

const STOCKS_PREVIEW = [
  { name: "CloudCorp",  ticker: "MSFT", price: "$415.50", change: "+2.4%",  pos: true,  sector: "Tech"     },
  { name: "ChipMaker",  ticker: "NVDA", price: "$875.20", change: "+8.1%",  pos: true,  sector: "Tech"     },
  { name: "OilGiant",   ticker: "XOM",  price: "$108.75", change: "-1.2%",  pos: false, sector: "Energy"   },
  { name: "GreenPower", ticker: "NEE",  price: "$76.40",  change: "+0.8%",  pos: true,  sector: "Energy"   },
  { name: "PharmaMax",  ticker: "JNJ",  price: "$162.30", change: "-0.4%",  pos: false, sector: "Health"   },
  { name: "BioLeap",    ticker: "MRNA", price: "$94.60",  change: "+12.3%", pos: true,  sector: "Health"   },
  { name: "RetailKing", ticker: "AMZN", price: "$185.90", change: "+3.1%",  pos: true,  sector: "Consumer" },
  { name: "BrandHouse", ticker: "PG",   price: "$152.10", change: "+0.2%",  pos: true,  sector: "Consumer" },
];

const SECTOR_COLORS: Record<string, string> = {
  Tech:     "#60A5FA",
  Energy:   "#FBBF24",
  Health:   "#34D399",
  Consumer: "#F472B6",
};

const FEATURES = [
  { label: "10 trading rounds",   icon: "🔄", desc: "One news event per round"     },
  { label: "AI reasoning stream", icon: "🤖", desc: "Watch it think in real time"  },
  { label: "RAG market coach",    icon: "🎓", desc: "Grounded in real principles"  },
  { label: "Live-ish prices",     icon: "📈", desc: "Real tickers, simulated moves" },
  { label: "Personal bridge",     icon: "💡", desc: "Connects to your real money"   },
];

function TiltCard({ children }: { children: React.ReactNode }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useTransform(my, [-0.5, 0.5], [8, -8]);
  const ry = useTransform(mx, [-0.5, 0.5], [-8, 8]);
  return (
    <motion.div
      style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width  - 0.5);
        my.set((e.clientY - r.top)  / r.height - 0.5);
      }}
      onMouseLeave={() => { mx.set(0); my.set(0); }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedPrice({ value, delay }: { value: string; delay: number }) {
  const [shown, setShown] = useState("···");
  useEffect(() => {
    const t = setTimeout(() => setShown(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return (
    <motion.span key={shown} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      {shown}
    </motion.span>
  );
}

export default function LandingPage() {
  const router  = useRouter();
  const [starting,       setStarting]       = useState(false);
  const [error,          setError]          = useState<string | null>(null);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const handleStart = async () => {
    setStarting(true);
    setError(null);
    try {
      const data = await api.startGame("Player");
      // Store everything backend returns in localStorage
      localStorage.setItem("game_id",   data.game_id);
      localStorage.setItem("game_data", JSON.stringify(data));
      router.push("/game");
    } catch (e) {
      setError("Could not connect to server. Is the backend running?");
      setStarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 grid-texture opacity-30 pointer-events-none" />

      <motion.div
        animate={{ scale: [1, 1.18, 1], opacity: [0.07, 0.14, 0.07] }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
        className="absolute -top-48 left-1/3 w-[800px] h-[800px] rounded-full blur-[180px] pointer-events-none"
        style={{ background: "#00FF87" }}
      />
      <motion.div
        animate={{ scale: [1, 1.12, 1], opacity: [0.05, 0.1, 0.05] }}
        transition={{ repeat: Infinity, duration: 10, ease: "easeInOut", delay: 3 }}
        className="absolute -bottom-48 right-1/3 w-[700px] h-[700px] rounded-full blur-[160px] pointer-events-none"
        style={{ background: "#FFD700" }}
      />
      {[...Array(8)].map((_, i) => (
        <motion.div key={i}
          animate={{ y: [0, -20, 0], opacity: [0.06, 0.3, 0.06] }}
          transition={{ repeat: Infinity, duration: 4 + i * 0.7, delay: i * 0.5, ease: "easeInOut" }}
          className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
          style={{ background: i % 2 === 0 ? "#00FF87" : "#FFD700", left: `${8 + i * 12}%`, top: `${12 + (i % 4) * 22}%` }}
        />
      ))}

      <div className="relative z-10 w-full max-w-6xl mx-auto px-10 py-24 flex flex-col items-center gap-24">

        {/* HERO */}
        <motion.div
          initial={{ opacity: 0, y: -28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          className="text-center space-y-8"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}
            className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-gain/30 bg-gain/5"
          >
            <motion.span animate={{ opacity: [1, 0.15, 1] }} transition={{ repeat: Infinity, duration: 1.4 }}
              className="w-2 h-2 rounded-full bg-gain" />
            <span className="text-xs font-mono text-gain/80 uppercase tracking-[0.22em]">Live Simulation Active</span>
          </motion.div>

          <h1 className="font-display font-black tracking-tight text-white leading-none"
              style={{ fontSize: "clamp(5rem, 12vw, 9rem)" }}>
            STOCK
            <motion.span
              animate={{ textShadow: ["0 0 30px #00FF87", "0 0 80px #00FF87, 0 0 140px #00FF87", "0 0 30px #00FF87"] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="text-gain"
            >★</motion.span>
            STAR
          </h1>

          <p className="font-mono text-xs text-white/20 uppercase tracking-[0.55em]">
            Market Simulation · AI Opponent · Real Data
          </p>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="font-body text-xl leading-relaxed text-white/55 max-w-xl mx-auto"
          >
            Compete against an AI trader that thinks out loud.{" "}
            <span className="text-white/85 font-semibold">Learn how markets really work</span>
            {" "}— by doing, not watching.
          </motion.p>
        </motion.div>

        {/* STOCK CARDS */}
        <motion.div
          initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.65 }}
          className="w-full grid grid-cols-4 gap-6"
        >
          {STOCKS_PREVIEW.map((s, i) => (
            <TiltCard key={s.name}>
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 + i * 0.07 }}
                whileHover={{ y: -6, borderColor: s.pos ? "rgba(0,255,135,0.5)" : "rgba(255,69,96,0.5)" }}
                className="relative rounded-2xl border border-white/10 overflow-hidden cursor-default transition-colors duration-200"
                style={{ padding: "28px 24px 24px", background: "linear-gradient(150deg, rgba(255,255,255,0.055) 0%, rgba(10,14,26,0.92) 100%)", boxShadow: "0 8px 32px rgba(0,0,0,0.35)" }}
              >
                <div className="absolute top-0 left-0 right-0 h-[3px]"
                     style={{ background: `linear-gradient(90deg, ${SECTOR_COLORS[s.sector]}, transparent)` }} />
                <motion.div
                  initial={{ x: "-120%", opacity: 0 }} whileHover={{ x: "220%", opacity: 0.08 }}
                  transition={{ duration: 0.55 }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent skew-x-12 pointer-events-none"
                />
                <div className="flex items-center justify-between mb-5">
                  <span className="text-xs px-2.5 py-1 rounded-lg font-mono font-bold"
                        style={{ background: `${SECTOR_COLORS[s.sector]}18`, color: SECTOR_COLORS[s.sector], border: `1px solid ${SECTOR_COLORS[s.sector]}35` }}>
                    {s.ticker}
                  </span>
                  <span className={`text-sm font-mono font-bold ${s.pos ? "text-gain" : "text-loss"}`}>
                    {s.pos ? "▲" : "▼"} {s.change.replace(/[+-]/, "")}
                  </span>
                </div>
                <p className="font-display text-xs font-bold uppercase tracking-widest text-white/35 mb-2">{s.name}</p>
                <p className="font-mono font-black text-white mb-5" style={{ fontSize: "1.65rem", lineHeight: 1 }}>
                  <AnimatedPrice value={s.price} delay={600 + i * 80} />
                </p>
                <div className="h-9 flex items-end gap-[3px]">
                  {[...Array(10)].map((_, j) => {
                    const h = s.pos
                      ? 20 + Math.sin(j * 0.9 + i) * 14 + j * 3
                      : 60 - Math.sin(j * 0.9 + i) * 14 - j * 2.5;
                    return (
                      <motion.div key={j}
                        initial={{ height: 0 }} animate={{ height: `${Math.max(8, Math.min(100, h))}%` }}
                        transition={{ delay: 0.75 + i * 0.06 + j * 0.025, duration: 0.4, ease: "easeOut" }}
                        className="flex-1 rounded-sm"
                        style={{ background: s.pos ? `rgba(0,255,135,${0.22 + j * 0.045})` : `rgba(255,69,96,${0.22 + j * 0.045})` }}
                      />
                    );
                  })}
                </div>
              </motion.div>
            </TiltCard>
          ))}
        </motion.div>

        {/* FEATURES */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
          className="flex flex-wrap justify-center gap-4"
        >
          {FEATURES.map((f, i) => (
            <motion.div key={f.label}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 + i * 0.08 }}
              onHoverStart={() => setHoveredFeature(i)} onHoverEnd={() => setHoveredFeature(null)}
              whileHover={{ scale: 1.06, y: -3 }}
              className="flex items-center gap-4 rounded-2xl border cursor-default transition-all duration-200"
              style={{ padding: "16px 24px", borderColor: hoveredFeature === i ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.09)", background: hoveredFeature === i ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.025)" }}
            >
              <span style={{ fontSize: "1.4rem", lineHeight: 1 }}>{f.icon}</span>
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-white/80 font-body leading-none">{f.label}</p>
                <p className="text-[11px] text-white/30 font-mono">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.05, type: "spring", stiffness: 90 }}
          className="flex flex-col items-center gap-5"
        >
          {/* Error message */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="text-sm font-mono text-loss border border-loss/30 bg-loss/5 px-4 py-2 rounded-xl"
            >
              ⚠ {error}
            </motion.p>
          )}

          <motion.button
            onClick={handleStart}
            disabled={starting}
            whileHover={starting ? {} : { scale: 1.07, boxShadow: "0 0 90px rgba(0,255,135,0.7), 0 0 180px rgba(0,255,135,0.22)" }}
            whileTap={starting ? {} : { scale: 0.95 }}
            className="relative rounded-2xl font-display font-black tracking-wider overflow-hidden disabled:cursor-not-allowed"
            style={{
              padding: "28px 80px",
              fontSize: "1.5rem",
              background: starting ? "rgba(0,255,135,0.08)" : "linear-gradient(135deg, #00FF87 0%, #00d474 55%, #00a855 100%)",
              color: starting ? "#00FF87" : "#051a0f",
              boxShadow: starting ? "none" : "0 0 60px rgba(0,255,135,0.42), 0 10px 40px rgba(0,0,0,0.5)",
              border: starting ? "1px solid rgba(0,255,135,0.25)" : "none",
            }}
          >
            {!starting && (
              <motion.div
                initial={{ x: "-100%" }} whileHover={{ x: "350%" }}
                transition={{ duration: 0.55 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12 pointer-events-none"
              />
            )}
            {starting ? (
              <span className="flex items-center gap-4">
                <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }} className="inline-block">◌</motion.span>
                <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 0.9 }}>CONNECTING...</motion.span>
              </span>
            ) : (
              <span className="flex items-center gap-5">
                START TRADING
                <motion.span animate={{ x: [0, 7, 0] }} transition={{ repeat: Infinity, duration: 1.1 }} style={{ fontSize: "1.7rem", lineHeight: 1 }}>→</motion.span>
              </span>
            )}
          </motion.button>

          <motion.p
            animate={{ opacity: [0.22, 0.42, 0.22] }} transition={{ repeat: Infinity, duration: 4 }}
            className="text-xs text-white/30 font-mono tracking-[0.3em] uppercase"
          >
            ~15 minutes · No signup required · Free
          </motion.p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
          className="text-[10px] text-white/15 font-mono tracking-[0.35em] uppercase"
        >
          ⚡ Powered by real market data & LangGraph AI reasoning
        </motion.p>
      </div>
    </div>
  );
}