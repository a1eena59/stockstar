"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";

interface CountdownTimerProps {
  seconds: number;
  onComplete: () => void;
  paused?: boolean;
}

export default function CountdownTimer({ seconds, onComplete, paused }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    setTimeLeft(seconds);
  }, [seconds]);

  useEffect(() => {
    if (paused) return;
    if (timeLeft <= 0) {
      onComplete();
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, paused, onComplete]);

  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const progress = timeLeft / seconds;
  const strokeDashoffset = circumference * (1 - progress);

  const color = progress > 0.5 ? "#00FF87" : progress > 0.25 ? "#FFD700" : "#FF4560";
  const isUrgent = timeLeft <= 10;

  return (
    <div className="flex flex-col items-center gap-1">
      <motion.div
        animate={isUrgent ? { scale: [1, 1.05, 1] } : {}}
        transition={{ repeat: Infinity, duration: 0.8 }}
        className="relative"
      >
        <svg width={72} height={72} className="-rotate-90">
          {/* Track */}
          <circle
            cx={36} cy={36} r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={4}
          />
          {/* Progress */}
          <motion.circle
            cx={36} cy={36} r={radius}
            fill="none"
            stroke={color}
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
            transition={{ duration: 0.9, ease: "linear" }}
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            key={timeLeft}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="font-mono font-bold text-xl"
            style={{ color }}
          >
            {timeLeft}
          </motion.span>
        </div>
      </motion.div>
      <span className="text-xs text-white/30 font-mono uppercase tracking-widest">
        seconds
      </span>
    </div>
  );
}