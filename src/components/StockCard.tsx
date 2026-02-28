"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StockName, StockPrice, TradeAction, Trade } from "@/src/types/game";
import { STOCKS } from "@/src/types/game";  // Import STOCKS from types, not from useGameState
import { getSectorColor } from "@/src/hooks/useGameState";  // This is correct, keep it

interface StockCardProps {
  stock: StockPrice;
  trade: Trade | undefined;
  onTrade: (stock: StockName, trade: Trade) => void;
  locked: boolean;
}

export default function StockCard({ stock, trade, onTrade, locked }: StockCardProps) {
  const [qty, setQty] = useState(1);
  const info = STOCKS[stock.name];
  const isGain = stock.changePct >= 0;
  const hasChange = stock.change !== 0;

  const handleAction = useCallback((action: TradeAction) => {
    onTrade(stock.name, { stock: stock.name, action, quantity: qty });
  }, [stock.name, qty, onTrade]);

  const actionColor = {
    buy: "border-gain/60 bg-gain/10 text-gain hover:bg-gain/20",
    sell: "border-loss/60 bg-loss/10 text-loss hover:bg-loss/20",
    hold: "border-white/20 bg-white/5 text-white/60 hover:bg-white/10",
  };

  const selectedAction = trade?.action;

  return (
    <motion.div
      layout
      className="rounded-xl border border-white/8 p-4 relative overflow-hidden"
      style={{
        background: hasChange && isGain
          ? "linear-gradient(135deg, rgba(0,255,135,0.04) 0%, rgba(10,14,26,1) 60%)"
          : hasChange
          ? "linear-gradient(135deg, rgba(255,69,96,0.04) 0%, rgba(10,14,26,1) 60%)"
          : "rgba(255,255,255,0.02)",
      }}
      animate={hasChange ? { borderColor: isGain ? "rgba(0,255,135,0.3)" : "rgba(255,69,96,0.3)" } : {}}
      transition={{ duration: 0.5 }}
    >
      {/* Sector tag */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display text-sm font-bold text-white">{stock.name}</span>
            <span
              className="text-xs px-1.5 py-0.5 rounded font-mono"
              style={{
                background: `${getSectorColor(info.sector)}20`,
                color: getSectorColor(info.sector),
              }}
            >
              {info.ticker}
            </span>
          </div>
          <span className="text-xs text-white/30 font-body">{info.sector}</span>
        </div>

        <div className="text-right">
          <motion.div
            key={stock.price}
            initial={hasChange ? { scale: 1.1 } : {}}
            animate={{ scale: 1 }}
            className="font-mono text-base font-bold text-white"
          >
            ${stock.price.toFixed(2)}
          </motion.div>
          {hasChange && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-xs font-mono font-bold ${isGain ? "text-gain" : "text-loss"}`}
            >
              {isGain ? "▲" : "▼"} {Math.abs(stock.changePct).toFixed(2)}%
            </motion.div>
          )}
        </div>
      </div>

      {/* Trade controls */}
      <div className="flex items-center gap-2">
        {/* Qty */}
        <div className="flex items-center gap-1 mr-1">
          <button
            onClick={() => setQty(Math.max(1, qty - 1))}
            disabled={locked}
            className="w-5 h-5 rounded text-xs bg-white/5 hover:bg-white/10 text-white/60 transition-colors disabled:opacity-40"
          >
            −
          </button>
          <span className="w-4 text-center text-xs font-mono text-white/60">{qty}</span>
          <button
            onClick={() => setQty(Math.min(100, qty + 1))}
            disabled={locked}
            className="w-5 h-5 rounded text-xs bg-white/5 hover:bg-white/10 text-white/60 transition-colors disabled:opacity-40"
          >
            +
          </button>
        </div>

        {/* Action buttons */}
        {(["buy", "sell", "hold"] as TradeAction[]).map((action) => (
          <button
            key={action}
            onClick={() => handleAction(action)}
            disabled={locked}
            className={`flex-1 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed ${
              selectedAction === action
                ? action === "buy"
                  ? "border-gain bg-gain/20 text-gain ring-1 ring-gain/40"
                  : action === "sell"
                  ? "border-loss bg-loss/20 text-loss ring-1 ring-loss/40"
                  : "border-white/30 bg-white/10 text-white ring-1 ring-white/20"
                : actionColor[action]
            }`}
          >
            {action}
          </button>
        ))}
      </div>

      {/* Selected indicator */}
      {selectedAction && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full"
          style={{
            background: selectedAction === "buy" ? "#00FF87" : selectedAction === "sell" ? "#FF4560" : "#9CA3AF",
          }}
        />
      )}
    </motion.div>
  );
}