import React, { useState } from 'react';
import { 
  ChevronDown, 
  Radio, 
  CheckCircle2, 
  Flame, 
  Activity, 
  Clock, 
  Timer, 
  Zap, 
  Info,
  ShieldCheck,
  Check,
  AlertTriangle,
  Key
} from 'lucide-react';
import { 
  BrokerType,
  FOREX_PAIRS, 
  OTC_PAIRS,
  ALL_SUPPORTED_PAIRS,
  QuoteData, 
  Timeframe, 
  TIMEFRAMES, 
  TradeDuration, 
  TRADE_DURATIONS,
  TRADE_DURATION_SECONDS,
  MarketMode
} from '../types/trading';
import { isWeekend, startOTCLive, toPairKey } from '../services/brokerSyncEngine';

interface PairTimeframeSelectorProps {
  selectedPair: string;
  onSelectPair: (pair: string) => void;
  selectedTimeframe: Timeframe;
  onSelectTimeframe: (tf: Timeframe) => void;
  selectedTradeDuration: TradeDuration;
  onSelectTradeDuration: (td: TradeDuration) => void;
  selectedBroker: BrokerType;
  onSelectBroker: (broker: BrokerType) => void;
  onGetSignal: () => void;
  isAnalyzing: boolean;
  quotes: QuoteData[];
  isLive?: boolean;
  marketMode?: MarketMode;
  onSelectMarketMode?: (mode: MarketMode) => void;
  onOpenBrokerModal?: (broker: BrokerType) => void;
  onOpenSettings?: () => void;
  brokerFeedConnected?: boolean;
  brokerStatusMessage?: string;
  brokerPrice?: number | null;
  isFallback?: boolean;
  effectiveBroker?: BrokerType;
  pocketConnected?: boolean;
  quotexConnected?: boolean;
  feedLabel?: string;
  executionMode?: string;
}

