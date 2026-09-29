/**
 * WATTOPro Official Sound Engine & Audio Manager
 * Supports official WATTOPro Trader Reel audio track, Web Audio synthesizers, and custom audio upload.
 */

type SoundStateListener = (state: {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  source: string;
}) => void;

class WattoSoundEngine {
  private static instance: WattoSoundEngine;
  private audioEl: HTMLAudioElement | null = null;
  private isPlaying: boolean = false;
  private volume: number = 0.85;
  private listeners: Set<SoundStateListener> = new Set();
  private customAudioUrl: string | null = null;
  private customAudioName: string | null = null;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.initAudioElement();
      this.loadSavedCustomAudio();
    }
  }

  public static getInstance(): WattoSoundEngine {
    if (!WattoSoundEngine.instance) {
      WattoSoundEngine.instance = new WattoSoundEngine();
    }
    return WattoSoundEngine.instance;
  }

  private initAudioElement() {
    try {
      this.audioEl = new Audio();
      this.audioEl.preload = 'auto';
      this.audioEl.autoplay = false;
      this.audioEl.loop = true; // Seamless loop while SOUND is ON
      this.audioEl.volume = this.volume;

      // Primary source: /audio/wattopro_sound.mp3
      this.audioEl.src = this.customAudioUrl || '/audio/wattopro_sound.mp3';

      this.audioEl.addEventListener('play', () => {
        this.isPlaying = true;
        this.notifyListeners();
      });

      this.audioEl.addEventListener('pause', () => {
        this.isPlaying = false;
        this.notifyListeners();
      });

      this.audioEl.addEventListener('ended', () => {
        this.isPlaying = false;
        this.notifyListeners();
      });

      this.audioEl.addEventListener('timeupdate', () => {
        this.notifyListeners();
      });

      this.audioEl.addEventListener('error', (e) => {
        console.warn('Audio playback notice:', e);
        // Fallback to wav if mp3 had an issue
        if (this.audioEl && !this.customAudioUrl && this.audioEl.src.endsWith('.mp3')) {
          this.audioEl.src = '/audio/wattopro_sound.wav';
        }
      });
    } catch (err) {
      console.warn('Audio element init error:', err);
    }
  }

  private loadSavedCustomAudio() {
    try {
      const saved = localStorage.getItem('wattopro_custom_audio_data');
      const savedName = localStorage.getItem('wattopro_custom_audio_name');
      if (saved) {
        this.customAudioUrl = saved;
        this.customAudioName = savedName || 'Custom Video Sound';
        if (this.audioEl) {
          this.audioEl.src = saved;
        }
      }
    } catch (e) {
      // LocalStorage access notice
    }
  }

  public setCustomAudio(dataUrl: string, name: string = 'Uploaded Sound') {
    this.customAudioUrl = dataUrl;
    this.customAudioName = name;
    try {
      localStorage.setItem('wattopro_custom_audio_data', dataUrl);
      localStorage.setItem('wattopro_custom_audio_name', name);
    } catch (e) {
      console.warn('Could not save custom audio to localStorage (size limit):', e);
    }

    if (this.audioEl) {
      const wasPlaying = this.isPlaying;
      this.audioEl.src = dataUrl;
      if (wasPlaying) {
        this.audioEl.play().catch(() => {});
      }
    }
    this.notifyListeners();
  }

  public resetToDefaultTheme() {
    this.customAudioUrl = null;
    this.customAudioName = null;
    try {
      localStorage.removeItem('wattopro_custom_audio_data');
      localStorage.removeItem('wattopro_custom_audio_name');
    } catch (e) {}

    if (this.audioEl) {
      this.audioEl.src = '/audio/wattopro_sound.mp3';
    }
    this.notifyListeners();
  }

  public getCustomAudioName(): string | null {
    return this.customAudioName;
  }

  public hasCustomAudio(): boolean {
    return Boolean(this.customAudioUrl);
  }

  public subscribe(listener: SoundStateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    const state = this.getState();
    this.listeners.forEach(fn => fn(state));
  }

  public getState() {
    return {
      isPlaying: this.isPlaying,
      currentTime: this.audioEl ? this.audioEl.currentTime : 0,
      duration: this.audioEl && !isNaN(this.audioEl.duration) ? this.audioEl.duration : 14,
      volume: this.volume,
      source: this.customAudioName || 'WATTOPro Official Reel Sound',
    };
  }

  public async play(): Promise<boolean> {
    if (!this.audioEl) {
      this.initAudioElement();
    }
    if (!this.audioEl) return false;

    try {
      this.audioEl.volume = this.volume;
      this.audioEl.currentTime = 0;
      await this.audioEl.play();
      this.isPlaying = true;
      this.notifyListeners();
      return true;
    } catch (err) {
      console.warn('Playback blocked by browser autoplay policy:', err);
      // Fallback: Web Audio synthesis if HTML5 audio fails
      this.playSyntheticTheme();
      return false;
    }
  }

  public pause() {
    if (this.audioEl) {
      this.audioEl.pause();
      this.isPlaying = false;
      this.notifyListeners();
    }
  }

  public toggle(): Promise<boolean> | void {
    if (this.isPlaying) {
      this.pause();
    } else {
      return this.play();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.audioEl) {
      this.audioEl.volume = this.volume;
    }
    this.notifyListeners();
  }

  /**
   * Fallback Web Audio API synthesizer for the signature bass & melody
   */
  public playSyntheticTheme() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Heavy 808 sub kick
      const kickOsc = ctx.createOscillator();
      const kickGain = ctx.createGain();
      kickOsc.type = 'sine';
      kickOsc.frequency.setValueAtTime(130, now);
      kickOsc.frequency.exponentialRampToValueAtTime(45, now + 0.35);

      kickGain.gain.setValueAtTime(this.volume * 0.45, now);
      kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      kickOsc.connect(kickGain);
      kickGain.connect(ctx.destination);
      kickOsc.start(now);
      kickOsc.stop(now + 0.45);

      // Desi melodic synth hook (D5 - C#5 - D5 - A4)
      const notes = [587.33, 554.37, 587.33, 440.00, 466.16, 587.33];
      notes.forEach((freq, idx) => {
        const noteStart = now + 0.15 + idx * 0.22;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, noteStart);

        g.gain.setValueAtTime(this.volume * 0.18, noteStart);
        g.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.28);

        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(noteStart);
        osc.stop(noteStart + 0.29);
      });
    } catch (e) {
      console.warn('Web Audio synthesis failed:', e);
    }
  }
}

