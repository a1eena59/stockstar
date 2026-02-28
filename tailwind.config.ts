import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0A0E1A",
          800: "#0D1220",
          700: "#111827",
          600: "#1a2235",
          500: "#1e2d45",
        },
        gain: "#00FF87",
        loss: "#FF4560",
        gold: "#FFD700",
        "gain-dim": "#00c965",
        "loss-dim": "#cc3549",
      },
      fontFamily: {
        display: ["var(--font-display)", "monospace"],
        mono: ["var(--font-mono)", "monospace"],
        body: ["var(--font-body)", "sans-serif"],
      },
      animation: {
        "ticker-scroll": "ticker-scroll 30s linear infinite",
        "pulse-gain": "pulse-gain 1s ease-in-out",
        "pulse-loss": "pulse-loss 1s ease-in-out",
        "fade-in-up": "fade-in-up 0.5s ease-out forwards",
        scanline: "scanline 8s linear infinite",
      },
      keyframes: {
        "ticker-scroll": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "pulse-gain": {
          "0%, 100%": { backgroundColor: "transparent" },
          "50%": { backgroundColor: "rgba(0, 255, 135, 0.2)" },
        },
        "pulse-loss": {
          "0%, 100%": { backgroundColor: "transparent" },
          "50%": { backgroundColor: "rgba(255, 69, 96, 0.2)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;