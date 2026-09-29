import { Candle, IndicatorState } from '../types/trading';

/**
 * Calculates Exponential Moving Average (EMA)
 */
export function calculateEMA(prices: number[], period: number): number[] {
  if (prices.length < period) return [];
  const k = 2 / (period + 1);
  const emaArray: number[] = [];

  // Initial SMA as base
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += prices[i];
  }
  let prevEma = sum / period;
  emaArray.push(prevEma);

  for (let i = period; i < prices.length; i++) {
    const currentEma = prices[i] * k + prevEma * (1 - k);
    emaArray.push(currentEma);
    prevEma = currentEma;
  }

  return emaArray;
}

/**
 * Calculates Relative Strength Index (RSI 14)
 */
export function calculateRSI(prices: number[], period: number = 14): number[] {
  if (prices.length <= period) return [];

  const changes: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }

  let gains = 0;
  let losses = 0;

  for (let i = 0; i < period; i++) {
    if (changes[i] >= 0) gains += changes[i];
    else losses += Math.abs(changes[i]);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  const rsiArray: number[] = [];
  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  rsiArray.push(100 - 100 / (1 + rs));

  for (let i = period; i < changes.length; i++) {
    const change = changes[i];
    const gain = change >= 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - 100 / (1 + rs);
    rsiArray.push(rsi);
  }

  return rsiArray;
}

/**
 * Calculates MACD (12, 26, 9)
 */
export function calculateMACD(prices: number[]): {
  macdLine: number[];
  signalLine: number[];
  histogram: number[];
} {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);

  // Align length to ema26
  const offset = 26 - 12;
  const macdLine: number[] = [];

  for (let i = 0; i < ema26.length; i++) {
    macdLine.push(ema12[i + offset] - ema26[i]);
  }

  const signalLine = calculateEMA(macdLine, 9);
  const sigOffset = macdLine.length - signalLine.length;
  const histogram: number[] = [];

  for (let i = 0; i < signalLine.length; i++) {
    histogram.push(macdLine[i + sigOffset] - signalLine[i]);
  }

  return { macdLine, signalLine, histogram };
}

/**
 * Finds Support and Resistance levels from pivots
 */
export function findSupportResistance(candles: Candle[], currentPrice: number): {
  support: number;
  resistance: number;
  status: 'Near Support' | 'Near Resistance' | 'Breakout' | 'Mid-Range';
} {
  if (candles.length < 5) {
    return {
      support: currentPrice * 0.998,
      resistance: currentPrice * 1.002,
      status: 'Mid-Range',
    };
  }

  const lows = candles.map(c => c.low);
  const highs = candles.map(c => c.high);

  // Pivot lows
  const pivotLows: number[] = [];
  for (let i = 2; i < lows.length - 2; i++) {
    if (lows[i] <= lows[i - 1] && lows[i] <= lows[i - 2] && lows[i] <= lows[i + 1] && lows[i] <= lows[i + 2]) {
      pivotLows.push(lows[i]);
    }
  }

  // Pivot highs
  const pivotHighs: number[] = [];
  for (let i = 2; i < highs.length - 2; i++) {
    if (highs[i] >= highs[i - 1] && highs[i] >= highs[i - 2] && highs[i] >= highs[i + 1] && highs[i] >= highs[i + 2]) {
      pivotHighs.push(highs[i]);
    }
  }

  const supportsBelow = pivotLows.filter(l => l <= currentPrice);
  const resistancesAbove = pivotHighs.filter(h => h >= currentPrice);

  const nearestSupport = supportsBelow.length > 0 ? Math.max(...supportsBelow) : Math.min(...lows);
  const nearestResistance = resistancesAbove.length > 0 ? Math.min(...resistancesAbove) : Math.max(...highs);

  const range = nearestResistance - nearestSupport;
  const distToSupport = Math.abs(currentPrice - nearestSupport);
  const distToResistance = Math.abs(nearestResistance - currentPrice);

  let status: 'Near Support' | 'Near Resistance' | 'Breakout' | 'Mid-Range' = 'Mid-Range';
  if (currentPrice > nearestResistance) {
    status = 'Breakout';
  } else if (distToSupport <= range * 0.25) {
    status = 'Near Support';
  } else if (distToResistance <= range * 0.25) {
    status = 'Near Resistance';
  }

  return {
    support: nearestSupport,
    resistance: nearestResistance,
    status,
  };
}

/**
 * Calculates Average True Range (ATR 14)
 */
export function calculateATR(candles: Candle[], period: number = 14): number {
  if (candles.length < 2) return 0.0001;

  const trueRanges: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const current = candles[i];
    const prev = candles[i - 1];
    const tr = Math.max(
      current.high - current.low,
      Math.abs(current.high - prev.close),
      Math.abs(current.low - prev.close)
    );
    trueRanges.push(tr);
  }

  if (trueRanges.length < period) {
    const sum = trueRanges.reduce((acc, v) => acc + v, 0);
    return trueRanges.length > 0 ? sum / trueRanges.length : 0.0001;
  }

  // Initial average
  let atr = trueRanges.slice(0, period).reduce((acc, v) => acc + v, 0) / period;

  // Smoothed Wilder's ATR
  for (let i = period; i < trueRanges.length; i++) {
    atr = (atr * (period - 1) + trueRanges[i]) / period;
  }

  return atr;
}

