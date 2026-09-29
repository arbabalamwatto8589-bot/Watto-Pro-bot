import React from 'react';
import { 
  HelpCircle, 
  BookOpen, 
  ShieldCheck, 
  TrendingUp, 
  Activity, 
  Clock, 
  Target,
  AlertTriangle
} from 'lucide-react';
import { BrandProfileCard } from './BrandProfileCard';

export const HelpView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Official WATTOPro Brand Profile Card */}
      <BrandProfileCard />

      {/* Title */}
      <div className="cyber-card p-4 sm:p-5 border-cyan-500/30">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-wide">
              WATTOPro Knowledge Base & Trading Rules
            </h1>
            <p className="text-xs text-slate-400">
              Master the multi-indicator confluence engine, closed-candle methodology, and risk principles
            </p>
          </div>
        </div>
      </div>

      {/* Core Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Rule 1: Closed Candle Logic */}
        <div className="cyber-card p-4 sm:p-5 border-cyan-500/20">
          <div className="flex items-center gap-2.5 mb-2 text-cyan-300 font-bold text-sm">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>1. Closed Candle Confirmation</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            WATTOPro evaluates signals primarily using <strong>confirmed closed candles</strong> rather than volatile intra-candle flickers. Wait for the live countdown timer on the signal card to sync with your entry to avoid false breakouts.
          </p>
        </div>

        {/* Rule 2: Multi-Indicator Confluence */}
        <div className="cyber-card p-4 sm:p-5 border-cyan-500/20">
          <div className="flex items-center gap-2.5 mb-2 text-emerald-400 font-bold text-sm">
            <Target className="w-4 h-4 text-emerald-400" />
            <span>2. Confluence, Never Single Indicators</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            A signal requires simultaneous alignment across <strong>EMA 9/21, RSI 14, MACD, and Price Action</strong>. When indicators conflict, WATTOPro automatically triggers <strong>NO TRADE</strong> to protect your capital.
          </p>
        </div>

        {/* Rule 3: Timeframe Correlation */}
        <div className="cyber-card p-4 sm:p-5 border-cyan-500/20">
          <div className="flex items-center gap-2.5 mb-2 text-blue-400 font-bold text-sm">
            <Activity className="w-4 h-4 text-blue-400" />
            <span>3. Timeframe Expirations</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Select the timeframe (1M, 2M, 3M, 5M, 15M, 30M) matching your trade duration. For 1-minute expiration strategies, use 1M or 2M. For swing setups, use 15M or 30M for reduced noise.
          </p>
        </div>

        {/* Rule 4: Capital Preservation */}
        <div className="cyber-card p-4 sm:p-5 border-cyan-500/20">
          <div className="flex items-center gap-2.5 mb-2 text-amber-400 font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>4. Risk Discipline & Position Sizing</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Never risk more than <strong>1% to 2%</strong> of your total account balance on any single signal. Consistent risk management is the single biggest factor distinguishing profitable traders from gamblers.
          </p>
        </div>
      </div>

      {/* Indicator Cheatsheet */}
      <div className="cyber-card p-5 border-cyan-500/30">
        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          <span>Technical Indicators Glossary</span>
        </h2>

        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-xl bg-[#091424] border border-slate-800">
            <span className="font-bold text-cyan-300 block mb-1">EMA 9 / EMA 21 Dynamic Cross</span>
            <p className="text-slate-300">
              When the fast EMA 9 crosses above the baseline EMA 21, upward momentum is verified. When it crosses below, downward momentum takes precedence.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#091424] border border-slate-800">
            <span className="font-bold text-cyan-300 block mb-1">RSI (14) Momentum Range</span>
            <p className="text-slate-300">
              Optimal BUY signals occur when RSI is between 48 and 65 (strong continuation) or rising from under 30 (oversold bounce). Avoid buying if RSI is above 75 (extreme overbought exhaustion).
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#091424] border border-slate-800">
            <span className="font-bold text-cyan-300 block mb-1">MACD (Moving Average Convergence Divergence)</span>
            <p className="text-slate-300">
              Calculates 12 EMA minus 26 EMA with a 9-period signal line. Expanding green histogram bars indicate increasing buyer dominance.
            </p>
          </div>
        </div>
      </div>

      {/* Strict Disclaimer */}
      <div className="cyber-card p-4 sm:p-5 border-amber-500/40 bg-[#0A101D]">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 space-y-1">
            <div className="font-bold text-amber-300">
              Financial Risk Notice
            </div>
            <p className="text-slate-400 leading-relaxed">
              Foreign exchange and CFD trading involve substantial risk of loss and are not suitable for all investors. WATTOPro is an analytical software tool designed solely for informational and educational decision-support. No information provided constitutes financial, investment, or trading advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
