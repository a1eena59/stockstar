"use client";

import { motion } from "framer-motion";
import { RoundData } from "@/src/types/game";

interface NewsCardProps {
  round: RoundData;
  visible: boolean;
}

export default function NewsCard({ round, visible }: NewsCardProps) {
  return (
    <motion.div
      initial={{ y: -40, opacity: 0, scale: 0.97 }}
      animate={visible ? { y: 0, opacity: 1, scale: 1 } : {}}
      transition={{ type: "spring", damping: 22, stiffness: 200 }}
      className="relative rounded-xl overflow-hidden border border-white/10"
      style={{
        background: "linear-gradient(135deg, #0D1220 0%, #111827 100%)",
        boxShadow: "0 0 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      {/* Breaking news header bar */}
      <div className="flex items-center gap-3 px-5 py-2.5 border-b border-white/10"
        style={{ background: "linear-gradient(90deg, #FF4560 0%, #cc3549 100%)" }}>
        <motion.span
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
          className="w-2 h-2 rounded-full bg-white"
        />
        <span className="font-display text-xs font-bold tracking-[0.2em] text-white uppercase">
          Breaking News
        </span>
        <span className="ml-auto text-xs text-white/70 font-mono">
          {round.source}
        </span>
      </div>

      {/* Headline */}
      <div className="px-5 py-6">
        <motion.p
          initial={{ opacity: 0 }}
          animate={visible ? { opacity: 1 } : {}}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-xl font-body font-semibold leading-snug text-white"
        >
          {round.headline}
        </motion.p>
      </div>

      {/* Corner decoration */}
      <div className="absolute top-0 right-0 w-16 h-16 opacity-10"
        style={{ background: "radial-gradient(circle at top right, #FF4560, transparent)" }} />
    </motion.div>
  );
}