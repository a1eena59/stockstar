"use client";

import { Portfolio } from "@/src/types/game";

interface TopBarProps {
  round: number;
  totalRounds: number;
  playerPortfolio: Portfolio;
  aiPortfolio: Portfolio;
}

export default function TopBar({ round, totalRounds, playerPortfolio, aiPortfolio }: TopBarProps) {
  const playerPnl = playerPortfolio.totalValue - 100000;
  const aiPnl = aiPortfolio.totalValue - 100000;

  return (
    <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-navy-800">
      {/* Left — Logo + Round */}
      <div className="flex items-center gap-4">
        <span className="font-display text-base font-black tracking-widest text-white">
          STOCK<span className="text-gain">★</span>STAR
        </span>
        <div className="h-4 w-px bg-white/10" />
        <span className="font-mono text-xs text-white/40">
          Week{" "}
          <span className="text-white font-bold">{round}</span>
          {" "}of{" "}
          <span className="text-white/60">{totalRounds}</span>
        </span>
      </div>

      {/* Center — Portfolio comparison */}
      <div className="flex items-center gap-6">
        <PortfolioStat
          label="You"
          value={playerPortfolio.totalValue}
          pnl={playerPnl}
          color="#00FF87"
        />
        <div className="h-6 w-px bg-white/10" />
        <PortfolioStat
          label="AI"
          value={aiPortfolio.totalValue}
          pnl={aiPnl}
          color="#FFD700"
        />
      </div>

      {/* Right — Cash */}
      <div className="text-right">
        <div className="text-xs text-white/30 font-mono uppercase tracking-widest">Cash</div>
        <div className="font-mono text-sm font-bold text-white">
          ${playerPortfolio.cash.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </div>
      </div>
    </div>
  );
}

function PortfolioStat({
  label, value, pnl, color,
}: { label: string; value: number; pnl: number; color: string }) {
  const isGain = pnl >= 0;
  return (
    <div className="text-center">
      <div className="text-xs font-mono uppercase tracking-widest mb-0.5" style={{ color }}>
        {label}
      </div>
      <div className="font-mono text-sm font-bold text-white">
        ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
      </div>
      <div className={`text-xs font-mono ${isGain ? "text-gain" : "text-loss"}`}>
        {isGain ? "+" : ""}{pnl.toLocaleString(undefined, { maximumFractionDigits: 0 })}
      </div>
    </div>
  );
}