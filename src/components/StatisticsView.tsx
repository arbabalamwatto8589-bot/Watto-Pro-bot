import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Activity, 
  AlertCircle,
  HelpCircle,
  PieChart
} from 'lucide-react';
import { TradingStats } from '../types/trading';

interface StatisticsViewProps {
  stats: TradingStats;
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({ stats }) => {
  const hasOutcomeData = stats.trackedCompleted > 0;

  return (
    <div className="space-y-6">
      {/* Title & Introduction */}
      <div className="cyber-card p-4 sm:p-5 border-cyan-500/30">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-wide">
              Performance & Confluence Statistics
            </h1>
            <p className="text-xs text-slate-400">
              Transparent, empirically verified signal analytics derived strictly from recorded trade history
            </p>
          </div>
        </div>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 font-tabular">
        {/* Total Signals */}
        <div className="cyber-card p-4 border-cyan-500/25">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Total Signals
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {stats.totalSignals}
          </div>
          <div className="text-[10px] text-cyan-400 mt-1">
            All evaluated requests
          </div>
        </div>

        {/* BUY Signals */}
        <div className="cyber-card p-4 border-emerald-500/30">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            BUY Signals
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">
            {stats.buySignals}
          </div>
          <div className="text-[10px] text-emerald-300 mt-1">
            {stats.totalSignals > 0 ? ((stats.buySignals / stats.totalSignals) * 100).toFixed(0) : 0}% of all signals
          </div>
        </div>

        {/* SELL Signals */}
        <div className="cyber-card p-4 border-rose-500/30">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            SELL Signals
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-400">
            {stats.sellSignals}
          </div>
          <div className="text-[10px] text-rose-300 mt-1">
            {stats.totalSignals > 0 ? ((stats.sellSignals / stats.totalSignals) * 100).toFixed(0) : 0}% of all signals
          </div>
        </div>

        {/* NO TRADE Signals */}
        <div className="cyber-card p-4 border-amber-500/30">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            NO TRADE Filter
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400">
            {stats.noTradeSignals}
          </div>
          <div className="text-[10px] text-amber-300 mt-1">
            Conflicting setups avoided
          </div>
        </div>
      </div>

      {/* Outcome & Empirical Win Rate Section */}
      <div className="cyber-card p-5 sm:p-6 border-cyan-500/30">
        <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          <span>Empirical Outcome Tracking (Post-Candle Expiry)</span>
        </h2>

        {hasOutcomeData ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-tabular mt-4">
            {/* Win Rate */}
            <div className="p-4 rounded-xl bg-[#091526] border border-cyan-500/40 text-center">
              <div className="text-xs font-bold text-slate-400 uppercase">
                Empirical Win Rate
              </div>
              <div className="text-4xl font-black text-cyan-300 my-2">
                {stats.winRate}%
              </div>
              <div className="text-[11px] text-slate-400">
                Calculated across {stats.trackedCompleted} completed candle expiries
              </div>
            </div>

            {/* Wins */}
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/40 text-center">
              <div className="text-xs font-bold text-slate-400 uppercase">
                Verified In-The-Money (Wins)
              </div>
              <div className="text-4xl font-black text-emerald-400 my-2">
                {stats.wins}
              </div>
              <div className="text-[11px] text-emerald-300">
                Positive directional close
              </div>
            </div>

            {/* Losses */}
            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/40 text-center">
              <div className="text-xs font-bold text-slate-400 uppercase">
                Out-of-The-Money (Losses)
              </div>
              <div className="text-4xl font-black text-rose-400 my-2">
                {stats.losses}
              </div>
              <div className="text-[11px] text-rose-300">
                Reversed market structure
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-[#081324] border border-slate-800 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
            <div className="text-sm font-bold text-white">
              Performance data requires outcome tracking.
            </div>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Once you generate signals and allow the selected candle timeframe to elapse, WATTOPro automatically compares the closing candle price with your entry price and records true verified win/loss outcomes.
            </p>
          </div>
        )}
      </div>

      {/* Compliance & Accuracy Principle Notice */}
      <div className="cyber-card p-4 sm:p-5 border-slate-800 bg-[#07101E]">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 space-y-1">
            <div className="font-bold text-white">
              WATTOPro Anti-Deception & Transparency Guarantee
            </div>
            <p className="text-slate-400 leading-relaxed">
              We strictly adhere to honest trading principles: we never advertise "100% guaranteed profit", "risk-free trading", or fabricated accuracy badges. Forex trading involves significant risk to invested capital. WATTOPro is an analytical indicator decision engine built to eliminate emotional trading errors and enhance confluence awareness.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
