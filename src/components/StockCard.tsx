
// "use client";

// import { useState, useCallback } from "react";
// import { motion } from "framer-motion";
// import { StockName, StockPrice, TradeAction, Trade } from "@/src/types/game";
// import { STOCKS } from "@/src/types/game";
// import { getSectorColor } from "@/src/hooks/useGameState";

// interface StockCardProps {
//   stock: StockPrice;
//   trade: Trade | undefined;
//   onTrade: (stock: StockName, trade: Trade) => void;
//   locked: boolean;
//   owned?: number;
// }

// export default function StockCard({ stock, trade, onTrade, locked, owned = 0 }: StockCardProps) {
//   const [qty, setQty] = useState(1);
//   const info = STOCKS[stock.name];
//   const isGain = stock.changePct >= 0;
//   const hasChange = stock.change !== 0;
//   const selectedAction = trade?.action;
//   const canSell = owned > 0;

//   const handleAction = useCallback((action: TradeAction) => {
//     if (action === "sell" && !canSell) return;
//     // FIX 2 — Hold sends quantity 0, no qty spinner needed
//     const finalQty = action === "hold" ? 0 : action === "sell" ? Math.min(qty, owned) : qty;
//     onTrade(stock.name, { stock: stock.name, action, quantity: finalQty });
//   }, [stock.name, qty, onTrade, canSell, owned]);

//   const actionColor = {
//     buy:  "border-gain/60 bg-gain/10 text-gain hover:bg-gain/20",
//     sell: canSell
//       ? "border-loss/60 bg-loss/10 text-loss hover:bg-loss/20"
//       : "border-white/10 bg-transparent text-white/20 cursor-not-allowed",
//     hold: "border-white/20 bg-white/5 text-white/60 hover:bg-white/10",
//   };

//   // FIX 3 — Only show qty spinner for buy/sell, not hold
//   const showQty = selectedAction !== "hold" && !locked;

//   return (
//     <motion.div
//       layout
//       className="rounded-xl border border-white/8 p-4 relative overflow-hidden"
//       style={{
//         background: hasChange && isGain
//           ? "linear-gradient(135deg, rgba(0,255,135,0.04) 0%, rgba(10,14,26,1) 60%)"
//           : hasChange
//           ? "linear-gradient(135deg, rgba(255,69,96,0.04) 0%, rgba(10,14,26,1) 60%)"
//           : "rgba(255,255,255,0.02)",
//       }}
//       animate={hasChange ? { borderColor: isGain ? "rgba(0,255,135,0.3)" : "rgba(255,69,96,0.3)" } : {}}
//       transition={{ duration: 0.5 }}
//     >
//       {/* Top row — name + price */}
//       <div className="flex items-start justify-between mb-2">
//         <div>
//           <div className="flex items-center gap-2">
//             <span className="font-display text-sm font-bold text-white">{stock.name}</span>
//             <span className="text-xs px-1.5 py-0.5 rounded font-mono"
//               style={{ background: `${getSectorColor(info.sector)}20`, color: getSectorColor(info.sector) }}>
//               {info.ticker}
//             </span>
//           </div>
//           <span className="text-xs text-white/30 font-body">{info.sector}</span>
//         </div>

//         <div className="text-right">
//           <motion.div key={stock.price} initial={hasChange ? { scale: 1.1 } : {}} animate={{ scale: 1 }}
//             className="font-mono text-base font-bold text-white">
//             ${stock.price.toFixed(2)}
//           </motion.div>
//           {hasChange && (
//             <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
//               className={`text-xs font-mono font-bold ${isGain ? "text-gain" : "text-loss"}`}>
//               {isGain ? "▲" : "▼"} {Math.abs(stock.changePct).toFixed(2)}%
//             </motion.div>
//           )}
//         </div>
//       </div>

//       {/* Owned shares row */}
//       <div className="mb-3">
//         {owned > 0 ? (
//           <div className="flex items-center gap-1.5">
//             <div className="w-1.5 h-1.5 rounded-full bg-gain/60" />
//             <span className="text-xs font-mono text-white/50">
//               Owned: <span className="text-white/80 font-bold">{owned}</span>
//             </span>
//             <span className="text-xs font-mono text-white/30">
//               (${(owned * stock.price).toFixed(0)})
//             </span>
//           </div>
//         ) : (
//           <span className="text-xs font-mono text-white/20">No position</span>
//         )}
//       </div>

