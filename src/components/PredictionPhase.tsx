"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sector, PredictionResult } from "@/src/types/game";
import { getSectorColor } from "@/src/hooks/useGameState";

const SECTORS: { label: Sector; icon: string; description: string }[] = [
  { label: "Tech", icon: "⚡", description: "Cloud, Chips, Software" },
  { label: "Energy", icon: "🔋", description: "Oil, Gas, Renewables" },
  { label: "Healthcare", icon: "💊", description: "Pharma, Biotech" },
  { label: "Consumer", icon: "🛒", description: "Retail, Consumer Goods" },
];

interface PredictionPhaseProps {
  onPredict: (sector: Sector) => void;
  result: PredictionResult | null;
}

export default function PredictionPhase({ onPredict, result }: PredictionPhaseProps) {
  const [timeLeft, setTimeLeft] = useState(15);
  const [selected, setSelected] = useState<Sector | null>(null);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (result || expired) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setExpired(true);
          clearInterval(interval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [result, expired]);

  const handleSelect = useCallback((sector: Sector) => {
    if (selected || result) return;
    setSelected(sector);
    onPredict(sector);
  }, [selected, result, onPredict]);

  const timerPct = (timeLeft / 15) * 100;

  return (
    <div className="space-y-4">
      {/* Timer bar */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-white/40 font-mono uppercase tracking-widest">Predict</span>
        <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, #FF4560, #FFD700, #00FF87)` }}
            initial={{ width: "100%" }}
            animate={{ width: `${timerPct}%` }}
            transition={{ duration: 1, ease: "linear" }}
          />
        </div>
        <motion.span
          animate={{ color: timeLeft <= 5 ? "#FF4560" : "#FFD700" }}
          className="text-sm font-mono font-bold w-6 text-right"
        >
          {timeLeft}
        </motion.span>
      </div>

      <p className="text-sm text-white/60 font-body">
        Which sector does this headline hit hardest?
      </p>

      {/* Sector buttons */}
      <div className="grid grid-cols-2 gap-3">
        {SECTORS.map((sector) => {
          const isSelected = selected === sector.label;
          const isResult = result !== null;
          const isCorrect = result?.correctSector === sector.label;
          const isWrong = isSelected && result && !result.correct;

          let borderColor = "border-white/10";
          if (isSelected && !isResult) borderColor = "border-gold";
          if (isCorrect && isResult) borderColor = "border-gain";
          if (isWrong) borderColor = "border-loss";

          return (
            <motion.button
              key={sector.label}
              onClick={() => handleSelect(sector.label)}
              disabled={!!selected || expired}
              whileHover={{ scale: selected ? 1 : 1.02 }}
              whileTap={{ scale: selected ? 1 : 0.97 }}
              className={`relative p-4 rounded-xl border ${borderColor} text-left transition-all duration-200 disabled:cursor-not-allowed`}
              style={{
                background: isSelected
                  ? `linear-gradient(135deg, ${getSectorColor(sector.label)}15, transparent)`
                  : "rgba(255,255,255,0.02)",
              }}
            >
              <div className="text-2xl mb-1">{sector.icon}</div>
              <div className="font-display text-sm font-bold" style={{ color: getSectorColor(sector.label) }}>
                {sector.label}
              </div>
              <div className="text-xs text-white/40 font-body">{sector.description}</div>

              {/* Result overlay */}
              <AnimatePresence>
                {isResult && isCorrect && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute top-2 right-2 text-gain text-xs font-bold"
                  >
                    ✓ CORRECT
                  </motion.div>
                )}
                {isWrong && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute top-2 right-2 text-loss text-xs font-bold"
                  >
                    ✗ WRONG
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Bonus hint */}
      <AnimatePresence>
        {result?.correct && result.bonusHint && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-lg border border-gold/40 bg-gold/5"
          >
            <span className="text-xs font-bold text-gold uppercase tracking-widest">Market Insider Bonus</span>
            <p className="text-sm text-white/80 mt-1">{result.bonusHint}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}