import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  ArrowUp, 
  ArrowDown, 
  Minus, 
  Sparkles, 
  TrendingUp, 
  Zap, 
  ShieldCheck,
  CheckCircle2,
  Clock,
  X
} from 'lucide-react';
import { SignalItem, BrokerType } from '../types/trading';

interface AnalyzeModalProps {
  isOpen: boolean;
  selectedPair: string;
  selectedBroker: BrokerType;
  selectedTimeframe: string;
  selectedTradeDuration: string;
  signalResult: SignalItem | null;
  onComplete: () => void;
}

export const AnalyzeModal: React.FC<AnalyzeModalProps> = ({
  isOpen,
  selectedPair,
  selectedBroker,
  selectedTimeframe,
  selectedTradeDuration,
  signalResult,
  onComplete,
}) => {
  // useState timer = 5
  // Every 1 sec: timer goes 5 -> 4 -> 3 -> 2 -> 1 -> 0
  const [timer, setTimer] = useState<number>(5);

  useEffect(() => {
    if (!isOpen) {
      setTimer(5);
      return;
    }

    // Reset timer to 5 immediately when modal opens
    setTimer(5);

    // useEffect with setInterval 1000ms
    const intervalId = window.setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          // Reaching 0 sec: clearInterval
          window.clearInterval(intervalId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Update text every second according to timer:
  // 5 sec: "Scanning 1M Market Structure..."
  // 4 sec: "Checking Tick Momentum..."
  // 3 sec: "Measuring Impulse Velocity..."
  // 2 sec: "Confirming Trend..."
  // 1 sec: "Finalizing Signal..."
  // 0 sec: Show BUY/SELL result
  const getTextAndSubtext = () => {
    switch (timer) {
      case 5:
        return {
          title: "Scanning 1M Market Structure...",
          subtitle: "Reading price action & candlestick order blocks",
          icon: Activity,
        };
      case 4:
        return {
          title: "Checking Tick Momentum...",
          subtitle: "Inspecting live WebSocket tick velocity & volume bursts",
          icon: Zap,
        };
      case 3:
        return {
          title: "Measuring Impulse Velocity...",
          subtitle: "Calculating RSI divergence, MACD spread & ATR volatility",
          icon: TrendingUp,
        };
      case 2:
        return {
          title: "Confirming Trend...",
          subtitle: "Verifying 9 EMA / 21 EMA institutional confluence",
          icon: ShieldCheck,
        };
      case 1:
        return {
          title: "Finalizing Signal...",
          subtitle: "Locking broker entry price & expiry duration",
          icon: Sparkles,
        };
      case 0:
      default:
        return {
          title: "Signal Confirmed",
          subtitle: "Execution parameters verified for broker entry",
          icon: CheckCircle2,
        };
    }
  };

  const isComplete = timer === 0;
  const currentStepInfo = getTextAndSubtext();
  const IconComponent = currentStepInfo.icon;

  const signal = signalResult?.signal || 'BUY';
  const confidence = signalResult?.confidence || 88;
  const isBuy = signal === 'BUY';
  const isSell = signal === 'SELL';

  // Update circle progress based on timer: (5 - timer) / 5 * 100%
  // 5 sec: (5-5)/5 = 0%
  // 4 sec: (5-4)/5 = 20%
  // 3 sec: (5-3)/5 = 40%
  // 2 sec: (5-2)/5 = 60%
  // 1 sec: (5-1)/5 = 80%
  // 0 sec: (5-0)/5 = 100%
  const progressPercent = ((5 - timer) / 5) * 100;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * progressPercent) / 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-md cyber-card p-6 border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.35)] relative overflow-hidden flex flex-col items-center text-center">
        
        {/* Subtle Cyber Grid Background Glows */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Badge */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#08172c] border border-cyan-500/40 text-cyan-300 text-xs font-bold mb-4 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span>AI CONFLUENCE ENGINE</span>
          <span className="text-slate-500">•</span>
          <span className="text-white font-mono">{selectedPair}</span>
          <span className="text-slate-500">•</span>
          <span className="text-amber-400">{selectedTradeDuration}</span>
        </div>

        {/* Circle Animation with Countdown Timer 5..4..3..2..1..0 */}
        <div className="relative w-36 h-36 flex items-center justify-center my-2">
          {/* SVG Progress Circle */}
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 128 128">
            <circle
              cx="64"
              cy="64"
              r={radius}
              className="text-slate-800/80"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="64"
              cy="64"
              r={radius}
              className={`transition-all duration-700 ease-out ${
                isComplete
                  ? isBuy 
                    ? 'text-emerald-400' 
                    : isSell 
                    ? 'text-rose-500' 
                    : 'text-amber-400'
                  : 'text-cyan-400'
              }`}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>

          {/* Inner Circle Content: Countdown 5..4..3..2..1 or at 0 sec BUY/SELL Result Icon */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {!isComplete ? (
              <div className="flex flex-col items-center justify-center animate-pulse">
                <span 
                  key={timer}
                  className="text-4xl font-black text-cyan-300 font-mono tracking-tighter drop-shadow-[0_0_15px_rgba(6,182,212,0.8)] animate-scaleIn"
                >
                  {timer}
                </span>
                <span className="text-[10px] text-cyan-400/80 uppercase font-bold tracking-widest mt-0.5">
                  SEC
                </span>
              </div>
            ) : isBuy ? (
              <div className="flex flex-col items-center justify-center animate-scaleIn">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-[0_0_20px_rgba(0,230,118,0.7)] border border-emerald-400/60">
                  <ArrowUp className="w-8 h-8 stroke-[3]" />
                </div>
              </div>
            ) : isSell ? (
              <div className="flex flex-col items-center justify-center animate-scaleIn">
                <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shadow-[0_0_20px_rgba(255,61,87,0.7)] border border-rose-400/60">
                  <ArrowDown className="w-8 h-8 stroke-[3]" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center animate-scaleIn">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.7)] border border-amber-400/60">
                  <Minus className="w-8 h-8 stroke-[3]" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Sequence Text */}
        <div className="min-h-[70px] mt-2 flex flex-col items-center justify-center">
          {!isComplete ? (
            <div key={timer} className="animate-fadeIn">
              <h3 className="text-base sm:text-lg font-extrabold text-white tracking-wide">
                {currentStepInfo.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {currentStepInfo.subtitle}
              </p>
            </div>
          ) : (
            <div className="animate-fadeIn">
              <div className="flex items-center justify-center gap-2">
                <span className={`text-2xl sm:text-3xl font-black tracking-widest ${
                  isBuy ? 'text-emerald-400 drop-shadow-[0_0_18px_rgba(0,230,118,0.8)]' :
                  isSell ? 'text-rose-400 drop-shadow-[0_0_18px_rgba(255,61,87,0.8)]' :
                  'text-slate-300'
                }`}>
                  {signal} SIGNAL READY
                </span>
              </div>
              <p className="text-xs text-slate-300 font-semibold mt-1">
                Confidence: <strong className={isBuy ? 'text-emerald-400' : isSell ? 'text-rose-400' : 'text-amber-400'}>{confidence}%</strong> • {selectedBroker} Validated
              </p>
            </div>
          )}
        </div>

        {/* Progress Step Indicators (fill one by one every second as timer drops from 5 to 0) */}
        {/* Step index 1 to 5: filled when elapsed >= step (elapsed = 5 - timer) */}
        <div className="w-full max-w-xs grid grid-cols-5 gap-1.5 mt-3 mb-2">
          {[1, 2, 3, 4, 5].map((step) => {
            const elapsed = 5 - timer;
            const isFilled = elapsed >= step;
            const isCurrentActive = elapsed === step - 1 && !isComplete;

            return (
              <div
                key={step}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  isFilled
                    ? isComplete
                      ? isBuy 
                        ? 'bg-emerald-400 shadow-[0_0_8px_#00e676]' 
                        : isSell 
                        ? 'bg-rose-500 shadow-[0_0_8px_#ff3d57]' 
                        : 'bg-cyan-400'
                      : 'bg-cyan-400 shadow-[0_0_6px_#06b6d4]'
                    : isCurrentActive
                    ? 'bg-cyan-300 animate-pulse'
                    : 'bg-slate-800'
                }`}
              />
            );
          })}
        </div>

        {/* At 0 sec: Action buttons to Apply or View Signal */}
        {isComplete && (
          <div className="w-full mt-3 animate-fadeIn">
            <button
              type="button"
              onClick={onComplete}
              className={`w-full py-2.5 px-4 rounded-xl font-black text-sm tracking-wider uppercase shadow-lg transition-transform active:scale-95 cursor-pointer ${
                isBuy
                  ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 shadow-[0_0_20px_rgba(0,230,118,0.4)]'
                  : isSell
                  ? 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white shadow-[0_0_20px_rgba(255,61,87,0.4)]'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
              }`}
            >
              APPLY & VIEW {signal} SIGNAL
            </button>
          </div>
        )}

        {/* Broker + Micro Status */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 w-full flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Timeframe: <strong className="text-slate-200">{selectedTimeframe}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-mono text-cyan-300">{selectedBroker} WS Live</span>
          </div>
        </div>

      </div>
    </div>
  );
};
