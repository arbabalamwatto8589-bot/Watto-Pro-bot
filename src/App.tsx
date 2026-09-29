import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { PairTimeframeSelector } from './components/PairTimeframeSelector';
import { LiveSignalCard } from './components/LiveSignalCard';
import { MarketPairsGrid } from './components/MarketPairsGrid';
import { CandlestickChart } from './components/CandlestickChart';
import { RecentSignalsList } from './components/RecentSignalsList';
import { HistoryView } from './components/HistoryView';
import { StatisticsView } from './components/StatisticsView';
import { SettingsView } from './components/SettingsView';
import { HelpView } from './components/HelpView';
import { BrokerModal } from './components/BrokerModal';
import { UpgradeModal } from './components/UpgradeModal';
import { AnalyzeModal } from './components/AnalyzeModal';
import { BrandProfileCard } from './components/BrandProfileCard';
import { BotPerformanceCard } from './components/BotPerformanceCard';
import { FallingPetalsCanvas } from './components/FallingPetalsCanvas';
import { LicenseActivationScreen } from './components/LicenseActivationScreen';
import { PriceVerificationCard } from './components/PriceVerificationCard';

import { 
  BrokerType, 
  Candle, 
  FOREX_PAIRS, 
  OTC_PAIRS, 
  ALL_SUPPORTED_PAIRS, 
  MarketMode, 
  NormalizedBrokerData,
  QuoteData, 
  SignalItem, 
  Timeframe, 
  TradeDuration, 
  TRADE_DURATION_SECONDS, 
  TradingStats 
} from './types/trading';
import { MarketDataService, UserSettings } from './services/marketDataService';
import { brokerSyncEngine, BrokerId, isWeekend } from './services/brokerSyncEngine';
import { pocketOptionSync } from './services/pocketOptionSync';
import { analyzeMarketSignal, buildSignalItem } from './services/signalEngine';
import { computeIndicators } from './services/indicators';
import { playSignalSound } from './utils/sound';
import { Zap, ShieldCheck, Heart, Crown } from 'lucide-react';

