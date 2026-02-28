"use client"
import { createContext, useContext, useState, ReactNode } from "react"
import { Stock} from "@/src/types/game";  
import { Trade } from "@/src/types/game";

interface GameState {
  gameId: string | null
  currentRound: number
  totalRounds: number
  currentPhase: "news" | "prediction" | "trading" | "resolution" | "debrief" | "results"
  headline: string
  correctSector: string
  stocks: Stock[]
  playerCash: number
  aiCash: number
  playerHoldings: Record<string, number>
  aiHoldings: Record<string, number>
  playerTrades: Trade[]
  predictedSector: string
  playerPortfolioHistory: number[]
  aiPortfolioHistory: number[]
  aiReasoning: string
  playerPredictedCorrectly: boolean
  lessons: any[]
  playerName: string
}

interface GameContextType {
  state: GameState
  setState: (updates: Partial<GameState>) => void
  resetGame: () => void
}

const defaultState: GameState = {
  gameId: null,
  currentRound: 1,
  totalRounds: 10,
  currentPhase: "news",
  headline: "",
  correctSector: "",
  stocks: [],
  playerCash: 10000,
  aiCash: 10000,
  playerHoldings: {},
  aiHoldings: {},
  playerTrades: [],
  predictedSector: "",
  playerPortfolioHistory: [10000],
  aiPortfolioHistory: [10000],
  aiReasoning: "",
  playerPredictedCorrectly: false,
  lessons: [],
  playerName: "Player"
}

const GameContext = createContext<GameContextType | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setStateRaw] = useState<GameState>(defaultState)

  const setState = (updates: Partial<GameState>) => {
    setStateRaw(prev => ({ ...prev, ...updates }))
  }

  const resetGame = () => setStateRaw(defaultState)

  return (
    <GameContext.Provider value={{ state, setState, resetGame }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error("useGame must be used inside GameProvider")
  return ctx
}