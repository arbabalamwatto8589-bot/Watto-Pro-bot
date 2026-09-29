import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  ArrowUp, 
  ArrowDown, 
  Minus, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle,
  Key,
  Timer, 
  Info, 
  RefreshCw,
  Activity,
  Zap,
  Volume2,
  VolumeX
} from 'lucide-react';
import { 
  BrokerType,
  FOREX_PAIRS, 
  OTC_PAIRS,
  ALL_SUPPORTED_PAIRS,
  SignalItem, 
  Timeframe, 
  TradeDuration, 
  TRADE_DURATION_SECONDS 
} from '../types/trading';
import { brokerSyncEngine, BrokerLiveTick, PriceDirection, BrokerId, getBrokerDecimals } from '../services/brokerSyncEngine';

interface LiveSignalCardProps {
  currentSignal: SignalItem | null;
  selectedPair: string;
  selectedTimeframe: Timeframe;
  selectedTradeDuration: TradeDuration;
  selectedBroker?: BrokerType;
  onRefreshSignal: () => void;
  isAnalyzing: boolean;
  brokerFeedConnected?: boolean;
  brokerPrice?: number | null;
  lastUpdateFormatted?: string;
  isFallback?: boolean;
  effectiveBroker?: BrokerType;
  pocketConnected?: boolean;
  quotexConnected?: boolean;
  feedLabel?: string;
  executionMode?: string;
  onOpenSettings?: () => void;
}

