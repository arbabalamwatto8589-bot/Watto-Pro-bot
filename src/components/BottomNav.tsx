import React from 'react';
import { Home, Layers, History, BarChart3, Settings } from 'lucide-react';
import { NavTab } from './Sidebar';

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'pairs', label: 'Pairs', icon: Layers },
    { id: 'history', label: 'History', icon: History },
    { id: 'statistics', label: 'Stats', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#060D1A]/98 backdrop-blur-lg border-t border-cyan-500/30 px-2 py-1.5 shadow-[0_-5px_20px_rgba(0,0,0,0.6)]">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id as NavTab)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-all ${
                isActive
                  ? 'text-cyan-400 scale-105 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-md ${isActive ? 'bg-cyan-500/20 text-cyan-300' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
