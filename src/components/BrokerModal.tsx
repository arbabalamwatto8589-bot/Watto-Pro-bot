import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, ExternalLink, X, CheckCircle2, Zap, Key, RefreshCw } from 'lucide-react';
import { BrokerType } from '../types/trading';

interface BrokerModalProps {
  broker: BrokerType | null;
  selectedBroker: BrokerType;
  onSelectBroker: (broker: BrokerType) => void;
  onClose: () => void;
  selectedPair: string;
  currentPrice?: number | null;
  brokerFeedConnected?: boolean;
}

export const BrokerModal: React.FC<BrokerModalProps> = ({
  broker,
  selectedBroker,
  onSelectBroker,
  onClose,
  selectedPair,
  currentPrice,
  brokerFeedConnected = false,
}) => {
  if (!broker) return null;

  const isCurrentActive = broker === selectedBroker;
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) return;

    setIsSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/broker/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          broker,
          apiKey: apiKeyInput.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFeedback({
          success: data.verified,
          message: data.message || 'Key saved successfully on server.',
        });
        setApiKeyInput('');
      } else {
        setFeedback({
          success: false,
          message: data.error || 'Failed to save key.',
        });
      }
    } catch (err: any) {
      setFeedback({
        success: false,
        message: 'Connection error while saving credentials.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg cyber-card p-6 border-cyan-500/40 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 text-sm cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md ${
            broker === 'Quotex' ? 'bg-rose-600' : 'bg-gradient-to-br from-blue-600 to-cyan-500'
          }`}>
            {broker === 'Quotex' ? 'QX' : 'PO'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white">{broker} Market Data</h3>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                brokerFeedConnected 
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50' 
                  : 'bg-rose-950 text-rose-300 border-rose-500/50'
              }`}>
                {brokerFeedConnected ? '🟢 CONNECTED' : '🔴 DISCONNECTED'}
              </span>
            </div>
            <span className="text-[11px] text-cyan-400 font-semibold uppercase tracking-wider">
              WATTOPro Live Feed: ACTIVE (24/7 Real Market)
            </span>
          </div>
        </div>

        {/* Important Feed Transparency Notice */}
        <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-200/90 mb-4 leading-relaxed">
          <div className="font-bold text-cyan-300 flex items-center gap-1.5 mb-1">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>WATTOPro Live Feed Status</span>
          </div>
          <p className="text-[11px] text-slate-300">
            Real-time market quotes and candlestick data are synchronized continuously via WATTOPro 24/7 Live Feed. No broker logins, passwords, or session tokens required.
          </p>
        </div>

        {/* Live Broker Details */}
        <div className="p-3.5 rounded-xl bg-[#081220] border border-slate-800 space-y-2 text-xs mb-4">
          <div className="flex items-center justify-between text-slate-300">
            <span>Selected Pair:</span>
            <span className="text-white font-bold font-tabular">{selectedPair}</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span>Broker Live Price:</span>
            <span className="font-mono font-bold text-cyan-300 text-sm">
              {currentPrice !== null && currentPrice !== undefined ? currentPrice : 'UNAVAILABLE'}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span>Status in Terminal:</span>
            <span className={`font-bold ${isCurrentActive ? 'text-emerald-400' : 'text-slate-400'}`}>
              {isCurrentActive ? 'ACTIVE PRIMARY SOURCE' : 'SECONDARY'}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span>Safe Trading Rule:</span>
            <span className="text-amber-300 font-semibold">No price or candle fabrication</span>
          </div>
        </div>

        {/* Server-Side Credentials Input (Safe) */}
        <form onSubmit={handleSaveCredentials} className="p-3.5 rounded-xl bg-[#061020] border border-cyan-500/30 mb-4">
          <label className="block text-xs font-bold text-cyan-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-cyan-400" />
            <span>Configure {broker} API Key / Token</span>
          </label>
          <p className="text-[10px] text-slate-400 mb-2.5">
            Saved securely in server-side memory. Never exposed in frontend code, responses, or client storage.
          </p>

          <div className="flex gap-2">
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder={broker === 'Quotex' ? 'Enter X-BOT-AUTH-KEY...' : 'Enter Pocket Option Token / Key...'}
              className="flex-1 px-3 py-2 rounded-lg bg-[#081426] border border-slate-700 text-white text-xs font-mono focus:border-cyan-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isSubmitting || !apiKeyInput.trim()}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Testing...' : 'Save & Connect'}
            </button>
          </div>

          {feedback && (
            <div className={`mt-2 p-2 rounded-lg text-[11px] flex items-center gap-1.5 ${
              feedback.success ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50' : 'bg-rose-950/80 text-rose-300 border border-rose-500/50'
            }`}>
              {feedback.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
              <span>{feedback.message}</span>
            </div>
          )}
        </form>

        {/* Action button to activate broker */}
        {!isCurrentActive && (
          <button
            type="button"
            onClick={() => {
              onSelectBroker(broker);
              onClose();
            }}
            className="w-full mb-3 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Zap className="w-4 h-4" />
            <span>Select {broker} As Primary Market-Data Feed</span>
          </button>
        )}

        {/* Regulatory & Safety Notice */}
        <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/40 text-xs text-amber-200/90 space-y-1 mb-4">
          <div className="flex items-center gap-1.5 font-bold text-amber-300 text-[11px]">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Signal-Only Application Notice</span>
          </div>
          <p className="text-[10px] text-amber-200/80 leading-relaxed">
            WATTOPRO does <strong>NOT</strong> automatically place trades and does not claim 100% accuracy or guaranteed profits. All trades are manual at the user&apos;s sole discretion.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-colors border border-slate-700 cursor-pointer"
        >
          Return to Terminal
        </button>
      </div>
    </div>
  );
};
