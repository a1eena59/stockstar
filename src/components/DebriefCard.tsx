"use client";

import { motion } from "framer-motion";

interface DebriefCardProps {
  text: string;
  principles?: string[];
  roundNumber: number;
  onNext: () => void;
  isLastRound: boolean;
}

export default function DebriefCard({ text, principles = [], roundNumber, onNext, isLastRound }: DebriefCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-gain/20 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(0,255,135,0.04) 0%, rgba(10,14,26,1) 50%)",
        boxShadow: "0 0 24px rgba(0,255,135,0.06)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-gain/10">
        <span className="text-xl">🎓</span>
        <div>
          <div className="font-display text-xs font-bold text-gain tracking-widest uppercase">
            Market Coach
          </div>
          <div className="text-xs text-white/30">Round {roundNumber} debrief</div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Debrief text */}
        <p className="text-sm text-white/80 font-body leading-relaxed">{text}</p>

        {/* Principles cited */}
        {principles.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-white/30 uppercase tracking-widest">
              Principles Applied
            </p>
            {principles.map((p, i) => (
              <div key={i} className="flex gap-2.5 items-start">
                <span className="text-gain/60 mt-0.5 flex-shrink-0 text-xs">📌</span>
                <p className="text-xs text-white/50 font-body italic">{p}</p>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <motion.button
          onClick={onNext}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 rounded-xl font-display text-sm font-bold tracking-wider transition-all duration-200"
          style={{
            background: isLastRound
              ? "linear-gradient(90deg, #FFD700, #FFA500)"
              : "linear-gradient(90deg, rgba(0,255,135,0.15), rgba(0,255,135,0.05))",
            border: isLastRound ? "none" : "1px solid rgba(0,255,135,0.3)",
            color: isLastRound ? "#0A0E1A" : "#00FF87",
          }}
        >
          {isLastRound ? "🏆 See Final Results" : "▶ Next Round"}
        </motion.button>
      </div>
    </motion.div>
  );
}