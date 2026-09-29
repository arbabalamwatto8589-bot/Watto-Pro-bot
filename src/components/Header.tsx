import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Crown, 
  Clock, 
  Settings, 
  Activity,
  Zap
} from 'lucide-react';
import traderProfileImg from '../assets/images/wattopro_trader_official_1790201299660.jpg';
import { SoundButton } from './SoundButton';
import { BrokerType, MarketMode } from '../types/trading';

interface HeaderProps {
  isLive: boolean;
  isDemo: boolean;
  selectedBroker: BrokerType;
  marketMode?: MarketMode;
  onSelectBroker: (broker: BrokerType) => void;
  onOpenSettings: () => void;
  onOpenBrokerModal: (broker: BrokerType) => void;
}

export const Header: React.FC<HeaderProps> = ({
  isLive,
  isDemo,
  selectedBroker,
  marketMode = 'NORMAL',
  onSelectBroker,
  onOpenSettings,
  onOpenBrokerModal,
}) => {
  const [utcTime, setUtcTime] = useState<string>('');
  const [utcDate, setUtcDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcDate(now.toISOString().slice(0, 10));
      setUtcTime(now.toTimeString().slice(0, 8));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const brokerLatencyLabel = 'WATTOPro Live Feed: ACTIVE - Real Market 24/7';

  return (
    <header className="relative w-full border-b border-cyan-500/20 bg-[#060D1A]/95 backdrop-blur-md z-20">
      {/* Top Bar with Brand, Middle Flag (Left 20%), 4 Social Icons (Right), UTC Clock above Brokers */}
      <div className="max-w-[1680px] mx-auto px-3 sm:px-5 py-2.5">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3 lg:gap-4">
          
          {/* ========================================================
              LEFT SIDE: Brand Logo + [Telegram Guide] with "Guide this bot"
             ======================================================== */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3">
              
              {/* Official Trader Profile Image Avatar */}
              <div className="relative shrink-0 group">
                <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-xl overflow-hidden border-2 border-cyan-400 shadow-[0_0_18px_rgba(6,182,212,0.5)] bg-slate-950 ring-2 ring-cyan-500/30">
                  <img 
                    src={traderProfileImg} 
                    alt="WATTOPro Official Trader Profile"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <span 
                  className="w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#060D1A] absolute -bottom-0.5 -right-0.5 animate-pulse shadow-[0_0_6px_#00ff00]" 
                  title="Official Trader Online" 
                />
              </div>

              {/* Brand Typography */}
              <div className="flex flex-col">
                <div 
                  className="flex items-center gap-1.5 cursor-pointer group"
                  title="WATTOPro Official Profile"
                >
                  <span className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent group-hover:brightness-125 transition-all" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                    WATTO<span className="text-cyan-400">Pro</span>
                  </span>
                  <Crown className="w-4 h-4 text-amber-400 inline-block animate-pulse" />
                </div>
                <div className="flex items-center gap-2 text-[10px] tracking-wider text-cyan-300/90 uppercase font-semibold">
                  <span>Trading Signal Bot</span>
                  <span>•</span>
                  <span className="text-amber-300 italic font-bold">Trade Smarter • Not Harder</span>
                </div>
              </div>

              {/* [Telegram Guide] - https://t.me/WATTOPROBOT - with "Guide this bot" label */}
              <a
                href="https://t.me/WATTOPROBOT"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.preventDefault();
                  window.open('https://t.me/WATTOPROBOT', '_blank', 'noopener,noreferrer');
                }}
                title="Click to Message @WATTOPROBOT for Bot Guide & Access"
                className="flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-xl bg-[#091528]/90 hover:bg-[#0c1c36] border border-[#2AABEE]/50 hover:border-[#2AABEE] shadow-[0_0_14px_rgba(42,171,238,0.3)] hover:shadow-[0_0_20px_rgba(42,171,238,0.6)] transition-all duration-200 cursor-pointer group shrink-0 select-none ml-1 sm:ml-2"
              >
                {/* Top: Telegram logo 38px blue gradient with online pulse */}
                <div className="relative w-[38px] h-[38px] min-w-[38px] min-h-[38px] rounded-full bg-gradient-to-tr from-[#229ED9] to-[#2AABEE] text-white flex items-center justify-center shadow-[0_0_12px_rgba(42,171,238,0.7)] group-hover:scale-105 transition-transform">
                  <svg className="w-[22px] h-[22px] fill-current text-white pl-0.5" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  <span 
                    className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#091528] absolute -bottom-0.5 -right-0.5 animate-pulse shadow-[0_0_6px_#00ff00]" 
                    title="Online Now"
                  />
                </div>

                {/* Line 1: "Guide this bot" (9px white bold) */}
                <span className="text-[9px] text-white font-bold tracking-tight leading-tight whitespace-nowrap mt-0.5 group-hover:text-cyan-200">
                  Guide this bot
                </span>
                {/* Line 2: "Message Us" (7px blue #2AABEE) */}
                <span className="text-[7px] text-[#2AABEE] font-extrabold uppercase tracking-wider leading-none">
                  Message Us
                </span>
              </a>
            </div>

            {/* Mobile quick actions */}
            <div className="flex items-center gap-2 lg:hidden">
              <SoundButton size="sm" />
              <button 
                onClick={onOpenSettings}
                className="p-2 rounded-lg bg-slate-800/80 text-cyan-400 border border-cyan-500/30 hover:bg-slate-700/80 transition-colors cursor-pointer"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* =========================================================================
              HORIZONTAL LINE: [ Pakistan Badge - LEFT ] ........ [ FB ][ IG ][ TG ][ TikTok ] - RIGHT
              - Flag side pe (left shifted 20%), 180px x 55px medium size
              - 4 social icons side pe (right side), all 44px x 44px in one row directly across
             ========================================================================= */}
          <div className="flex-1 w-full lg:w-auto flex items-center justify-between gap-3 sm:gap-6 px-1 sm:px-3">
            
            {/* 1. Pakistan Zindabad badge: shifted LEFT (approx 20%), size 180px x 55px */}
            <div 
              className="w-[180px] h-[55px] min-w-[180px] min-h-[55px] flex items-center justify-center gap-2.5 px-3 py-1.5 rounded-xl bg-gradient-to-b from-[#061424]/90 to-[#040B15]/95 border border-emerald-500/40 hover:border-emerald-400/70 shadow-[0_0_18px_rgba(0,255,0,0.22)] transition-all shrink-0 cursor-default select-none"
              title="پاکستان زندہ باد — Official WATTOPro Brand"
            >
              {/* Waving Pakistan flag animation (34px x 24px) */}
              <div className="w-[34px] h-[24px] relative flex items-center justify-center shrink-0">
                <svg
                  viewBox="0 0 36 26"
                  className="w-[34px] h-[24px] rounded-[3px] shadow-[0_0_10px_rgba(0,255,0,0.5)] animate-flag-wave shrink-0 overflow-hidden"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Pakistan Green Field */}
                  <rect width="36" height="26" fill="#01411C" rx="2" />
                  {/* White Stripe (1/4 width on hoist side) */}
                  <rect width="9" height="26" fill="#FFFFFF" rx="2" />
                  <rect x="7" width="2" height="26" fill="#FFFFFF" />
                  {/* White Crescent Moon */}
                  <circle cx="21" cy="13" r="5.8" fill="#FFFFFF" />
                  {/* Green inner circle to form crescent */}
                  <circle cx="22.6" cy="11.4" r="5.0" fill="#01411C" />
                  {/* 5-pointed Star tilted at ~45 degrees */}
                  <polygon
                    points="23.8,7.8 24.8,10.2 27.2,10.2 25.2,11.6 26.0,14.0 23.8,12.5 21.6,14.0 22.4,11.6 20.4,10.2 22.8,10.2"
                    fill="#FFFFFF"
                  />
                </svg>
              </div>

              {/* 🇵🇰 پاکستان زندہ باد Glowing Calligraphy */}
              <span
                className="text-[13px] sm:text-[14px] font-bold tracking-[0.5px] text-white urdu-glow-pulse whitespace-nowrap leading-tight"
                style={{
                  fontFamily: "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', 'Urdu Typesetting', Tahoma, sans-serif",
                }}
                dir="rtl"
              >
                🇵🇰 پاکستان زندہ باد
              </span>
            </div>

            {/* 2. 4 Social Icons (Facebook, Instagram, Telegram, TikTok): all 44px x 44px in ONE line on RIGHT side */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              
              {/* 1. Facebook: 44px x 44px circular, blue gradient */}
              <a
                href="https://www.facebook.com/share/19Px5u76ao/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.preventDefault();
                  window.open('https://www.facebook.com/share/19Px5u76ao/', '_blank', 'noopener,noreferrer');
                }}
                title="Follow WATTOPro on Facebook"
                className="w-[44px] h-[44px] min-w-[44px] min-h-[44px] rounded-full text-white flex items-center justify-center shadow-[0_0_15px_rgba(24,119,242,0.6)] hover:shadow-[0_0_22px_rgba(24,119,242,0.95)] hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer bg-gradient-to-tr from-[#1877F2] to-[#3b82f6]"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              {/* 2. Instagram: 44px x 44px circular, pink gradient */}
              <a
                href="https://www.instagram.com/aitrader.offical"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.preventDefault();
                  window.open('https://www.instagram.com/aitrader.offical', '_blank', 'noopener,noreferrer');
                }}
                title="Follow @aitrader.offical on Instagram"
                className="w-[44px] h-[44px] min-w-[44px] min-h-[44px] rounded-full text-white flex items-center justify-center shadow-[0_0_15px_rgba(214,41,118,0.6)] hover:shadow-[0_0_22px_rgba(214,41,118,0.95)] hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
                style={{
                  background: 'linear-gradient(45deg, #feda75, #fa7e1e, #d62976, #962fbf, #4f5bd5)',
                }}
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              {/* 3. Telegram Small: 44px x 44px circular, blue #2AABEE */}
              <a
                href="https://t.me/WATTOPROBOT"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.preventDefault();
                  window.open('https://t.me/WATTOPROBOT', '_blank', 'noopener,noreferrer');
                }}
                title="Message @WATTOPROBOT on Telegram"
                className="w-[44px] h-[44px] min-w-[44px] min-h-[44px] rounded-full text-white flex items-center justify-center shadow-[0_0_15px_rgba(42,171,238,0.7)] hover:shadow-[0_0_22px_rgba(42,171,238,0.95)] hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer bg-gradient-to-tr from-[#229ED9] to-[#2AABEE]"
              >
                <svg className="w-5 h-5 fill-current text-white pl-0.5" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </a>

              {/* 4. NEW TikTok: 44px x 44px circular, black gradient #000000 to #25F4EE with white music note icon */}
              <a
                href="https://www.tiktok.com/@aitrader83?_r=1&_t=ZN-9A0PFgs2Xsl"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.preventDefault();
                  window.open('https://www.tiktok.com/@aitrader83?_r=1&_t=ZN-9A0PFgs2Xsl', '_blank', 'noopener,noreferrer');
                }}
                title="Follow @aitrader83 on TikTok"
                className="w-[44px] h-[44px] min-w-[44px] min-h-[44px] rounded-full text-white flex items-center justify-center shadow-[0_0_15px_rgba(37,244,238,0.6)] hover:shadow-[0_0_24px_rgba(255,255,255,0.95)] hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer bg-gradient-to-tr from-[#000000] via-[#111111] to-[#25F4EE] border border-cyan-400/40 hover:border-white"
              >
                {/* TikTok white music note icon */}
                <svg className="w-5 h-5 fill-current text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.87-4.49V8.58a8.3 8.3 0 0 0 4.9 1.58V6.73a4.77 4.77 0 0 1-1-.04z"/>
                </svg>
              </a>
            </div>

          </div>

          {/* ========================================================
              RIGHT SIDE: Time UTC + Sound & Settings Controls
              (Broker selector completely removed from top bar)
             ======================================================== */}
          <div className="flex items-center justify-center lg:justify-end gap-2.5 shrink-0 w-full lg:w-auto">
            {/* UTC Clock */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0A1629] border border-cyan-500/30 text-xs shadow-sm">
              <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <div className="flex items-center gap-2 font-tabular">
                <span className="text-[10px] text-slate-400 leading-none">{utcDate || '2026-09-25'}</span>
                <span className="text-cyan-300 font-bold tracking-wide leading-tight">
                  {utcTime || '00:00:00'} <span className="text-[9px] text-slate-400 font-normal">(UTC)</span>
                </span>
              </div>
            </div>

            {/* Sound Button (Desktop) */}
            <div className="hidden lg:flex items-center">
              <SoundButton size="md" />
            </div>

            {/* Settings Icon (Desktop) */}
            <button
              type="button"
              onClick={onOpenSettings}
              className="hidden lg:flex p-2 rounded-xl bg-[#0A1629] text-slate-300 hover:text-white border border-cyan-500/30 hover:border-cyan-400 transition-colors shadow-sm cursor-pointer"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Real-time Ticker Bar with Status Badge */}
      <div className="w-full bg-[#040913] border-t border-cyan-500/15 py-1 px-3 sm:px-5 flex items-center justify-between text-[11px] text-slate-400 overflow-hidden font-tabular">
        <div className="flex items-center gap-4 animate-marquee whitespace-nowrap">
          {/* Main badge: FREE LIVE FEED ACTIVE with green dot + small red blinking popup badge "LIVE FEED" with gap 8px */}
          <div className="inline-flex items-center gap-[8px]">
            <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
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
          <span className="text-slate-500">•</span>
          <span className="text-cyan-300 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            {brokerLatencyLabel}
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300">Active Broker: <strong className="text-white">{selectedBroker.toUpperCase()}</strong></span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300">Confluence: EMA 9/21 + RSI 14 + MACD + Trend</span>
          <span className="text-slate-500">•</span>
          <span className="text-amber-300">
            {marketMode === 'OTC' ? '22 Active OTC Currency Pairs (24/7 Weekend Ready)' : '10 Active Currency Pairs (Normal Interbank)'}
          </span>
        </div>

        <div className="hidden md:flex items-center gap-2.5 shrink-0 pl-4 bg-[#040913] z-10">
          <div className="inline-flex items-center gap-[8px]">
            <span className="text-xs px-2.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/60 text-emerald-400 font-black flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
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
          <span className="text-xs font-mono font-bold text-cyan-300">
            {brokerLatencyLabel}
          </span>
        </div>
      </div>
    </header>
  );
};
