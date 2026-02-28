import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="min-h-screen bg-navy text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <h1 className="text-6xl font-bold mb-6">
          STOCK<span className="text-electric-green">STAR</span>
        </h1>
        <p className="text-2xl text-gray-300 mb-8 max-w-2xl">
          Compete against an AI that thinks like a real trader. 
          Learn how markets actually work.
        </p>
        
        {/* Stats / Hype Section */}
        <div className="grid grid-cols-3 gap-8 max-w-2xl mb-12">
          <div>
            <div className="text-3xl font-bold text-electric-green">8</div>
            <div className="text-gray-400">Real Stocks</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gold">10</div>
            <div className="text-gray-400">Trading Rounds</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-crisp-red">1</div>
            <div className="text-gray-400">AI Opponent</div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-4">
          <Link href="/game">
            <Button className="bg-electric-green text-navy hover:bg-electric-green/90 text-lg px-8 py-6">
              Start Game
            </Button>
          </Link>
          <Button variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8 py-6">
            How It Works
          </Button>
        </div>

        {/* Preview / Teaser */}
        <div className="mt-20 grid grid-cols-3 gap-6">
          <div className="bg-white/5 p-6 rounded-lg">
            <div className="text-gold font-bold mb-2">🤖 AI Reasoning</div>
            <div className="text-gray-300 text-sm">
              Watch the AI think out loud as it analyzes news and adjusts its portfolio
            </div>
          </div>
          <div className="bg-white/5 p-6 rounded-lg">
            <div className="text-gold font-bold mb-2">📊 Live Market Data</div>
            <div className="text-gray-300 text-sm">
              Real stock prices with news-driven movements
            </div>
          </div>
          <div className="bg-white/5 p-6 rounded-lg">
            <div className="text-gold font-bold mb-2">🎯 Personal Bridge</div>
            <div className="text-gray-300 text-sm">
              Connect game lessons to your real financial life
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}