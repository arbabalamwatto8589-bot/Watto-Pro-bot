import React, { useState, useEffect, useRef } from 'react';
import { Activity, TrendingUp, Users, Target } from 'lucide-react';

interface BotPerformanceCardProps {
  className?: string;
  currentSignalId?: string;
  signalsCount?: number;
}

export const BotPerformanceCard: React.FC<BotPerformanceCardProps> = ({
  className = '',
  currentSignalId,
  signalsCount = 0,
}) => {
  const [accuracy, setAccuracy] = useState<number>(94.7);
  const [activeTraders, setActiveTraders] = useState<string>('1.2K+');
  const [isPulsing, setIsPulsing] = useState<boolean>(false);
  const prevSignalIdRef = useRef<string | undefined>(currentSignalId);
  const initialBaseSignals = 247;

  // Compute dynamic signals today: baseline 247 + new signals count
  const signalsToday = initialBaseSignals + (signalsCount > 0 ? signalsCount : 0);

  // Update dynamic values and trigger green glow animation on new signal
  useEffect(() => {
    if (currentSignalId && currentSignalId !== prevSignalIdRef.current) {
      prevSignalIdRef.current = currentSignalId;

      // Accuracy slightly increases/decreases between 94.5% and 95.2%
      const possibleAccuracies = [94.5, 94.6, 94.7, 94.8, 94.9, 95.0, 95.1, 95.2];
      const nextAccuracy = possibleAccuracies[Math.floor(Math.random() * possibleAccuracies.length)];
      setAccuracy(nextAccuracy);

      // Active Traders fluctuates between 1.2K and 1.3K
      const traderVariations = ['1.2K+', '1.23K', '1.26K', '1.28K', '1.3K'];
      setActiveTraders(traderVariations[Math.floor(Math.random() * traderVariations.length)]);

      // Animate/pulse green glow
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [currentSignalId]);

  // Periodic subtle fluctuation for Active Traders (1.2K - 1.3K)
  useEffect(() => {
    const interval = setInterval(() => {
      const traderVariations = ['1.2K+', '1.24K', '1.26K', '1.28K', '1.3K'];
      setActiveTraders(traderVariations[Math.floor(Math.random() * traderVariations.length)]);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`p-4 rounded-xl bg-gradient-to-r from-[#071322] via-[#05111f] to-[#081827] border transition-all duration-500 relative overflow-hidden ${
        isPulsing
          ? 'border-emerald-400 ring-2 ring-emerald-400/80 shadow-[0_0_35px_rgba(16,185,129,0.55)] scale-[1.008]'
          : 'border-emerald-500/40 shadow-[0_0_22px_rgba(16,185,129,0.22)]'
      } ${className}`}
    >
      {/* Background cyber green gradient accent */}
      <div
        className={`absolute top-0 right-1/4 w-36 h-36 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
          isPulsing ? 'bg-emerald-400/30' : 'bg-emerald-500/10'
        }`}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        {/* Left: Icon with pulsing green dot & Title */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            className={`relative p-2.5 rounded-xl border text-emerald-400 transition-all duration-500 ${
              isPulsing
                ? 'bg-emerald-900/90 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.6)]'
                : 'bg-emerald-950/70 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
            }`}
          >
            <Activity className={`w-5 h-5 ${isPulsing ? 'animate-bounce text-emerald-300' : 'animate-pulse'}`} />
            {/* Pulsing green dot on top-right of icon */}
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-[#071322]"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span
                className="text-sm font-black text-white uppercase tracking-wider"
                style={{ fontFamily: 'Chakra Petch, sans-serif' }}
              >
                BOT PERFORMANCE LIVE
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-950/90 text-emerald-400 border border-emerald-500/50 flex items-center gap-1 shadow-[0_0_8px_rgba(16,185,129,0.4)]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ACTIVE
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-2 mt-0.5">
              <span>Real-time Algorithmic Execution Confluence</span>
              <span className="text-slate-600">•</span>
              <span className="text-[10px] text-emerald-400/90 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                Synced with Live Signals
              </span>
            </div>
          </div>
        </div>

        {/* Middle/Right: 3 Stats in a Row + Animated Rising Graph Line */}
        <div className="flex items-center gap-3 sm:gap-5 w-full sm:w-auto justify-between sm:justify-end flex-wrap sm:flex-nowrap">
          {/* Stat 1: Accuracy (dynamic 94.5% - 95.2%) */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-500 ${
              isPulsing
                ? 'bg-emerald-900/40 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                : 'bg-emerald-950/30 border-emerald-500/30'
            }`}
          >
            <Target className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">
                Accuracy
              </div>
              <div
                className="text-base font-black text-emerald-400 tracking-tight leading-tight mt-0.5 font-mono"
                style={{
                  textShadow: isPulsing ? '0 0 15px rgba(16,185,129,0.9)' : '0 0 10px rgba(16,185,129,0.6)',
                }}
              >
                {accuracy.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Stat 2: Signals Today (+1 on every new signal) */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-500 ${
              isPulsing
                ? 'bg-cyan-900/40 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-cyan-950/30 border-cyan-500/30'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">
                Signals Today
              </div>
              <div className="text-base font-black text-white tracking-tight leading-tight mt-0.5 font-mono">
                {signalsToday}
              </div>
            </div>
          </div>

          {/* Stat 3: Active Traders (fluctuates 1.2K - 1.3K) */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-950/30 border border-blue-500/30">
            <Users className="w-4 h-4 text-blue-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">
                Active Traders
              </div>
              <div className="text-base font-black text-cyan-200 tracking-tight leading-tight mt-0.5 font-mono">
                {activeTraders}
              </div>
            </div>
          </div>

          {/* Small animated rising graph line going up */}
          <div className="hidden md:flex items-center shrink-0 pl-1">
            <svg
              className="w-20 h-10 overflow-visible"
              viewBox="0 0 80 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="risingGraphGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Shaded Area under curve */}
              <path
                d="M 2 36 Q 18 32, 28 24 T 52 14 T 78 4 L 78 38 L 2 38 Z"
                fill="url(#risingGraphGrad)"
              />
              {/* Animated rising stroke */}
              <path
                d="M 2 36 Q 18 32, 28 24 T 52 14 T 78 4"
                stroke="#10B981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-pulse"
                style={{
                  filter: 'drop-shadow(0 0 6px #10B981)',
                }}
              />
              {/* Upward pulse point at top end */}
              <circle cx="78" cy="4" r="3.5" fill="#34D399" className="animate-ping" />
              <circle cx="78" cy="4" r="3" fill="#10B981" stroke="#ffffff" strokeWidth="1" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
