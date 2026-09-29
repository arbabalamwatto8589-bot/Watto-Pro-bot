import React from 'react';
import { 
  Home, 
  Radio, 
  Layers, 
  History, 
  BarChart3, 
  Settings, 
  HelpCircle, 
  Crown, 
  Sparkles
} from 'lucide-react';
import traderProfileImg from '../assets/images/wattopro_trader_official_1790201299660.jpg';

export type NavTab = 'home' | 'signals' | 'pairs' | 'history' | 'statistics' | 'settings' | 'help';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onUpgradeClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onUpgradeClick,
}) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'signals', label: 'Live Signals', icon: Radio },
    { id: 'pairs', label: 'Pairs', icon: Layers },
    { id: 'history', label: 'History', icon: History },
    { id: 'statistics', label: 'Statistics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help', icon: HelpCircle },
  ] as const;

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 p-4 gap-4 border-r border-cyan-500/20 bg-[#050C17]/90 min-h-[calc(100vh-105px)]">
      {/* Official WATTOPro Brand Profile Card in Desktop Sidebar */}
      <div className="p-3 rounded-2xl bg-gradient-to-br from-[#0B1A2F] via-[#071324] to-[#0A1629] border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.18)] flex items-center gap-3 relative overflow-hidden group">
        <div className="relative shrink-0">
          <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)] bg-slate-950 ring-2 ring-cyan-500/30">
            <img 
              src={traderProfileImg} 
              alt="WATTOPro Official Trader Profile"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-110"
            />
          </div>
          <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#071324] absolute bottom-0 right-0 animate-pulse" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <span className="font-extrabold text-sm text-white tracking-wide truncate">
              WATTO<span className="text-cyan-400">Pro</span>
            </span>
            <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          </div>
          <div className="text-[10px] text-cyan-300 font-extrabold uppercase tracking-wider truncate">
            TRADING SIGNAL BOT
          </div>
          <div className="text-[9px] text-amber-300/90 italic font-semibold truncate">
            Trade Smarter • Not Harder
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col gap-1.5" aria-label="Main Navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id as NavTab)}
              className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 text-left cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-[0_0_20px_rgba(6,182,212,0.4)] border border-cyan-300/40 translate-x-0.5'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-cyan-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Pro Version Promo Card */}
      <div className="mt-2 p-4 rounded-2xl bg-gradient-to-b from-[#162136] to-[#0D1524] border border-amber-400/30 shadow-[0_0_25px_rgba(245,158,11,0.12)]">
        <div className="flex items-center gap-2 mb-2">
          <Crown className="w-5 h-5 text-amber-400" />
          <div className="font-bold text-sm text-white flex items-center gap-1.5">
            WATTO<span className="text-amber-400">Pro</span>
          </div>
        </div>
        <div className="text-xs font-semibold text-amber-300 mb-3">
          Pro Version Activated
        </div>

        <ul className="space-y-1.5 text-xs text-slate-300 mb-4">
          <li className="flex items-center gap-2 text-slate-200">
            <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">✓</span>
            <span>All 10 Forex Pairs</span>
          </li>
          <li className="flex items-center gap-2 text-slate-200">
            <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">✓</span>
            <span>Real-time Multi-EMA</span>
          </li>
          <li className="flex items-center gap-2 text-slate-200">
            <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">✓</span>
            <span>Strict Normal Forex (No OTC)</span>
          </li>
          <li className="flex items-center gap-2 text-slate-200">
            <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">✓</span>
            <span>Dynamic Signal Expiry</span>
          </li>
        </ul>

        <button
          onClick={onUpgradeClick}
          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 font-bold text-xs tracking-wider uppercase shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-slate-950" />
          <span>PRO FEATURES</span>
        </button>
      </div>

      {/* Bot Status Card with Circular Avatar */}
      <div className="p-3 rounded-xl bg-[#091322] border border-cyan-500/25 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden border border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)] shrink-0 bg-slate-950">
          <img 
            src={traderProfileImg} 
            alt="WATTOPro Avatar"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-top"
          />
        </div>
        <div className="leading-tight">
          <div className="text-xs font-bold text-white">WATTOPro</div>
          <div className="text-[11px] text-slate-400">Signal Bot v2.4</div>
        </div>
        <div className="ml-auto flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Online</span>
        </div>
      </div>

      {/* Motivational Badge */}
      <div className="mt-auto p-3.5 rounded-xl bg-gradient-to-br from-[#0B172C] to-[#070F1D] border border-cyan-500/20 text-center">
        <div className="flex items-center justify-center gap-1.5 text-amber-400 mb-1">
          <Crown className="w-4 h-4" />
        </div>
        <div className="text-sm font-bold tracking-wide italic text-cyan-200">
          "Discipline Creates Freedom"
        </div>
        <div className="text-[10px] text-slate-400 mt-0.5">
          Execute with Patience & Strategy
        </div>
      </div>
    </aside>
  );
};
