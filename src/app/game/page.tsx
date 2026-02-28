"use client";

import { useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useGameState } from "@/src/hooks/useGameState";
import { api } from "@/src/lib/api";
import { StockName, Sector, Trade } from "@/src/types/game";
import { STOCKS } from "@/src/types/game";

import Ticker from "@/src/components/Ticker";
import TopBar from "@/src/components/TopBar";
import NewsCard from "@/src/components/NewsCard";
import PredictionPhase from "@/src/components/PredictionPhase";
import StockCard from "@/src/components/StockCard";
import CountdownTimer from "@/src/components/CountdownTimer";
import AIReasoningPanel from "@/src/components/AIReasoningPanel";
import EquityCurve from "@/src/components/EquityCurve";
import DebriefCard from "@/src/components/DebriefCard";
import ResultsScreen from "@/src/components/ResultsScreen";

export default function GamePage() {
  const router = useRouter();
  const game = useGameState();
  const { state } = game;
  const typewriterRef = useRef<NodeJS.Timeout | null>(null);

  // ── 1. Load game data from localStorage (set by landing page) ─────────────
  useEffect(() => {
    const raw = localStorage.getItem("game_data");
    if (!raw) {
      router.push("/");
      return;
    }
    const data = JSON.parse(raw);

    // Map backend response to our game state shape
    // Adjust key names here if Person B's response differs
    game.startGame(
      data.game_id,
      data.rounds ?? data.headlines ?? [],          // array of round objects
      data.stocks ?? data.current_stocks ?? {},     // { CloudCorp: 415.5, ... }
      data.player_portfolio ?? { cash: 100000, holdings: {}, totalValue: 100000 },
      data.ai_portfolio     ?? { cash: 100000, holdings: {}, totalValue: 100000 }
    );
  }, []);

  // ── 2. Handle sector prediction ───────────────────────────────────────────
  const handlePredict = useCallback((sector: Sector) => {
    const round = state.currentRound;
    if (!round) return;

    const h = round.headline.toLowerCase();
    let correctSector: Sector = "Tech";
    if (/oil|opec|energy|gas|crude/.test(h))     correctSector = "Energy";
    else if (/fda|pharma|biotech|mrna|drug/.test(h)) correctSector = "Healthcare";
    else if (/retail|amazon|consumer|spending/.test(h)) correctSector = "Consumer";

    const correct = sector === correctSector;
    game.setPrediction({
      selected: sector,
      correct,
      correctSector,
      bonusHint: correct
        ? `Watch ${Object.values(STOCKS).find(s => s.sector === correctSector)?.name} — it'll move most this round.`
        : undefined,
    });

    setTimeout(() => game.setPhase("trading"), 2000);
  }, [state.currentRound, game]);

  // ── 3. Timer ends → submit trades → typewriter AI reasoning ───────────────
  const handleTradeTimerComplete = useCallback(async () => {
    game.setPhase("ai_reasoning");

    const gameId = localStorage.getItem("game_id")!;
    const trades = Object.values(state.pendingTrades).map(t => ({
      stock: t.stock,
      action: t.action,
      quantity: t.quantity,
    }));

    try {
      const tradeData = await api.submitTrades(
        gameId,
        state.round,
        trades,
        state.predictionResult?.selected ?? "Tech"
      );

      // Typewriter the real AI reasoning from backend
      const reasoning: string = tradeData.ai_reasoning ?? "Analyzing market conditions...";
      let i = 0;
      const stream = () => {
        if (i >= reasoning.length) {
          game.completeAiReasoning();
          resolveRound();
          return;
        }
        game.appendAiReasoning(reasoning.slice(i, i + 3));
        i += 3;
        typewriterRef.current = setTimeout(stream, 20);
      };
      stream();
    } catch (err) {
      console.error("Trade submission failed:", err);
      game.completeAiReasoning();
      resolveRound();
    }
  }, [state.pendingTrades, state.round, state.predictionResult]);

  // ── 4. Resolve round → update prices + equity curve ───────────────────────
  const resolveRound = useCallback(async () => {
    game.setPhase("resolution");
    const gameId = localStorage.getItem("game_id")!;

    try {
      const data = await api.resolveRound(gameId);

      // Build newPrices in our StockPrice shape from backend's updated_stocks
      const updatedStocks = data.updated_stocks ?? data.stocks ?? {};
      const newPrices = Object.fromEntries(
        Object.entries(updatedStocks).map(([name, info]: [string, any]) => [
          name,
          {
            name: name as StockName,
            price:     info.price      ?? info,
            prevPrice: info.prev_price ?? info.price ?? info,
            change:    info.change     ?? 0,
            changePct: info.change_pct ?? 0,
          },
        ])
      ) as any;

      const playerValue = data.player_portfolio_value ?? data.player_portfolio?.totalValue ?? 100000;
      const aiValue     = data.ai_portfolio_value     ?? data.ai_portfolio?.totalValue     ?? 100000;

      game.resolveRound(
        newPrices,
        { ...state.playerPortfolio, totalValue: playerValue },
        { ...state.aiPortfolio,     totalValue: aiValue },
        { round: state.round, playerValue, aiValue }
      );

      // ── 5. Get coach debrief ────────────────────────────────────────────
      const debrief = await api.getDebrief(gameId, state.round);
      game.setDebrief(
        debrief.debrief_text ?? "Round complete.",
        debrief.round_lesson ?? debrief.debrief_text ?? ""
      );

    } catch (err) {
      console.error("Resolve failed:", err);
      game.setPhase("debrief");
      game.setDebrief("Round complete — could not load coach analysis.", "");
    }
  }, [state.round, state.playerPortfolio, state.aiPortfolio, game]);

  // ── Next round or results ──────────────────────────────────────────────────
  const handleNextRound = useCallback(() => {
    if (state.round >= state.totalRounds) {
      game.setPhase("results");
    } else {
      game.nextRound();
    }
  }, [state.round, state.totalRounds, game]);

  // ── Auto-advance news → prediction ────────────────────────────────────────
  useEffect(() => {
    if (state.phase !== "news_reveal") return;
    const t = setTimeout(() => game.setPhase("prediction"), 3000);
    return () => clearTimeout(t);
  }, [state.phase, state.round]);

  // Cleanup typewriter
  useEffect(() => () => { if (typewriterRef.current) clearTimeout(typewriterRef.current); }, []);

  // ── Results ────────────────────────────────────────────────────────────────
  if (state.phase === "results") {
    return <ResultsScreen state={state} onPlayAgain={() => { localStorage.clear(); router.push("/"); }} />;
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (state.phase === "loading") {
    return (
      <div className="min-h-screen bg-navy flex flex-col items-center justify-center gap-6">
        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }}
          className="font-display text-2xl font-black text-white">
          STOCK<span className="text-gain">★</span>STAR
        </motion.div>
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div key={i} animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 1, delay: i * 0.15 }}
              className="w-2 h-2 rounded-full bg-gain" />
          ))}
        </div>
        <p className="text-sm text-white/30 font-mono">Loading market data...</p>
      </div>
    );
  }

  const isTrading = state.phase === "trading";
  const isDebrief = state.phase === "debrief" || state.phase === "resolution";

  return (
    <div className="min-h-screen bg-navy flex flex-col">
      <div className="scanline-overlay" />
      <Ticker prices={state.prices} />
      <TopBar round={state.round} totalRounds={state.totalRounds} playerPortfolio={state.playerPortfolio} aiPortfolio={state.aiPortfolio} />

      <div className="flex-1 grid grid-cols-[1fr_2fr_1fr] gap-5 p-5 min-h-0">

        {/* Left — news + prediction + debrief */}
        <div className="flex flex-col gap-5 min-h-0 overflow-y-auto">
          {state.currentRound && (
            <>
              <AnimatePresence mode="wait">
                <NewsCard key={state.round} round={state.currentRound} visible={true} />
              </AnimatePresence>

              <AnimatePresence>
                {state.phase === "prediction" && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <PredictionPhase onPredict={handlePredict} result={state.predictionResult} />
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {isDebrief && state.debrief && (
                  <DebriefCard
                    text={state.debrief}
                    roundNumber={state.round}
                    onNext={handleNextRound}
                    isLastRound={state.round >= state.totalRounds}
                  />
                )}
              </AnimatePresence>
            </>
          )}
        </div>

        {/* Center — timer + stock grid + equity curve */}
        <div className="flex flex-col gap-5 min-h-0">
          <AnimatePresence>
            {isTrading && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="flex justify-center">
                <CountdownTimer seconds={60} onComplete={handleTradeTimerComplete} paused={!isTrading} />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1 grid grid-cols-2 gap-4 content-start overflow-y-auto">
            {(Object.keys(state.prices) as StockName[]).map((name) => (
              <StockCard
                key={name}
                stock={state.prices[name]}
                trade={state.pendingTrades[name]}
                onTrade={(stockName: StockName, trade: Trade) => game.setTrade(stockName, trade)}
                locked={!isTrading}
              />
            ))}
          </div>

          <div className="rounded-2xl border border-white/8 p-5" style={{ background: "rgba(255,255,255,0.01)" }}>
            <div className="flex items-center gap-4 mb-2">
              <span className="text-xs font-mono text-white/30 uppercase tracking-widest">Portfolio</span>
              <div className="flex items-center gap-3 ml-auto">
                <LegendDot color="#00FF87" label="You" />
                <LegendDot color="#FFD700" label="AI" dashed />
              </div>
            </div>
            <EquityCurve data={state.equityHistory} compact />
          </div>
        </div>

        {/* Right — AI reasoning */}
        <div className="min-h-0">
          <AIReasoningPanel phase={state.phase} reasoning={state.aiReasoning} complete={state.aiReasoningComplete} />
        </div>

      </div>
    </div>
  );
}

function LegendDot({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-4 h-0.5" style={{ background: dashed ? "transparent" : color, borderBottom: dashed ? `2px dashed ${color}` : "none" }} />
      <span className="text-xs font-mono" style={{ color }}>{label}</span>
    </div>
  );
}