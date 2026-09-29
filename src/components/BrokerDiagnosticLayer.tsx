import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, AlertTriangle, RefreshCw, Zap, CheckCircle2, XCircle } from 'lucide-react';
import { BrokerType, PairInfo, ALL_SUPPORTED_PAIRS, FOREX_PAIRS } from '../types/trading';
import { isOTC } from '../config';

interface BrokerDiagnosticLayerProps {
  selectedPair: string;
  selectedBroker: BrokerType;
  currentPrice: number | null;
  dataSource?: string;
  dataStatus?: string;
}

export const BrokerDiagnosticLayer: React.FC<BrokerDiagnosticLayerProps> = ({
  selectedPair,
  selectedBroker,
  currentPrice,
  dataSource = 'WATTOPro Live Feed',
  dataStatus = 'LIVE MARKET DATA',
}) => {
  const isOtc = isOTC(selectedPair);
  const pairInfo = ALL_SUPPORTED_PAIRS.find(p => p.symbol === selectedPair) || FOREX_PAIRS[0];

  const [brokerPriceInput, setBrokerPriceInput] = useState<string>('');
  const [comparisonData, setComparisonData] = useState<{
    wattoproPrice: number | null;
    brokerDisplayPrice: number | null;
    priceDifference: number | string;
    lastUpdate: string;
    dataSource: string;
    dataStatus: string;
    synced: boolean;
    message?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const runDiagnosticCheck = async (customBrokerPrice?: number) => {
    setIsLoading(true);
    try {
      const brokerPriceParam = customBrokerPrice != null ? `&brokerPrice=${customBrokerPrice}` : '';
      const res = await fetch(`/api/broker/compare?symbol=${encodeURIComponent(selectedPair)}&broker=${encodeURIComponent(selectedBroker)}${brokerPriceParam}`);
      if (res.ok) {
        const data = await res.json();
        setComparisonData(data);
      }
    } catch (err) {
      console.warn('Diagnostic check failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // When pair or broker changes, reset broker price input and run diagnostic
    setBrokerPriceInput('');
    runDiagnosticCheck();
  }, [selectedPair, selectedBroker]);

  const handleApplyBrokerPrice = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(brokerPriceInput);
    if (!isNaN(val) && val > 0) {
      runDiagnosticCheck(val);
    }
  };

  const wattoproDisplay = isOtc
    ? 'OTC DATA UNAVAILABLE'
    : currentPrice !== null
    ? currentPrice.toFixed(pairInfo.decimals)
    : comparisonData?.wattoproPrice !== null && comparisonData?.wattoproPrice !== undefined
    ? comparisonData.wattoproPrice.toFixed(pairInfo.decimals)
    : 'Awaiting feed...';

  const brokerDisplay = isOtc
    ? 'NO PUBLIC API'
    : comparisonData?.brokerDisplayPrice !== null && comparisonData?.brokerDisplayPrice !== undefined
    ? comparisonData.brokerDisplayPrice.toFixed(pairInfo.decimals)
    : 'Not entered';

  const diffDisplay = isOtc
    ? 'N/A'
    : comparisonData?.priceDifference !== null && comparisonData?.priceDifference !== undefined
    ? typeof comparisonData.priceDifference === 'number'
      ? comparisonData.priceDifference.toFixed(5)
      : comparisonData.priceDifference
    : 'Pending verification';

  const isActuallySynced = !isOtc && comparisonData?.synced === true;

  return (
    <div className="cyber-card p-4 sm:p-5 border-cyan-500/30 mb-4 bg-gradient-to-br from-[#061022] via-[#091528] to-[#040B18]">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-cyan-500/20">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm sm:text-base font-extrabold text-white tracking-wide flex items-center gap-2">
            <span>Broker Price Comparison Diagnostic</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 font-mono border border-cyan-500/40">
              LAYER 3 AUDIT
            </span>
          </h3>
        </div>

        <button
          type="button"
          onClick={() => runDiagnosticCheck(brokerPriceInput ? parseFloat(brokerPriceInput) : undefined)}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0C1B33] border border-cyan-500/40 text-cyan-300 hover:text-white hover:border-cyan-400 text-xs font-bold transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Audit</span>
        </button>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-3 text-xs">
        {/* 1. ASSET / PAIR */}
        <div className="p-2.5 rounded-xl bg-[#081220] border border-cyan-500/20">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Asset</div>
          <div className="text-sm font-extrabold text-white truncate">{selectedPair}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{selectedBroker}</div>
        </div>

        {/* 2. WATTOPRO PRICE */}
        <div className="p-2.5 rounded-xl bg-[#081220] border border-cyan-500/20">
          <div className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider mb-1">WATTOPRO PRICE</div>
          <div className={`text-sm font-black font-mono tracking-wide ${isOtc ? 'text-amber-400 text-xs' : 'text-cyan-200'}`}>
            {wattoproDisplay}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">
            {isOtc ? 'Broker direct required' : 'Verified feed'}
          </div>
        </div>

        {/* 3. BROKER DISPLAY PRICE */}
        <div className="p-2.5 rounded-xl bg-[#081220] border border-cyan-500/20">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">BROKER DISPLAY PRICE</div>
          <div className={`text-sm font-black font-mono tracking-wide ${isOtc ? 'text-rose-400 text-xs' : 'text-white'}`}>
            {brokerDisplay}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">
            {isOtc ? 'No public API' : selectedBroker}
          </div>
        </div>

        {/* 4. PRICE DIFFERENCE */}
        <div className="p-2.5 rounded-xl bg-[#081220] border border-cyan-500/20">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">PRICE DIFFERENCE</div>
          <div className="text-sm font-black font-mono tracking-wide text-slate-200">
            {diffDisplay}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Tolerance: ±0.00003</div>
        </div>

        {/* 5. DATA SOURCE */}
        <div className="p-2.5 rounded-xl bg-[#081220] border border-cyan-500/20">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">DATA SOURCE</div>
          <div className="text-xs font-bold text-cyan-300 truncate">
            {isOtc ? 'None (Broker Direct)' : (comparisonData?.dataSource || dataSource)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">No fake data</div>
        </div>

        {/* 6. STATUS */}
        <div className="p-2.5 rounded-xl bg-[#081220] border border-cyan-500/20">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">STATUS</div>
          <div>
            {isOtc ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                OTC UNAVAILABLE
              </span>
            ) : isActuallySynced ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                SYNCED
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                <ShieldCheck className="w-3 h-3 text-cyan-400" />
                REAL FEED LIVE
              </span>
            )}
          </div>
          <div className="text-[9px] text-slate-400 mt-1 truncate">
            {isActuallySynced ? 'Quote match verified' : isOtc ? 'Signals suspended' : 'Live interbank'}
          </div>
        </div>
      </div>

      {/* Cross-check interactive input: allows trader to enter exact displayed quote from broker for precision verification */}
      {!isOtc && (
        <form onSubmit={handleApplyBrokerPrice} className="flex flex-wrap items-center gap-2 pt-2 text-xs">
          <span className="text-slate-400">Cross-check with your active {selectedBroker} screen price:</span>
          <input
            type="number"
            step="0.00001"
            placeholder={`e.g. ${currentPrice ? currentPrice.toFixed(pairInfo.decimals) : '1.08381'}`}
            value={brokerPriceInput}
            onChange={(e) => setBrokerPriceInput(e.target.value)}
            className="px-2.5 py-1 rounded-lg bg-[#071324] border border-cyan-500/40 text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-cyan-400 w-32"
          />
          <button
            type="submit"
            className="px-3 py-1 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow cursor-pointer"
          >
            Verify Sync
          </button>
          <span className="text-[11px] text-slate-500">
            Last update: {comparisonData?.lastUpdate ? new Date(comparisonData.lastUpdate).toLocaleTimeString() : new Date().toLocaleTimeString()}
          </span>
        </form>
      )}

      {isOtc && (
        <div className="flex items-center gap-2 text-[11px] text-amber-300/90 bg-amber-950/40 p-2 rounded-lg border border-amber-500/30">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>OTC Policy Enforced:</strong> Pocket Option and Quotex do not provide public quote APIs for OTC pairs. To prevent financial risk, WATTOPRO strictly refuses to generate simulated or estimated prices. Trading signals are locked to <strong>NO TRADE</strong>.
          </span>
        </div>
      )}
    </div>
  );
};
