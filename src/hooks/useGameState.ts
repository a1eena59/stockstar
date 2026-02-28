"use client";

import { useReducer, useCallback } from "react";
import type {
  GameState,
  GamePhase,
  Trade,
  StockName,
  StockPrice,
  Portfolio,
  EquityPoint,
  RoundData,
  PredictionResult,
  Sector,
} from "@/src/types/game";
import { STOCKS } from "@/src/types/game";

const INITIAL_PRICES: Record<StockName, StockPrice> = Object.fromEntries(
  Object.keys(STOCKS).map((name) => [
    name as StockName,
    { name: name as StockName, price: 0, prevPrice: 0, change: 0, changePct: 0 },
  ])
) as Record<StockName, StockPrice>;

const INITIAL_PORTFOLIO: Portfolio = {
  cash: 100000,
  holdings: {},
  totalValue: 100000,
};

const initialState: GameState = {
  gameId: "",
  round: 0,
  totalRounds: 10,
  phase: "loading",
  prices: INITIAL_PRICES,
  playerPortfolio: INITIAL_PORTFOLIO,
  aiPortfolio: INITIAL_PORTFOLIO,
  equityHistory: [],
  rounds: [],
  currentRound: null,
  pendingTrades: {},
  predictionResult: null,
  aiReasoning: "",
  aiReasoningComplete: false,
  debrief: "",
  lessonsLearned: [],
};

