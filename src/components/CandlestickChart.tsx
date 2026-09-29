import React, { useRef, useEffect, useState } from 'react';
import { 
  BarChart2, 
  Layers, 
  ChevronDown, 
  Maximize2, 
  Eye, 
  TrendingUp, 
  TrendingDown, 
  Sliders,
  Radio,
  Zap
} from 'lucide-react';
import { Candle, FOREX_PAIRS, OTC_PAIRS, ALL_SUPPORTED_PAIRS, QuoteData, Timeframe, TIMEFRAMES, BrokerType } from '../types/trading';
import { calculateEMA } from '../services/indicators';
import { brokerSyncEngine, BrokerLiveTick, PriceDirection, BrokerId, getBrokerDecimals, toPairKey } from '../services/brokerSyncEngine';

interface CandlestickChartProps {
  pair: string;
  timeframe: Timeframe;
  onSelectTimeframe: (tf: Timeframe) => void;
  candles: Candle[];
  currentPrice?: number;
  isLive: boolean;
  quotes: QuoteData[];
  selectedBroker?: BrokerType;
  onSelectBroker?: (broker: BrokerType) => void;
}

export const CandlestickChart: React.FC<CandlestickChartProps> = ({
  pair,
  timeframe,
  onSelectTimeframe,
  candles,
  currentPrice,
  isLive,
  quotes,
  selectedBroker = 'Pocket Option',
  onSelectBroker,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Indicators toggle
  const [showEMA9, setShowEMA9] = useState(true);
  const [showEMA21, setShowEMA21] = useState(true);
  const [showVolume, setShowVolume] = useState(true);
  const [indicatorMenuOpen, setIndicatorMenuOpen] = useState(false);

  const activeBrokerId: BrokerId = selectedBroker === 'Quotex' ? 'quotex' : 'pocket';
  const brokerDisplayName = selectedBroker === 'Quotex' ? 'Quotex' : 'Pocket Option';

  // Real-time Broker Live Price and Flash Sync
  const [livePoPrice, setLivePoPrice] = useState<number | null>(() => {
    return currentPrice || brokerSyncEngine.getCurrentPrice(pair);
  });
  const [priceDirection, setPriceDirection] = useState<PriceDirection>('EQUAL');
  const [isFlashing, setIsFlashing] = useState<boolean>(false);

  // Crosshair state
  const [hoverData, setHoverData] = useState<{
    candle: Candle;
    x: number;
    y: number;
  } | null>(null);

  const pairInfo = ALL_SUPPORTED_PAIRS.find(p => p.symbol === pair) || FOREX_PAIRS[0];
  const decimals = getBrokerDecimals(pair);

  // Subscribe to Universal Real-Time WebSocket sync engine (Pocket Option + Quotex)
  useEffect(() => {
    brokerSyncEngine.setBroker(activeBrokerId);
    brokerSyncEngine.setPair(pair);

    const unsubscribe = brokerSyncEngine.subscribe((tick: BrokerLiveTick) => {
      const cleanTick = tick.pair.replace('_otc', '').replace(' (OTC)', '').replace('/', '').toUpperCase();
      const cleanPair = pair.replace('_otc', '').replace(' (OTC)', '').replace('/', '').toUpperCase();

      if (cleanTick === cleanPair || tick.pair === pair) {
        setLivePoPrice(tick.price);
        if (tick.direction !== 'EQUAL') {
          setPriceDirection(tick.direction);
          setIsFlashing(true);
          const t = setTimeout(() => setIsFlashing(false), 550);
          return () => clearTimeout(t);
        }
      }
    });

    return () => unsubscribe();
  }, [pair, activeBrokerId]);

  // Keep live price in sync if currentPrice prop changes
  useEffect(() => {
    if (currentPrice && currentPrice !== livePoPrice) {
      setLivePoPrice(currentPrice);
    }
  }, [currentPrice]);

  // Bind window.chart for instant update from fetchRealBrokerPrice
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).chart = {
        update: (newPrice: number) => {
          if (!isNaN(newPrice) && newPrice > 0) {
            setLivePoPrice(newPrice);
          }
        },
      };
    }
    return () => {
      if (typeof window !== 'undefined' && (window as any).chart) {
        delete (window as any).chart;
      }
    };
  }, []);

  // Draw chart on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || candles.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high-DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = 340;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);

    // Padding & Area
    const padding = { top: 20, right: 65, bottom: 45, left: 10 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const volumeHeight = showVolume ? chartHeight * 0.22 : 0;
    const priceChartHeight = chartHeight - volumeHeight;

    // Clear background
    ctx.fillStyle = '#070E1A';
    ctx.fillRect(0, 0, width, height);

    // Compute Price Scale
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let maxVolume = 0;

    candles.forEach(c => {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
      if (c.volume > maxVolume) maxVolume = c.volume;
    });

    if (currentPrice) {
      minPrice = Math.min(minPrice, currentPrice);
      maxPrice = Math.max(maxPrice, currentPrice);
    }

    const priceMargin = (maxPrice - minPrice) * 0.08 || 0.0005;
    minPrice -= priceMargin;
    maxPrice += priceMargin;
    const priceRange = maxPrice - minPrice || 1;

    // Coordinate Helpers
    const getY = (price: number) => {
      return padding.top + priceChartHeight - ((price - minPrice) / priceRange) * priceChartHeight;
    };

    const candleCount = candles.length;
    const candleSlotWidth = chartWidth / candleCount;
    const candleBarWidth = Math.max(2, Math.min(16, candleSlotWidth * 0.72));

    const getX = (index: number) => {
      return padding.left + index * candleSlotWidth + candleSlotWidth / 2;
    };

    // Draw Grid Lines (Horizontal price grid)
    const gridLines = 5;
    ctx.strokeStyle = '#122238';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    for (let i = 0; i <= gridLines; i++) {
      const priceVal = minPrice + (priceRange / gridLines) * i;
      const y = getY(priceVal);

      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      // Price Label
      ctx.fillStyle = '#64748B';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(priceVal.toFixed(pairInfo.decimals), width - padding.right + 6, y + 3);
    }
    ctx.setLineDash([]); // Reset line dash

    // Draw Volume Bars
    if (showVolume && maxVolume > 0) {
      const volBaseY = padding.top + chartHeight;
      candles.forEach((c, idx) => {
        const x = getX(idx);
        const barH = (c.volume / maxVolume) * volumeHeight;
        const isUp = c.close >= c.open;

        ctx.fillStyle = isUp ? 'rgba(0, 230, 118, 0.25)' : 'rgba(255, 61, 87, 0.25)';
        ctx.fillRect(x - candleBarWidth / 2, volBaseY - barH, candleBarWidth, barH);
      });
    }

    // Draw Candlesticks
    candles.forEach((c, idx) => {
      const x = getX(idx);
      const isUp = c.close >= c.open;
      const openY = getY(c.open);
      const closeY = getY(c.close);
      const highY = getY(c.high);
      const lowY = getY(c.low);

      const candleTop = Math.min(openY, closeY);
      const candleHeight = Math.max(2, Math.abs(closeY - openY));

      // Color
      const color = isUp ? '#00E676' : '#FF3D57';
      ctx.strokeStyle = color;
      ctx.fillStyle = color;

      // Draw Wick
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Draw Body
      ctx.fillRect(x - candleBarWidth / 2, candleTop, candleBarWidth, candleHeight);
    });

    // Calculate and draw EMAs
    const closePrices = candles.map(c => c.close);

    // EMA 9 (Cyan)
    if (showEMA9) {
      const ema9 = calculateEMA(closePrices, 9);
      const offset9 = closePrices.length - ema9.length;
      ctx.strokeStyle = '#00E5FF';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      let started = false;

      for (let i = 0; i < ema9.length; i++) {
        const candleIdx = i + offset9;
        const x = getX(candleIdx);
        const y = getY(ema9[i]);
        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }

    // EMA 21 (Orange/Gold)
    if (showEMA21) {
      const ema21 = calculateEMA(closePrices, 21);
      const offset21 = closePrices.length - ema21.length;
      ctx.strokeStyle = '#FFB300';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      let started = false;

      for (let i = 0; i < ema21.length; i++) {
        const candleIdx = i + offset21;
        const x = getX(candleIdx);
        const y = getY(ema21[i]);
        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }

    // Current Price Line with glowing tag (Synchronized with Pocket Option live price)
    const livePrice = livePoPrice || currentPrice || candles[candles.length - 1]?.close || 0;
    if (livePrice) {
      const liveY = getY(livePrice);

      // Horizontal dashed line
      ctx.strokeStyle = isFlashing 
        ? (priceDirection === 'UP' ? '#00E676' : '#FF3D57') 
        : '#00E5FF';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(padding.left, liveY);
      ctx.lineTo(width - padding.right, liveY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Price Tag Pill on Right
      ctx.fillStyle = isFlashing 
        ? (priceDirection === 'UP' ? '#00E676' : '#FF3D57') 
        : '#00E5FF';
      const tagWidth = decimals === 2 ? 55 : 62;
      const tagHeight = 18;
      const tagX = width - padding.right + 2;
      const tagY = liveY - tagHeight / 2;

      ctx.beginPath();
      ctx.roundRect(tagX, tagY, tagWidth, tagHeight, 4);
      ctx.fill();

      // Text
      ctx.fillStyle = '#050B14';
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(livePrice.toFixed(decimals), tagX + tagWidth / 2, tagY + 12);
    }

    // Time Axis at Bottom
    ctx.fillStyle = '#64748B';
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';

    const step = Math.max(1, Math.floor(candleCount / 5));
    for (let i = 0; i < candleCount; i += step) {
      const x = getX(i);
      const candle = candles[i];
      if (candle) {
        const timePart = candle.datetime.split(' ')[1] || candle.datetime;
        const shortTime = timeframe.includes('SEC') ? (timePart.substring(0, 8) || timePart) : timePart.substring(0, 5);
        ctx.fillText(shortTime, x, height - 12);
      }
    }

    // Crosshair rendering
    if (hoverData) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(hoverData.x, padding.top);
      ctx.lineTo(hoverData.x, padding.top + chartHeight);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(padding.left, hoverData.y);
      ctx.lineTo(width - padding.right, hoverData.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [candles, currentPrice, showEMA9, showEMA21, showVolume, hoverData, pairInfo]);

  // Handle canvas mouse move for interactive crosshair
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || candles.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const padding = { left: 10, right: 65, top: 20 };
    const chartWidth = rect.width - padding.left - padding.right;
    const candleSlotWidth = chartWidth / candles.length;

    const index = Math.floor((x - padding.left) / candleSlotWidth);

    if (index >= 0 && index < candles.length) {
      setHoverData({
        candle: candles[index],
        x,
        y,
      });
    } else {
      setHoverData(null);
    }
  };

  const handleMouseLeave = () => {
    setHoverData(null);
  };

  // Top Gainers & Losers from quotes
  const sortedQuotes = [...quotes].sort((a, b) => b.percent_change - a.percent_change);
  const topGainers = sortedQuotes.slice(0, 3);
  const topLosers = [...sortedQuotes].reverse().slice(0, 3);

  // Sentiment ratio (calculated based on recent bullish candles)
  const bullishCount = candles.filter(c => c.close >= c.open).length;
  const buyersRatio = Math.round((bullishCount / Math.max(1, candles.length)) * 100);
  const sellersRatio = 100 - buyersRatio;

  const displayPrice = livePoPrice || currentPrice || candles[candles.length - 1]?.close || pairInfo.baseRate;

  return (
    <div className="cyber-card p-4 sm:p-5 border-cyan-500/30">
      {/* Chart Top Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
        {/* Pair title & Live status & Broker Selector & Live Indicator */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xl">{pairInfo.flagBase}{pairInfo.flagQuote}</span>
            <div className="text-base sm:text-lg font-black tracking-wide text-white">
              {pair} - {timeframe}
            </div>
          </div>

          {/* Broker Select Dropdown requested in prompt: <select id="broker-select"> */}
          <div className="flex items-center gap-1.5">
            <select
              id="broker-select"
              value={selectedBroker}
              onChange={(e) => {
                const newBroker = e.target.value as BrokerType;
                if (typeof (window as any).setBroker === 'function') {
                  (window as any).setBroker(newBroker === 'Quotex' ? 'quotex' : 'pocket');
                }
                if (onSelectBroker) onSelectBroker(newBroker);
              }}
              className="bg-[#0A182F] text-cyan-300 font-bold text-xs py-1.5 px-3 rounded-lg border border-cyan-500/40 hover:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 cursor-pointer shadow-sm"
            >
              <option value="Pocket Option">Pocket Option</option>
              <option value="Quotex">Quotex</option>
            </select>
          </div>

          {/* Indicator element requested in prompt: <div id="live-indicator"> */}
          <div 
            id="live-indicator"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-400 text-xs font-bold border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)] select-none"
          >
            ● OTC LIVE • 24/7 WATTOPro Feed | Tick: 0.5s
          </div>

          {/* Live Price element requested in prompt: <div id="live-price" style="font-size:24px; font-weight:bold"> */}
          <div 
            id="live-price"
            data-otc-id={"otc-price-" + toPairKey(pair)}
            style={{ fontSize: '24px', fontWeight: 'bold' }}
            className={`font-mono px-3 py-0.5 rounded-lg border border-transparent transition-all duration-200 ${
              isFlashing
                ? priceDirection === 'UP'
                  ? 'po-flash-up border-emerald-500/60'
                  : 'po-flash-down border-rose-500/60'
                : 'text-cyan-300 bg-cyan-950/40 border-cyan-500/30'
            }`}
          >
            {displayPrice.toFixed(decimals)}
          </div>
        </div>

        {/* Indicators and Timeframe controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Indicators Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIndicatorMenuOpen(!indicatorMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0E1F36] border border-cyan-500/40 text-xs font-bold text-cyan-300 hover:bg-[#122845] transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Indicators</span>
              <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
            </button>

            {indicatorMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setIndicatorMenuOpen(false)} 
                />
                <div className="absolute right-0 mt-2 z-40 w-44 rounded-xl bg-[#091322] border border-cyan-500/40 p-2 shadow-2xl space-y-1 text-xs">
                  <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800 cursor-pointer">
                    <span className="text-cyan-300 font-semibold">EMA 9 (Cyan)</span>
                    <input 
                      type="checkbox" 
                      checked={showEMA9} 
                      onChange={e => setShowEMA9(e.target.checked)} 
                      className="accent-cyan-400"
                    />
                  </label>
                  <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800 cursor-pointer">
                    <span className="text-amber-400 font-semibold">EMA 21 (Gold)</span>
                    <input 
                      type="checkbox" 
                      checked={showEMA21} 
                      onChange={e => setShowEMA21(e.target.checked)} 
                      className="accent-amber-400"
                    />
                  </label>
                  <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800 cursor-pointer">
                    <span className="text-slate-300 font-semibold">Volume Bars</span>
                    <input 
                      type="checkbox" 
                      checked={showVolume} 
                      onChange={e => setShowVolume(e.target.checked)} 
                      className="accent-emerald-400"
                    />
                  </label>
                </div>
              </>
            )}
          </div>

          {/* Timeframe Quick Buttons */}
          <div className="flex items-center overflow-x-auto max-w-full p-0.5 rounded-lg bg-[#091424] border border-slate-800 scrollbar-none">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                onClick={() => onSelectTimeframe(tf)}
                className={`px-2 py-1 shrink-0 rounded text-[11px] sm:text-xs font-bold transition-all ${
                  timeframe === tf
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Legend & Hover Info Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-[#091424] text-[11px] mb-2 font-tabular border border-slate-800">
        <div className="flex items-center gap-3">
          {showEMA9 && (
            <span className="text-cyan-400 font-semibold flex items-center gap-1">
              <span className="w-2 h-0.5 bg-cyan-400 inline-block"></span> EMA 9
            </span>
          )}
          {showEMA21 && (
            <span className="text-amber-400 font-semibold flex items-center gap-1">
              <span className="w-2 h-0.5 bg-amber-400 inline-block"></span> EMA 21
            </span>
          )}
        </div>

        {hoverData ? (
          <div className="flex items-center gap-2 sm:gap-3 text-slate-300 font-medium">
            <span>O: <strong className="text-white">{hoverData.candle.open.toFixed(pairInfo.decimals)}</strong></span>
            <span>H: <strong className="text-emerald-400">{hoverData.candle.high.toFixed(pairInfo.decimals)}</strong></span>
            <span>L: <strong className="text-rose-400">{hoverData.candle.low.toFixed(pairInfo.decimals)}</strong></span>
            <span>C: <strong className="text-cyan-300">{hoverData.candle.close.toFixed(pairInfo.decimals)}</strong></span>
            <span>Vol: <strong className="text-slate-300">{hoverData.candle.volume}</strong></span>
          </div>
        ) : (
          <span className="text-slate-400 text-[10px]">Hover candles for exact OHLCV values</span>
        )}
      </div>

      {/* Chart Canvas Area */}
      <div 
        ref={containerRef} 
        className="w-full h-[340px] rounded-xl overflow-hidden relative bg-[#070E1A] border border-cyan-500/20"
      >
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-full h-full cursor-crosshair block"
        />
      </div>

      {/* Price Source Label Under Chart with exact requested id="price-source" style="font-size:10px" */}
      <div 
        id="price-source"
        style={{ fontSize: '10px' }}
        className="mt-2.5 flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#06101E] border border-cyan-500/20 font-mono"
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-300 font-bold">Source: {selectedBroker} • WATTOPro Live Feed: ACTIVE | Tick: 0.5s</span>
        </div>
        <div className="flex items-center gap-2 text-cyan-300 font-extrabold">
          <Zap className="w-3.5 h-3.5 text-cyan-400 fill-current" />
          <span>Tick: 0.5s</span>
          <span className="text-slate-500">•</span>
          <span className="text-emerald-400 font-bold">● OTC LIVE 24/7</span>
        </div>
      </div>

      {/* Market Sentiment & Gainers / Losers (matching reference screenshot bottom widgets) */}
      <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Market Sentiment Gauge */}
        <div className="p-3 rounded-xl bg-[#091424] border border-cyan-500/20 flex items-center gap-3">
          <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
            {/* SVG Donut */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-rose-500"
                strokeWidth="3.5"
                strokeDasharray="100, 100"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-400"
                strokeDasharray={`${buyersRatio}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[11px] font-black font-tabular text-white">
              {buyersRatio}%
            </span>
          </div>

          <div className="leading-tight">
            <div className="text-[11px] uppercase font-bold text-slate-400">Market Sentiment</div>
            <div className="flex items-center gap-2 mt-1 text-xs font-tabular">
              <span className="text-emerald-400 font-bold">{buyersRatio}% Buyers</span>
              <span className="text-slate-500">·</span>
              <span className="text-rose-400 font-bold">{sellersRatio}% Sellers</span>
            </div>
          </div>
        </div>

        {/* Top Gainers */}
        <div className="p-3 rounded-xl bg-[#091424] border border-emerald-500/20">
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1.5 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span>Top Gainers</span>
          </div>
          <div className="space-y-1 text-xs font-tabular">
            {topGainers.map((g) => (
              <div key={g.symbol} className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold">{g.symbol}</span>
                <span className="text-emerald-400 font-bold">+{g.percent_change.toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Losers */}
        <div className="p-3 rounded-xl bg-[#091424] border border-rose-500/20">
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1.5 flex items-center gap-1">
            <TrendingDown className="w-3 h-3 text-rose-400" />
            <span>Top Losers</span>
          </div>
          <div className="space-y-1 text-xs font-tabular">
            {topLosers.map((l) => (
              <div key={l.symbol} className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold">{l.symbol}</span>
                <span className="text-rose-400 font-bold">{l.percent_change.toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
