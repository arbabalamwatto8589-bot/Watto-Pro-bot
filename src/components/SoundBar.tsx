import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Upload, 
  RotateCcw, 
  Music, 
  Sparkles,
  Sliders
} from 'lucide-react';
import { soundEngine } from '../utils/sound';

export const SoundBar: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const [sourceName, setSourceName] = useState('WATTOPro Reel Sound');
  const [hasCustom, setHasCustom] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = soundEngine.subscribe((state) => {
      setIsPlaying(state.isPlaying);
      setVolume(state.volume);
      setSourceName(state.source);
      setHasCustom(soundEngine.hasCustomAudio());
    });
    return unsubscribe;
  }, []);

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.toggle();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    soundEngine.setVolume(val);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        soundEngine.setCustomAudio(result, file.name);
        // Do not autoplay - user taps the dedicated SOUND button
      }
    };
    reader.readAsDataURL(file);
    // Reset file input so same file can be re-selected if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleResetDefault = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.resetToDefaultTheme();
  };

  return (
    <div className="relative inline-flex items-center">
      {/* Hidden file input for uploading custom audio or video */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept="audio/*,video/mp4,video/*" 
        className="hidden" 
      />

      {/* Main Sound Controller Pill */}
      <div 
        onClick={() => setShowControls(!showControls)}
        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer select-none transition-all duration-300 ${
          isPlaying 
            ? 'bg-cyan-950/50 border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.35)] text-cyan-200' 
            : 'bg-[#0A1629] border-cyan-500/30 text-slate-300 hover:border-cyan-400 hover:text-white'
        }`}
        title="WATTOPro Official Reel Sound Player"
      >
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={handleTogglePlay}
          className={`p-1 rounded-md transition-all ${
            isPlaying 
              ? 'bg-cyan-500 text-slate-950 shadow-[0_0_8px_rgba(6,182,212,0.6)]' 
              : 'bg-slate-800 text-cyan-300 hover:bg-cyan-500 hover:text-slate-950'
          }`}
          title={isPlaying ? 'Pause Sound' : 'Play WATTOPro Sound'}
        >
          {isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
        </button>

        {/* Animated Sound Waveform Bars */}
        <div className="flex items-end gap-0.5 h-3.5 px-0.5">
          <span className={`w-0.5 rounded-full bg-cyan-400 transition-all ${isPlaying ? 'h-3 animate-pulse' : 'h-1.5'}`} />
          <span className={`w-0.5 rounded-full bg-cyan-300 transition-all ${isPlaying ? 'h-3.5 animate-bounce' : 'h-2'}`} />
          <span className={`w-0.5 rounded-full bg-emerald-400 transition-all ${isPlaying ? 'h-2.5 animate-pulse' : 'h-1'}`} />
          <span className={`w-0.5 rounded-full bg-cyan-400 transition-all ${isPlaying ? 'h-3.5 animate-bounce' : 'h-2'}`} />
        </div>

        {/* Sound Label */}
        <div className="flex flex-col text-left leading-tight hidden sm:flex">
          <span className="text-[10px] font-black text-cyan-300 tracking-wider uppercase flex items-center gap-1">
            <span>SOUND</span>
            {hasCustom && <Sparkles className="w-2.5 h-2.5 text-amber-400 inline" />}
          </span>
          <span className="text-[9px] text-slate-400 max-w-[85px] truncate font-medium">
            {hasCustom ? 'Custom Audio' : 'WATTOPro Reel'}
          </span>
        </div>

        {/* Volume icon */}
        <Volume2 className={`w-3.5 h-3.5 ${isPlaying ? 'text-cyan-400 animate-pulse' : 'text-slate-400'}`} />
      </div>

      {/* Expanded Sound Popover / Control Dropdown */}
      {showControls && (
        <>
          <div 
            className="fixed inset-0 z-30" 
            onClick={() => setShowControls(false)} 
          />
          <div className="absolute right-0 top-full mt-2 w-72 p-3.5 rounded-2xl bg-[#081224] border border-cyan-500/40 shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(6,182,212,0.25)] z-40 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-cyan-500/20">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-black text-white tracking-wide uppercase">
                  WATTOPro Sound Bot
                </span>
              </div>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                isPlaying 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse' 
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {isPlaying ? 'PLAYING' : 'IDLE'}
              </span>
            </div>

            {/* Currently Active Sound Info */}
            <div className="p-2.5 rounded-xl bg-[#050B14] border border-slate-800 mb-3 text-xs">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Active Track</div>
              <div className="text-cyan-300 font-bold truncate mt-0.5 flex items-center justify-between">
                <span>{sourceName}</span>
                {hasCustom && (
                  <button
                    type="button"
                    onClick={handleResetDefault}
                    className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-1 underline ml-2 shrink-0 cursor-pointer"
                    title="Reset to default WATTOPro reel sound"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Playback & Volume Control */}
            <div className="space-y-3 mb-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleTogglePlay}
                  className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs uppercase tracking-wider shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span>Pause Sound</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Play Sound</span>
                    </>
                  )}
                </button>
              </div>

              {/* Volume Slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                  <span className="flex items-center gap-1">
                    <Volume2 className="w-3 h-3 text-cyan-400" />
                    Volume
                  </span>
                  <span className="font-tabular text-cyan-300">{Math.round(volume * 100)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.05"
                  value={volume} 
                  onChange={handleVolumeChange}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
            </div>

            {/* Custom Video / Audio Upload Option */}
            <div className="pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-1.5 px-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-cyan-300 border border-slate-700/80 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span>Upload Custom Audio / Video</span>
              </button>
              <p className="text-[9px] text-slate-400 text-center mt-1">
                Select your video or MP3 file to play inside the bot
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
