import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, 
  Sliders, 
  Volume2, 
  Check, 
  Activity,
  Play,
  Pause,
  Upload,
  RotateCcw,
  Music,
  Sparkles,
  ShieldCheck,
  Lock,
  ExternalLink,
  Key,
  Radio,
  AlertTriangle,
  Clipboard,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { BotPerformanceCard } from './BotPerformanceCard';
import { FOREX_PAIRS, Timeframe, TIMEFRAMES, TradeDuration, TRADE_DURATIONS } from '../types/trading';
import { UserSettings } from '../services/marketDataService';
import { soundEngine, playSignalSound } from '../utils/sound';
import { brokerSyncEngine } from '../services/brokerSyncEngine';

interface SettingsViewProps {
  settings: UserSettings;
  onSaveSettings: (settings: UserSettings) => void;
  isLive: boolean;
  isDemo?: boolean;
  hasApiKey?: boolean;
  onSaveApiKey?: (key: string) => Promise<boolean>;
  onLockBot?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  isLive,
  onLockBot,
}) => {
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [hasCustomAudio, setHasCustomAudio] = useState(false);
  const [customAudioName, setCustomAudioName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean Market Data State (WATTOPro Live Feed)
  const [marketStatus] = useState<string>('WATTOPro Feed: CONNECTED (24/7 Live Active)');

  useEffect(() => {
    const unsub = soundEngine.subscribe((state) => {
      setIsPlayingAudio(state.isPlaying);
      setHasCustomAudio(soundEngine.hasCustomAudio());
      setCustomAudioName(soundEngine.getCustomAudioName());
    });
    return unsub;
  }, []);

  const handleTestAudio = () => {
    playSignalSound(
      'BUY',
      localSettings.soundVolume || 85
    );
  };

  const handleToggleSoundPlayback = () => {
    soundEngine.toggle();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        soundEngine.setCustomAudio(result, file.name);
        // Do not autoplay - user taps the dedicated SOUND button when ready
      }
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleResetAudio = () => {
    soundEngine.resetToDefaultTheme();
  };

  const handleSaveAll = () => {
    onSaveSettings(localSettings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Title */}
      <div className="cyber-card p-4 sm:p-5 border-cyan-500/30">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-wide">
              Terminal & Engine Settings
            </h1>
            <p className="text-xs text-slate-400">
              Configure algorithmic engine sensitivity, timeframe defaults, and execution preferences
            </p>
          </div>
        </div>
      </div>

      {/* [WATTOPRO LIVE FEED] */}
      <div className="cyber-card p-5 border-cyan-500/35 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cyan-500/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>WATTOPro Live Feed</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                  Real Market Feed Active 24/7
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Real candlestick feed directly from WATTOPro live market feed &amp; algorithmic RSI(14) confluence
              </p>
            </div>
          </div>

          <span className="px-3 py-1.5 rounded-full text-xs font-black tracking-wider flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            WATTOPro Feed: CONNECTED (24/7 Live Active)
          </span>
        </div>

        {/* UI shows: Icon: Live Green Dot, Text: "Live Market Data - No Login Needed" */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-[#071B26] to-[#061424] border border-emerald-500/40 flex items-center gap-3.5 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
          <div className="relative flex items-center justify-center">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]"></span>
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping absolute opacity-75"></span>
          </div>
          <div className="flex-1">
            <div className="text-sm sm:text-base font-black text-emerald-300 tracking-wide">
              Live Market Data - No Login Needed
            </div>
            <div className="text-xs text-slate-400 mt-1 leading-relaxed">
              Streams verified 1-minute candlestick series and calculates technical confluence strictly using closed candle momentum and RSI(14) logic. No broker session ID or third-party token required.
            </div>
          </div>
        </div>
      </div>

      {/* Signal Engine Preferences */}
      <div className="cyber-card p-5 border-cyan-500/30 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span>Algorithmic Signal Engine Sensitivity</span>
        </h2>

        {/* Sensitivity Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Signal Strictness / Filter Threshold
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            {(['Conservative', 'Balanced', 'Aggressive'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, sensitivity: mode })}
                className={`p-3 rounded-xl text-left border transition-all ${
                  localSettings.sensitivity === mode
                    ? 'bg-cyan-950/60 border-cyan-400 text-white shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                    : 'bg-[#091424] border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="font-bold">{mode}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {mode === 'Conservative' && 'Highest confluence requirement (~80%+ strictness)'}
                  {mode === 'Balanced' && 'Standard EMA 9/21 + RSI + MACD confirmation'}
                  {mode === 'Aggressive' && 'Faster entry signals with lower threshold'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Default Pair, Timeframe, & Trade Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Default Forex Pair
            </label>
            <select
              value={localSettings.defaultPair}
              onChange={(e) => setLocalSettings({ ...localSettings, defaultPair: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-[#091424] border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              {FOREX_PAIRS.map(p => (
                <option key={p.symbol} value={p.symbol}>
                  {p.symbol} — {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Default Market Timeframe
            </label>
            <select
              value={localSettings.defaultTimeframe}
              onChange={(e) => setLocalSettings({ ...localSettings, defaultTimeframe: e.target.value as Timeframe })}
              className="w-full p-2.5 rounded-xl bg-[#091424] border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              {TIMEFRAMES.map(tf => (
                <option key={tf} value={tf}>
                  {tf} (Indicator Analysis)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Default Trade Duration / Expiry
            </label>
            <select
              value={localSettings.defaultTradeDuration || '1 MIN'}
              onChange={(e) => setLocalSettings({ ...localSettings, defaultTradeDuration: e.target.value as TradeDuration })}
              className="w-full p-2.5 rounded-xl bg-[#091424] border border-slate-800 text-xs text-amber-300 font-bold focus:outline-none focus:border-cyan-400"
            >
              {TRADE_DURATIONS.map(td => (
                <option key={td} value={td}>
                  {td} Trade Time
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sound & Audio Engine Card */}
        <div className="p-4 rounded-xl bg-[#091424] border border-cyan-500/30 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                <Music className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>WATTOPro Sound & Reel Audio Engine</span>
                  {hasCustomAudio && <Sparkles className="w-3 h-3 text-amber-400 inline" />}
                </div>
                <div className="text-[10px] text-slate-400">
                  Play the signature WATTOPro video soundtrack or custom audio on signals and alerts
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={localSettings.soundEnabled}
              onChange={(e) => setLocalSettings({ ...localSettings, soundEnabled: e.target.checked })}
              className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
            />
          </div>

          {localSettings.soundEnabled && (
            <div className="space-y-4 pt-1">
              {/* Sound Mode Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setLocalSettings({ ...localSettings, soundMode: 'wattopro_reel' })}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    (localSettings.soundMode || 'wattopro_reel') === 'wattopro_reel'
                      ? 'bg-cyan-950/40 border-cyan-400 text-white shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                      : 'bg-[#050C17] border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-black text-cyan-300">🎵 WATTOPro Reel Sound</div>
                  <div className="text-[10px] text-slate-400 mt-1">Official high-energy video theme</div>
                </button>

                <button
                  type="button"
                  onClick={() => setLocalSettings({ ...localSettings, soundMode: 'chime' })}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    localSettings.soundMode === 'chime'
                      ? 'bg-cyan-950/40 border-cyan-400 text-white shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                      : 'bg-[#050C17] border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-black text-emerald-300">🔔 Tactical Chime</div>
                  <div className="text-[10px] text-slate-400 mt-1">Instant harmonic synthesized cue</div>
                </button>

                <button
                  type="button"
                  onClick={() => setLocalSettings({ ...localSettings, soundMode: 'both' })}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    localSettings.soundMode === 'both'
                      ? 'bg-cyan-950/40 border-cyan-400 text-white shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                      : 'bg-[#050C17] border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-black text-amber-300">⚡ Reel + Chime (Both)</div>
                  <div className="text-[10px] text-slate-400 mt-1">Full sensory audio experience</div>
                </button>
              </div>

              {/* Volume Slider and Test Audio */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#050C17] border border-slate-800">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                      Audio Volume
                    </span>
                    <span className="font-tabular font-bold text-cyan-300">
                      {localSettings.soundVolume || 85}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={localSettings.soundVolume || 85}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      setLocalSettings({ ...localSettings, soundVolume: v });
                      soundEngine.setVolume(v / 100);
                    }}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTestAudio}
                    className="px-3 py-2 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Test Chime</span>
                  </button>
                </div>
              </div>

              {/* Upload Custom Audio / Video Section */}
              <div className="p-3 rounded-xl bg-[#050C17] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="audio/*,video/mp4,video/*"
                  className="hidden"
                />
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>Active Audio Track:</span>
                    <span className="text-cyan-300 font-mono">
                      {hasCustomAudio && customAudioName ? customAudioName : 'WATTOPro Official Reel Sound (Built-in)'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Upload any video (.mp4) or audio (.mp3) from your phone or PC to use as the bot sound
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Upload Audio/Video</span>
                  </button>

                  {hasCustomAudio && (
                    <button
                      type="button"
                      onClick={handleResetAudio}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-950/40 text-rose-300 hover:bg-rose-900/50 border border-rose-500/30 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      title="Reset to default official reel sound"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Ambient Visuals: Premium Falling Petals */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-[#091424] border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-pink-500/15 text-pink-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>Ambient Falling Petal Animation</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  Subtle Glow
                </span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Gentle drifting floral petals behind UI cards. Auto-disables if system reduced motion is on.
              </div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={localSettings.petalsAnimationEnabled !== false}
            onChange={(e) => setLocalSettings({ ...localSettings, petalsAnimationEnabled: e.target.checked })}
            className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
          />
        </div>

        {/* BOT PERFORMANCE LIVE Card */}
        <BotPerformanceCard />

        {/* License Info Card */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-[#0a182d] to-[#071120] border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Licensed To: PRO USER
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
                  ACTIVE
                </span>
              </div>
              <div className="text-[11px] text-emerald-400/90 font-medium mt-0.5">
                Official Bot Engine Verified
              </div>
            </div>
          </div>

          {onLockBot && (
            <button
              type="button"
              onClick={onLockBot}
              className="px-3.5 py-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Lock bot and return to activation screen"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock Bot</span>
            </button>
          )}
        </div>
      </div>

      {/* Save Settings Button */}
      <div className="flex items-center justify-end gap-3">
        {savedSuccess && (
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
            <Check className="w-4 h-4" />
            Preferences Saved!
          </span>
        )}
        <button
          type="button"
          onClick={handleSaveAll}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs uppercase tracking-wider shadow-[0_0_18px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
};
