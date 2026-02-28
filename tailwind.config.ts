import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: '#0A0E1A',
        'electric-green': '#00FF87',
        'crisp-red': '#FF4560',
        gold: '#FFD700',
      },
    },
  },
  plugins: [],
}

export default config