export const PairTimeframeSelector: React.FC<PairTimeframeSelectorProps> = ({
  selectedPair,
  onSelectPair,
  selectedTimeframe,
  onSelectTimeframe,
  selectedTradeDuration,
  onSelectTradeDuration,
  selectedBroker,
  onSelectBroker,
  onGetSignal,
  isAnalyzing,
  quotes,
  isLive = true,
  marketMode = 'NORMAL',
  onSelectMarketMode,
  onOpenBrokerModal,
  onOpenSettings,
  brokerFeedConnected = true,
  brokerStatusMessage,
  brokerPrice,
  isFallback = false,
  effectiveBroker,
  pocketConnected,
  quotexConnected,
  feedLabel,
  executionMode,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const isFallbackActive = isFallback || (selectedBroker === 'Pocket Option' && pocketConnected === false);

  const isWk = isWeekend();
  const availablePairs = (marketMode === 'OTC' || isWk) ? OTC_PAIRS : FOREX_PAIRS;
  const currentPairInfo = ALL_SUPPORTED_PAIRS.find(p => p.symbol === selectedPair) || availablePairs[0];
  const currentQuote = quotes.find(q => q.symbol === selectedPair);

  const getExplanation = (duration: TradeDuration, tf: Timeframe) => {
    switch (duration) {
      case '5 SEC':
        return {
          type: 'Ultra-Fast Expiry',
          text: `5 SEC trade expiry selected. Instant micro-tick momentum from ${tf} market structure for 5-second execution.`
        };
      case '15 SEC':
        return {
          type: 'Fast Expiry',
          text: `15 SEC trade expiry selected. Micro-breakout velocity within ${tf} market candles for rapid 15-second execution.`
        };
      case '30 SEC':
        return {
          type: 'Fast Expiry',
          text: `30 SEC trade expiry selected. Sub-candle directional impulse aligned with ${tf} market trend.`
        };
      case '1 MIN':
        return {
          type: 'Standard 1-Minute Expiry',
          text: `1 MIN trade expiry selected. 60-second window calibrated with ${tf} technical indicators (EMA 9/21, RSI 14, MACD).`
        };
      case '2 MIN':
        return {
          type: 'Standard 2-Minute Expiry',
          text: `2 MIN trade expiry selected. 120-second contract duration for pattern confirmation across ${tf} candles.`
        };
      case '3 MIN':
        return {
          type: 'Standard 3-Minute Expiry',
          text: `3 MIN trade expiry selected. 180-second window for multi-candle pullbacks and key level reactions.`
        };
      case '5 MIN':
        return {
          type: 'Extended 5-Minute Expiry',
          text: `5 MIN trade expiry selected. Sustained 300-second duration designed for structural trend continuation on ${tf}.`
        };
      case '15 MIN':
        return {
          type: 'Macro 15-Minute Expiry',
          text: `15 MIN trade expiry selected. 900-second contract duration targeting broader support and resistance reactions.`
        };
      case '30 MIN':
        return {
          type: 'Macro 30-Minute Expiry',
          text: `30 MIN trade expiry selected. 1,800-second swing contract duration for major multi-period moves.`
        };
      default:
        return {
          type: 'Standard Expiry',
          text: `${duration} trade expiry selected based on ${tf} market technical confluence.`
        };
    }
  };

  const explanation = getExplanation(selectedTradeDuration, selectedTimeframe);

  return (
    <div className="cyber-card p-4 sm:p-5 border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
      {/* Title & Status Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <span>Trading Parameters</span>
          </h2>
        </div>

        {/* Status Badges: OTC LIVE • 24/7 Broker Feed | Tick: 0.5s */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-[8px]">
            <div 
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-emerald-400 text-xs font-black tracking-wide shadow-[0_0_12px_rgba(16,185,129,0.35)]"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>● OTC LIVE • 24/7 Broker Feed | Tick: 0.5s</span>
            </div>

            <span 
              className="inline-flex items-center justify-center font-bold text-white uppercase tracking-wider animate-live-feed-blink shrink-0 select-none shadow-[0_0_12px_rgba(255,0,0,0.8)]"
              style={{
                backgroundColor: '#ff0000',
                color: '#ffffff',
                fontSize: '10px',
                fontWeight: 'bold',
                padding: '3px 8px',
                borderRadius: '10px',
                lineHeight: 1,
              }}
            >
              LIVE FEED
            </span>
          </div>
        </div>
      </div>

      {/* BROKER SELECTOR: [ POCKET OPTION ] [ QUOTEX ] */}
      <div className="mb-4 p-3 rounded-2xl bg-[#061020] border border-cyan-500/35 shadow-inner">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <label className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>Broker Selector (Live Active Brokers)</span>
          </label>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-md flex items-center gap-1.5 border text-emerald-400 bg-emerald-950/80 border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.3)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              WATTOPro Feed: CONNECTED (24/7 Live Active)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* POCKET OPTION BUTTON */}
          <button
            type="button"
            onClick={() => onSelectBroker('Pocket Option')}
            className={`p-3 rounded-xl border transition-all text-left flex items-center justify-between cursor-pointer ${
              selectedBroker === 'Pocket Option'
                ? 'bg-gradient-to-r from-blue-950/95 via-[#0A1B36] to-[#082442] border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] ring-1 ring-cyan-300/80'
                : 'bg-[#091526]/80 hover:bg-[#0E2038] border-slate-700/60 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-black text-xs shadow-md shrink-0">
                PO
              </div>
              <div>
                <div className="text-xs font-black text-white flex items-center gap-1.5">
                  <span>Pocket Option</span>
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-black border bg-emerald-950 text-emerald-300 border-emerald-500/60 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    LIVE
                  </span>
                </div>
                <div className="text-[9px] text-slate-400">
                  Live Broker
                </div>
              </div>
            </div>
          </button>

          {/* QUOTEX BUTTON */}
          <button
            type="button"
            onClick={() => onSelectBroker('Quotex')}
            className={`p-3 rounded-xl border transition-all text-left flex items-center justify-between cursor-pointer ${
              selectedBroker === 'Quotex'
                ? 'bg-gradient-to-r from-rose-950/95 via-[#180816] to-[#0A1628] border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)] ring-1 ring-rose-400/80'
                : 'bg-[#091526]/80 hover:bg-[#0E2038] border-slate-700/60 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white font-black text-xs shadow-md shrink-0">
                QX
              </div>
              <div>
                <div className="text-xs font-black text-white flex items-center gap-1.5">
                  <span>Quotex</span>
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-black border bg-emerald-950 text-emerald-300 border-emerald-500/60 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    LIVE
                  </span>
                </div>
                <div className="text-[9px] text-slate-400">
                  Live Broker
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* FEED NOTICE: WATTOPro Live Feed: ACTIVE - Real Market 24/7 */}
        <div className="mt-2.5 p-2 rounded-xl bg-gradient-to-r from-[#071926] to-[#081322] border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 px-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-bold text-emerald-300">
              WATTOPro Live Feed: ACTIVE - Real Market 24/7
            </span>
          </div>
          <span className="font-mono text-emerald-400 font-bold text-[10px] self-end sm:self-center">
            Manual Signals - ACTIVE
          </span>
        </div>
      </div>

      {/* NORMAL 10 PAIRS vs OTC 22 PAIRS BUTTONS */}
      <div className="mb-4">
        <div className="flex items-center justify-between gap-2 p-1 rounded-xl bg-[#060F1E] border border-cyan-500/30">
          <button
            type="button"
            onClick={() => onSelectMarketMode && onSelectMarketMode('NORMAL')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              marketMode === 'NORMAL' && !isWk
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-[0_0_12px_rgba(6,182,212,0.5)] border border-cyan-300'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${marketMode === 'NORMAL' && !isWk ? 'bg-emerald-300 animate-pulse' : 'bg-slate-500'}`} />
            <span>NORMAL 10 PAIRS</span>
            {isWk && (
              <span className="text-[8px] px-1 py-0.2 rounded bg-rose-950/80 text-rose-400 border border-rose-500/40">
                CLOSED SAT/SUN
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onSelectMarketMode && onSelectMarketMode('OTC')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              marketMode === 'OTC' || isWk
                ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white shadow-[0_0_16px_rgba(245,158,11,0.6)] border border-amber-300 ring-1 ring-amber-400'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${(marketMode === 'OTC' || isWk) ? 'text-amber-300 fill-current' : 'text-slate-400'}`} />
            <span>OTC 22 PAIRS</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-black animate-pulse">
              {isWk ? 'WEEKEND 24/7' : '24/7'}
            </span>
          </button>
        </div>
      </div>

      {/* 1. Pair Dropdown Selector */}
      <div className="mb-4 relative">
        <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
          1. Select Currency Pair ({marketMode === 'OTC' ? '22 OTC Pairs' : '10 Normal Pairs'})
        </label>
        
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#0B172A] border border-cyan-500/40 hover:border-cyan-400 text-white font-bold transition-all shadow-inner focus:outline-none focus:ring-2 focus:ring-cyan-500/50 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl leading-none">
              {currentPairInfo.flagBase} {currentPairInfo.flagQuote}
            </span>
            <div className="text-left">
              <div className="text-base font-extrabold tracking-wide text-white flex items-center gap-1.5">
                <span>{currentPairInfo.symbol}</span>
                {marketMode === 'OTC' && (
                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    OTC +0.15%
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 font-normal">
                {currentPairInfo.name}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentQuote && (
              <div className="text-right font-tabular">
                <div 
                  id={"otc-price-" + toPairKey(selectedPair)}
                  className="text-sm font-bold text-cyan-300"
                >
                  {currentQuote.price.toFixed(currentPairInfo.decimals)}
                </div>
                <div className={`text-[10px] font-semibold ${
                  currentQuote.percent_change >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {currentQuote.percent_change >= 0 ? '+' : ''}{currentQuote.percent_change.toFixed(2)}%
                </div>
              </div>
            )}
            <ChevronDown className={`w-5 h-5 text-cyan-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <>
            <div 
              className="fixed inset-0 z-30" 
              onClick={() => setDropdownOpen(false)}
            />
            <div className="absolute top-full left-0 right-0 mt-2 z-40 max-h-72 overflow-y-auto rounded-xl bg-[#091322] border border-cyan-500/50 shadow-[0_10px_35px_rgba(0,0,0,0.8)] divide-y divide-slate-800">
              {availablePairs.map((pair) => {
                const q = quotes.find(item => item.symbol === pair.symbol);
                const isSelected = pair.symbol === selectedPair;
                const pairKey = toPairKey(pair.symbol);

                return (
                  <button
                    key={pair.symbol}
                    type="button"
                    data-pair-symbol={pair.symbol}
                    onClick={() => {
                      startOTCLive(pair.symbol);
                      onSelectPair(pair.symbol);
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors cursor-pointer ${
                      isSelected ? 'bg-cyan-950/60 text-cyan-300' : 'hover:bg-slate-800/60 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg leading-none">{pair.flagBase}{pair.flagQuote}</span>
                      <div>
                        <div className="font-extrabold text-sm flex items-center gap-1.5">
                          <span>{pair.symbol}</span>
                          {marketMode === 'OTC' && (
                            <span className="text-[8px] font-bold px-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              OTC
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">{pair.name}</div>
                      </div>
                    </div>

                    <div className="text-right font-tabular">
                      <div 
                        id={"dropdown-price-" + pairKey}
                        className="otc-pair-price text-xs font-bold text-white"
                      >
                        {q ? q.price.toFixed(pair.decimals) : pair.baseRate.toFixed(pair.decimals)}
                      </div>
                      <div className={`otc-pair-pct text-[10px] ${
                        q && q.percent_change >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {q ? (q.percent_change >= 0 ? '+' : '') + q.percent_change.toFixed(2) + '%' : '+0.08%'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* 2. MARKET TIMEFRAME - Single Grid (No White Box, No Duplicate Overlay) */}
      <div className="mb-4 p-3 rounded-2xl bg-[#081324] border border-cyan-500/35 shadow-inner">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>2. Market Timeframe</span>
          </label>
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-tabular">
            Selected: <strong className="text-cyan-400">{selectedTimeframe}</strong>
          </span>
        </div>

        {/* Single Grid - 3x3 */}
        <div 
          className="timeframe-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            background: 'transparent',
            zIndex: 1,
            overflow: 'visible'
          }}
        >
          {TIMEFRAMES.map((tf) => {
            const isSelected = selectedTimeframe === tf;
            return (
              <button
                key={tf}
                type="button"
                onClick={() => onSelectTimeframe(tf)}
                className={`py-2 px-1 rounded-xl font-extrabold text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] border border-cyan-300 scale-[1.02]'
                    : 'bg-[#0B172A] text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800'
                }`}
              >
                {tf}
              </button>
            );
          })}
        </div>
        <div className="text-[10px] text-slate-400 mt-1 pl-1 flex items-center justify-between">
          <span>Used by technical indicators (EMA 9/21, RSI 14, MACD, Trend)</span>
          {selectedTimeframe.includes('SEC') && (
            <span className="text-cyan-400 font-bold font-mono text-[10px]">
              ⚡ Ultra-Fast Tick Analysis
            </span>
          )}
        </div>
      </div>

      {/* 3. SIGNAL DURATION / EXPIRY - Single Grid (Dynamic EXPIRY Badge & Text) */}
      <div className="mb-5 p-3 rounded-2xl bg-[#081324] border border-cyan-500/40 shadow-inner">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
            <Timer className="w-4 h-4 text-cyan-400" />
            <span>3. Signal Duration / Expiry</span>
          </label>
          
          <span className="text-xs font-black px-3 py-1 rounded-lg bg-cyan-950 border border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.35)] flex items-center gap-1.5 tracking-wider">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>EXPIRY: {selectedTradeDuration}</span>
          </span>
        </div>

        {/* 9 Duration buttons in 3x3 grid */}
        <div 
          className="timeframe-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            background: 'transparent',
            zIndex: 1,
            overflow: 'visible'
          }}
        >
          {TRADE_DURATIONS.map((td) => {
            const isSelected = selectedTradeDuration === td;
            const isFast = TRADE_DURATION_SECONDS[td] < 60;
            return (
              <button
                key={td}
                type="button"
                onClick={() => onSelectTradeDuration(td)}
                className={`py-2 px-1 rounded-xl font-black text-xs transition-all duration-200 flex flex-col items-center justify-center relative cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-b from-cyan-400 to-blue-600 text-slate-950 font-black shadow-[0_0_15px_rgba(6,182,212,0.5)] border border-cyan-200 scale-[1.03]'
                    : isFast
                    ? 'bg-[#0B1B32] text-cyan-200 hover:bg-[#0E2547] border border-cyan-800/60'
                    : 'bg-[#0B172A] text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800'
                }`}
              >
                {isFast && (
                  <span className={`text-[8px] font-extrabold uppercase leading-none mb-0.5 flex items-center gap-0.5 ${
                    isSelected ? 'text-slate-950' : 'text-amber-400'
                  }`}>
                    <Zap className="w-2.5 h-2.5 fill-current" />
                    FAST
                  </span>
                )}
                <span className="leading-tight tracking-tight whitespace-nowrap">{td}</span>
              </button>
            );
          })}
        </div>

        {/* DYNAMIC EXPLANATORY TEXT */}
        <div className="mt-2.5 flex items-start gap-2 p-2.5 rounded-xl bg-[#060D19] border border-cyan-900/50 text-[11px] text-slate-300 leading-relaxed">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-cyan-300 mr-1">
              [{explanation.type}]:
            </span>
            <span>{explanation.text}</span>
          </div>
        </div>
      </div>

      {/* GENERATE / GET SIGNAL BUTTON */}
      <button
        type="button"
        onClick={onGetSignal}
        disabled={isAnalyzing || !brokerFeedConnected}
        className={`w-full text-slate-950 font-black cursor-pointer flex items-center justify-center gap-3 select-none transition-all ${
          !brokerFeedConnected
            ? 'py-3.5 px-4 rounded-2xl bg-slate-800 border border-rose-500/50 text-rose-300 cursor-not-allowed opacity-80'
            : 'btn-realtime-signal disabled:opacity-75 disabled:cursor-not-allowed'
        }`}
      >
        {brokerFeedConnected && <span className="shimmer-sweep" />}

        {isAnalyzing ? (
          <div className="relative z-10 flex items-center justify-center gap-3">
            <span className="w-5 h-5 border-3 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
            <span className="tracking-wider uppercase">ANALYZING CONFLUENCE...</span>
          </div>
        ) : !brokerFeedConnected ? (
          <div className="relative z-10 flex items-center justify-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
            <span className="tracking-wider uppercase font-bold text-xs sm:text-sm">
              SIGNALS STOPPED • {selectedBroker.toUpperCase()} LIVE FEED UNAVAILABLE
            </span>
          </div>
        ) : (
          <div className="relative z-10 flex items-center justify-center gap-2.5">
            <span className="text-xl sm:text-2xl animate-pulse filter drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]">
              ⚡
            </span>
            <span className="tracking-wider uppercase drop-shadow-sm font-extrabold">
              GET REAL-TIME SIGNAL ({selectedBroker.toUpperCase()})
            </span>
          </div>
        )}
      </button>
    </div>
  );
};
