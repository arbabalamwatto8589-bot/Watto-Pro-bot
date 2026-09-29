import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, ArrowRightLeft, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { BrokerType, PriceVerificationData } from '../types/trading';

interface PriceVerificationCardProps {
  selectedPair: string;
  selectedBroker: BrokerType;
  brokerPrice: number | null;
  brokerFeedConnected: boolean;
  onRefresh?: () => void;
}

export const PriceVerificationCard: React.FC<PriceVerificationCardProps> = ({
  selectedPair,
  selectedBroker,
  brokerPrice,
  brokerFeedConnected,
  onRefresh,
}) => {
  const [data, setData] = useState<PriceVerificationData>({
    broker: selectedBroker,
    symbol: selectedPair,
    brokerPrice: brokerPrice,
    referencePrice: null,
    priceDifference: null,
    priceDifferenceFormatted: 'N/A',
    feedStatus: brokerFeedConnected ? 'CONNECTED' : 'DISCONNECTED',
    referenceStatus: 'CONNECTED',
    referenceSource: 'WATTOPro Interbank Feed',
    tolerance: selectedPair.includes('JPY') ? 0.03 : 0.00003,
    isSame: false,
    lastUpdate: new Date().toLocaleTimeString('en-US', { hour12: false }),
    notes: 'Awaiting reference feed cross-check.',
  });

  const [loading, setLoading] = useState(false);

  const fetchVerification = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/broker/verify?symbol=${encodeURIComponent(selectedPair)}&broker=${encodeURIComponent(selectedBroker)}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.warn('Failed to fetch verification data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerification();
    const interval = setInterval(fetchVerification, 4000);
    return () => clearInterval(interval);
  }, [selectedPair, selectedBroker]);

  const isJpy = selectedPair.includes('JPY');
  const decimals = isJpy ? 2 : 4;
  const tolerance = isJpy ? 0.03 : 0.00003;

  return (
    <div className="cyber-card p-4 sm:p-5 border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
      {/* Title Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20 mb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm sm:text-base font-bold text-white tracking-wide flex items-center gap-2">
            <span>Price Verification Cross-Check</span>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
              REFERENCE FEED
            </span>
          </h3>
        </div>

        <button
          type="button"
          onClick={fetchVerification}
          disabled={loading}
          className="p-1.5 rounded-lg bg-[#091424] border border-cyan-500/30 text-cyan-300 hover:text-white hover:border-cyan-400 transition-colors disabled:opacity-50 cursor-pointer"
          title="Refresh cross-check"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Grid: Broker Price, Reference Price, Price Difference, Feed Status */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
        {/* BROKER PRICE */}
        <div className="p-3 rounded-xl bg-[#071325] border border-cyan-500/30">
          <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>BROKER PRICE</span>
            <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded ${
              data.feedStatus === 'CONNECTED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-rose-950 text-rose-300 border border-rose-500/40'
            }`}>
              {selectedBroker === 'Quotex' ? 'QX' : 'PO'}
            </span>
          </div>
          <div className="text-lg sm:text-xl font-black font-mono text-cyan-200">
            {data.brokerPrice !== null ? data.brokerPrice.toFixed(decimals) : (
              <span className="text-rose-400 text-sm">UNAVAILABLE</span>
            )}
          </div>
          <div className="text-[9px] text-slate-400 mt-0.5 truncate">
            {selectedBroker} Primary
          </div>
        </div>

        {/* REFERENCE PRICE */}
        <div className="p-3 rounded-xl bg-[#071325] border border-cyan-500/30">
          <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>REFERENCE PRICE</span>
            <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 border border-blue-500/40">
              REF
            </span>
          </div>
          <div className="text-lg sm:text-xl font-black font-mono text-slate-200">
            {data.referencePrice !== null ? data.referencePrice.toFixed(decimals) : (
              <span className="text-amber-400 text-sm">UNAVAILABLE</span>
            )}
          </div>
          <div className="text-[9px] text-slate-400 mt-0.5 truncate">
            {data.referenceSource || 'WATTOPro Reference'}
          </div>
        </div>

        {/* PRICE DIFFERENCE */}
        <div className="p-3 rounded-xl bg-[#071325] border border-cyan-500/30">
          <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>PRICE DIFFERENCE</span>
            <ArrowRightLeft className="w-3 h-3 text-cyan-400" />
          </div>
          <div className={`text-lg sm:text-xl font-black font-mono ${
            data.priceDifference === null 
              ? 'text-slate-500 text-sm' 
              : data.isSame 
              ? 'text-emerald-400' 
              : 'text-amber-400'
          }`}>
            {data.priceDifference !== null ? data.priceDifferenceFormatted : 'N/A'}
          </div>
          <div className="text-[9px] text-slate-400 mt-0.5 truncate">
            Tolerance: ±{tolerance}
          </div>
        </div>

        {/* FEED STATUS */}
        <div className="p-3 rounded-xl bg-[#071325] border border-cyan-500/30">
          <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-1">
            FEED STATUS
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            {data.feedStatus === 'CONNECTED' ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-sm font-black text-emerald-400">CONNECTED</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="text-sm font-black text-rose-400">DISCONNECTED</span>
              </>
            )}
          </div>
          <div className="text-[9px] text-slate-400 mt-0.5 truncate">
            {data.lastUpdate}
          </div>
        </div>
      </div>

      {/* Comparison Match Status Banner */}
      <div className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
        data.feedStatus !== 'CONNECTED'
          ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
          : data.isSame
          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
          : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
      }`}>
        <div className="flex items-center gap-2">
          {data.feedStatus !== 'CONNECTED' ? (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : data.isSame ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <div className="text-[11px] leading-tight">
            <strong>STATUS: </strong>
            {data.feedStatus !== 'CONNECTED' ? (
              <span>{selectedBroker.toUpperCase()} LIVE FEED UNAVAILABLE • Signals suspended to prevent false executions.</span>
            ) : data.isSame ? (
              <span>MATCH: Broker price and Reference price are <strong>SAME</strong> within tolerance (Δ ≤ {tolerance}).</span>
            ) : (
              <span>DIVERGENT: Broker price differs from reference by {data.priceDifferenceFormatted} (&gt; {tolerance}).</span>
            )}
          </div>
        </div>

        <div className="text-[10px] text-slate-400 font-mono shrink-0 hidden sm:block">
          RULE: Verified Real Market Price Feed
        </div>
      </div>
    </div>
  );
};
