import React from 'react';
import { Crown, Sparkles, Check, X, Shield, Zap } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg cyber-card p-6 border-amber-400/50 shadow-[0_0_40px_rgba(245,158,11,0.2)] relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 text-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Crown & Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-950 shadow-[0_0_25px_rgba(245,158,11,0.4)] mb-3">
            <Crown className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white">
            WATTO<span className="text-amber-400">Pro</span> Platinum Suite
          </h2>
          <p className="text-xs text-amber-200/80 mt-1">
            Unlock Full Institutional High-Frequency Confluence & Alerts
          </p>
        </div>

        {/* Features Checklist */}
        <div className="space-y-2.5 p-4 rounded-xl bg-[#091526] border border-amber-500/30 text-xs mb-5">
          <div className="flex items-center gap-2.5 text-slate-200">
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">✓</span>
            <span><strong>All 10 Normal Forex Pairs</strong> with Zero Delay WATTOPro Live Streaming</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-200">
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">✓</span>
            <span><strong>Automated Sound & Visual Alerts</strong> on 9-EMA / 21-EMA dynamic crossovers</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-200">
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">✓</span>
            <span><strong>Telegram & Webhook Push Feeds</strong> for instant mobile notifications</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-200">
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">✓</span>
            <span><strong>Multi-Timeframe Trend Confirmation (1M to 30M)</strong></span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-200">
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">✓</span>
            <span><strong>100% Ad-Free</strong> Pristine Dark Terminal Experience</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            alert('WATTOPro Pro membership is currently activated in your terminal workspace!');
            onClose();
          }}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4 fill-slate-950" />
          <span>Activate Pro Platinum Tier</span>
        </button>

        <p className="text-[10px] text-center text-slate-400 mt-3">
          Instant activation • No recurring contract required
        </p>
      </div>
    </div>
  );
};
