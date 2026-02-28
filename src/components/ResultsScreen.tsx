"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameState, BridgeAnswers } from "@/src/types/game";
import { api } from "@/src/lib/api";
import EquityCurve from "./EquityCurve";
import PersonalBridge from "./PersonalBridge";

interface ResultsScreenProps {
  state: GameState;
  onPlayAgain: () => void;
}

export default function ResultsScreen({ state, onPlayAgain }: ResultsScreenProps) {
  const [showBridge,   setShowBridge]   = useState(false);
  const [bridgeLoading, setBridgeLoading] = useState(false);
  const [bridgeAdvice,  setBridgeAdvice]  = useState<string | null>(null);

  const playerFinal = state.playerPortfolio.totalValue;
  const aiFinal     = state.aiPortfolio.totalValue;
  const playerWon   = playerFinal >= aiFinal;
  const playerPnl   = ((playerFinal - 100000) / 100000) * 100;
  const aiPnl       = ((aiFinal     - 100000) / 100000) * 100;

  const handleBridge = async (answers: BridgeAnswers) => {
    setBridgeLoading(true);
    const gameId = localStorage.getItem("game_id") ?? "";
    try {
      const res = await api.getBridgeAdvice(
        gameId,
        answers.invests === "yes",
        answers.accountType ?? "not_sure",
        answers.techAllocation ?? 0
      );
      setBridgeAdvice(res.advice);
    } catch {
      setBridgeAdvice("Could not load personalised advice — but here's the key takeaway: the same forces you just played (rate hikes, oil shocks, FDA events) are moving your real portfolio right now. The difference is you now have a mental model for why.");
    } finally {
      setBridgeLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy grid-texture flex flex-col">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="relative px-8 py-12 text-center border-b border-white/5"
        style={{ background: playerWon ? "linear-gradient(180deg, rgba(0,255,135,0.08) 0%, transparent 100%)" : "linear-gradient(180deg, rgba(255,215,0,0.06) 0%, transparent 100%)" }}
      >
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", delay: 0.2 }} className="text-6xl mb-4">
          {playerWon ? "🏆" : "🤖"}
        </motion.div>
        <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
          className="font-display text-4xl font-black mb-2" style={{ color: playerWon ? "#00FF87" : "#FFD700" }}>
          {playerWon ? "You Beat the AI!" : "AI Wins This Time"}
        </motion.h1>
        <p className="text-white/40 font-body">10-round simulation complete</p>
      </motion.div>

      <div className="flex-1 px-6 py-8 max-w-5xl mx-auto w-full space-y-8">
        {/* Score cards */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="grid grid-cols-2 gap-4">
          <ScoreCard label="Your Portfolio" value={playerFinal} pnl={playerPnl} color="#00FF87" winner={playerWon}  />
          <ScoreCard label="AI Portfolio"   value={aiFinal}     pnl={aiPnl}     color="#FFD700" winner={!playerWon} />
        </motion.div>

        {/* Equity curve */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
          className="rounded-xl border border-white/10 p-5" style={{ background: "rgba(255,255,255,0.02)" }}>
          <h3 className="font-display text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Portfolio Performance Over 10 Rounds</h3>
          <EquityCurve data={state.equityHistory} />
        </motion.div>

        {/* Lessons */}
        {state.lessonsLearned.length > 0 && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
            <h3 className="font-display text-xs font-bold text-white/40 uppercase tracking-widest mb-3">What You Learned</h3>
            <div className="space-y-2">
              {state.lessonsLearned.map((lesson, i) => (
                <motion.div key={i} initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.6 + i * 0.08 }}
                  className="flex items-start gap-3 p-3 rounded-lg border border-white/5 bg-white/2">
                  <span className="text-gain font-mono text-xs mt-0.5 flex-shrink-0">{String(i + 1).padStart(2, "0")}</span>
                  <p className="text-sm text-white/60 font-body">{lesson}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Personal bridge */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }}>
          {!showBridge && !bridgeAdvice && (
            <div className="rounded-xl border border-gold/30 p-6 text-center cursor-pointer hover:border-gold/60 transition-all"
                 style={{ background: "rgba(255,215,0,0.04)" }}
                 onClick={() => setShowBridge(true)}>
              <div className="text-3xl mb-3">💡</div>
              <h3 className="font-display text-lg font-bold text-gold mb-2">Connect This to Your Real Money</h3>
              <p className="text-sm text-white/50 mb-4">Answer 3 quick questions and get personalised advice based on what you just played.</p>
              <span className="font-display text-sm font-bold text-gold border border-gold/40 px-4 py-2 rounded-lg hover:bg-gold/10 transition-colors">
                Get My Personal Report →
              </span>
            </div>
          )}

          <AnimatePresence>
            {showBridge && !bridgeAdvice && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <PersonalBridge onSubmit={handleBridge} loading={bridgeLoading} />
              </motion.div>
            )}
            {bridgeAdvice && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-gold/30 p-6"
                style={{ background: "linear-gradient(135deg, rgba(255,215,0,0.06), rgba(10,14,26,1))" }}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">💡</span>
                  <div>
                    <div className="font-display text-sm font-bold text-gold uppercase tracking-widest">Your Personal Financial Report</div>
                    <div className="text-xs text-white/30">Generated from your game performance</div>
                  </div>
                </div>
                <p className="text-sm text-white/80 font-body leading-relaxed whitespace-pre-wrap">{bridgeAdvice}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Play again */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="text-center pb-8">
          <button onClick={onPlayAgain}
            className="font-display text-sm font-bold tracking-wider px-8 py-3 rounded-xl border border-white/20 text-white/60 hover:border-white/40 hover:text-white transition-all">
            ↺ Play Again
          </button>
        </motion.div>
      </div>
    </div>
  );
}

function ScoreCard({ label, value, pnl, color, winner }: { label: string; value: number; pnl: number; color: string; winner: boolean }) {
  const isGain = pnl >= 0;
  return (
    <div className="rounded-xl border p-5 text-center relative overflow-hidden transition-all"
         style={{ borderColor: winner ? color : "rgba(255,255,255,0.1)", background: winner ? `${color}08` : "rgba(255,255,255,0.02)", boxShadow: winner ? `0 0 30px ${color}20` : "none" }}>
      {winner && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ background: color, color: "#0A0E1A" }}>
          WINNER
        </motion.div>
      )}
      <div className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color }}>{label}</div>
      <div className="font-display text-3xl font-black text-white mb-1">${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
      <div className={`font-mono text-sm font-bold ${isGain ? "text-gain" : "text-loss"}`}>{isGain ? "+" : ""}{pnl.toFixed(1)}% return</div>
    </div>
  );
}