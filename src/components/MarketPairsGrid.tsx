import React from 'react';
import { ArrowUp, ArrowDown, Activity, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { FOREX_PAIRS, OTC_PAIRS, QuoteData, MarketMode } from '../types/trading';

interface MarketPairsGridProps {
  quotes: QuoteData[];
  selectedPair: string;
  onSelectPair: (symbol: string) => void;
  isLive: boolean;
  marketMode?: MarketMode;
  onSelectMarketMode?: (mode: MarketMode) => void;
}

export const MarketPairsGrid: React.FC<MarketPairsGridProps> = ({
  quotes,
  selectedPair,
  onSelectPair,
  isLive,
  marketMode = 'NORMAL',
  onSelectMarketMode,
}) => {
  const activePairs = marketMode === 'OTC' ? OTC_PAIRS : FOREX_PAIRS;

  return (
    <div className="cyber-card p-4 sm:p-5 border-cyan-500/30">
      {/* Header with NORMAL 10 PAIRS vs OTC 22 PAIRS Toggle Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <span>Market Pairs</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-bold">
              {marketMode === 'OTC' ? '22 OTC Pairs (24/7)' : '10 Normal Forex Pairs'}
            </span>
          </h2>
        </div>

        {/* Both Functional Buttons: NORMAL 10 PAIRS and OTC 22 PAIRS */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-[#071324] border border-cyan-500/35 shadow-inner">
          {/* NORMAL 10 PAIRS BUTTON */}
          <button
            type="button"
            onClick={() => onSelectMarketMode && onSelectMarketMode('NORMAL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              marketMode === 'NORMAL'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-[0_0_12px_rgba(6,182,212,0.5)] border border-cyan-300'
                : 'bg-transparent text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
            title="Switch to 10 Normal Interbank Forex Pairs"
          >
            <span className={`w-2 h-2 rounded-full ${marketMode === 'NORMAL' ? 'bg-emerald-300 animate-pulse' : 'bg-slate-500'}`} />
            <span>NORMAL 10 PAIRS</span>
          </button>

          {/* OTC 22 PAIRS BUTTON */}
          <button
            type="button"
            onClick={() => onSelectMarketMode && onSelectMarketMode('OTC')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              marketMode === 'OTC'
                ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white shadow-[0_0_14px_rgba(214,41,118,0.55)] border border-pink-300'
                : 'bg-transparent text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
            title="Switch to 22 Broker OTC Pairs (+0.15% markup, 24/7 weekend active)"
          >
            <Zap className={`w-3.5 h-3.5 ${marketMode === 'OTC' ? 'text-amber-300 fill-current' : 'text-slate-400'}`} />
            <span>OTC 22 PAIRS</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-amber-400 text-slate-950 font-black">
              24/7
            </span>
          </button>
        </div>
      </div>

      {/* Grid of Forex / OTC Pairs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3">
        {activePairs.map((pair) => {
          const quote = quotes.find(q => q.symbol === pair.symbol);
          const isSelected = pair.symbol === selectedPair;
          const isOtc = pair.symbol.includes('OTC') || marketMode === 'OTC';
          const isPositive = quote ? quote.percent_change >= 0 : true;

          return (
            <button
              key={pair.symbol}
              type="button"
              onClick={() => onSelectPair(pair.symbol)}
              className={`p-3 rounded-xl text-left transition-all duration-200 relative group cursor-pointer ${
                isSelected
                  ? 'bg-[#0E2038] border-2 border-cyan-400 shadow-[0_0_18px_rgba(6,182,212,0.35)] scale-[1.02]'
                  : 'bg-[#091424] border border-slate-800 hover:border-cyan-500/40 hover:bg-[#0C1A2E]'
              }`}
            >
              {/* Pair Flags & Live Badge */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-base sm:text-lg leading-none">
                  {pair.flagBase}{pair.flagQuote}
                </span>

                <div className="flex items-center gap-1">
                  {isOtc && (
                    <span className="text-[8px] font-black px-1 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      OTC
                    </span>
                  )}
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    isOtc 
                      ? 'bg-rose-950/80 text-rose-300 border border-rose-600/40' 
                      : isLive 
                      ? 'bg-emerald-500/20 text-emerald-400' 
                      : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {isOtc ? 'No API' : isLive ? 'Live' : 'Demo'}
                  </span>
                </div>
              </div>

              {/* Pair Symbol */}
              <div className="text-xs sm:text-sm font-extrabold text-white group-hover:text-cyan-300 transition-colors truncate">
                {pair.symbol}
              </div>

              {/* Current Price */}
              <div className={`text-xs sm:text-sm font-bold font-tabular mt-0.5 ${isOtc ? 'text-amber-400' : 'text-slate-200'}`}>
                {isOtc ? 'UNAVAILABLE' : (quote && quote.price !== null ? quote.price.toFixed(pair.decimals) : pair.baseRate.toFixed(pair.decimals))}
              </div>

              {/* Percentage Change or Status */}
              <div className={`flex items-center gap-1 text-[11px] font-bold font-tabular mt-1 ${
                isOtc ? 'text-rose-400' : isPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {!isOtc && (
                  isPositive ? (
                    <ArrowUp className="w-3 h-3 stroke-[2.5]" />
                  ) : (
                    <ArrowDown className="w-3 h-3 stroke-[2.5]" />
                  )
                )}
                <span>
                  {isOtc ? 'NO TRADE' : `${isPositive ? '+' : ''}${quote ? quote.percent_change.toFixed(2) : '0.00'}%`}
                </span>
              </div>

              {isSelected && (
                <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00e5ff]"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
