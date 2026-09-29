import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Minus, 
  Filter, 
  ExternalLink,
  ChevronDown,
  Info
} from 'lucide-react';
import { SignalItem } from '../types/trading';

interface HistoryViewProps {
  signals: SignalItem[];
  onClearHistory: () => void;
  onClose?: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  signals,
  onClearHistory,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'BUY' | 'SELL' | 'NO TRADE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSignal, setSelectedSignal] = useState<SignalItem | null>(null);

  const filtered = signals.filter(sig => {
    if (filterType !== 'ALL' && sig.signal !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return sig.pair.toLowerCase().includes(q) || sig.timeframe.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 cyber-card p-4 sm:p-5 border-cyan-500/30">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-wide">
              Signal Log & Audit Trail
            </h1>
            <p className="text-xs text-slate-400">
              Complete historical record of generated technical signals and outcomes
            </p>
          </div>
        </div>

        {signals.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to clear your local signal history?')) {
                onClearHistory();
              }
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 hover:bg-rose-900/60 transition-colors text-xs font-bold self-start sm:self-auto"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Filters & Search */}
      <div className="cyber-card p-4 border-cyan-500/20 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Type Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#081220] border border-slate-800 w-full md:w-auto">
          {(['ALL', 'BUY', 'SELL', 'NO TRADE'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === type
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search pair or timeframe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#081220] border border-slate-800 focus:border-cyan-500/50 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Signals Table */}
      <div className="cyber-card overflow-hidden border-cyan-500/25">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-tabular">
            <thead className="bg-[#081324] text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Pair</th>
                <th className="py-3 px-4">Market TF</th>
                <th className="py-3 px-4">Trade Time</th>
                <th className="py-3 px-4">Signal</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Entry Price</th>
                <th className="py-3 px-4">Outcome</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 text-sm">
                    No signals found matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((sig) => {
                  const isBuy = sig.signal === 'BUY';
                  const isSell = sig.signal === 'SELL';

                  return (
                    <tr 
                      key={sig.id} 
                      className="hover:bg-[#0E1E33]/60 transition-colors cursor-pointer"
                      onClick={() => setSelectedSignal(sig)}
                    >
                      <td className="py-3 px-4 text-slate-300">
                        {sig.timeFormatted}
                        <div className="text-[10px] text-slate-500">
                          {new Date(sig.timestamp).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-white">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span>{sig.pair}</span>
                          {sig.broker && (
                            <span className={`text-[9px] font-black px-1.5 py-0.2 rounded border ${
                              sig.broker === 'Quotex' ? 'bg-rose-950/80 text-rose-300 border-rose-500/50' : 'bg-blue-950/80 text-cyan-300 border-cyan-500/50'
                            }`}>
                              {sig.broker}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-semibold text-[11px] border border-cyan-500/30" title="Market Timeframe">
                          {sig.timeframe}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 font-bold text-[11px] border border-amber-500/30 whitespace-nowrap" title="Trade Duration">
                          ⏱ {sig.tradeDuration || sig.timeframe}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {isBuy ? (
                          <span className="inline-flex items-center gap-1 font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                            <ArrowUp className="w-3.5 h-3.5 stroke-[3]" />
                            BUY
                          </span>
                        ) : isSell ? (
                          <span className="inline-flex items-center gap-1 font-extrabold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                            <ArrowDown className="w-3.5 h-3.5 stroke-[3]" />
                            SELL
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                            <Minus className="w-3.5 h-3.5" />
                            NO TRADE
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-200">
                        {sig.confidence}%
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {sig.entryPrice !== null ? sig.entryPrice.toFixed(5) : 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        {sig.outcome === 'WIN' ? (
                          <span className="font-extrabold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded text-[11px]">
                            ✓ WIN
                          </span>
                        ) : sig.outcome === 'LOSS' ? (
                          <span className="font-extrabold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded text-[11px]">
                            ✗ LOSS
                          </span>
                        ) : sig.outcome === 'PENDING' ? (
                          <span className="font-semibold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded text-[11px] animate-pulse">
                            ⏳ Tracking...
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSignal(sig);
                          }}
                          className="text-cyan-400 hover:text-cyan-300 font-semibold text-[11px] underline"
                        >
                          View Audit
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Signal Details Audit Modal */}
      {selectedSignal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg cyber-card p-6 border-cyan-500/40 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20 mb-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span>Signal Confluence Audit</span>
              </h3>
              <button
                onClick={() => setSelectedSignal(null)}
                className="text-slate-400 hover:text-white text-lg font-bold px-2"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#091424]">
                <div>
                  <span className="text-slate-400">Pair & Market TF:</span>
                  <div className="text-white font-bold text-sm">
                    {selectedSignal.pair} ({selectedSignal.timeframe})
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Trade Time / Duration:</span>
                  <div className="text-amber-300 font-bold text-sm">
                    ⏱ {selectedSignal.tradeDuration || selectedSignal.timeframe}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Signal & Confidence:</span>
                  <div className={`font-black text-sm ${
                    selectedSignal.signal === 'BUY' ? 'text-emerald-400' : selectedSignal.signal === 'SELL' ? 'text-rose-400' : 'text-slate-400'
                  }`}>
                    {selectedSignal.signal} ({selectedSignal.confidence}%)
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Entry Price:</span>
                  <div className="text-cyan-300 font-bold font-tabular">
                    {selectedSignal.entryPrice}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Data Source:</span>
                  <div className="text-slate-200 font-semibold">
                    {selectedSignal.source} {selectedSignal.isDemo ? '(Demo)' : '(Live)'}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Signal Outcome:</span>
                  <div className="font-bold">
                    {selectedSignal.outcome === 'WIN' ? (
                      <span className="text-emerald-400">✓ WIN</span>
                    ) : selectedSignal.outcome === 'LOSS' ? (
                      <span className="text-rose-400">✗ LOSS</span>
                    ) : (
                      <span className="text-amber-400">⏳ Pending</span>
                    )}
                  </div>
                </div>
              </div>

              {selectedSignal.methodologyNote && (
                <div className="p-2.5 rounded-xl bg-[#060D19] border border-cyan-900/40 text-[11px] text-slate-300">
                  <span className="text-cyan-400 font-bold">Methodology:</span> {selectedSignal.methodologyNote}
                </div>
              )}

              {/* Indicator States Breakdown */}
              <div className="p-3 rounded-xl bg-[#091424] space-y-2">
                <div className="font-bold text-slate-300 uppercase text-[10px] tracking-wider">
                  Technical Indicator States at Signal Time:
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-400">EMA 9 / 21:</span>
                  <span className="text-white font-semibold">
                    {selectedSignal.indicators.ema9} / {selectedSignal.indicators.ema21} ({selectedSignal.indicators.emaStatus})
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-400">RSI (14):</span>
                  <span className="text-cyan-300 font-semibold">
                    {selectedSignal.indicators.rsi14} ({selectedSignal.indicators.rsiStatus})
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-400">MACD Histogram:</span>
                  <span className="text-white font-semibold">
                    {selectedSignal.indicators.macd.histogram} ({selectedSignal.indicators.macd.status})
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-400">Trend Alignment:</span>
                  <span className="text-emerald-400 font-semibold">
                    {selectedSignal.indicators.trend}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Support / Resistance:</span>
                  <span className="text-slate-200 font-semibold">
                    {selectedSignal.indicators.supportResistance.status} (S: {selectedSignal.indicators.supportResistance.support} | R: {selectedSignal.indicators.supportResistance.resistance})
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 italic">
                * Note: WATTOPro signals are analytical outputs calculated deterministically from multi-indicator confluence. Never invest capital you cannot afford to lose.
              </div>
            </div>

            <button
              onClick={() => setSelectedSignal(null)}
              className="mt-4 w-full py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
