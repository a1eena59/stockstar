"use client";

import { StockName, StockPrice } from "@/src/types/game";

interface TickerProps {
  prices: Record<StockName, StockPrice>;
}

export default function Ticker({ prices }: TickerProps) {
  const items = Object.values(prices);
  // Duplicate for seamless loop
  const all = [...items, ...items];

  return (
    <div className="overflow-hidden bg-navy-800 border-b border-white/5 h-8 flex items-center">
      <div className="flex animate-ticker-scroll whitespace-nowrap">
        {all.map((stock, i) => {
          const isGain = stock.changePct >= 0;
          const color = isGain ? "text-gain" : "text-loss";
          const arrow = isGain ? "▲" : "▼";
          return (
            <span key={i} className="inline-flex items-center gap-1.5 px-4 text-xs font-mono border-r border-white/5">
              <span className="text-white/60">{stock.name}</span>
              <span className="text-white font-medium">${stock.price.toFixed(2)}</span>
              <span className={color}>{arrow} {Math.abs(stock.changePct).toFixed(2)}%</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}