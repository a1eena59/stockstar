export type Sector = 'Tech' | 'Energy' | 'Healthcare' | 'Consumer Goods';

export type Stock = {
  id: string;
  name: string; // e.g., "CloudCorp"
  ticker: string; // e.g., "MSFT"
  sector: Sector;
  price: number;
  previousPrice?: number;
  changePercent?: number;
};

export type Trade = {
  stockId: string;
  action: 'buy' | 'sell' | 'hold';
  quantity: number;
};

export type NewsItem = {
  headline: string;
  source: string;
  url?: string;
  datetime: number;
  sector?: Sector; // Which sector it actually impacts
};

export type Round = {
  roundNumber: number;
  news: NewsItem;
  playerTrades: Trade[];
  aiTrades: Trade[];
  prices: Stock[];
};