//       {/* Trade controls */}
//       <div className="flex items-center gap-2">

//         {/* FIX 3 — Qty spinner only shows for buy/sell, hidden for hold */}
//         {showQty ? (
//           <div className="flex flex-col items-center mr-1">
//             <span className="text-xs font-mono text-white/20 mb-0.5">qty</span>
//             <div className="flex items-center gap-1">
//               <button onClick={() => setQty(Math.max(1, qty - 1))} disabled={locked}
//                 className="w-5 h-5 rounded text-xs bg-white/5 hover:bg-white/10 text-white/60 transition-colors disabled:opacity-40">
//                 −
//               </button>
//               <span className="w-5 text-center text-xs font-mono text-white/60">{qty}</span>
//               <button onClick={() => setQty(Math.min(100, qty + 1))} disabled={locked}
//                 className="w-5 h-5 rounded text-xs bg-white/5 hover:bg-white/10 text-white/60 transition-colors disabled:opacity-40">
//                 +
//               </button>
//             </div>
//           </div>
//         ) : (
//           // Placeholder to keep button layout stable
//           <div className="w-9 mr-1" />
//         )}

//         {/* Buy / Sell / Hold buttons */}
//         {(["buy", "sell", "hold"] as TradeAction[]).map((action) => (
//           <button
//             key={action}
//             onClick={() => handleAction(action)}
//             disabled={locked || (action === "sell" && !canSell)}
//             title={action === "sell" && !canSell ? "You don't own any shares to sell" : undefined}
//             className={`flex-1 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all duration-150 disabled:cursor-not-allowed ${
//               selectedAction === action
//                 ? action === "buy"
//                   ? "border-gain bg-gain/20 text-gain ring-1 ring-gain/40"
//                   : action === "sell"
//                   ? "border-loss bg-loss/20 text-loss ring-1 ring-loss/40"
//                   : "border-white/30 bg-white/10 text-white ring-1 ring-white/20"
//                 : actionColor[action]
//             }`}
//           >
//             {action}
//           </button>
//         ))}
//       </div>

//       {/* Sell warning */}
//       {selectedAction === "sell" && qty > owned && owned > 0 && (
//         <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
//           className="text-xs text-loss/70 font-mono mt-2">
//           Max sell: {owned} shares
//         </motion.p>
//       )}

//       {/* Selected action dot */}
//       {selectedAction && (
//         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
//           className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full"
//           style={{
//             background: selectedAction === "buy" ? "#00FF87" : selectedAction === "sell" ? "#FF4560" : "#9CA3AF",
//           }} />
//       )}
//     </motion.div>
//   );
//}






"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { StockName, StockPrice, TradeAction, Trade } from "@/src/types/game";
import { STOCKS } from "@/src/types/game";
import { getSectorColor } from "@/src/hooks/useGameState";

interface StockCardProps {
  stock: StockPrice;
  trade: Trade | undefined;
  onTrade: (stock: StockName, trade: Trade) => void;
  locked: boolean;
  owned?: number;
}

