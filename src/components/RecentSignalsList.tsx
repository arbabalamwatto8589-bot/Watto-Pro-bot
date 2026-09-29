import React from 'react';
import { Clock, ArrowUp, ArrowDown, Minus, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import { SignalItem } from '../types/trading';

interface RecentSignalsListProps {
  signals: SignalItem[];
  onViewAll: () => void;
}

export const RecentSignalsList: React.FC<RecentSignalsListProps> = ({
  signals,
  onViewAll,
}) => {
  const recent = signals.slice(0, 7);

  return (
    <div className="cyber-card p-4 sm:p-5 border-cyan-500/30 flex flex-col justify-between">
      <div>
        {/* Title */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20 mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
              Recent Signals
            </h2>
          </div>
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Signals Rows */}
        {recent.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            No signals generated yet. Click "GET SIGNAL" to analyze the market.
          </div>
        ) : (
          <div className="space-y-1.5 font-tabular">
            {recent.map((sig) => {
              const isBuy = sig.signal === 'BUY';
              const isSell = sig.signal === 'SELL';

              return (
                <div
                  key={sig.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#091424] border border-slate-800/80 hover:border-cyan-500/30 text-xs transition-colors"
                >
                  {/* Time & Pair */}
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[11px] w-12 font-tabular">
                      {sig.timeFormatted.substring(0, 5)}
                    </span>
                    <span className="text-white font-bold">{sig.pair}</span>
                    <span className="text-[10px] text-cyan-400 font-semibold px-1 rounded bg-cyan-950/60 border border-cyan-500/20" title="Market Timeframe">
                      {sig.timeframe}
                    </span>
                    {sig.broker && (
                      <span className={`text-[9px] font-black px-1 rounded ${
                        sig.broker === 'Quotex' ? 'bg-rose-950/80 text-rose-300 border border-rose-600/40' : 'bg-blue-950/80 text-cyan-300 border border-cyan-500/40'
                      }`} title={`Broker: ${sig.broker}`}>
                        {sig.broker === 'Quotex' ? 'QX' : 'PO'}
                      </span>
                    )}
                    {sig.tradeDuration && (
                      <span className="text-[10px] text-amber-300 font-bold px-1 rounded bg-amber-950/50 border border-amber-500/20" title="Trade Duration / Expiry">
                        ⏱ {sig.tradeDuration}
                      </span>
                    )}
                  </div>

                  {/* Signal & Confidence */}
                  <div className="flex items-center gap-3">
                    {isBuy ? (
                      <span className="flex items-center gap-1 font-extrabold text-emerald-400">
                        <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>BUY</span>
                      </span>
                    ) : isSell ? (
                      <span className="flex items-center gap-1 font-extrabold text-rose-400">
                        <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>SELL</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 font-bold text-slate-400">
                        <Minus className="w-3.5 h-3.5" />
                        <span>HOLD</span>
                      </span>
                    )}

                    <span className={`font-bold w-9 text-right ${
                      isBuy ? 'text-emerald-300' : isSell ? 'text-rose-300' : 'text-slate-400'
                    }`}>
                      {sig.confidence}%
                    </span>

                    {/* Outcome tag if resolved */}
                    {sig.outcome === 'WIN' && (
                      <span className="text-[10px] font-extrabold text-emerald-400 px-1 py-0.5 rounded bg-emerald-500/20">
                        WIN
                      </span>
                    )}
                    {sig.outcome === 'LOSS' && (
                      <span className="text-[10px] font-extrabold text-rose-400 px-1 py-0.5 rounded bg-rose-500/20">
                        LOSS
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mini Signal Log Footer */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <span>Historical signals saved locally</span>
        <span className="text-cyan-400 font-semibold font-tabular">
          {signals.length} Signals Logged
        </span>
      </div>
    </div>
  );
};
