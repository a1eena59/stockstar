"use client";

import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { EquityPoint } from "@/src/types/game";

interface EquityCurveProps {
  data: EquityPoint[];
  compact?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-navy-800 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono">
      <div className="text-white/40 mb-1">Round {label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color }}>
          {p.name}: ${p.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </div>
      ))}
    </div>
  );
};

export default function EquityCurve({ data, compact = false }: EquityCurveProps) {
  const height = compact ? 90 : 140;

  if (data.length < 2) {
    return (
      <div style={{ height }} className="flex items-center justify-center">
        <p className="text-xs text-white/20 font-mono">Chart updates after each round</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
        <XAxis
          dataKey="round"
          tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "Share Tech Mono" }}
          tickLine={false}
          axisLine={false}
          label={compact ? undefined : { value: "Round", position: "insideBottom", fill: "rgba(255,255,255,0.2)", fontSize: 10 }}
        />
        <YAxis
          tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "Share Tech Mono" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          width={44}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={100000} stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
        <Line
          type="monotone"
          dataKey="playerValue"
          name="You"
          stroke="#00FF87"
          strokeWidth={2}
          dot={{ r: 3, fill: "#00FF87", strokeWidth: 0 }}
          activeDot={{ r: 5, fill: "#00FF87" }}
          isAnimationActive={true}
          animationDuration={600}
          animationEasing="ease-out"
        />
        <Line
          type="monotone"
          dataKey="aiValue"
          name="AI"
          stroke="#FFD700"
          strokeWidth={2}
          dot={{ r: 3, fill: "#FFD700", strokeWidth: 0 }}
          activeDot={{ r: 5, fill: "#FFD700" }}
          isAnimationActive={true}
          animationDuration={600}
          animationEasing="ease-out"
          strokeDasharray="5 3"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}