type Action =
  | { type: "GAME_STARTED"; gameId: string; rounds: RoundData[]; prices: Record<StockName, number>; playerPortfolio: Portfolio; aiPortfolio: Portfolio }
  | { type: "SET_PHASE"; phase: GamePhase }
  | { type: "NEXT_ROUND" }
  | { type: "SET_TRADE"; stock: StockName; trade: Trade }
  | { type: "CLEAR_TRADES" }
  | { type: "SET_PREDICTION"; result: PredictionResult }
  | { type: "AI_REASONING_CHUNK"; chunk: string }
  | { type: "AI_REASONING_COMPLETE" }
  | { type: "ROUND_RESOLVED"; newPrices: Record<StockName, StockPrice>; playerPortfolio: Portfolio; aiPortfolio: Portfolio; equityPoint: EquityPoint }
  | { type: "SET_DEBRIEF"; text: string; lesson: string }
  | { type: "RESET" };

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "GAME_STARTED": {
      const prices: Record<StockName, StockPrice> = Object.fromEntries(
        Object.entries(action.prices).map(([name, price]) => [
          name,
          { name: name as StockName, price, prevPrice: price, change: 0, changePct: 0 },
        ])
      ) as Record<StockName, StockPrice>;

      return {
        ...state,
        gameId: action.gameId,
        rounds: action.rounds,
        prices,
        playerPortfolio: action.playerPortfolio,
        aiPortfolio: action.aiPortfolio,
        equityHistory: [{ round: 0, playerValue: action.playerPortfolio.totalValue, aiValue: action.aiPortfolio.totalValue }],
        phase: "news_reveal",
        round: 1,
        currentRound: action.rounds[0],
      };
    }

    case "SET_PHASE":
      return { ...state, phase: action.phase };

    case "NEXT_ROUND": {
      const nextRound = state.round + 1;
      if (nextRound > state.totalRounds) {
        return { ...state, phase: "results" };
      }
      return {
        ...state,
        round: nextRound,
        currentRound: state.rounds[nextRound - 1] || null,
        phase: "news_reveal",
        pendingTrades: {},
        predictionResult: null,
        aiReasoning: "",
        aiReasoningComplete: false,
        debrief: "",
      };
    }

    case "SET_TRADE":
      return {
        ...state,
        pendingTrades: { ...state.pendingTrades, [action.stock]: action.trade },
      };

    case "CLEAR_TRADES":
      return { ...state, pendingTrades: {} };

    case "SET_PREDICTION":
      return { ...state, predictionResult: action.result };

    case "AI_REASONING_CHUNK":
      return { ...state, aiReasoning: state.aiReasoning + action.chunk };

    case "AI_REASONING_COMPLETE":
      return { ...state, aiReasoningComplete: true };

    case "ROUND_RESOLVED":
      return {
        ...state,
        prices: action.newPrices,
        playerPortfolio: action.playerPortfolio,
        aiPortfolio: action.aiPortfolio,
        equityHistory: [...state.equityHistory, action.equityPoint],
        phase: "debrief",
      };

    case "SET_DEBRIEF":
      return {
        ...state,
        debrief: action.text,
        lessonsLearned: [...state.lessonsLearned, action.lesson],
      };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const startGame = useCallback((gameId: string, rounds: RoundData[], prices: Record<StockName, number>, playerPortfolio: Portfolio, aiPortfolio: Portfolio) => {
    dispatch({ type: "GAME_STARTED", gameId, rounds, prices, playerPortfolio, aiPortfolio });
  }, []);

  const setPhase = useCallback((phase: GamePhase) => {
    dispatch({ type: "SET_PHASE", phase });
  }, []);

  const nextRound = useCallback(() => {
    dispatch({ type: "NEXT_ROUND" });
  }, []);

  const setTrade = useCallback((stock: StockName, trade: Trade) => {
    dispatch({ type: "SET_TRADE", stock, trade });
  }, []);

  const setPrediction = useCallback((result: PredictionResult) => {
    dispatch({ type: "SET_PREDICTION", result });
  }, []);

  const appendAiReasoning = useCallback((chunk: string) => {
    dispatch({ type: "AI_REASONING_CHUNK", chunk });
  }, []);

  const completeAiReasoning = useCallback(() => {
    dispatch({ type: "AI_REASONING_COMPLETE" });
  }, []);

  const resolveRound = useCallback((
    newPrices: Record<StockName, StockPrice>,
    playerPortfolio: Portfolio,
    aiPortfolio: Portfolio,
    equityPoint: EquityPoint
  ) => {
    dispatch({ type: "ROUND_RESOLVED", newPrices, playerPortfolio, aiPortfolio, equityPoint });
  }, []);

  const setDebrief = useCallback((text: string, lesson: string) => {
    dispatch({ type: "SET_DEBRIEF", text, lesson });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  return {
    state,
    startGame,
    setPhase,
    nextRound,
    setTrade,
    setPrediction,
    appendAiReasoning,
    completeAiReasoning,
    resolveRound,
    setDebrief,
    resetGame,
  };
}

// Helper: get sector color
export function getSectorColor(sector: string): string {
  switch (sector) {
    case "Tech": return "#60A5FA";
    case "Energy": return "#FBBF24";
    case "Healthcare": return "#34D399";
    case "Consumer": return "#F472B6";
    default: return "#9CA3AF";
  }
}

// Helper: simulate price movement for demo mode
export function simulatePriceMovement(
  prices: Record<StockName, StockPrice>,
  headline: string
): Record<StockName, StockPrice> {
  // Simple keyword-based sentiment
  const isRateHike = /rate hike|fed|federal reserve/i.test(headline);
  const isOilNews = /opec|oil|energy|crude/i.test(headline);
  const isBioNews = /fda|mRNA|vaccine|drug/i.test(headline);
  const isTechBoom = /nvidia|ai chip|cloud|earnings beat/i.test(headline);
  const isTechBust = /layoffs|microsoft cuts|tech job/i.test(headline);

  const multipliers: Record<StockName, number> = {
    CloudCorp: isRateHike ? -0.06 : isTechBoom ? 0.05 : isTechBust ? -0.07 : 0.01,
    ChipMaker: isRateHike ? -0.05 : isTechBoom ? 0.09 : isTechBust ? -0.05 : 0.01,
    OilGiant: isOilNews ? 0.08 : isRateHike ? 0.02 : -0.01,
    GreenPower: isOilNews ? 0.04 : isRateHike ? -0.03 : 0.01,
    PharmaMax: isBioNews ? 0.05 : isRateHike ? -0.01 : 0.005,
    BioLeap: isBioNews ? 0.12 : isRateHike ? -0.02 : -0.01,
    RetailKing: isTechBoom ? 0.04 : isRateHike ? -0.03 : 0.01,
    BrandHouse: isRateHike ? -0.01 : 0.005,
  };

  return Object.fromEntries(
    Object.entries(prices).map(([name, stock]) => {
      const mult = multipliers[name as StockName] + (Math.random() - 0.5) * 0.02;
      const newPrice = stock.price * (1 + mult);
      const change = newPrice - stock.price;
      return [name, {
        ...stock,
        prevPrice: stock.price,
        price: newPrice,
        change,
        changePct: (change / stock.price) * 100,
      }];
    })
  ) as Record<StockName, StockPrice>;
}

// Helper: execute AI trades based on headline (demo mode)
export function generateAiTrades(
  headline: string,
  portfolio: Portfolio,
  prices: Record<StockName, StockPrice>
): { reasoning: string } {
  const isRateHike = /rate hike|fed|federal reserve/i.test(headline);
  const isOilNews = /opec|oil|energy|crude/i.test(headline);
  const isBioNews = /fda|mRNA|vaccine|drug/i.test(headline);
  const isTechBoom = /nvidia|ai chip|cloud|earnings beat/i.test(headline);

  if (isRateHike) {
    return { reasoning: "Headline signals Federal Reserve rate hike → rising discount rates compress present value of future earnings → growth stocks most vulnerable → Tech sector exposed due to elevated P/E multiples → executing SELL on CloudCorp and ChipMaker → rotating capital into Energy sector as inflation hedge → BUYING OilGiant → Healthcare maintained as defensive hold → Consumer Goods held as inflation pass-through buffer." };
  }
  if (isOilNews) {
    return { reasoning: "OPEC+ production cut creates supply shock → direct positive catalyst for upstream oil producers → executing BUY on OilGiant and GreenPower → commodity exposure increased to 30% of portfolio → Tech unaffected by this catalyst, holding current positions → Consumer Goods faces margin pressure from energy cost pass-through → trimming RetailKing position 15% as precaution." };
  }
  if (isBioNews) {
    return { reasoning: "FDA breakthrough designation represents binary event catalyst for Healthcare sector → mRNA platform validation directly benefits BioLeap — executing aggressive BUY position → PharmaMax benefits from sector halo effect, adding to position → pipeline assets repriced higher → reducing Energy and Consumer positions to fund Healthcare rotation → Tech unchanged." };
  }
  if (isTechBoom) {
    return { reasoning: "AI chip demand surge — direct revenue catalyst for semiconductor exposure → executing BUY on ChipMaker, increasing position to 25% of portfolio → cloud infrastructure demand follows — adding to CloudCorp → sector P/E expansion expected → trimming Energy as capital rotates from value to growth → Healthcare held, Consumer held." };
  }
  return { reasoning: "Headline presents mixed signals across sectors → no clear directional catalyst identified → maintaining current portfolio allocations → slight defensive rotation — increasing BrandHouse position as stability play → monitoring for follow-on news before committing capital → cash reserve preserved for higher-conviction opportunities." };
}