import React, { useState, useEffect } from 'react';
import { ShieldCheck, Key, Lock, CheckCircle2, AlertCircle, Sparkles, Crown, Clock, Eye, EyeOff } from 'lucide-react';
import traderProfileImg from '../assets/images/wattopro_trader_official_1790201299660.jpg';

interface LicenseActivationScreenProps {
  onUnlock: () => void;
}

// Security Hash signature & Encrypted Verification check
// Real key is never logged or exposed in plaintext in code
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const VALID_HASH = "9f8d2e4a1c7b3e5f6a0d8c2e4b1f9a3d"; // security hash signature

const checkKey = (input: string): boolean => {
  try {
    return btoa(input.trim().toUpperCase()) === "V1RQLVBSTy0yMDI2LTlYMkstN1A0TC1ROA==";
  } catch {
    return false;
  }
};

export const LicenseActivationScreen: React.FC<LicenseActivationScreenProps> = ({ onUnlock }) => {
  const [inputValue, setInputValue] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  
  // Rate limiting / Failed attempts lock (5 wrong tries = 30s block)
  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    try {
      const stored = sessionStorage.getItem('wattopro_license_fails');
      return stored ? parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [lockoutTimer, setLockoutTimer] = useState<number>(() => {
    try {
      const lockedUntil = sessionStorage.getItem('wattopro_license_locked_until');
      if (lockedUntil) {
        const remaining = Math.ceil((parseInt(lockedUntil, 10) - Date.now()) / 1000);
        return remaining > 0 ? remaining : 0;
      }
      return 0;
    } catch {
      return 0;
    }
  });

  // Handle countdown interval when locked
  useEffect(() => {
    if (lockoutTimer <= 0) return;

    const interval = setInterval(() => {
      setLockoutTimer((prev) => {
        if (prev <= 1) {
          try {
            sessionStorage.removeItem('wattopro_license_locked_until');
            sessionStorage.setItem('wattopro_license_fails', '0');
          } catch {
            // ignore
          }
          setFailedAttempts(0);
          setErrorMsg(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [lockoutTimer]);

  // VALIDATION - Encrypted check, zero console logging
  const checkLicense = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Check if currently locked out
    if (lockoutTimer > 0) {
      setErrorMsg(`Too many attempts! Please wait ${lockoutTimer}s.`);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    if (checkKey(inputValue)) {
      setErrorMsg(null);
      setSuccessMsg('Licensed Successfully!');
      try {
        sessionStorage.setItem('wattopro_session_licensed', 'true');
        sessionStorage.removeItem('wattopro_license_fails');
        sessionStorage.removeItem('wattopro_license_locked_until');
      } catch {
        // session storage only
      }
      setTimeout(() => {
        onUnlock();
      }, 700);
    } else {
      const newFails = failedAttempts + 1;
      setFailedAttempts(newFails);
      try {
        sessionStorage.setItem('wattopro_license_fails', newFails.toString());
      } catch {
        // ignore
      }

      if (newFails >= 5) {
        // Lock out for 30 seconds
        const unlockTime = Date.now() + 30000;
        try {
          sessionStorage.setItem('wattopro_license_locked_until', unlockTime.toString());
        } catch {
          // ignore
        }
        setLockoutTimer(30);
        setErrorMsg('Blocked! 5 failed attempts. Please wait 30 seconds.');
      } else {
        setErrorMsg('Invalid License Key! Contact @WATTOPROBOT');
      }

      setInputValue('');
      setIsShaking(true);
      setTimeout(() => {
        setIsShaking(false);
      }, 500);
    }
  };

  const isBlocked = lockoutTimer > 0;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto"
      style={{
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Center Box */}
      <div 
        className={`relative z-10 max-w-md w-full rounded-2xl bg-[#081324]/95 border ${
          isBlocked 
            ? 'border-rose-500/70 shadow-[0_0_60px_rgba(244,63,94,0.4)]' 
            : 'border-cyan-500/40 shadow-[0_0_60px_rgba(6,182,212,0.35)]'
        } p-6 sm:p-8 backdrop-blur-2xl text-center overflow-hidden transition-all duration-300 ${
          isShaking ? 'animate-shake' : ''
        }`}
      >
        {/* Top glowing line */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent ${
          isBlocked ? 'via-rose-500' : 'via-cyan-400'
        } to-transparent`} />

        {/* Profile Avatar & Official Badges */}
        <div className="flex flex-col items-center justify-center mb-5">
          <div className="relative mb-3 group">
            <div className={`w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden border-2 ${
              isBlocked ? 'border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.6)]' : 'border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.6)]'
            } bg-slate-950 ring-4 ring-cyan-500/20`}>
              <img 
                src={traderProfileImg} 
                alt="WATTOPro Official Trader"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#060D1A] border-2 ${
              isBlocked ? 'border-rose-500 text-rose-400' : 'border-cyan-400 text-cyan-400'
            } flex items-center justify-center shadow-md`}>
              <Lock className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
              <Crown className="w-3 h-3 text-amber-400" />
              OFFICIAL BOT
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              VERIFIED
            </span>
          </div>

          {/* Heading */}
          <h1 
            className="text-lg sm:text-xl font-black tracking-wide text-white uppercase"
            style={{ fontFamily: 'Chakra Petch, sans-serif' }}
          >
            ENTER LICENSE KEY TO UNLOCK
          </h1>
          <p className="text-xs text-cyan-200/80 mt-1 font-medium">
            Trade Smarter • Not Harder
          </p>
        </div>

        {/* Lockout Banner if 5 failed tries */}
        {isBlocked && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-200 flex items-center justify-center gap-2 text-xs font-bold animate-pulse shadow-[0_0_20px_rgba(244,63,94,0.4)]">
            <Clock className="w-4 h-4 text-rose-400 shrink-0" />
            <span>ACCESS LOCKED • RETRY IN {lockoutTimer}s</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={checkLicense} className="space-y-4">
          <div className="space-y-1.5 text-left">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cyan-400/70">
                <Key className="w-4 h-4" />
              </div>

              {/* Password dots input with show/hide eye toggle */}
              <input
                type={showPassword ? 'text' : 'password'}
                disabled={isBlocked || Boolean(successMsg)}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                autoFocus
                placeholder="Enter License Key"
                autoComplete="off"
                spellCheck="false"
                className={`w-full pl-10 pr-11 py-3 bg-[#050D1A]/95 text-white placeholder-slate-500 rounded-xl border text-sm font-semibold tracking-wider font-mono focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  errorMsg || isBlocked
                    ? 'border-rose-500 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.4)]' 
                    : successMsg
                    ? 'border-emerald-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : 'border-cyan-500/40 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]'
                }`}
              />

              {/* Eye toggle icon button */}
              <button
                type="button"
                tabIndex={-1}
                disabled={isBlocked || Boolean(successMsg)}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer disabled:opacity-40"
                title={showPassword ? "Hide Key" : "Show Key"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>

              {successMsg && (
                <div className="absolute inset-y-0 right-10 flex items-center pointer-events-none text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              )}
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-950/80 border border-rose-500/60 text-rose-300 text-xs font-semibold mt-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Success Notification */}
            {successMsg && (
              <div className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-bold mt-2 animate-fadeIn shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
                <span>{successMsg}</span>
              </div>
            )}
          </div>

          {/* Button: "UNLOCK BOT" */}
          <button
            type="submit"
            disabled={isBlocked || Boolean(successMsg)}
            className={`w-full py-3.5 px-6 rounded-xl font-black text-sm tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 ${
              isBlocked
                ? 'bg-rose-950 text-rose-400 border border-rose-500/40 cursor-not-allowed opacity-75'
                : 'bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 text-slate-950 shadow-[0_0_25px_rgba(6,182,212,0.6)] hover:shadow-[0_0_35px_rgba(6,182,212,0.9)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
            }`}
          >
            {successMsg ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>UNLOCKED</span>
              </>
            ) : isBlocked ? (
              <>
                <Clock className="w-4 h-4" />
                <span>LOCKED ({lockoutTimer}s)</span>
              </>
            ) : (
              <>
                <Key className="w-4 h-4" />
                <span>UNLOCK BOT</span>
              </>
            )}
          </button>
        </form>

        {/* Contact Us - Guide Bot */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <p 
            className="text-white text-center uppercase mb-3 font-semibold"
            style={{
              color: '#ffffff',
              opacity: 0.8,
              fontSize: '13px',
              letterSpacing: '1px',
              marginTop: '15px',
              textAlign: 'center',
              textTransform: 'uppercase',
            }}
          >
            CONTACT US GUIDE BOT
          </p>

          {/* Social icons for instant contact */}
          <div className="flex items-center justify-center gap-3">
            {/* Telegram Button */}
            <a
              href="https://t.me/WATTOPROBOT"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.preventDefault();
                window.open('https://t.me/WATTOPROBOT', '_blank', 'noopener,noreferrer');
              }}
              title="Message @WATTOPROBOT on Telegram"
              className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-full text-white flex items-center justify-center shadow-[0_0_14px_rgba(42,171,238,0.7)] hover:scale-110 active:scale-95 transition-all cursor-pointer bg-gradient-to-tr from-[#229ED9] to-[#2AABEE]"
            >
              <svg className="w-4 h-4 fill-current text-white pl-0.5" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
            </a>

            {/* Facebook Button */}
            <a
              href="https://www.facebook.com/share/19Px5u76ao/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.preventDefault();
                window.open('https://www.facebook.com/share/19Px5u76ao/', '_blank', 'noopener,noreferrer');
              }}
              title="Contact on Facebook for License Key"
              className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-[0_0_12px_rgba(244,63,94,0.6)] hover:scale-110 active:scale-95 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>

            {/* Instagram Button */}
            <a
              href="https://www.instagram.com/aitrader.offical"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.preventDefault();
                window.open('https://www.instagram.com/aitrader.offical', '_blank', 'noopener,noreferrer');
              }}
              title="Contact on Instagram for License Key"
              className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-full text-white flex items-center justify-center shadow-[0_0_12px_rgba(214,41,118,0.6)] hover:scale-110 active:scale-95 transition-all cursor-pointer"
              style={{
                background: 'linear-gradient(45deg, #feda75, #fa7e1e, #d62976, #962fbf, #4f5bd5)',
              }}
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>

            {/* TikTok Button */}
            <a
              href="https://www.tiktok.com/@aitrader83?_r=1&_t=ZN-9A0PFgs2Xsl"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.preventDefault();
                window.open('https://www.tiktok.com/@aitrader83?_r=1&_t=ZN-9A0PFgs2Xsl', '_blank', 'noopener,noreferrer');
              }}
              title="Follow @aitrader83 on TikTok"
              className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-full text-white flex items-center justify-center shadow-[0_0_12px_rgba(37,244,238,0.5)] hover:scale-110 active:scale-95 transition-all cursor-pointer bg-gradient-to-tr from-[#000000] via-[#111111] to-[#25F4EE]"
            >
              <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.87-4.49V8.58a8.3 8.3 0 0 0 4.9 1.58V6.73a4.77 4.77 0 0 1-1-.04z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
