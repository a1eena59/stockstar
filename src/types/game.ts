// Stock universe
// // ─────────────────────────────────────────
// // STOCK UNIVERSE
// // ─────────────────────────────────────────

export const STOCKS = {
  CloudCorp:  { ticker: "MSFT", sector: "Tech",       name: "CloudCorp",  id: "cloudcorp"  },
  ChipMaker:  { ticker: "NVDA", sector: "Tech",       name: "ChipMaker",  id: "chipmaker"  },
  OilGiant:   { ticker: "XOM",  sector: "Energy",     name: "OilGiant",   id: "oilgiant"   },
  GreenPower: { ticker: "NEE",  sector: "Energy",     name: "GreenPower", id: "greenpower" },
  PharmaMax:  { ticker: "JNJ",  sector: "Healthcare", name: "PharmaMax",  id: "pharmamax"  },
  BioLeap:    { ticker: "MRNA", sector: "Healthcare", name: "BioLeap",    id: "bioleap"    },
  RetailKing: { ticker: "AMZN", sector: "Consumer",   name: "RetailKing", id: "retailking" },
  BrandHouse: { ticker: "PG",   sector: "Consumer",   name: "BrandHouse", id: "brandhouse" },
} as const;

export type StockName = keyof typeof STOCKS;
export type Sector = "Tech" | "Energy" | "Healthcare" | "Consumer";
export type TradeAction = "buy" | "sell" | "hold";

// ─────────────────────────────────────────
// ID ↔ DISPLAY NAME MAPS
// ─────────────────────────────────────────

export const NAME_TO_ID: Record<string, string> = {
  "CloudCorp":  "cloudcorp",
  "ChipMaker":  "chipmaker",
  "OilGiant":   "oilgiant",
  "GreenPower": "greenpower",
  "PharmaMax":  "pharmamax",
  "BioLeap":    "bioleap",
  "RetailKing": "retailking",
  "BrandHouse": "brandhouse",
};

export const ID_TO_NAME: Record<string, StockName> = {
  "cloudcorp":  "CloudCorp",
  "chipmaker":  "ChipMaker",
  "oilgiant":   "OilGiant",
  "greenpower": "GreenPower",
  "pharmamax":  "PharmaMax",
  "bioleap":    "BioLeap",
  "retailking": "RetailKing",
  "brandhouse": "BrandHouse",
};

// ─────────────────────────────────────────
// FRONTEND TYPES
// ─────────────────────────────────────────

export interface Stock {
  name: StockName;
  ticker: string;
  sector: Sector;
  price: number;
  change?: number;
  changePct?: number;
}

export interface StockPrice {
  name: StockName;
  price: number;
  prevPrice: number;
  change: number;
  changePct: number;
  sector: Sector;
  id: string;
}

export interface Trade {
  stock: StockName;
  action: TradeAction;
  quantity: number;
}

// What we send to the backend per trade
export interface BackendTrade {
  stock_id: string;
  action: TradeAction;
  quantity: number;
}

export interface RoundData {
  roundNumber?: number;
  headline: string;
  correct_sector: string;
  source?: string;
}

export interface Portfolio {
  cash: number;
  holdings: Partial<Record<StockName, number>>;
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
  invests: boolean;
  accountType: string;
  techAllocation: number;
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

// ─────────────────────────────────────────
// BACKEND API RESPONSE TYPES
// These match exactly what the backend returns
// ─────────────────────────────────────────

// Backend stock shape (inside arrays)
export interface BackendStock {
  id: string;
  display_name: string;
  sector: string;
  price: number;
  previous_price: number;
  change_pct: number;
}

// POST /game/start
export interface StartGameResponse {
  game_id: string;
  player_name: string;
  current_round: number;
  total_rounds: number;
  player_cash: number;
  ai_cash: number;
  stocks: BackendStock[];
  headline: string;
  correct_sector: string;
}

// POST /game/trade
export interface TradeResponse {
  ai_reasoning: string;
  ai_trades: BackendTrade[];
  sentiment_scores: Record<string, number>;
  player_predicted_correctly: boolean;
  correct_sector: string;
}

// POST /game/resolve
export interface ResolveResponse {
  round_number: number;
  updated_stocks: BackendStock[];
  price_changes: Record<string, number>;
  player_cash: number;
  ai_cash: number;
  player_portfolio_value: number;
  ai_portfolio_value: number;
  player_holdings: Record<string, number>;
  ai_holdings: Record<string, number>;
  game_over: boolean;
  next_headline: string | null;
  next_correct_sector: string | null;
}

// POST /game/debrief
export interface DebriefResponse {
  debrief_text: string;
  round_number: number;
}

// POST /game/bridge
export interface BridgeResponse {
  advice: string;
  player_name: string;
}

// GET /game/{game_id}/state
export interface GameStateResponse {
  game_id: string;
  current_round: number;
  player_cash: number;
  ai_cash: number;
  player_holdings: Record<string, number>;
  ai_holdings: Record<string, number>;
  current_prices: Record<string, number>;
  round_history: any[];
  headline: string | null;
}

// ─────────────────────────────────────────
// UTILITY — Convert backend stocks array
// to frontend StockPrice map
// ─────────────────────────────────────────

export function backendStocksTopriceMap(
  stocks: BackendStock[]
): Record<StockName, StockPrice> {
  const map = {} as Record<StockName, StockPrice>;

  for (const stock of stocks) {
    const displayName = (stock.display_name ?? ID_TO_NAME[stock.id]) as StockName;
    if (!displayName) continue;

    map[displayName] = {
      name:      displayName,
      price:     stock.price,
      prevPrice: stock.previous_price ?? stock.price,
      change:    stock.price - (stock.previous_price ?? stock.price),
      changePct: stock.change_pct ?? 0,
      sector:    stock.sector as Sector,
      id:        stock.id,
    };
  }

  return map;
}

// ─────────────────────────────────────────
// UTILITY — Convert frontend trades
// to backend trade format
// ─────────────────────────────────────────

export function frontendTradesToBackend(
  pendingTrades: Partial<Record<StockName, Trade>>
): BackendTrade[] {
  const result: BackendTrade[] = [];
  const tradedIds = new Set<string>();

  // Add trades the player made
  for (const trade of Object.values(pendingTrades)) {
    if (!trade) continue;
    const stockId = NAME_TO_ID[trade.stock];
    if (!stockId) continue;
    result.push({
      stock_id: stockId,
      action:   trade.action,
      quantity: trade.quantity,
    });
    tradedIds.add(stockId);
  }

  // Fill in hold for any stocks not traded
  for (const stockId of Object.values(NAME_TO_ID)) {
    if (!tradedIds.has(stockId)) {
      result.push({ stock_id: stockId, action: "hold", quantity: 0 });
    }
  }

  return result;
}