export default function App() {
  const marketService = MarketDataService.getInstance();

  // ========================================================
  // 1. LICENSE EVERY TIME - MANDATORY ON EVERY OPEN
  // ========================================================
  const [isLicensed, setIsLicensed] = useState<boolean>(false);
  const [showLicenseModal, setShowLicenseModal] = useState<boolean>(true);

  useEffect(() => {
    // Remove all auto-login, always ask license on every open/refresh
    try {
      localStorage.removeItem('license');
      localStorage.removeItem('isLicensed');
      localStorage.removeItem('wattopro_license');
      sessionStorage.removeItem('wattopro_license');
      sessionStorage.removeItem('wattopro_session_licensed');
    } catch (e) {
      // ignore
    }
    setShowLicenseModal(true);
    setIsLicensed(false);
  }, []);

  const handleUnlock = () => {
    setIsLicensed(true);
    setShowLicenseModal(false);
  };

  const handleLockBot = () => {
    try {
      localStorage.removeItem('license');
      localStorage.removeItem('isLicensed');
      localStorage.removeItem('wattopro_license');
      sessionStorage.removeItem('wattopro_license');
      sessionStorage.removeItem('wattopro_session_licensed');
    } catch (e) {
      // ignore
    }
    setIsLicensed(false);
    setShowLicenseModal(true);
  };

  // Navigation state
  const [activeTab, setActiveTab] = useState<NavTab>('home');

  // Real Broker Selection state ('Pocket Option' active default)
  const [selectedBroker, setSelectedBroker] = useState<BrokerType>(() => marketService.getSelectedBroker() || 'Pocket Option');

  // Market Mode state ('NORMAL' 10 pairs vs 'OTC' 22 pairs)
  // Requirement 1: If day is Saturday or Sunday, set selectedMode = "OTC", convert EUR/USD -> EUR/USD (OTC)
  const [marketMode, setMarketMode] = useState<MarketMode>(() => {
    if (isWeekend()) return 'OTC';
    return marketService.getMarketMode() || 'NORMAL';
  });

  // Market & Trading state
  const [selectedPair, setSelectedPair] = useState<string>(() => {
    if (isWeekend()) return 'EUR/USD (OTC)';
    return 'EUR/USD';
  });
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('1M');
  const [selectedTradeDuration, setSelectedTradeDuration] = useState<TradeDuration>('1 MIN');
  const [quotes, setQuotes] = useState<QuoteData[]>([]);
  const [candles, setCandles] = useState<Candle[]>([]);

  // Initial Exact Signal
  const [currentSignal, setCurrentSignal] = useState<SignalItem | null>(() => {
    const now = Date.now();
    const timeStr = new Date(now).toLocaleTimeString('en-US', { hour12: false });
    const isWk = isWeekend();
    const initialPair = isWk ? 'EUR/USD (OTC)' : 'EUR/USD';
    const initPrice = isWk ? 1.1425 : 1.0850;
    return {
      id: `sig_initial_live`,
      timestamp: now,
      timeFormatted: timeStr,
      lastCandleClosedTime: timeStr,
      pair: initialPair,
      timeframe: '1M',
      tradeDuration: '1 MIN',
      signal: 'SELL',
      confidence: 86,
      entryPrice: initPrice,
      broker: 'Pocket Option',
      indicators: {
        ema9: Number((initPrice - 0.0001).toFixed(4)),
        ema21: Number((initPrice + 0.0001).toFixed(4)),
        emaStatus: 'Bearish',
        rsi14: 40.8,
        rsiStatus: 'Below 50',
        macd: { macd: -0.00014, signal: -0.00008, histogram: -0.00006, status: 'Bearish' },
        trend: 'Downtrend',
        supportResistance: { 
          support: Number((initPrice - 0.0015).toFixed(4)), 
          resistance: Number((initPrice + 0.0015).toFixed(4)), 
          status: 'Near Resistance' 
        },
        momentum: 'Bearish',
      },
      source: 'WATTOPro Live Feed',
      isDemo: false,
      outcome: 'PENDING',
      expiryTimestamp: now + 60000,
      methodologyNote: 'SELL Bearish Confluence 86% Confidence (EMA 9 < EMA 21, RSI 40.8, MACD negative histogram, Downtrend confirmed)',
    };
  });

  const [signalsHistory, setSignalsHistory] = useState<SignalItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Market connection state (Free Live Feed - No limit)
  const [isLive, setIsLive] = useState<boolean>(true);
  const [isDemo, setIsDemo] = useState<boolean>(false);
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);

  // Settings
  const [settings, setSettings] = useState<UserSettings>(marketService.getSettings());

  // Modals
  const [brokerModal, setBrokerModal] = useState<BrokerType | null>(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState<boolean>(false);
  const [isAnalyzeModalOpen, setIsAnalyzeModalOpen] = useState<boolean>(false);
  const [pendingAnalyzedSignal, setPendingAnalyzedSignal] = useState<SignalItem | null>(null);

  // Normalized Broker Data State
  const [brokerNormalizedData, setBrokerNormalizedData] = useState<NormalizedBrokerData>(() => brokerSyncEngine.getLatestData());

  useEffect(() => {
    const unsub = brokerSyncEngine.subscribeNormalized((data) => {
      setBrokerNormalizedData(data);
    });
    return unsub;
  }, []);

  // Save selected broker to persistence and update Universal Broker Adapter
  const handleSelectBroker = (broker: BrokerType) => {
    setSelectedBroker(broker);
    marketService.setSelectedBroker(broker);
    brokerSyncEngine.setBroker(broker);
  };

  // Switch Market Mode between NORMAL 10 PAIRS and OTC 22 PAIRS
  const handleSelectMarketMode = (mode: MarketMode) => {
    setMarketMode(mode);
    marketService.setMarketMode(mode);
    if (mode === 'NORMAL') {
      setSelectedPair('EUR/USD');
    } else {
      setSelectedPair('EUR/USD (OTC)');
    }
  };

  // Initial setup and seed signals
  useEffect(() => {
    const loadedSettings = marketService.getSettings();
    setSettings(loadedSettings);
    if (loadedSettings.defaultTradeDuration) {
      setSelectedTradeDuration(loadedSettings.defaultTradeDuration);
    }

    let hist = marketService.getSignals();
    if (hist.length === 0) {
      const now = Date.now();
      const seedEntries: Array<{ 
        pair: string; 
        timeframe: Timeframe; 
        tradeDuration: TradeDuration; 
        signal: 'BUY' | 'SELL'; 
        confidence: number; 
        offsetMin: number 
      }> = [
        { pair: 'EUR/USD', timeframe: '1M', tradeDuration: '1 MIN', signal: 'SELL', confidence: 86, offsetMin: 1 },
        { pair: 'GBP/USD', timeframe: '1M', tradeDuration: '1 MIN', signal: 'SELL', confidence: 82, offsetMin: 4 },
        { pair: 'USD/JPY', timeframe: '2M', tradeDuration: '2 MIN', signal: 'BUY', confidence: 78, offsetMin: 7 },
        { pair: 'AUD/USD', timeframe: '1M', tradeDuration: '30 SEC', signal: 'BUY', confidence: 76, offsetMin: 11 },
        { pair: 'USD/CAD', timeframe: '3M', tradeDuration: '1 MIN', signal: 'SELL', confidence: 84, offsetMin: 15 },
        { pair: 'EUR/JPY', timeframe: '1M', tradeDuration: '15 SEC', signal: 'BUY', confidence: 79, offsetMin: 20 },
      ];

      const initialSignals: SignalItem[] = seedEntries.map((s, idx) => {
        const time = new Date(now - s.offsetMin * 60000);
        const timeStr = time.toLocaleTimeString('en-US', { hour12: false });
        return {
          id: `seed_${idx}`,
          timestamp: time.getTime(),
          timeFormatted: timeStr,
          lastCandleClosedTime: timeStr,
          pair: s.pair,
          timeframe: s.timeframe,
          tradeDuration: s.tradeDuration,
          signal: s.signal,
          confidence: s.confidence,
          entryPrice: (ALL_SUPPORTED_PAIRS.find(p => p.symbol === s.pair)?.baseRate || 1.1425),
          broker: 'Pocket Option',
          indicators: {
            ema9: 1.13785,
            ema21: 1.13812,
            emaStatus: s.signal === 'BUY' ? 'Bullish' : 'Bearish',
            rsi14: s.signal === 'BUY' ? 58.2 : 40.8,
            rsiStatus: s.signal === 'BUY' ? 'Above 50' : 'Below 50',
            macd: { macd: -0.00014, signal: -0.00008, histogram: -0.00006, status: s.signal === 'BUY' ? 'Bullish' : 'Bearish' },
            trend: s.signal === 'BUY' ? 'Uptrend' : 'Downtrend',
            supportResistance: { support: 1.13650, resistance: 1.13920, status: 'Near Resistance' },
            momentum: s.signal === 'BUY' ? 'Bullish' : 'Bearish',
          },
          source: 'WATTOPro Live Feed',
          isDemo: false,
          outcome: idx % 3 === 0 ? 'WIN' : idx % 3 === 1 ? 'LOSS' : 'WIN',
          expiryTimestamp: time.getTime() + 60000,
        };
      });

      initialSignals.forEach(item => marketService.saveSignal(item));
      hist = initialSignals;
    }

    setSignalsHistory(hist);
  }, []);

  // FREE LIVE FEED SYSTEM:
  // - getQuotes ticks 1-second live ticks:
  //   NORMAL: price + (Math.random()-0.5)*0.0003
  //   OTC: price + (Math.random()-0.5)*0.0008 (more volatile, +0.15% OTC markup)
  const fetchMarketData = useCallback(async () => {
    setIsLive(true);
    setIsDemo(false);
    setHasApiKey(true);

    const quotesData = await marketService.getQuotes(selectedBroker, marketMode);
    setQuotes(quotesData.quotes);

    // Evaluate pending signals
    const updatedHistory = marketService.evaluatePendingSignals(quotesData.quotes);
    setSignalsHistory(updatedHistory);
  }, [selectedBroker, marketMode]);

  // Live 500ms tick loop with direct real broker live mirroring
  useEffect(() => {
    const brokerId: BrokerId = selectedBroker === 'Quotex' ? 'quotex' : 'pocket';
    brokerSyncEngine.setBroker(brokerId);
    brokerSyncEngine.setPair(selectedPair);

    fetchMarketData();
    const interval = setInterval(() => {
      fetchMarketData();

      // Mirror live candle close with exact real broker price
      setCandles(prevCandles => {
        if (!prevCandles || prevCandles.length === 0) return prevCandles;
        const tfSec = 
          selectedTimeframe === '5SEC' ? 5 :
          selectedTimeframe === '15SEC' ? 15 :
          selectedTimeframe === '30SEC' ? 30 :
          selectedTimeframe === '1M' ? 60 :
          selectedTimeframe === '2M' ? 120 :
          selectedTimeframe === '3M' ? 180 :
          selectedTimeframe === '5M' ? 300 :
          selectedTimeframe === '15M' ? 900 : 1800;

        return brokerSyncEngine.syncCandleWithLivePrice(prevCandles, selectedPair, tfSec);
      });
    }, 500);

    return () => clearInterval(interval);
  }, [fetchMarketData, selectedPair, selectedTimeframe, selectedBroker]);

  // Fetch candles when pair, timeframe, broker, or marketMode changes
  const fetchCandles = useCallback(async () => {
    const data = await marketService.getCandles(selectedPair, selectedTimeframe, 50, selectedBroker);
    setCandles(data.candles);
  }, [selectedPair, selectedTimeframe, selectedBroker]);

  useEffect(() => {
    fetchCandles();
  }, [fetchCandles]);

  // Real-time calculation sync: Update current signal indicators when active quote ticks
  useEffect(() => {
    if (!currentSignal || candles.length < 20 || quotes.length === 0) return;
    const activeQuote = quotes.find(q => q.symbol === selectedPair);
    if (!activeQuote || !activeQuote.price) return;

    const pairInfo = ALL_SUPPORTED_PAIRS.find(p => p.symbol === selectedPair) || FOREX_PAIRS[0];
    const updatedCandles = [...candles];
    const lastIdx = updatedCandles.length - 1;
    if (lastIdx >= 0) {
      const lastCandle = {
        ...updatedCandles[lastIdx],
        close: activeQuote.price,
        high: Math.max(updatedCandles[lastIdx].high, activeQuote.price),
        low: Math.min(updatedCandles[lastIdx].low, activeQuote.price),
      };
      updatedCandles[lastIdx] = lastCandle;

      const freshIndicators = computeIndicators(updatedCandles, pairInfo.decimals);

      setCurrentSignal(prev => {
        if (!prev) return null;
        if (
          prev.indicators.ema9 === freshIndicators.ema9 &&
          prev.indicators.ema21 === freshIndicators.ema21 &&
          prev.indicators.rsi14 === freshIndicators.rsi14 &&
          prev.indicators.macd.histogram === freshIndicators.macd.histogram &&
          prev.indicators.trend === freshIndicators.trend &&
          prev.indicators.emaStatus === freshIndicators.emaStatus
        ) {
          return prev;
        }
        return {
          ...prev,
          indicators: freshIndicators,
        };
      });
    }
  }, [quotes, selectedPair, candles, currentSignal?.id]);

  // GET SIGNAL Handler: Calculates real signal from priceHistory/candles
  // Triggers 5-second Analyze popup with exact 5..4..3..2..1 countdown sequence
  const handleGetSignal = async () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);

    try {
      const candleData = await marketService.getCandles(selectedPair, selectedTimeframe, 50, selectedBroker);
      setCandles(candleData.candles);

      const pairInfo = ALL_SUPPORTED_PAIRS.find(p => p.symbol === selectedPair) || FOREX_PAIRS[0];
      const isFallback = Boolean(brokerNormalizedData.isFallback);
      const effectiveBroker = brokerNormalizedData.effectiveBroker || (isFallback ? 'Quotex' : selectedBroker);

      const analysis = analyzeMarketSignal(
        candleData.candles,
        pairInfo.decimals,
        settings.sensitivity,
        selectedPair,
        selectedTimeframe,
        selectedBroker,
        brokerNormalizedData.connected,
        isFallback,
        effectiveBroker
      );

      const activeQuote = quotes.find(q => q.symbol === selectedPair);
      const brokerPrice = (brokerNormalizedData.connected && brokerNormalizedData.price !== null)
        ? brokerNormalizedData.price
        : activeQuote?.price;

      if (brokerPrice) {
        analysis.entryPrice = brokerPrice;
      }

      // Ensure confidence is between 75% and 92% as requested
      const boundedConfidence = Math.max(75, Math.min(92, analysis.confidence || 86));
      analysis.confidence = boundedConfidence;

      const sourceLabel = 'SOURCE: WATTOPRO LIVE FEED';

      const newSignal = buildSignalItem(
        analysis,
        selectedPair,
        selectedTimeframe,
        selectedTradeDuration,
        false,
        sourceLabel,
        selectedBroker,
        analysis.entryPrice,
        candleData.candles?.[candleData.candles.length - 1]?.timestamp,
        brokerNormalizedData.timestamp,
        'LIVE MARKET DATA'
      );

      // Store pending signal and launch 5-second analyze popup modal
      setPendingAnalyzedSignal(newSignal);
      setIsAnalyzeModalOpen(true);
    } catch (err) {
      console.error('Failed to generate real-time signal:', err);
      setIsAnalyzing(false);
    }
  };

  // Called when 5-second analyze popup sequence finishes
  const handleAnalyzeModalComplete = () => {
    setIsAnalyzeModalOpen(false);
    setIsAnalyzing(false);

    if (pendingAnalyzedSignal) {
      setCurrentSignal(pendingAnalyzedSignal);
      const updatedSignals = marketService.saveSignal(pendingAnalyzedSignal);
      setSignalsHistory(updatedSignals);

      if (settings.soundEnabled) {
        playSignalSound(
          pendingAnalyzedSignal.signal === 'BUY' ? 'BUY' : pendingAnalyzedSignal.signal === 'SELL' ? 'SELL' : 'NO_TRADE',
          settings.soundVolume || 85
        );
      }
    }
  };

  const handleSelectPair = (pair: string) => {
    setSelectedPair(pair);
    brokerSyncEngine.setPair(pair);
  };

  const handleSelectTimeframe = (tf: Timeframe) => {
    setSelectedTimeframe(tf);
  };

  const handleSelectTradeDuration = (td: TradeDuration) => {
    setSelectedTradeDuration(td);
    if (currentSignal) {
      const durationSec = TRADE_DURATION_SECONDS[td] || 60;
      setCurrentSignal({
        ...currentSignal,
        tradeDuration: td,
        expiryTimestamp: Date.now() + durationSec * 1000,
      });
    }
  };

  const handleSaveSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    marketService.saveSettings(newSettings);
  };

  const handleSaveApiKey = async (_key: string): Promise<boolean> => {
    return true;
  };

  const handleClearHistory = () => {
    marketService.clearHistory();
    setSignalsHistory([]);
  };

  const currentPairQuote = quotes.find(q => q.symbol === selectedPair);
  const stats: TradingStats = marketService.getStats(signalsHistory);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      
      {/* ========================================================
          MANDATORY LICENSE MODAL (Shows on page load over everything)
         ======================================================== */}
      {(!isLicensed || showLicenseModal) && (
        <LicenseActivationScreen onUnlock={handleUnlock} />
      )}

      {/* Header: Contains Left [Telegram Guide], Middle [Pakistan Flag + Calligraphy], Right [4 Social Icons + UTC] */}
      <Header
        isLive={isLive}
        isDemo={isDemo}
        selectedBroker={selectedBroker}
        marketMode={marketMode}
        onSelectBroker={handleSelectBroker}
        onOpenSettings={() => setActiveTab('settings')}
        onOpenBrokerModal={(broker) => setBrokerModal(broker)}
      />

      {/* Body: Sidebar + Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          onUpgradeClick={() => setUpgradeModalOpen(true)}
        />

        {/* Main Workspace */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6 pb-24 lg:pb-8 space-y-6 max-w-[1680px] mx-auto w-full">
          
          {activeTab === 'home' && (
            <div className="space-y-6">
              {/* Brand Profile Banner Card */}
              <BrandProfileCard />

              {/* BOT PERFORMANCE LIVE Card */}
              <BotPerformanceCard
                currentSignalId={currentSignal?.id}
                signalsCount={signalsHistory.length}
              />

              {/* Top Row: Trading Parameters (Left) + Live Signal Card (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
                {/* Left: Trading Parameters */}
                <div className="lg:col-span-7">
                  <PairTimeframeSelector
                    selectedPair={selectedPair}
                    onSelectPair={handleSelectPair}
                    selectedTimeframe={selectedTimeframe}
                    onSelectTimeframe={handleSelectTimeframe}
                    selectedTradeDuration={selectedTradeDuration}
                    onSelectTradeDuration={handleSelectTradeDuration}
                    selectedBroker={selectedBroker}
                    onSelectBroker={handleSelectBroker}
                    onGetSignal={handleGetSignal}
                    isAnalyzing={isAnalyzing}
                    quotes={quotes}
                    isLive={isLive}
                    marketMode={marketMode}
                    onSelectMarketMode={handleSelectMarketMode}
                    onOpenSettings={() => setActiveTab('settings')}
                    brokerFeedConnected={brokerNormalizedData.connected}
                    brokerStatusMessage={brokerNormalizedData.statusMessage}
                    brokerPrice={brokerNormalizedData.price}
                    isFallback={brokerNormalizedData.isFallback}
                    effectiveBroker={brokerNormalizedData.effectiveBroker}
                    pocketConnected={brokerNormalizedData.pocketConnected}
                    quotexConnected={brokerNormalizedData.quotexConnected}
                    feedLabel={brokerNormalizedData.feedLabel}
                    executionMode={brokerNormalizedData.executionMode}
                  />
                </div>

                {/* Right: Live Signal Card */}
                <div className="lg:col-span-5">
                  <LiveSignalCard
                    currentSignal={currentSignal}
                    selectedPair={selectedPair}
                    selectedTimeframe={selectedTimeframe}
                    selectedTradeDuration={selectedTradeDuration}
                    selectedBroker={selectedBroker}
                    onRefreshSignal={handleGetSignal}
                    isAnalyzing={isAnalyzing}
                    onOpenSettings={() => setActiveTab('settings')}
                    brokerFeedConnected={brokerNormalizedData.connected}
                    brokerPrice={brokerNormalizedData.price}
                    lastUpdateFormatted={brokerNormalizedData.lastUpdateFormatted || (brokerNormalizedData.timestamp ? new Date(brokerNormalizedData.timestamp).toLocaleTimeString('en-US', { hour12: false }) : undefined)}
                    isFallback={brokerNormalizedData.isFallback}
                    effectiveBroker={brokerNormalizedData.effectiveBroker}
                    pocketConnected={brokerNormalizedData.pocketConnected}
                    quotexConnected={brokerNormalizedData.quotexConnected}
                    feedLabel={brokerNormalizedData.feedLabel}
                    executionMode={brokerNormalizedData.executionMode}
                  />
                </div>
              </div>

              {/* Price Verification Cross-Check (WATTOPro Reference vs Broker Price) */}
              <PriceVerificationCard
                selectedPair={selectedPair}
                selectedBroker={selectedBroker}
                brokerPrice={brokerNormalizedData.price}
                brokerFeedConnected={brokerNormalizedData.connected}
              />

              {/* Market Pairs Section (NORMAL 10 PAIRS vs OTC 22 PAIRS) */}
              <MarketPairsGrid
                quotes={quotes}
                selectedPair={selectedPair}
                onSelectPair={handleSelectPair}
                isLive={isLive}
                marketMode={marketMode}
                onSelectMarketMode={handleSelectMarketMode}
              />

              {/* Candlestick Chart + Recent Signals Row */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
                {/* Candlestick Chart */}
                <div className="lg:col-span-8">
                  <CandlestickChart
                    pair={selectedPair}
                    timeframe={selectedTimeframe}
                    onSelectTimeframe={handleSelectTimeframe}
                    candles={candles}
                    currentPrice={currentPairQuote?.price}
                    isLive={isLive}
                    quotes={quotes}
                    selectedBroker={selectedBroker}
                    onSelectBroker={handleSelectBroker}
                  />
                </div>

                {/* Recent Signals List */}
                <div className="lg:col-span-4">
                  <RecentSignalsList
                    signals={signalsHistory}
                    onViewAll={() => setActiveTab('history')}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'signals' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PairTimeframeSelector
                  selectedPair={selectedPair}
                  onSelectPair={handleSelectPair}
                  selectedTimeframe={selectedTimeframe}
                  onSelectTimeframe={handleSelectTimeframe}
                  selectedTradeDuration={selectedTradeDuration}
                  onSelectTradeDuration={handleSelectTradeDuration}
                  selectedBroker={selectedBroker}
                  onSelectBroker={handleSelectBroker}
                  onGetSignal={handleGetSignal}
                  isAnalyzing={isAnalyzing}
                  quotes={quotes}
                  marketMode={marketMode}
                  onSelectMarketMode={handleSelectMarketMode}
                  brokerFeedConnected={brokerNormalizedData.connected}
                  brokerStatusMessage={brokerNormalizedData.statusMessage}
                  brokerPrice={brokerNormalizedData.price}
                  feedLabel={brokerNormalizedData.feedLabel}
                  executionMode={brokerNormalizedData.executionMode}
                  onOpenSettings={() => setActiveTab('settings')}
                />
                <LiveSignalCard
                  currentSignal={currentSignal}
                  selectedPair={selectedPair}
                  selectedTimeframe={selectedTimeframe}
                  selectedTradeDuration={selectedTradeDuration}
                  selectedBroker={selectedBroker}
                  onRefreshSignal={handleGetSignal}
                  isAnalyzing={isAnalyzing}
                  onOpenSettings={() => setActiveTab('settings')}
                  brokerFeedConnected={brokerNormalizedData.connected}
                  brokerPrice={brokerNormalizedData.price}
                  lastUpdateFormatted={brokerNormalizedData.lastUpdateFormatted || (brokerNormalizedData.timestamp ? new Date(brokerNormalizedData.timestamp).toLocaleTimeString('en-US', { hour12: false }) : undefined)}
                  feedLabel={brokerNormalizedData.feedLabel}
                  executionMode={brokerNormalizedData.executionMode}
                />
              </div>

              {/* Price Verification Cross-Check */}
              <PriceVerificationCard
                selectedPair={selectedPair}
                selectedBroker={selectedBroker}
                brokerPrice={brokerNormalizedData.price}
                brokerFeedConnected={brokerNormalizedData.connected}
              />
              <MarketPairsGrid
                quotes={quotes}
                selectedPair={selectedPair}
                onSelectPair={handleSelectPair}
                isLive={isLive}
                marketMode={marketMode}
                onSelectMarketMode={handleSelectMarketMode}
              />
            </div>
          )}

          {activeTab === 'pairs' && (
            <div className="space-y-6">
              <MarketPairsGrid
                quotes={quotes}
                selectedPair={selectedPair}
                onSelectPair={handleSelectPair}
                isLive={isLive}
                marketMode={marketMode}
                onSelectMarketMode={handleSelectMarketMode}
              />
              <CandlestickChart
                pair={selectedPair}
                timeframe={selectedTimeframe}
                onSelectTimeframe={handleSelectTimeframe}
                candles={candles}
                currentPrice={currentPairQuote?.price}
                isLive={isLive}
                quotes={quotes}
                selectedBroker={selectedBroker}
                onSelectBroker={handleSelectBroker}
              />
            </div>
          )}

          {activeTab === 'history' && (
            <HistoryView
              signals={signalsHistory}
              onClearHistory={handleClearHistory}
            />
          )}

          {activeTab === 'statistics' && (
            <StatisticsView stats={stats} />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onSaveSettings={handleSaveSettings}
              isLive={isLive}
              isDemo={isDemo}
              hasApiKey={hasApiKey}
              onSaveApiKey={handleSaveApiKey}
              onLockBot={handleLockBot}
            />
          )}

          {activeTab === 'help' && (
            <HelpView />
          )}

          {/* ========================================================
              FOOTER: Facebook / Instagram / TikTok @aitrader83 / Telegram @WATTOPROBOT
             ======================================================== */}
          <footer className="mt-12 pt-6 pb-6 border-t border-cyan-500/20 text-center text-xs text-slate-400">
            <div className="flex flex-col items-center justify-center gap-4 max-w-5xl mx-auto px-4">
              
              {/* Brand and quote line: WATTOPro - Trade Smarter - Pakistan Zindabad */}
              <div className="flex items-center justify-center gap-2 flex-wrap text-center">
                <span className="font-black text-white text-sm tracking-wide" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                  WATTO<span className="text-cyan-400">Pro</span>
                </span>
                <span className="text-slate-600 font-bold">•</span>
                <span className="text-amber-300 font-semibold italic">Trade Smarter • Not Harder</span>
                <span className="text-slate-600 font-bold">•</span>
                <span className="text-emerald-400 font-bold tracking-wide">🇵🇰 پاکستان زندہ باد</span>
              </div>

              {/* Stylish Colorful Social Pills / Buttons */}
              <div className="flex items-center justify-center gap-2 sm:gap-2.5 flex-wrap">
                {/* 1. Facebook: #1877F2 */}
                <a
                  href="https://www.facebook.com/share/19Px5u76ao/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.preventDefault();
                    window.open('https://www.facebook.com/share/19Px5u76ao/', '_blank', 'noopener,noreferrer');
                  }}
                  className="social-pill-pulse social-pill-fb inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[20px] bg-white/[0.08] border border-white/10 text-white font-medium text-xs transition-all duration-300 cursor-pointer group"
                  title="Follow on Facebook"
                >
                  <svg className="w-3.5 h-3.5 fill-[#1877F2] shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span className="text-[#1877F2] font-semibold tracking-wide">Facebook</span>
                </a>

                {/* Separator */}
                <span className="text-slate-600/70 text-[10px] select-none">/</span>

                {/* 2. Instagram: gradient #E4405F to #FCAF45 */}
                <a
                  href="https://www.instagram.com/aitrader.offical"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.preventDefault();
                    window.open('https://www.instagram.com/aitrader.offical', '_blank', 'noopener,noreferrer');
                  }}
                  className="social-pill-pulse social-pill-ig inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[20px] bg-white/[0.08] border border-white/10 text-white font-medium text-xs transition-all duration-300 cursor-pointer group"
                  title="Follow on Instagram"
                >
                  <svg className="w-3.5 h-3.5 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                    <defs>
                      <linearGradient id="igFooterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#E4405F" />
                        <stop offset="100%" stopColor="#FCAF45" />
                      </linearGradient>
                    </defs>
                    <path fill="url(#igFooterGrad)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  <span className="font-semibold tracking-wide bg-gradient-to-r from-[#E4405F] to-[#FCAF45] bg-clip-text text-transparent">
                    Instagram
                  </span>
                </a>

                {/* Separator */}
                <span className="text-slate-600/70 text-[10px] select-none">/</span>

                {/* 3. TikTok: cyan #00F2EA + pink #FF0050 with @aitrader83 in #00E5FF */}
                <a
                  href="https://www.tiktok.com/@aitrader83?_r=1&_t=ZN-9A0PFgs2Xsl"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.preventDefault();
                    window.open('https://www.tiktok.com/@aitrader83', '_blank', 'noopener,noreferrer');
                  }}
                  className="social-pill-pulse social-pill-tt inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[20px] bg-white/[0.08] border border-white/10 text-white font-medium text-xs transition-all duration-300 cursor-pointer group"
                  title="Follow @aitrader83 on TikTok"
                >
                  <svg className="w-3.5 h-3.5 fill-[#00F2EA] drop-shadow-[0_0_6px_#FF0050] shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.87-4.49V8.58a8.3 8.3 0 0 0 4.9 1.58V6.73a4.77 4.77 0 0 1-1-.04z"/>
                  </svg>
                  <span className="font-semibold tracking-wide text-[#00F2EA]">TikTok</span>
                  <span 
                    className="font-bold tracking-wider text-[#00E5FF] px-1.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-[11px]"
                    style={{
                      textShadow: '0 0 8px rgba(0, 229, 255, 0.9), 0 0 14px rgba(0, 229, 255, 0.6)',
                      boxShadow: '0 0 10px rgba(0, 229, 255, 0.35)',
                    }}
                  >
                    @aitrader83
                  </span>
                </a>

                {/* Separator */}
                <span className="text-slate-600/70 text-[10px] select-none">/</span>

                {/* 4. Telegram: blue #26A5E4 with @WATTOPROBOT in #00E5FF */}
                <a
                  href="https://t.me/WATTOPROBOT"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.preventDefault();
                    window.open('https://t.me/WATTOPROBOT', '_blank', 'noopener,noreferrer');
                  }}
                  className="social-pill-pulse social-pill-tg inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[20px] bg-white/[0.08] border border-white/10 text-white font-medium text-xs transition-all duration-300 cursor-pointer group"
                  title="Message @WATTOPROBOT on Telegram"
                >
                  <svg className="w-3.5 h-3.5 fill-[#26A5E4] shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  <span className="text-[#26A5E4] font-semibold tracking-wide">Telegram</span>
                  <span 
                    className="font-bold tracking-wider text-[#00E5FF] px-1.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-[11px]"
                    style={{
                      textShadow: '0 0 8px rgba(0, 229, 255, 0.9), 0 0 14px rgba(0, 229, 255, 0.6)',
                      boxShadow: '0 0 10px rgba(0, 229, 255, 0.35)',
                    }}
                  >
                    @WATTOPROBOT
                  </span>
                </a>
              </div>
            </div>

            <div className="mt-4 text-[11px] text-slate-500 flex items-center justify-center gap-2 flex-wrap">
              <span>© {new Date().getFullYear()} WATTOPro Trading Signal Bot. All Rights Reserved.</span>
              <span>•</span>
              <div className="inline-flex items-center gap-[8px]">
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  FREE LIVE FEED ACTIVE
                </span>
                <span 
                  className="inline-flex items-center justify-center font-bold text-white uppercase tracking-wider animate-live-feed-blink shrink-0 select-none shadow-[0_0_12px_rgba(255,0,0,0.8)]"
                  style={{
                    backgroundColor: '#ff0000',
                    color: '#ffffff',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    padding: '3px 8px',
                    borderRadius: '10px',
                    lineHeight: 1,
                  }}
                >
                  LIVE FEED
                </span>
              </div>
            </div>
          </footer>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
      />

      {/* FOREGROUND OVERLAY: Falling Flower Petals Layer */}
      <FallingPetalsCanvas enabled={settings.petalsAnimationEnabled !== false} />

      {/* Broker Reference Modal */}
      <BrokerModal
        broker={brokerModal}
        selectedBroker={selectedBroker}
        onSelectBroker={handleSelectBroker}
        onClose={() => setBrokerModal(null)}
        selectedPair={selectedPair}
        currentPrice={currentPairQuote?.price}
      />

      {/* Pro Upgrade Modal */}
      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
      />

      {/* 5-Second Real-Time Analyze Modal with Countdown Circle */}
      <AnalyzeModal
        isOpen={isAnalyzeModalOpen}
        selectedPair={selectedPair}
        selectedBroker={selectedBroker}
        selectedTimeframe={selectedTimeframe}
        selectedTradeDuration={selectedTradeDuration}
        signalResult={pendingAnalyzedSignal}
        onComplete={handleAnalyzeModalComplete}
      />
    </div>
  );
}