/**
 * Calculates Bollinger Bands (period: 20, multiplier: 2)
 */
export function calculateBollingerBands(
  prices: number[],
  period: number = 20,
  multiplier: number = 2
): {
  upper: number;
  middle: number;
  lower: number;
  percentB: number;
  bandwidth: number;
  status: 'Above Upper' | 'Below Lower' | 'Inside Bands' | 'Squeeze';
} {
  const current = prices[prices.length - 1] || 1;
  if (prices.length < period) {
    return {
      upper: current * 1.002,
      middle: current,
      lower: current * 0.998,
      percentB: 0.5,
      bandwidth: 0.004,
      status: 'Inside Bands',
    };
  }

  const slice = prices.slice(-period);
  const middle = slice.reduce((a, b) => a + b, 0) / period;

  const variance = slice.reduce((acc, p) => acc + Math.pow(p - middle, 2), 0) / period;
  const stdDev = Math.sqrt(variance);

  const upper = middle + multiplier * stdDev;
  const lower = middle - multiplier * stdDev;
  const bandwidth = (upper - lower) / (middle || 1);
  const percentB = (current - lower) / (upper - lower || 0.00001);

  let status: 'Above Upper' | 'Below Lower' | 'Inside Bands' | 'Squeeze' = 'Inside Bands';
  if (bandwidth < 0.0015) {
    status = 'Squeeze';
  } else if (current >= upper) {
    status = 'Above Upper';
  } else if (current <= lower) {
    status = 'Below Lower';
  }

  return {
    upper,
    middle,
    lower,
    percentB,
    bandwidth,
    status,
  };
}

/**
 * Analyzes candle structure / price action patterns
 */
export function analyzeCandleStructure(candle: Candle, prevCandle?: Candle): {
  pattern: string;
  bias: 'Bullish' | 'Bearish' | 'Neutral';
} {
  if (!candle) return { pattern: 'Standard Candle', bias: 'Neutral' };

  const range = Math.max(0.00001, candle.high - candle.low);
  const body = Math.abs(candle.close - candle.open);
  const isGreen = candle.close >= candle.open;
  const upperWick = candle.high - Math.max(candle.open, candle.close);
  const lowerWick = Math.min(candle.open, candle.close) - candle.low;

  // Doji
  if (body / range < 0.1) {
    return { pattern: 'Doji Indecision', bias: 'Neutral' };
  }

  // Hammer / Pinbar (Bullish)
  if (lowerWick >= body * 1.8 && upperWick <= body * 0.4) {
    return { pattern: 'Bullish Hammer / Pinbar', bias: 'Bullish' };
  }

  // Shooting Star / Inverted Hammer (Bearish)
  if (upperWick >= body * 1.8 && lowerWick <= body * 0.4) {
    return { pattern: 'Bearish Shooting Star', bias: 'Bearish' };
  }

  // Bullish Engulfing
  if (prevCandle && isGreen && prevCandle.close < prevCandle.open) {
    if (candle.open <= prevCandle.close && candle.close >= prevCandle.open) {
      return { pattern: 'Bullish Engulfing', bias: 'Bullish' };
    }
  }

  // Bearish Engulfing
  if (prevCandle && !isGreen && prevCandle.close > prevCandle.open) {
    if (candle.open >= prevCandle.close && candle.close <= prevCandle.open) {
      return { pattern: 'Bearish Engulfing', bias: 'Bearish' };
    }
  }

  // Strong Body
  if (body / range > 0.65) {
    return isGreen
      ? { pattern: 'Strong Bullish Marubozu', bias: 'Bullish' }
      : { pattern: 'Strong Bearish Marubozu', bias: 'Bearish' };
  }

  return { pattern: isGreen ? 'Bullish Drift' : 'Bearish Drift', bias: isGreen ? 'Bullish' : 'Bearish' };
}

/**
 * Computes complete Indicator State from Candle Series
 */
