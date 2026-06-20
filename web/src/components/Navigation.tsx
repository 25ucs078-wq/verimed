import React from 'react';
import { 
  LayoutDashboard, 
  ScanLine, 
  Map, 
  BellRing, 
  RefreshCw, 
  UserCog,
  Database
} from 'lucide-react';
import { colors } from '../theme/colors';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOnline: boolean;
  pendingOutboxCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  isOnline,
  pendingOutboxCount,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'scan', label: 'Scanner', icon: ScanLine },
    { id: 'map', label: 'Risk Radar', icon: Map },
    { id: 'alerts', label: 'Alerts Hub', icon: BellRing },
    { id: 'sync', label: 'Sync Center', icon: RefreshCw, badge: pendingOutboxCount > 0 ? pendingOutboxCount : undefined },
    { id: 'profile', label: 'Operator', icon: UserCog },
  ];

  return (
    <>
      {/* 1. Desktop Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-64 fixed top-0 bottom-0 left-0 bg-[#0c0e22]/50 border-r border-glass-border p-6 backdrop-blur-lg">
        {/* Brand logo header */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-teal to-brand-violet flex items-center justify-center font-bold text-slate-900">
            VM
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white">
            Veri<span className="text-brand-teal">Med</span>
          </span>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 flex flex-col gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isFocused = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`
                  flex items-center justify-between w-full px-4 py-3.5 rounded-xl font-semibold text-sm
                  transition-all duration-200 group
                  ${isFocused 
                    ? 'bg-brand-teal/10 text-brand-teal border border-brand-teal/20' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'}
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className="transition-transform group-hover:scale-105" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="bg-brand-red text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Connection Widget Footer */}
        <div className="border-t border-white/5 pt-4">
          <div className="flex items-center gap-3 bg-white/5 border border-glass-border rounded-2xl p-4">
            <div 
              className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-brand-teal shadow-[0_0_8px_#2de0c2]' : 'bg-brand-amber shadow-[0_0_8px_#ffb648]'}`} 
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">
                {isOnline ? 'Ecosystem Online' : 'Offline Mirror'}
              </p>
              <p className="text-[10px] text-slate-500 font-medium">
                {isOnline ? 'Connected to primary PG' : 'Using Local SQLite Cache'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. Floating Bottom Glass Tab Bar (Mobile layout viewport) */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 h-18 z-40 rounded-3xl overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.5)] border border-glass-border">
        {/* blur surface */}
        <div className="absolute inset-0 bg-[#0c0e22]/70 backdrop-blur-md" />
        
        <nav className="relative z-10 flex h-full justify-around items-center px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isFocused = activeTab === item.id;
            const color = isFocused ? '#2DE0C2' : '#94A3B8';

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="flex flex-col items-center justify-center p-2 relative"
              >
                <div className="relative">
                  <Icon size={20} color={color} className="transition-all duration-200" />
                  {item.badge !== undefined && (
                    <span className="absolute -top-1.5 -right-1.5 bg-brand-red text-white text-[8px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span 
                  className="text-[9px] font-bold mt-1 tracking-wide"
                  style={{ color }}
                >
                  {item.label.split(' ')[0]}
                </span>
                
                {/* Active bottom glow dot */}
                {isFocused && (
                  <div className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-brand-teal shadow-[0_0_8px_#2de0c2]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
};
