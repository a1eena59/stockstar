"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GamePhase } from "@/src/types/game";

interface AIReasoningPanelProps {
  phase: GamePhase;
  reasoning: string;
  complete: boolean;
}

export default function AIReasoningPanel({ phase, reasoning, complete }: AIReasoningPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [reasoning]);

  const isAnalyzing = phase === "trading" || phase === "prediction";
  const isStreaming = phase === "ai_reasoning" && !complete;
  const isDone = complete && reasoning;

  return (
    <div
      className="h-full rounded-xl border border-gold/20 overflow-hidden flex flex-col"
      style={{
        background: "linear-gradient(180deg, #0D1220 0%, #0A0E1A 100%)",
        boxShadow: "0 0 30px rgba(255,215,0,0.06), inset 0 1px 0 rgba(255,215,0,0.08)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gold/10">
        <div className="relative">
          <div className="w-7 h-7 rounded-full bg-gold/10 border border-gold/40 flex items-center justify-center text-sm">
            🤖
          </div>
          {(isAnalyzing || isStreaming) && (
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-gold"
            />
          )}
        </div>
        <div>
          <div className="font-display text-xs font-bold text-gold tracking-widest uppercase">
            AI Opponent
          </div>
          <div className="text-xs text-white/30 font-body">
            {isAnalyzing ? "Analyzing market..." : isStreaming ? "Streaming reasoning" : isDone ? "Analysis complete" : "Awaiting market data"}
          </div>
        </div>
      </div>

      {/* Content area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {isAnalyzing && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-32 gap-4"
            >
              {/* Pulsing dots */}
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -8, 0], opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                    className="w-2 h-2 rounded-full bg-gold"
                  />
                ))}
              </div>
              <p className="text-xs text-white/30 font-mono uppercase tracking-widest">
                Processing news event
              </p>
            </motion.div>
          )}

          {(isStreaming || isDone) && (
            <motion.div
              key="reasoning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p
                className={`text-sm font-mono text-white/80 leading-relaxed ${
                  isStreaming ? "typewriter-cursor" : ""
                }`}
              >
                {reasoning}
              </p>
            </motion.div>
          )}

          {!isAnalyzing && !isStreaming && !isDone && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-32"
            >
              <div className="text-4xl mb-3 opacity-20">📊</div>
              <p className="text-xs text-white/20 font-mono text-center">
                AI analysis will appear here after trading begins
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Strategy chips (shown when complete) */}
      <AnimatePresence>
        {isDone && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="px-4 pb-4 pt-2 border-t border-gold/10 flex flex-wrap gap-1.5"
          >
            {extractActions(reasoning).map((action, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`text-xs px-2 py-0.5 rounded-full font-mono border ${
                  action.type === "buy"
                    ? "border-gain/40 text-gain bg-gain/5"
                    : action.type === "sell"
                    ? "border-loss/40 text-loss bg-loss/5"
                    : "border-white/20 text-white/50 bg-white/5"
                }`}
              >
                {action.type.toUpperCase()} {action.stock}
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function extractActions(text: string): { type: "buy" | "sell" | "hold"; stock: string }[] {
  const actions: { type: "buy" | "sell" | "hold"; stock: string }[] = [];
  const buyMatches = text.matchAll(/(?:BUYING|BUY(?:ING)?)\s+(\w+)/gi);
  const sellMatches = text.matchAll(/(?:SELLING|SELL(?:ING)?)\s+(\w+)/gi);
  const holdMatches = text.matchAll(/(?:HOLDING|HOLD(?:ING)?)\s+(\w+)/gi);

  for (const m of buyMatches) actions.push({ type: "buy", stock: m[1] });
  for (const m of sellMatches) actions.push({ type: "sell", stock: m[1] });
  for (const m of holdMatches) actions.push({ type: "hold", stock: m[1] });

  return actions.slice(0, 6);
}