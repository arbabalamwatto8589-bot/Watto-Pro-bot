export type Timeframe = '5SEC' | '15SEC' | '30SEC' | '1M' | '2M' | '3M' | '5M' | '15M' | '30M';

export type TradeDuration =
  | '5 SEC'
  | '15 SEC'
  | '30 SEC'
  | '1 MIN'
  | '2 MIN'
  | '3 MIN'
  | '5 MIN'
  | '15 MIN'
  | '30 MIN';

export const TRADE_DURATIONS: TradeDuration[] = [
  '5 SEC',
  '15 SEC',
  '30 SEC',
  '1 MIN',
  '2 MIN',
  '3 MIN',
  '5 MIN',
  '15 MIN',
  '30 MIN',
];

export const TRADE_DURATION_SECONDS: Record<TradeDuration, number> = {
  '5 SEC': 5,
  '15 SEC': 15,
  '30 SEC': 30,
  '1 MIN': 60,
  '2 MIN': 120,
  '3 MIN': 180,
  '5 MIN': 300,
  '15 MIN': 900,
  '30 MIN': 1800,
};

export interface PairInfo {
  symbol: string;
  name: string;
  base: string;
  quote: string;
  baseRate: number;
  decimals: number;
  flagBase: string; // ISO 2 letter country code or flag emoji
  flagQuote: string;
}

export interface Candle {
  datetime: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  isClosed: boolean;
}

export interface IndicatorState {
  ema9: number;
  ema21: number;
  emaStatus: 'Bullish' | 'Bearish' | 'Neutral';
  rsi14: number;
  rsiStatus: 'Above 50' | 'Below 50' | 'Oversold (<30)' | 'Overbought (>70)';
  macd: {
    macd: number;
    signal: number;
    histogram: number;
    status: 'Bullish' | 'Bearish' | 'Bullish Crossover' | 'Bearish Crossover';
  };
  trend: 'Uptrend' | 'Downtrend' | 'Strong Uptrend' | 'Strong Downtrend' | 'Consolidation';
  supportResistance: {
    support: number;
    resistance: number;
    status: 'Near Support' | 'Near Resistance' | 'Breakout' | 'Mid-Range';
  };
  momentum: 'Strong Bullish' | 'Bullish' | 'Neutral' | 'Bearish' | 'Strong Bearish';
  atr14?: number;
  bollingerBands?: {
    upper: number;
    middle: number;
    lower: number;
    percentB: number;
    status: 'Above Upper' | 'Below Lower' | 'Inside Bands' | 'Squeeze';
  };
  candleStructure?: {
    pattern: string;
    bias: 'Bullish' | 'Bearish' | 'Neutral';
  };
}

export type BrokerType = 'Pocket Option' | 'Quotex';

export interface NormalizedBrokerData {
  broker: BrokerType;
  effectiveBroker?: BrokerType;
  isFallback?: boolean;
  pocketConnected?: boolean;
  quotexConnected?: boolean;
  feedLabel?: string;
  executionMode?: string;
  symbol: string;
  timestamp: number;
  price: number | null;
  bid: number | null;
  ask: number | null;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  timeframe: string;
  source: string;
  connected: boolean;
  isThirdParty?: boolean;
  statusMessage?: string;
  lastCandleClosed?: boolean;
  lastClosedCandle?: Candle | null;
  candles?: Candle[];
  lastUpdateFormatted?: string;
}

export interface PriceVerificationData {
  broker: BrokerType;
  symbol: string;
  brokerPrice: number | null;
  referencePrice: number | null;
  priceDifference: number | null;
  priceDifferenceFormatted: string;
  feedStatus: 'CONNECTED' | 'DISCONNECTED';
  referenceStatus: 'CONNECTED' | 'DISCONNECTED' | 'KEY_REQUIRED';
  referenceSource: string;
  tolerance: number;
  isSame: boolean;
  lastUpdate: string;
  notes: string;
}

export type SignalDecision = 'BUY' | 'SELL' | 'NO TRADE';

export interface SignalItem {
  id: string;
  timestamp: number;
  timeFormatted: string;
  lastCandleClosedTime: string;
  candleTimestamp?: number;
  dataTimestamp?: number;
  pair: string;
  timeframe: Timeframe;
  tradeDuration: TradeDuration;
  signal: SignalDecision;
  confidence: number;
  entryPrice: number;
  broker: BrokerType;
  indicators: IndicatorState;
  source: string;
  isDemo: boolean;
  outcome: 'PENDING' | 'WIN' | 'LOSS' | 'VOID';
  outcomePrice?: number;
  expiryTimestamp: number;
  methodologyNote?: string;
  dataStatus?: 'LIVE MARKET DATA' | 'OTC DATA UNAVAILABLE' | 'NO DIRECT BROKER FEED' | 'SYNCED' | 'STALE' | 'POCKET OPTION LIVE DATA UNAVAILABLE' | 'QUOTEX LIVE DATA UNAVAILABLE' | string;
}

