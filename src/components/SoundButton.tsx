import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { soundEngine } from '../utils/sound';

interface SoundButtonProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showEqualizer?: boolean;
}

export const SoundButton: React.FC<SoundButtonProps> = ({
  className = '',
  size = 'md',
  showEqualizer = true,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const unsub = soundEngine.subscribe((state) => {
      setIsPlaying(state.isPlaying);
    });
    return unsub;
  }, []);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    soundEngine.toggle();
  };

  // Size styling variations
  const sizeClasses = {
    sm: 'px-2.5 py-1 text-[11px] gap-1.5',
    md: 'px-3 py-1.5 text-xs gap-2',
    lg: 'px-4 py-2.5 text-sm gap-2.5',
  }[size];

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={isPlaying ? 'Mute sound (SOUND ON)' : 'Play sound (SOUND OFF)'}
      aria-pressed={isPlaying}
      title={
        isPlaying
          ? 'WATTOPro Sound is Playing • Tap to Mute (SOUND OFF)'
          : 'WATTOPro Sound is Silent • Tap to Play (SOUND ON)'
      }
      className={`group relative inline-flex items-center justify-center font-black tracking-wider uppercase rounded-xl border transition-all duration-300 select-none cursor-pointer active:scale-95 shadow-md ${sizeClasses} ${
        isPlaying
          ? 'bg-gradient-to-r from-emerald-950/80 via-[#062024]/90 to-emerald-950/80 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(0,230,118,0.45),inset_0_0_12px_rgba(6,182,212,0.25)]'
          : 'bg-[#091526]/90 border-cyan-500/35 text-slate-300 hover:border-cyan-400 hover:text-white hover:bg-[#0D1F38] hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]'
      } ${className}`}
    >
      {/* State Indicators */}
      {isPlaying ? (
        <>
          {/* Sound Wave Equalizer Bars */}
          {showEqualizer && (
            <div className="flex items-end gap-0.5 h-3.5 px-0.5 pointer-events-none" aria-hidden="true">
              <span className="w-0.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="w-0.5 h-3.5 bg-cyan-300 rounded-full animate-bounce" />
              <span className="w-0.5 h-2 bg-emerald-300 rounded-full animate-pulse" />
              <span className="w-0.5 h-3 bg-cyan-400 rounded-full animate-bounce" />
            </div>
          )}

          {/* Sound ON label */}
          <span className="flex items-center gap-1.5 drop-shadow-[0_0_8px_rgba(0,230,118,0.7)] text-emerald-300">
            <span className="text-sm">🔊</span>
            <span className="font-extrabold tracking-widest">SOUND ON</span>
          </span>

          {/* Active green radar dot */}
          <span className="relative flex h-2 w-2 ml-0.5" aria-hidden="true">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </>
      ) : (
        <>
          {/* Sound OFF label */}
          <span className="flex items-center gap-1.5 text-slate-300 group-hover:text-cyan-200">
            <span className="text-sm">🔇</span>
            <span className="font-extrabold tracking-widest">SOUND OFF</span>
          </span>

          {/* Silent status dot */}
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500 group-hover:bg-cyan-400 transition-colors" aria-hidden="true" />
        </>
      )}
    </button>
  );
};
