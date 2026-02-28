import { Stock, NewsItem } from './types';

export const STOCKS: Stock[] = [
  { 
    id: '1', 
    name: 'CloudCorp', 
    ticker: 'MSFT', 
    sector: 'Tech', 
    price: 378.45,
    changePercent: 0
  },
  { 
    id: '2', 
    name: 'ChipMaker', 
    ticker: 'NVDA', 
    sector: 'Tech', 
    price: 124.56,
    changePercent: 0
  },
  { 
    id: '3', 
    name: 'OilGiant', 
    ticker: 'XOM', 
    sector: 'Energy', 
    price: 112.34,
    changePercent: 0
  },
  { 
    id: '4', 
    name: 'GreenPower', 
    ticker: 'NEE', 
    sector: 'Energy', 
    price: 67.89,
    changePercent: 0
  },
  { 
    id: '5', 
    name: 'PharmaMax', 
    ticker: 'JNJ', 
    sector: 'Healthcare', 
    price: 156.78,
    changePercent: 0
  },
  { 
    id: '6', 
    name: 'BioLeap', 
    ticker: 'MRNA', 
    sector: 'Healthcare', 
    price: 89.23,
    changePercent: 0
  },
  { 
    id: '7', 
    name: 'RetailKing', 
    ticker: 'AMZN', 
    sector: 'Consumer Goods', 
    price: 178.34,
    changePercent: 0
  },
  { 
    id: '8', 
    name: 'BrandHouse', 
    ticker: 'PG', 
    sector: 'Consumer Goods', 
    price: 156.12,
    changePercent: 0
  },
];

export const DUMMY_NEWS: NewsItem[] = [
  { 
    headline: "Fed Signals Rate Hike in September", 
    source: "Bloomberg", 
    datetime: Date.now(), 
    sector: 'Tech',
    url: "#"
  },
  { 
    headline: "OPEC+ Announces Production Cuts", 
    source: "Reuters", 
    datetime: Date.now(), 
    sector: 'Energy',
    url: "#"
  },
  { 
    headline: "FDA Approves New Cancer Treatment", 
    source: "Medical News", 
    datetime: Date.now(), 
    sector: 'Healthcare',
    url: "#"
  },
  { 
    headline: "Consumer Spending Rises 2% in Q2", 
    source: "WSJ", 
    datetime: Date.now(), 
    sector: 'Consumer Goods',
    url: "#"
  },
  { 
    headline: "Tech Earnings Beat Expectations", 
    source: "CNBC", 
    datetime: Date.now(), 
    sector: 'Tech',
    url: "#"
  },
  { 
    headline: "Oil Prices Surge on Supply Concerns", 
    source: "Bloomberg", 
    datetime: Date.now(), 
    sector: 'Energy',
    url: "#"
  },
  { 
    headline: "Biotech Breakthrough in Gene Editing", 
    source: "Reuters", 
    datetime: Date.now(), 
    sector: 'Healthcare',
    url: "#"
  },
  { 
    headline: "Retail Sales Hit Record High", 
    source: "CNBC", 
    datetime: Date.now(), 
    sector: 'Consumer Goods',
    url: "#"
  },
];

// Game constants
export const STARTING_CASH = 10000;
export const ROUNDS_TOTAL = 10;
export const PREDICTION_TIME = 15; // seconds
export const TRADING_TIME = 60; // seconds