export interface QuoteData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  percent_change: number;
  high: number;
  low: number;
  timestamp: string;
  isLive: boolean;
  isDemo: boolean;
  decimals: number;
  broker?: BrokerType;
  brokerLive?: boolean;
  source?: string;
  isOtcAvailable?: boolean;
  dataStatus?: 'LIVE MARKET DATA' | 'OTC DATA UNAVAILABLE' | 'NO DIRECT BROKER FEED' | 'SYNCED' | 'STALE' | 'POCKET OPTION LIVE DATA UNAVAILABLE' | 'QUOTEX LIVE DATA UNAVAILABLE' | string;
}

export interface TradingStats {
  totalSignals: number;
  buySignals: number;
  sellSignals: number;
  noTradeSignals: number;
  wins: number;
  losses: number;
  winRate: number;
  trackedCompleted: number;
}

export type MarketMode = 'NORMAL' | 'OTC';

export const FOREX_PAIRS: PairInfo[] = [
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', base: 'EUR', quote: 'USD', baseRate: 1.0845, decimals: 4, flagBase: '🇪🇺', flagQuote: '🇺🇸' },
  { symbol: 'GBP/USD', name: 'British Pound / US Dollar', base: 'GBP', quote: 'USD', baseRate: 1.3235, decimals: 4, flagBase: '🇬🇧', flagQuote: '🇺🇸' },
  { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', base: 'USD', quote: 'JPY', baseRate: 158.70, decimals: 2, flagBase: '🇺🇸', flagQuote: '🇯🇵' },
  { symbol: 'USD/CHF', name: 'US Dollar / Swiss Franc', base: 'USD', quote: 'CHF', baseRate: 0.8275, decimals: 4, flagBase: '🇺🇸', flagQuote: '🇨🇭' },
  { symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar', base: 'AUD', quote: 'USD', baseRate: 0.7028, decimals: 4, flagBase: '🇦🇺', flagQuote: '🇺🇸' },
  { symbol: 'USD/CAD', name: 'US Dollar / Canadian Dollar', base: 'USD', quote: 'CAD', baseRate: 1.4128, decimals: 4, flagBase: '🇺🇸', flagQuote: '🇨🇦' },
  { symbol: 'NZD/USD', name: 'New Zealand Dollar / US Dollar', base: 'NZD', quote: 'USD', baseRate: 0.5672, decimals: 4, flagBase: '🇳🇿', flagQuote: '🇺🇸' },
  { symbol: 'EUR/GBP', name: 'Euro / British Pound', base: 'EUR', quote: 'GBP', baseRate: 0.8602, decimals: 4, flagBase: '🇪🇺', flagQuote: '🇬🇧' },
  { symbol: 'EUR/JPY', name: 'Euro / Japanese Yen', base: 'EUR', quote: 'JPY', baseRate: 180.66, decimals: 2, flagBase: '🇪🇺', flagQuote: '🇯🇵' },
  { symbol: 'GBP/JPY', name: 'British Pound / Japanese Yen', base: 'GBP', quote: 'JPY', baseRate: 210.02, decimals: 2, flagBase: '🇬🇧', flagQuote: '🇯🇵' },
];

export const OTC_PAIRS: PairInfo[] = [
  { symbol: 'EUR/USD (OTC)', name: 'Euro / US Dollar OTC', base: 'EUR', quote: 'USD', baseRate: 1.0854, decimals: 4, flagBase: '🇪🇺', flagQuote: '🇺🇸' },
  { symbol: 'GBP/USD (OTC)', name: 'British Pound / US Dollar OTC', base: 'GBP', quote: 'USD', baseRate: 1.2642, decimals: 4, flagBase: '🇬🇧', flagQuote: '🇺🇸' },
  { symbol: 'USD/JPY (OTC)', name: 'US Dollar / Japanese Yen OTC', base: 'USD', quote: 'JPY', baseRate: 149.32, decimals: 2, flagBase: '🇺🇸', flagQuote: '🇯🇵' },
  { symbol: 'USD/CHF (OTC)', name: 'US Dollar / Swiss Franc OTC', base: 'USD', quote: 'CHF', baseRate: 0.8975, decimals: 4, flagBase: '🇺🇸', flagQuote: '🇨🇭' },
  { symbol: 'AUD/USD (OTC)', name: 'Australian Dollar / US Dollar OTC', base: 'AUD', quote: 'USD', baseRate: 0.6421, decimals: 4, flagBase: '🇦🇺', flagQuote: '🇺🇸' },
  { symbol: 'USD/CAD (OTC)', name: 'US Dollar / Canadian Dollar OTC', base: 'USD', quote: 'CAD', baseRate: 1.4125, decimals: 4, flagBase: '🇺🇸', flagQuote: '🇨🇦' },
  { symbol: 'NZD/USD (OTC)', name: 'New Zealand Dollar / US Dollar OTC', base: 'NZD', quote: 'USD', baseRate: 0.5675, decimals: 4, flagBase: '🇳🇿', flagQuote: '🇺🇸' },
  { symbol: 'EUR/GBP (OTC)', name: 'Euro / British Pound OTC', base: 'EUR', quote: 'GBP', baseRate: 0.8582, decimals: 4, flagBase: '🇪🇺', flagQuote: '🇬🇧' },
  { symbol: 'EUR/JPY (OTC)', name: 'Euro / Japanese Yen OTC', base: 'EUR', quote: 'JPY', baseRate: 162.15, decimals: 2, flagBase: '🇪🇺', flagQuote: '🇯🇵' },
  { symbol: 'GBP/JPY (OTC)', name: 'British Pound / Japanese Yen OTC', base: 'GBP', quote: 'JPY', baseRate: 188.75, decimals: 2, flagBase: '🇬🇧', flagQuote: '🇯🇵' },
  { symbol: 'AUD/CAD (OTC)', name: 'Australian / Canadian Dollar OTC', base: 'AUD', quote: 'CAD', baseRate: 0.9075, decimals: 4, flagBase: '🇦🇺', flagQuote: '🇨🇦' },
  { symbol: 'AUD/JPY (OTC)', name: 'Australian Dollar / Japanese Yen OTC', base: 'AUD', quote: 'JPY', baseRate: 95.85, decimals: 2, flagBase: '🇦🇺', flagQuote: '🇯🇵' },
  { symbol: 'CAD/JPY (OTC)', name: 'Canadian Dollar / Japanese Yen OTC', base: 'CAD', quote: 'JPY', baseRate: 105.70, decimals: 2, flagBase: '🇨🇦', flagQuote: '🇯🇵' },
  { symbol: 'EUR/AUD (OTC)', name: 'Euro / Australian Dollar OTC', base: 'EUR', quote: 'AUD', baseRate: 1.6905, decimals: 4, flagBase: '🇪🇺', flagQuote: '🇦🇺' },
  { symbol: 'EUR/CAD (OTC)', name: 'Euro / Canadian Dollar OTC', base: 'EUR', quote: 'CAD', baseRate: 1.5330, decimals: 4, flagBase: '🇪🇺', flagQuote: '🇨🇦' },
  { symbol: 'GBP/AUD (OTC)', name: 'British Pound / Australian Dollar OTC', base: 'GBP', quote: 'AUD', baseRate: 1.9685, decimals: 4, flagBase: '🇬🇧', flagQuote: '🇦🇺' },
  { symbol: 'GBP/CAD (OTC)', name: 'British Pound / Canadian Dollar OTC', base: 'GBP', quote: 'CAD', baseRate: 1.7850, decimals: 4, flagBase: '🇬🇧', flagQuote: '🇨🇦' },
  { symbol: 'NZD/JPY (OTC)', name: 'New Zealand Dollar / Japanese Yen OTC', base: 'NZD', quote: 'JPY', baseRate: 84.70, decimals: 2, flagBase: '🇳🇿', flagQuote: '🇯🇵' },
  { symbol: 'USD/PKR (OTC)', name: 'US Dollar / Pakistani Rupee OTC', base: 'USD', quote: 'PKR', baseRate: 278.45, decimals: 2, flagBase: '🇺🇸', flagQuote: '🇵🇰' },
  { symbol: 'USD/INR (OTC)', name: 'US Dollar / Indian Rupee OTC', base: 'USD', quote: 'INR', baseRate: 86.85, decimals: 2, flagBase: '🇺🇸', flagQuote: '🇮🇳' },
  { symbol: 'BTC/USD (OTC)', name: 'Bitcoin / US Dollar OTC', base: 'BTC', quote: 'USD', baseRate: 87450.00, decimals: 2, flagBase: '🪙', flagQuote: '🇺🇸' },
  { symbol: 'ETH/USD (OTC)', name: 'Ethereum / US Dollar OTC', base: 'ETH', quote: 'USD', baseRate: 2650.00, decimals: 2, flagBase: '💎', flagQuote: '🇺🇸' },
];

export const ALL_SUPPORTED_PAIRS: PairInfo[] = [...FOREX_PAIRS, ...OTC_PAIRS];

export const TIMEFRAMES: Timeframe[] = ['5SEC', '15SEC', '30SEC', '1M', '2M', '3M', '5M', '15M', '30M'];
