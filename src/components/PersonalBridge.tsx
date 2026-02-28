"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BridgeAnswers } from "@/src/types/game";

interface PersonalBridgeProps {
  onSubmit: (answers: BridgeAnswers) => void;
  loading: boolean;
}

export default function PersonalBridge({ onSubmit, loading }: PersonalBridgeProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<BridgeAnswers>>({});

  const handleInvests = (v: BridgeAnswers["invests"]) => {
    const updated = { ...answers, invests: v };
    setAnswers(updated);
    if (v === "no" || v === "student") {
      // Skip account type, go to submit
      onSubmit({ ...updated, invests: v } as BridgeAnswers);
    } else {
      setStep(1);
    }
  };

  const handleAccountType = (v: BridgeAnswers["accountType"]) => {
    setAnswers((a) => ({ ...a, accountType: v }));
    setStep(2);
  };

  const handleTechAllocation = (v: number) => {
    const final = { ...answers, techAllocation: v } as BridgeAnswers;
    onSubmit(final);
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-gold mb-2">
          Your Real Portfolio
        </h2>
        <p className="text-white/50 font-body text-sm">
          Let's connect what you learned tonight to your actual financial situation.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="q1"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="space-y-3"
          >
            <p className="font-body text-white font-medium">Do you currently invest?</p>
            {[
              { value: "yes" as const, label: "Yes, I invest", emoji: "📈" },
              { value: "no" as const, label: "Not yet", emoji: "🌱" },
              { value: "student" as const, label: "I'm a student", emoji: "🎓" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleInvests(opt.value)}
                className="w-full flex items-center gap-3 p-4 rounded-xl border border-white/10 hover:border-gold/40 hover:bg-gold/5 transition-all text-left"
              >
                <span className="text-xl">{opt.emoji}</span>
                <span className="font-body text-white">{opt.label}</span>
              </button>
            ))}
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="q2"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="space-y-3"
          >
            <p className="font-body text-white font-medium">What type of account?</p>
            {[
              { value: "401k" as const, label: "401(k) / Employer plan", emoji: "🏦" },
              { value: "index_fund" as const, label: "Index Fund / ETF", emoji: "📊" },
              { value: "mutual_fund" as const, label: "Mutual Fund", emoji: "🗂️" },
              { value: "stocks" as const, label: "Individual Stocks", emoji: "📉" },
              { value: "not_sure" as const, label: "Not sure", emoji: "🤷" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleAccountType(opt.value)}
                className="w-full flex items-center gap-3 p-4 rounded-xl border border-white/10 hover:border-gold/40 hover:bg-gold/5 transition-all text-left"
              >
                <span className="text-xl">{opt.emoji}</span>
                <span className="font-body text-white">{opt.label}</span>
              </button>
            ))}
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="q3"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="space-y-6"
          >
            <p className="font-body text-white font-medium">
              Roughly what % of your portfolio do you think is in Tech stocks?
            </p>
            <TechSlider onSubmit={handleTechAllocation} loading={loading} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress dots */}
      <div className="flex justify-center gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full transition-all"
            style={{ background: i <= step ? "#FFD700" : "rgba(255,255,255,0.15)" }}
          />
        ))}
      </div>
    </div>
  );
}

function TechSlider({ onSubmit, loading }: { onSubmit: (v: number) => void; loading: boolean }) {
  const [value, setValue] = useState(30);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-xs text-white/30 font-mono">0%</span>
        <motion.span
          key={value}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          className="font-display text-3xl font-bold text-gold"
        >
          {value}%
        </motion.span>
        <span className="text-xs text-white/30 font-mono">100%</span>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-full accent-gold cursor-pointer"
        style={{ accentColor: "#FFD700" }}
      />

      <button
        onClick={() => onSubmit(value)}
        disabled={loading}
        className="w-full py-4 rounded-xl font-display font-bold text-base tracking-wider transition-all"
        style={{
          background: loading ? "rgba(255,215,0,0.2)" : "linear-gradient(90deg, #FFD700, #FFA500)",
          color: loading ? "#FFD700" : "#0A0E1A",
        }}
      >
        {loading ? "Generating your report..." : "Generate My Personal Report →"}
      </button>
    </div>
  );
}