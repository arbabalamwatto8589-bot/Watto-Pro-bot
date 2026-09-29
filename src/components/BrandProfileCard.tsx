import React from 'react';
import { Crown, Sparkles, TrendingUp, ShieldCheck, Zap } from 'lucide-react';
import traderProfileImg from '../assets/images/wattopro_trader_official_1790201299660.jpg';

interface BrandProfileCardProps {
  compact?: boolean;
}

export const BrandProfileCard: React.FC<BrandProfileCardProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="cyber-card p-3 sm:p-4 border-cyan-500/30 bg-gradient-to-br from-[#091526]/90 via-[#060D1A]/95 to-[#091526]/90 relative overflow-hidden group">
        <div className="flex items-center gap-3.5">
          <div className="relative shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.4)] bg-slate-950">
              <img 
                src={traderProfileImg} 
                alt="WATTOPro Official Trader"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#060D1A] absolute -bottom-1 -right-1 animate-pulse" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-black tracking-wide bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                WATTO<span className="text-cyan-400">Pro</span>
              </span>
              <Crown className="w-4 h-4 text-amber-400 shrink-0" />
            </div>
            <div className="text-xs font-black text-emerald-400 tracking-wider uppercase">
              TRADING SIGNAL BOT
            </div>
            <div className="text-[11px] text-cyan-300 font-semibold italic mt-0.5 tracking-wide">
              "Trade Smarter • Not Harder"
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cyber-card p-4 sm:p-5 border-cyan-500/40 bg-gradient-to-br from-[#0A182E] via-[#060E1C] to-[#0A182E] relative overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.18)]">
      {/* Background cyber glow accents */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 relative z-10">
        {/* Profile Image with Neon Ring & Glow */}
        <div className="relative shrink-0">
          <div className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-2xl overflow-hidden border-2 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.6)] bg-slate-950 ring-4 ring-cyan-500/25">
            <img 
              src={traderProfileImg} 
              alt="WATTOPro Official Trader Brand Profile"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-cyan-950 border border-cyan-400 text-[11px] font-black uppercase tracking-wider text-cyan-300 shadow-lg whitespace-nowrap flex items-center gap-1.5 ring-2 ring-[#0A182E]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>OFFICIAL</span>
          </div>
        </div>

        {/* Brand Information */}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
            <h3 className="text-xl sm:text-2xl font-black tracking-wider text-white flex items-center gap-2">
              <span>WATTO<span className="text-cyan-400">Pro</span></span>
              <Crown className="w-5 h-5 text-amber-400 animate-pulse" />
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-extrabold uppercase tracking-wider">
              VERIFIED BRAND
            </span>
          </div>

          <div className="text-xs sm:text-sm font-black text-cyan-300 uppercase tracking-widest mb-1.5">
            TRADING SIGNAL BOT
          </div>

          <div className="text-sm sm:text-base font-bold text-amber-300 italic tracking-wide mb-3">
            "Trade Smarter • Not Harder"
          </div>

          {/* Value Badges */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-[11px] font-semibold text-slate-300">
            <span className="px-2.5 py-1 rounded-lg bg-[#091526] border border-cyan-500/30 flex items-center gap-1 text-cyan-300">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Multi-EMA Confluence</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#091526] border border-cyan-500/30 flex items-center gap-1 text-emerald-300">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>10 Forex Pairs</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#091526] border border-cyan-500/30 flex items-center gap-1 text-amber-300">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Manual Execution</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

