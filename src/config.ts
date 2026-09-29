// WATTOPRO Data Source & Broker Synchronization Configuration
// Strictly enforces real-data only and prevents fabricated or simulated OTC prices.

export const DATA_SOURCE = {
  NORMAL: {
    source: "WATTOPRO_LIVE_FEED",
    endpoint: "/api/market/time_series",
    candle_endpoint: "/time_series",
  },
  OTC: {
    source: "BROKER_DIRECT",
    allowFallback: false,
  },
} as const;

export interface PriceFeedResult {
  price: number | null;
  livePrice?: number | null;
  candleSeries?: any[];
  timestamp?: string;
  dataSource?: string;
  dataStatus: string;
  status?: string;
  signal?: 'BUY' | 'SELL' | 'NO TRADE';
  canTrade?: boolean;
  reason?: string;
}

export function isOTC(asset: string): boolean {
  if (!asset) return false;
  return asset.toUpperCase().includes('OTC');
}

/**
 * Core getPriceFeed function:
 * - If asset is OTC, immediately returns OTC BROKER DATA NOT AVAILABLE / NO TRADE
 * - Only queries real market feed (WATTOPro Live Feed) for NORMAL forex assets
 */
export async function getPriceFeed(asset: string, broker: string = 'Pocket Option'): Promise<PriceFeedResult> {
  if (isOTC(asset)) {
    // DOM synchronization if elements exist
    if (typeof document !== 'undefined') {
      const priceEl = document.getElementById('priceDisplay');
      if (priceEl) priceEl.innerText = "OTC DATA UNAVAILABLE";
      const signalEl = document.getElementById('signalDisplay');
      if (signalEl) signalEl.innerText = "NO TRADE";
      const warningEl = document.getElementById('warningDisplay');
      if (warningEl) warningEl.innerText = "OTC BROKER DATA NOT AVAILABLE - NO TRADE";
    }

    return {
      price: null,
      livePrice: null,
      candleSeries: [],
      status: "OTC BROKER DATA NOT AVAILABLE",
      dataStatus: "OTC DATA UNAVAILABLE",
      dataSource: "None (Broker Direct Required)",
      signal: "NO TRADE",
      canTrade: false,
      reason: "OTC prices are broker-specific. Pocket Option & Quotex have NO public price API. No public API available.",
    };
  }

  // Only for NORMAL forex
  return fetchWattoProFeed(asset, '1min', broker);
}

/**
 * Fetches real market data from WATTOPro Live Feed (via server-side proxy / real interbank endpoints)
 */
export async function fetchWattoProFeed(symbol: string, interval: string = '1min', broker: string = 'Pocket Option'): Promise<PriceFeedResult> {
  try {
    const res = await fetch(`/api/market/time_series?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}&outputsize=100&broker=${encodeURIComponent(broker)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.candles) && data.candles.length > 0) {
        const candles = data.candles;
        const latest = candles[candles.length - 1];
        return {
          price: latest.close,
          livePrice: latest.close,
          candleSeries: candles,
          timestamp: latest.datetime || new Date().toISOString(),
          dataSource: data.source || "WATTOPro Live Feed",
          dataStatus: "LIVE MARKET DATA",
          signal: undefined,
          canTrade: true,
        };
      }
    }
  } catch (err) {
    console.warn("fetchWattoProFeed error:", err);
  }

  return {
    price: null,
    livePrice: null,
    candleSeries: [],
    timestamp: new Date().toISOString(),
    dataSource: "WATTOPro Live Feed (Feed Disconnected)",
    dataStatus: "DATA FEED DISCONNECTED",
    status: "DATA FEED DISCONNECTED",
    signal: "NO TRADE",
    canTrade: false,
    reason: "Failed to establish reliable connection with real market data feed.",
  };
}