export const soundEngine = WattoSoundEngine.getInstance();

/**
 * Tactical signal alert dispatcher (Web Audio chimes only - never autoplays video soundtrack)
 */
export function playSignalSound(
  type: 'BUY' | 'SELL' | 'NO_TRADE',
  volumePercent: number = 85
) {
  // CRITICAL: Never autoplay video/reel audio track on signals.
  // Video audio is exclusively triggered by user interaction via the dedicated SOUND button.
  const vol = Math.max(0, Math.min(1, volumePercent / 100));
  playChime(type, vol);
}

/**
 * Lightweight Web Audio chime for instant tactical alerts
 */
function playChime(type: 'BUY' | 'SELL' | 'NO_TRADE', vol: number) {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    if (type === 'BUY') {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(523.25, now);
      osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.2);

      osc2.frequency.setValueAtTime(659.25, now);
      osc2.frequency.exponentialRampToValueAtTime(1046.50, now + 0.2);

      gain.gain.setValueAtTime(vol * 0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.4);
      osc2.stop(now + 0.4);
    } else if (type === 'SELL') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.exponentialRampToValueAtTime(329.63, now + 0.28);

      gain.gain.setValueAtTime(vol * 0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.34);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(vol * 0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.21);
    }
  } catch (e) {
    // Autoplay restrictions
  }
}