export default function StockCard({ stock, trade, onTrade, locked, owned = 0 }: StockCardProps) {
  const [qty, setQty] = useState(1);
  const info = STOCKS[stock.name];
  const isGain = stock.changePct >= 0;
  const hasChange = stock.change !== 0;
  const selectedAction = trade?.action;
  const maxSell = owned;
  const canSell = owned > 0;

  const handleAction = useCallback(
    (action: TradeAction) => {
      if (action === "sell" && !canSell) return;
      const finalQty = action === "sell" ? Math.min(qty, maxSell) : qty;
      onTrade(stock.name, { stock: stock.name, action, quantity: finalQty });
    },
    [stock.name, qty, onTrade, canSell, maxSell]
  );

  // ── default: white button, black text ─────────────────────────────────────
  const actionColor = {
    buy:  "border-white bg-white text-black hover:bg-white/90",
    sell: canSell
      ? "border-white bg-white text-black hover:bg-white/90"
      : "border-white/20 bg-white/10 text-white/25 cursor-not-allowed",
    hold: "border-white bg-white text-black hover:bg-white/90",
  };

  // ── selected: gold button, black text ─────────────────────────────────────
  const activeColor = {
    buy:  "border-gold bg-gold text-black shadow-[0_0_14px_rgba(255,215,0,0.45)]",
    sell: "border-gold bg-gold text-black shadow-[0_0_14px_rgba(255,215,0,0.45)]",
    hold: "border-gold bg-gold text-black shadow-[0_0_14px_rgba(255,215,0,0.45)]",
  };

  return (
    <motion.div
      layout
      className="rounded-xl border border-white/8 relative overflow-hidden"
      style={{
        padding: "20px 18px 18px",
        background: hasChange && isGain
          ? "linear-gradient(135deg, rgba(0,255,135,0.04) 0%, rgba(10,14,26,1) 60%)"
          : hasChange
          ? "linear-gradient(135deg, rgba(255,69,96,0.04) 0%, rgba(10,14,26,1) 60%)"
          : "rgba(255,255,255,0.02)",
      }}
      animate={hasChange ? { borderColor: isGain ? "rgba(0,255,135,0.3)" : "rgba(255,69,96,0.3)" } : {}}
      transition={{ duration: 0.5 }}
    >
      {/* Top row — name + price */}
      <div className="flex items-start justify-between" style={{ marginBottom: "14px" }}>
        <div>
          <div className="flex items-center gap-2" style={{ marginBottom: "6px" }}>
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
            style={{ marginBottom: "4px" }}
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

      {/* Owned shares row */}
      <div style={{ marginBottom: "14px" }}>
        {owned > 0 ? (
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-gain/60" />
            <span className="text-xs font-mono text-white/50">
              Owned: <span className="text-white/80 font-bold">{owned}</span>
            </span>
            <span className="text-xs font-mono text-white/30">
              (${(owned * stock.price).toFixed(0)} value)
            </span>
          </div>
        ) : (
          <span className="text-xs font-mono text-white/20">No position</span>
        )}
      </div>

      {/* Divider */}
      <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", marginBottom: "14px" }} />

      {/* Trade controls */}
      <div className="flex items-center gap-2">
        {/* Qty spinner */}
        <div className="flex items-center gap-1 mr-1">
          <button
            onClick={() => setQty(Math.max(1, qty - 1))}
            disabled={locked}
            className="w-5 h-5 rounded text-xs bg-white/5 hover:bg-white/10 text-white/60 transition-colors disabled:opacity-40"
          >
            −
          </button>
          <span className="w-5 text-center text-xs font-mono text-white/60">{qty}</span>
          <button
            onClick={() => setQty(Math.min(100, qty + 1))}
            disabled={locked}
            className="w-5 h-5 rounded text-xs bg-white/5 hover:bg-white/10 text-white/60 transition-colors disabled:opacity-40"
          >
            +
          </button>
        </div>

        {/* Buy / Sell / Hold buttons */}
        {(["buy", "sell", "hold"] as TradeAction[]).map((action) => (
          <button
            key={action}
            onClick={() => handleAction(action)}
            disabled={locked || (action === "sell" && !canSell)}
            title={action === "sell" && !canSell ? "You don't own any shares to sell" : undefined}
            className={`flex-1 py-2 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all duration-150 disabled:cursor-not-allowed ${
              selectedAction === action
                ? activeColor[action]
                : actionColor[action]
            }`}
          >
            {action}
          </button>
        ))}
      </div>

      {/* Sell warning */}
      {selectedAction === "sell" && qty > maxSell && maxSell > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-loss/70 font-mono mt-2"
        >
          Max sell: {maxSell} shares
        </motion.p>
      )}

      {/* Selected action dot */}
      {selectedAction && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full"
          style={{
            background: selectedAction === "buy" ? "#00FF87"
              : selectedAction === "sell" ? "#FF4560"
              : "#9CA3AF",
          }}
        />
      )}
    </motion.div>
  );
}