export function computeIndicators(candles: Candle[], decimals: number = 5): IndicatorState {
  const closePrices = candles.map(c => c.close);
  const currentPrice = closePrices[closePrices.length - 1] || 1;

  // 1. EMA 9 and 21
  const ema9Arr = calculateEMA(closePrices, 9);
  const ema21Arr = calculateEMA(closePrices, 21);

  const ema9 = ema9Arr.length > 0 ? ema9Arr[ema9Arr.length - 1] : currentPrice;
  const ema21 = ema21Arr.length > 0 ? ema21Arr[ema21Arr.length - 1] : currentPrice;

  let emaStatus: 'Bullish' | 'Bearish' | 'Neutral' = 'Neutral';
  if (ema9 > ema21 * 1.00005) {
    emaStatus = 'Bullish';
  } else if (ema9 < ema21 * 0.99995) {
    emaStatus = 'Bearish';
  }

  // 2. RSI 14
  const rsiArr = calculateRSI(closePrices, 14);
  const rsi14 = rsiArr.length > 0 ? Number(rsiArr[rsiArr.length - 1].toFixed(1)) : 50;

  let rsiStatus: 'Above 50' | 'Below 50' | 'Oversold (<30)' | 'Overbought (>70)' = 'Above 50';
  if (rsi14 > 70) {
    rsiStatus = 'Overbought (>70)';
  } else if (rsi14 < 30) {
    rsiStatus = 'Oversold (<30)';
  } else if (rsi14 >= 50) {
    rsiStatus = 'Above 50';
  } else {
    rsiStatus = 'Below 50';
  }

  // 3. MACD
  const macdData = calculateMACD(closePrices);
  const latestMacd = macdData.macdLine.length > 0 ? macdData.macdLine[macdData.macdLine.length - 1] : 0;
  const latestSignal = macdData.signalLine.length > 0 ? macdData.signalLine[macdData.signalLine.length - 1] : 0;
  const latestHist = macdData.histogram.length > 0 ? macdData.histogram[macdData.histogram.length - 1] : 0;
  const prevHist = macdData.histogram.length > 1 ? macdData.histogram[macdData.histogram.length - 2] : 0;

  let macdStatus: 'Bullish' | 'Bearish' | 'Bullish Crossover' | 'Bearish Crossover' = 'Bullish';
  if (prevHist < 0 && latestHist > 0) {
    macdStatus = 'Bullish Crossover';
  } else if (prevHist > 0 && latestHist < 0) {
    macdStatus = 'Bearish Crossover';
  } else if (latestHist >= 0) {
    macdStatus = 'Bullish';
  } else {
    macdStatus = 'Bearish';
  }

  // 4. Trend
  let trend: 'Uptrend' | 'Downtrend' | 'Strong Uptrend' | 'Strong Downtrend' | 'Consolidation' = 'Consolidation';
  const ema9Slope = ema9Arr.length >= 3 ? ema9 - ema9Arr[ema9Arr.length - 3] : 0;
  if (ema9 > ema21 && ema9Slope > 0) {
    trend = ema9Slope > currentPrice * 0.0003 ? 'Strong Uptrend' : 'Uptrend';
  } else if (ema9 < ema21 && ema9Slope < 0) {
    trend = ema9Slope < -currentPrice * 0.0003 ? 'Strong Downtrend' : 'Downtrend';
  }

  // 5. Support & Resistance
  const sr = findSupportResistance(candles, currentPrice);

  // 6. Momentum
  let momentum: 'Strong Bullish' | 'Bullish' | 'Neutral' | 'Bearish' | 'Strong Bearish' = 'Neutral';
  const roc = closePrices.length >= 5 ? (currentPrice - closePrices[closePrices.length - 5]) / closePrices[closePrices.length - 5] : 0;
  if (roc > 0.001) momentum = 'Strong Bullish';
  else if (roc > 0.0002) momentum = 'Bullish';
  else if (roc < -0.001) momentum = 'Strong Bearish';
  else if (roc < -0.0002) momentum = 'Bearish';

  // 7. ATR 14
  const atrVal = calculateATR(candles, 14);

  // 8. Bollinger Bands (20, 2)
  const bb = calculateBollingerBands(closePrices, 20, 2);

  // 9. Candle Structure (Last closed candle)
  const lastClosedCandle = candles[candles.length - 2] || candles[candles.length - 1];
  const prevClosedCandle = candles.length >= 3 ? candles[candles.length - 3] : undefined;
  const cs = analyzeCandleStructure(lastClosedCandle, prevClosedCandle);

  return {
    ema9: Number(ema9.toFixed(decimals)),
    ema21: Number(ema21.toFixed(decimals)),
    emaStatus,
    rsi14,
    rsiStatus,
    macd: {
      macd: Number(latestMacd.toFixed(decimals)),
      signal: Number(latestSignal.toFixed(decimals)),
      histogram: Number(latestHist.toFixed(decimals)),
      status: macdStatus,
    },
    trend,
    supportResistance: {
      support: Number(sr.support.toFixed(decimals)),
      resistance: Number(sr.resistance.toFixed(decimals)),
      status: sr.status,
    },
    momentum,
    atr14: Number(atrVal.toFixed(decimals)),
    bollingerBands: {
      upper: Number(bb.upper.toFixed(decimals)),
      middle: Number(bb.middle.toFixed(decimals)),
      lower: Number(bb.lower.toFixed(decimals)),
      percentB: Number(bb.percentB.toFixed(2)),
      status: bb.status,
    },
    candleStructure: cs,
  };
}