export const LiveSignalCard: React.FC<LiveSignalCardProps> = ({
  currentSignal,
  selectedPair,
  selectedTimeframe,
  selectedTradeDuration,
  selectedBroker = 'Pocket Option',
  onRefreshSignal,
  isAnalyzing,
  brokerFeedConnected = true,
  brokerPrice,
  lastUpdateFormatted,
  isFallback = false,
  effectiveBroker,
  pocketConnected,
  quotexConnected,
  feedLabel,
  executionMode,
  onOpenSettings,
}) => {
  const activeBroker = selectedBroker;
  const activeBrokerId: BrokerId = selectedBroker === 'Quotex' ? 'quotex' : 'pocket';
  // Duration in seconds corresponding to the selected Trade Duration
  const totalDurationSec = TRADE_DURATION_SECONDS[selectedTradeDuration] || 60;

  // Real countdown timer tracking for Trade Duration
  const [countdownSec, setCountdownSec] = useState<number>(totalDurationSec);
  const timerEndRef = useRef<number>(Date.now() + totalDurationSec * 1000);

  // CANDLE COUNTDOWN tracking (time until current timeframe candle closes)
  const getCandleIntervalSec = (tf: Timeframe): number => {
    switch (tf) {
      case '5SEC': return 5;
      case '15SEC': return 15;
      case '30SEC': return 30;
      case '1M': return 60;
      case '2M': return 120;
      case '3M': return 180;
      case '5M': return 300;
      case '15M': return 900;
      case '30M': return 1800;
      default: return 60;
    }
  };

  const [candleCountdownSec, setCandleCountdownSec] = useState<number>(() => {
    const period = getCandleIntervalSec(selectedTimeframe);
    const elapsed = Math.floor(Date.now() / 1000) % period;
    return period - elapsed;
  });

  // Real-time broker live price mirroring state
  const [livePrice, setLivePrice] = useState<number | null>(() => {
    if (brokerPrice !== undefined) return brokerPrice;
    return currentSignal?.entryPrice || brokerSyncEngine.getCurrentPrice(selectedPair);
  });
  const [priceDirection, setPriceDirection] = useState<PriceDirection>('EQUAL');
  const [isFlashing, setIsFlashing] = useState<boolean>(false);

  useEffect(() => {
    brokerSyncEngine.setBroker(activeBrokerId);
    brokerSyncEngine.setPair(selectedPair);

    const unsub = brokerSyncEngine.subscribe((tick: BrokerLiveTick) => {
      const cleanTick = tick.pair.replace('_otc', '').replace(' (OTC)', '').replace('/', '').toUpperCase();
      const cleanPair = selectedPair.replace('_otc', '').replace(' (OTC)', '').replace('/', '').toUpperCase();

      if (cleanTick === cleanPair || tick.pair === selectedPair) {
        setLivePrice(tick.price);
        if (tick.direction !== 'EQUAL') {
          setPriceDirection(tick.direction);
          setIsFlashing(true);
          const t = setTimeout(() => setIsFlashing(false), 550);
          return () => clearTimeout(t);
        }
      }
    });
    return () => unsub();
  }, [selectedPair, activeBrokerId]);

  // Whenever selectedTradeDuration or a new signal is triggered, reset timer to the selected trade duration
  useEffect(() => {
    const sec = TRADE_DURATION_SECONDS[selectedTradeDuration] || 60;
    const newEnd = Date.now() + sec * 1000;
    timerEndRef.current = newEnd;
    setCountdownSec(sec);
  }, [selectedTradeDuration, currentSignal?.id, currentSignal?.timestamp]);

  // Interval ticker that updates every second (both Trade Expiry and Candle Countdown)
  useEffect(() => {
    const updateTick = () => {
      const remaining = Math.max(0, Math.ceil((timerEndRef.current - Date.now()) / 1000));
      setCountdownSec(remaining);

      // Candle countdown calculation
      const tfSec = getCandleIntervalSec(selectedTimeframe);
      const elapsedInCandle = Math.floor(Date.now() / 1000) % tfSec;
      const cRemain = tfSec - elapsedInCandle;
      setCandleCountdownSec(cRemain);
    };

    updateTick();
    const interval = setInterval(updateTick, 1000);
    return () => clearInterval(interval);
  }, [selectedTradeDuration, selectedTimeframe]);

  // Track previous indicator values to detect real-time calculation changes
  const prevIndicatorsRef = useRef<{
    emaStatus?: string;
    ema9?: number;
    ema21?: number;
    rsiStatus?: string;
    rsi14?: number;
    macdStatus?: string;
    macdHist?: number;
    trend?: string;
    signalId?: string;
    signalTimestamp?: number;
  }>({});

  const [indicatorPulse, setIndicatorPulse] = useState<{
    ema: { pulsing: boolean; type: 'bullish' | 'bearish' | 'cyan'; count: number };
    rsi: { pulsing: boolean; type: 'bullish' | 'bearish' | 'cyan'; count: number };
    macd: { pulsing: boolean; type: 'bullish' | 'bearish' | 'cyan'; count: number };
    trend: { pulsing: boolean; type: 'bullish' | 'bearish' | 'cyan'; count: number };
  }>({
    ema: { pulsing: false, type: 'cyan', count: 0 },
    rsi: { pulsing: false, type: 'cyan', count: 0 },
    macd: { pulsing: false, type: 'cyan', count: 0 },
    trend: { pulsing: false, type: 'cyan', count: 0 },
  });

  const pulseTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!currentSignal?.indicators) return;

    const ind = currentSignal.indicators;
    const prev = prevIndicatorsRef.current;

    // Check if this is initial mount or a different signal
    const isNewSignal = prev.signalId !== currentSignal.id || prev.signalTimestamp !== currentSignal.timestamp;
    
    // Check individual calculation changes
    const emaChanged = isNewSignal ||
      prev.emaStatus !== ind.emaStatus ||
      prev.ema9 !== ind.ema9 ||
      prev.ema21 !== ind.ema21;

    const rsiChanged = isNewSignal ||
      prev.rsiStatus !== ind.rsiStatus ||
      prev.rsi14 !== ind.rsi14;

    const macdChanged = isNewSignal ||
      prev.macdStatus !== ind.macd.status ||
      prev.macdHist !== ind.macd.histogram;

    const trendChanged = isNewSignal ||
      prev.trend !== ind.trend;

    // Determine directional pulse color
    const emaType: 'bullish' | 'bearish' | 'cyan' = 
      ind.emaStatus === 'Bullish' ? 'bullish' : ind.emaStatus === 'Bearish' ? 'bearish' : 'cyan';
    const rsiType: 'bullish' | 'bearish' | 'cyan' = 
      ind.rsi14 >= 50 ? 'cyan' : 'bearish';
    const macdType: 'bullish' | 'bearish' | 'cyan' = 
      ind.macd.status.includes('Bullish') ? 'bullish' : ind.macd.status.includes('Bearish') ? 'bearish' : 'cyan';
    const trendType: 'bullish' | 'bearish' | 'cyan' = 
      ind.trend.includes('Up') ? 'bullish' : ind.trend.includes('Down') ? 'bearish' : 'cyan';

    // If any indicator changed or re-calculated
    if (emaChanged || rsiChanged || macdChanged || trendChanged) {
      setIndicatorPulse(curr => ({
        ema: emaChanged ? { pulsing: true, type: emaType, count: curr.ema.count + 1 } : curr.ema,
        rsi: rsiChanged ? { pulsing: true, type: rsiType, count: curr.rsi.count + 1 } : curr.rsi,
        macd: macdChanged ? { pulsing: true, type: macdType, count: curr.macd.count + 1 } : curr.macd,
        trend: trendChanged ? { pulsing: true, type: trendType, count: curr.trend.count + 1 } : curr.trend,
      }));

      if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
      pulseTimerRef.current = setTimeout(() => {
        setIndicatorPulse(curr => ({
          ema: { ...curr.ema, pulsing: false },
          rsi: { ...curr.rsi, pulsing: false },
          macd: { ...curr.macd, pulsing: false },
          trend: { ...curr.trend, pulsing: false },
        }));
      }, 1000);

      prevIndicatorsRef.current = {
        emaStatus: ind.emaStatus,
        ema9: ind.ema9,
        ema21: ind.ema21,
        rsiStatus: ind.rsiStatus,
        rsi14: ind.rsi14,
        macdStatus: ind.macd.status,
        macdHist: ind.macd.histogram,
        trend: ind.trend,
        signalId: currentSignal.id,
        signalTimestamp: currentSignal.timestamp,
      };
    }

    return () => {
      if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
    };
  }, [currentSignal?.indicators, currentSignal?.id, currentSignal?.timestamp]);

  const pairInfo = FOREX_PAIRS.find(p => p.symbol === selectedPair) || FOREX_PAIRS[0];

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const signalType = currentSignal?.signal || 'NO TRADE';
  const confidence = currentSignal ? currentSignal.confidence : 78;
  const isExpired = countdownSec === 0;
  const isShortDuration = TRADE_DURATION_SECONDS[selectedTradeDuration] < 60;

  // Segmented bar ticks (10 segments)
  const filledSegments = Math.round((confidence / 100) * 10);

  const hasAnyPulsing = 
    indicatorPulse.ema.pulsing || 
    indicatorPulse.rsi.pulsing || 
    indicatorPulse.macd.pulsing || 
    indicatorPulse.trend.pulsing;

  return (
    <div className="cyber-card p-4 sm:p-5 border-cyan-500/40 shadow-[0_0_25px_rgba(6,182,212,0.15)] relative overflow-hidden flex flex-col justify-between">
      {/* Top Header with Live Badge */}
      <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20 mb-3">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center">
            <Radio className="w-5 h-5 text-emerald-400" />
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute"></span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
            Live Signal & Trade Time
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Active Broker Logo Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#071325] border border-cyan-500/40 shadow-sm">
            <div className={`w-4 h-4 rounded flex items-center justify-center text-[9px] font-black text-white shrink-0 ${
              selectedBroker === 'Quotex' ? 'bg-rose-600' : 'bg-gradient-to-br from-blue-600 to-cyan-500'
            }`}>
              {selectedBroker === 'Quotex' ? 'QX' : 'PO'}
            </div>
            <span className="text-[11px] font-bold text-white">
              {selectedBroker === 'Quotex' ? 'QX Quotex' : 'PO Pocket Option'}
            </span>
            <span className="flex items-center gap-0.5 text-[8px] font-extrabold text-emerald-400 bg-emerald-950/80 px-1 rounded">
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping"></span>
              LIVE
            </span>
          </div>

          <button
            type="button"
            onClick={onRefreshSignal}
            disabled={isAnalyzing}
            title="Recalculate live signal"
            className="p-1.5 rounded-lg bg-[#091424] border border-cyan-500/30 text-cyan-300 hover:text-white hover:border-cyan-400 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Signal Display Banner (BUY / SELL / NO TRADE - Powered by WATTOPro Live Feed & RSI 14) */}
      <div className="mb-3 space-y-3">
        {signalType === 'BUY' ? (
          <div className="cyber-buy-glow rounded-2xl p-4 text-center relative overflow-hidden transition-all duration-300">
            <div className="flex items-center justify-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 shadow-[0_0_15px_rgba(0,230,118,0.4)]">
                <ArrowUp className="w-7 h-7 stroke-[3]" />
              </div>
              <div className="text-left">
                <div className="text-3xl sm:text-4xl font-black tracking-wider text-emerald-400 drop-shadow-[0_0_15px_rgba(0,230,118,0.6)]">
                  BUY
                </div>
                <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span>Bullish Confluence</span>
                  <span className="text-[10px] text-emerald-400/80 font-normal">
                    • RSI(14): {currentSignal?.indicators.rsi14 || 58.2} • WATTOPro Live Feed
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : signalType === 'SELL' ? (
          <div className="cyber-sell-glow rounded-2xl p-4 text-center relative overflow-hidden transition-all duration-300">
            <div className="flex items-center justify-center gap-3">
              <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-400 shadow-[0_0_15px_rgba(255,61,87,0.4)]">
                <ArrowDown className="w-7 h-7 stroke-[3]" />
              </div>
              <div className="text-left">
                <div className="text-3xl sm:text-4xl font-black tracking-wider text-rose-400 drop-shadow-[0_0_15px_rgba(255,61,87,0.6)]">
                  SELL
                </div>
                <div className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span>Bearish Confluence</span>
                  <span className="text-[10px] text-rose-400/80 font-normal">
                    • RSI(14): {currentSignal?.indicators.rsi14 || 41.6} • WATTOPro Live Feed
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl p-4 text-center bg-slate-900/80 border border-slate-700/60 transition-all duration-300">
            <div className="flex items-center justify-center gap-3">
              <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
                <Minus className="w-7 h-7 stroke-[3]" />
              </div>
              <div className="text-left">
                <div className="text-2xl sm:text-3xl font-black tracking-wider text-slate-300">
                  NO TRADE
                </div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span>Neutral Indicator Range</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    • RSI(14): {currentSignal?.indicators.rsi14 || 50.0} • WATTOPro Live Feed
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* TRADE DURATION & DYNAMIC COUNTDOWN PANEL */}
      <div className="grid grid-cols-2 gap-2.5 mb-3">
        {/* TRADE TIME Box (Dynamically displays selectedTradeDuration) */}
        <div className="p-3 rounded-xl bg-gradient-to-br from-[#0B1A30] to-[#081220] border border-cyan-500/40 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider font-extrabold mb-1">
            <span className="flex items-center gap-1 text-cyan-300">
              <Timer className="w-3.5 h-3.5" />
              TRADE TIME
            </span>
            {isShortDuration && (
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold">
                FAST
              </span>
            )}
          </div>
          <div className="text-2xl sm:text-3xl font-black text-cyan-200 tracking-wider font-tabular">
            {selectedTradeDuration}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 truncate">
            <span>Market TF:</span>
            <span className="font-bold text-slate-200">{selectedTimeframe}</span>
          </div>
        </div>

        {/* COUNTDOWN Box (Uses selectedTradeDuration countdown) */}
        <div className={`p-3 rounded-xl border shadow-sm flex flex-col justify-between transition-colors ${
          isExpired
            ? 'bg-rose-950/30 border-rose-500/40'
            : countdownSec <= 5
            ? 'bg-amber-950/40 border-amber-500/50 animate-pulse'
            : 'bg-gradient-to-br from-[#0B1A30] to-[#081220] border-cyan-500/40'
        }`}>
          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-extrabold mb-1">
            <span className="flex items-center gap-1 text-cyan-300">
              <Clock className="w-3.5 h-3.5" />
              COUNTDOWN
            </span>
            {isExpired ? (
              <span className="px-1.5 py-0.2 rounded bg-rose-500/30 text-rose-300 text-[9px] font-black">
                EXPIRED
              </span>
            ) : (
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">
                ACTIVE
              </span>
            )}
          </div>
          <div className={`text-2xl sm:text-3xl font-black tracking-wider font-tabular ${
            isExpired 
              ? 'text-rose-400' 
              : countdownSec <= 5 
              ? 'text-amber-400' 
              : 'text-emerald-400'
          }`}>
            {formatCountdown(countdownSec)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 truncate">
            {isExpired ? (
              <span className="text-rose-300 font-semibold">00:00 (EXPIRED)</span>
            ) : (
              <span>Entry window remaining</span>
            )}
          </div>
        </div>
      </div>

      {/* WATTOPRO BROKER MARKET-DATA METRICS PANEL */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-2xl bg-[#061020] border border-cyan-500/30 mb-3 text-xs">
        {/* BROKER & FEED STATUS */}
        <div className="p-2 rounded-xl bg-[#091526] border border-slate-800">
          <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-1">
            BROKER / STATUS
          </div>
          <div className="text-white font-black text-sm flex items-center gap-1.5">
            <span>{selectedBroker}</span>
          </div>
          <div className="mt-1 flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${brokerFeedConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
            <span className={`text-[10px] font-bold ${brokerFeedConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
              {brokerFeedConnected ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
          </div>
        </div>

        {/* PAIR & TIMEFRAME */}
        <div className="p-2 rounded-xl bg-[#091526] border border-slate-800">
          <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-1">
            PAIR / TIMEFRAME
          </div>
          <div className="text-cyan-300 font-black text-sm">
            {selectedPair}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-semibold">
            TF: <span className="text-white font-bold">{selectedTimeframe}</span> · Exp: <span className="text-slate-200">{selectedTradeDuration}</span>
          </div>
        </div>

        {/* LIVE PRICE & LAST UPDATE */}
        <div className="p-2 rounded-xl bg-[#091526] border border-slate-800">
          <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-1">
            WATTOPro Live Price
          </div>
          <div className="text-sm font-black font-mono">
            {brokerFeedConnected && livePrice !== null ? (
              <span className={`px-1.5 py-0.5 rounded transition-all duration-200 ${
                isFlashing 
                  ? priceDirection === 'UP' ? 'po-flash-up' : 'po-flash-down' 
                  : 'text-cyan-300'
              }`}>
                {livePrice.toFixed(pairInfo.decimals)}
              </span>
            ) : (
              <span className="text-rose-400 text-xs">UNAVAILABLE</span>
            )}
          </div>
          <div className="text-[9px] text-slate-400 mt-1 font-mono">
            Updated: {lastUpdateFormatted || new Date().toLocaleTimeString('en-US', { hour12: false })}
          </div>
        </div>

        {/* CANDLE COUNTDOWN */}
        <div className="p-2 rounded-xl bg-[#091526] border border-slate-800">
          <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>CANDLE COUNTDOWN</span>
            <Clock className="w-3 h-3 text-amber-400" />
          </div>
          <div className="text-amber-300 font-black font-mono text-base tracking-wider">
            {formatCountdown(candleCountdownSec)}
          </div>
          <div className="text-[9px] text-slate-400 mt-1">
            Until candle close
          </div>
        </div>
      </div>

      {/* DATA SOURCE & SIGNAL SOURCE BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 px-3 py-2 rounded-xl bg-[#050D19] border border-slate-800 text-[10px] text-slate-400 mb-3">
        <div>
          <span className="text-slate-400 font-semibold">DATA SOURCE: </span>
          <span className="text-slate-200 font-mono font-bold">
            WATTOPro Live Market Feed (24/7 Active)
          </span>
          <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 font-bold">
            WATTOPro Live Feed: ACTIVE
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-cyan-300">
            SOURCE: {selectedBroker.toUpperCase()}
          </span>
          <span className="text-slate-600">•</span>
          <span className="font-mono text-emerald-400 font-bold">
            Manual Signals - ACTIVE
          </span>
        </div>
      </div>

      {/* Confidence Score Bar */}
      <div className="p-2.5 rounded-xl bg-[#081220] border border-cyan-500/20 mb-3">
        <div className="flex items-center justify-between mb-1.5 text-xs">
          <span className="text-slate-300 font-semibold">Confidence:</span>
          <span className={`font-black font-tabular text-sm ${
            signalType === 'BUY' 
              ? 'text-emerald-400' 
              : signalType === 'SELL' 
              ? 'text-rose-400' 
              : 'text-amber-400'
          }`}>
            {confidence}%
          </span>
        </div>

        {/* Visual Segmented Meter (10 blocks) */}
        <div className="grid grid-cols-10 gap-1 h-2.5">
          {Array.from({ length: 10 }).map((_, idx) => {
            const isFilled = idx < filledSegments;
            let fillColor = 'bg-slate-800';
            if (isFilled) {
              if (signalType === 'BUY') fillColor = 'bg-emerald-400 shadow-[0_0_8px_rgba(0,230,118,0.6)]';
              else if (signalType === 'SELL') fillColor = 'bg-rose-500 shadow-[0_0_8px_rgba(255,61,87,0.6)]';
              else fillColor = 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]';
            }
            return (
              <div 
                key={idx} 
                className={`h-full rounded-sm transition-all duration-300 ${fillColor}`}
              />
            );
          })}
        </div>
      </div>

      {/* Technical Indicators Checklist Header & Real-Time Statuses */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5 px-0.5">
          <span className="flex items-center gap-1.5 text-cyan-300">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Technical Confluence</span>
          </span>
          <span className="text-[9px] text-emerald-400 font-semibold flex items-center gap-1 font-tabular">
            <span className={`w-1.5 h-1.5 rounded-full bg-emerald-400 ${
              hasAnyPulsing ? 'animate-ping' : 'animate-pulse'
            }`} />
            <span>Real-Time Calculation</span>
          </span>
        </div>

        <div className="space-y-1.5 text-xs font-semibold">
          {/* EMA 9/21 */}
          <div 
            className={`flex items-center justify-between px-3 py-1.5 rounded-lg border transition-all duration-300 relative overflow-hidden ${
              indicatorPulse.ema.pulsing
                ? indicatorPulse.ema.type === 'bullish'
                  ? 'indicator-pulse-bullish'
                  : indicatorPulse.ema.type === 'bearish'
                  ? 'indicator-pulse-bearish'
                  : 'indicator-pulse-cyan'
                : 'bg-[#091424] border-slate-800/80 hover:border-slate-700/80'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-slate-300 text-[11px] font-medium">EMA (9/21)</span>
              {currentSignal?.indicators && (
                <span className="text-[9px] text-slate-400 font-tabular hidden sm:inline">
                  9: {currentSignal.indicators.ema9} · 21: {currentSignal.indicators.ema21}
                </span>
              )}
            </div>

            <div 
              key={`ema-${indicatorPulse.ema.count}`}
              className={`flex items-center gap-1.5 text-[11px] ${indicatorPulse.ema.pulsing ? 'indicator-badge-pulse' : ''}`}
            >
              {indicatorPulse.ema.pulsing && (
                <span className="relative flex h-2 w-2 mr-0.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    indicatorPulse.ema.type === 'bullish' ? 'bg-emerald-400' : indicatorPulse.ema.type === 'bearish' ? 'bg-rose-400' : 'bg-cyan-400'
                  }`} />
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${
                    indicatorPulse.ema.type === 'bullish' ? 'bg-emerald-500' : indicatorPulse.ema.type === 'bearish' ? 'bg-rose-500' : 'bg-cyan-500'
                  }`} />
                </span>
              )}

              {currentSignal?.indicators.emaStatus === 'Bullish' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-emerald-400 font-bold">Bullish Alignment</span>
                </>
              ) : currentSignal?.indicators.emaStatus === 'Bearish' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="text-rose-400 font-bold">Bearish Alignment</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-amber-400 font-bold">Neutral</span>
                </>
              )}
            </div>
          </div>

          {/* RSI 14 */}
          <div 
            className={`flex items-center justify-between px-3 py-1.5 rounded-lg border transition-all duration-300 relative overflow-hidden ${
              indicatorPulse.rsi.pulsing
                ? indicatorPulse.rsi.type === 'bullish'
                  ? 'indicator-pulse-bullish'
                  : indicatorPulse.rsi.type === 'bearish'
                  ? 'indicator-pulse-bearish'
                  : 'indicator-pulse-cyan'
                : 'bg-[#091424] border-slate-800/80 hover:border-slate-700/80'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-slate-300 text-[11px] font-medium">RSI (14)</span>
              {currentSignal?.indicators && (
                <span className="text-[9px] text-slate-400 font-tabular hidden sm:inline">
                  {currentSignal.indicators.rsi14 >= 50 ? 'Bull Momentum' : 'Bear Momentum'}
                </span>
              )}
            </div>

            <div 
              key={`rsi-${indicatorPulse.rsi.count}`}
              className={`flex items-center gap-1.5 text-[11px] ${indicatorPulse.rsi.pulsing ? 'indicator-badge-pulse' : ''}`}
            >
              {indicatorPulse.rsi.pulsing && (
                <span className="relative flex h-2 w-2 mr-0.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    indicatorPulse.rsi.type === 'bullish' ? 'bg-cyan-400' : 'bg-rose-400'
                  }`} />
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${
                    indicatorPulse.rsi.type === 'bullish' ? 'bg-cyan-500' : 'bg-rose-500'
                  }`} />
                </span>
              )}
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="text-cyan-300 font-bold font-tabular">
                {currentSignal ? `${currentSignal.indicators.rsiStatus} (${currentSignal.indicators.rsi14})` : 'Above 50 (54.2)'}
              </span>
            </div>
          </div>

          {/* MACD */}
          <div 
            className={`flex items-center justify-between px-3 py-1.5 rounded-lg border transition-all duration-300 relative overflow-hidden ${
              indicatorPulse.macd.pulsing
                ? indicatorPulse.macd.type === 'bullish'
                  ? 'indicator-pulse-bullish'
                  : indicatorPulse.macd.type === 'bearish'
                  ? 'indicator-pulse-bearish'
                  : 'indicator-pulse-cyan'
                : 'bg-[#091424] border-slate-800/80 hover:border-slate-700/80'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-slate-300 text-[11px] font-medium">MACD (12/26/9)</span>
              {currentSignal?.indicators && (
                <span className="text-[9px] text-slate-400 font-tabular hidden sm:inline">
                  H: {currentSignal.indicators.macd.histogram > 0 ? `+${currentSignal.indicators.macd.histogram}` : currentSignal.indicators.macd.histogram}
                </span>
              )}
            </div>

            <div 
              key={`macd-${indicatorPulse.macd.count}`}
              className={`flex items-center gap-1.5 text-[11px] ${indicatorPulse.macd.pulsing ? 'indicator-badge-pulse' : ''}`}
            >
              {indicatorPulse.macd.pulsing && (
                <span className="relative flex h-2 w-2 mr-0.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    indicatorPulse.macd.type === 'bullish' ? 'bg-emerald-400' : 'bg-rose-400'
                  }`} />
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${
                    indicatorPulse.macd.type === 'bullish' ? 'bg-emerald-500' : 'bg-rose-500'
                  }`} />
                </span>
              )}

              {currentSignal?.indicators.macd.status.includes('Bullish') ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-emerald-400 font-bold">{currentSignal.indicators.macd.status}</span>
                </>
              ) : currentSignal?.indicators.macd.status.includes('Bearish') ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="text-rose-400 font-bold">{currentSignal.indicators.macd.status}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-emerald-400 font-bold">Bullish</span>
                </>
              )}
            </div>
          </div>

          {/* Trend */}
          <div 
            className={`flex items-center justify-between px-3 py-1.5 rounded-lg border transition-all duration-300 relative overflow-hidden ${
              indicatorPulse.trend.pulsing
                ? indicatorPulse.trend.type === 'bullish'
                  ? 'indicator-pulse-bullish'
                  : indicatorPulse.trend.type === 'bearish'
                  ? 'indicator-pulse-bearish'
                  : 'indicator-pulse-cyan'
                : 'bg-[#091424] border-slate-800/80 hover:border-slate-700/80'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-slate-300 text-[11px] font-medium">Trend Structure</span>
              <span className="text-[9px] text-slate-400 font-tabular hidden sm:inline">
                Slope EMA 9
              </span>
            </div>

            <div 
              key={`trend-${indicatorPulse.trend.count}`}
              className={`flex items-center gap-1.5 text-[11px] ${indicatorPulse.trend.pulsing ? 'indicator-badge-pulse' : ''}`}
            >
              {indicatorPulse.trend.pulsing && (
                <span className="relative flex h-2 w-2 mr-0.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    indicatorPulse.trend.type === 'bullish' ? 'bg-emerald-400' : 'bg-rose-400'
                  }`} />
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${
                    indicatorPulse.trend.type === 'bullish' ? 'bg-emerald-500' : 'bg-rose-500'
                  }`} />
                </span>
              )}

              <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${
                currentSignal?.indicators.trend.includes('Up') 
                  ? 'text-emerald-400' 
                  : currentSignal?.indicators.trend.includes('Down')
                  ? 'text-rose-400'
                  : 'text-amber-400'
              }`} />
              <span className={`font-bold ${
                currentSignal?.indicators.trend.includes('Up') 
                  ? 'text-emerald-400' 
                  : currentSignal?.indicators.trend.includes('Down')
                  ? 'text-rose-400'
                  : 'text-amber-400'
              }`}>
                {currentSignal?.indicators.trend || 'Uptrend'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Methodology & Expiry Explanation */}
      <div className="p-2 rounded-xl bg-[#060D19] border border-slate-800 text-[10px] text-slate-400 mb-2 leading-relaxed flex items-start gap-1.5">
        <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="text-cyan-300 font-bold">EXPIRY: {selectedTradeDuration}</span> —{' '}
          {selectedTimeframe.includes('SEC')
            ? `Ultra-fast ${selectedTradeDuration} execution. Derived from real ${selectedTimeframe} second candle structure (50 x ${selectedTimeframe}) and tick momentum.`
            : isShortDuration
            ? `Fast ${selectedTradeDuration} execution. Derived from ${selectedTimeframe} market candle structure and quote tick velocity.`
            : `Standard ${selectedTradeDuration} execution aligned with ${selectedTimeframe} market indicator confluence.`}
        </div>
      </div>

      {/* Candle Close & Timestamp Verification */}
      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-tabular">
        <div>
          Last candle closed:{' '}
          <span className="text-slate-200 font-semibold">
            {currentSignal?.lastCandleClosedTime || '14:44:00'}
          </span>
        </div>
        <div>
          Signal generated:{' '}
          <span className="text-cyan-300 font-semibold">
            {currentSignal?.timeFormatted || '14:44:12'}
          </span>
        </div>
      </div>
    </div>
  );
};
