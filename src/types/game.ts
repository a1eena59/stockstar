// Stock universe
export const STOCKS = {
  CloudCorp: { ticker: "MSFT", sector: "Tech", name: "CloudCorp" },
  ChipMaker: { ticker: "NVDA", sector: "Tech", name: "ChipMaker" },
  OilGiant: { ticker: "XOM", sector: "Energy", name: "OilGiant" },
  GreenPower: { ticker: "NEE", sector: "Energy", name: "GreenPower" },
  PharmaMax: { ticker: "JNJ", sector: "Healthcare", name: "PharmaMax" },
  BioLeap: { ticker: "MRNA", sector: "Healthcare", name: "BioLeap" },
  RetailKing: { ticker: "AMZN", sector: "Consumer", name: "RetailKing" },
  BrandHouse: { ticker: "PG", sector: "Consumer", name: "BrandHouse" },
} as const;

export type StockName = keyof typeof STOCKS;
export type Sector = "Tech" | "Energy" | "Healthcare" | "Consumer";
export type TradeAction = "buy" | "sell" | "hold";

export interface StockPrice {
  name: StockName;
  price: number;
  prevPrice: number;
  change: number;
  changePct: number;
}

export interface Trade {
  stock: StockName;
  action: TradeAction;
  quantity: number;
}

export interface RoundData {
  roundNumber: number;
  headline: string;
  source: string;
  publishedAt?: string;
}

export interface GameState {
  gameId: string;
  round: number;
  totalRounds: number;
  phase: GamePhase;
  prices: Record<StockName, StockPrice>;
  playerPortfolio: Portfolio;
  aiPortfolio: Portfolio;
  equityHistory: EquityPoint[];
  rounds: RoundData[];
  currentRound: RoundData | null;
  pendingTrades: Partial<Record<StockName, Trade>>;
  predictionResult: PredictionResult | null;
  aiReasoning: string;
  aiReasoningComplete: boolean;
  debrief: string;
  lessonsLearned: string[];
}

export interface Portfolio {
  cash: number;
  holdings: Partial<Record<StockName, number>>; // stock -> quantity
  totalValue: number;
}

export interface EquityPoint {
  round: number;
  playerValue: number;
  aiValue: number;
}

export type GamePhase =
  | "loading"
  | "news_reveal"
  | "prediction"
  | "trading"
  | "ai_reasoning"
  | "resolution"
  | "debrief"
  | "between_rounds"
  | "results";

export interface PredictionResult {
  selected: Sector;
  correct: boolean;
  correctSector: Sector;
  bonusHint?: string;
}

export interface BridgeAnswers {
  invests: "yes" | "no" | "student";
  accountType?: "401k" | "mutual_fund" | "index_fund" | "stocks" | "not_sure";
  techAllocation?: number;
}

// API response types
export interface GameStartResponse {
  gameId: string;
  rounds: RoundData[];
  prices: Record<StockName, number>;
  playerPortfolio: Portfolio;
  aiPortfolio: Portfolio;
}

export interface TradeResponse {
  aiTrades: Trade[];
  aiReasoning: string; // streamed via SSE
}

export interface ResolveResponse {
  newPrices: Record<StockName, StockPrice>;
  playerPortfolio: Portfolio;
  aiPortfolio: Portfolio;
  equityPoint: EquityPoint;
}

export interface DebriefResponse {
  text: string;
  principlesCited: string[];
  roundLesson: string;
}

export interface BridgeResponse {
  advice: string;
}