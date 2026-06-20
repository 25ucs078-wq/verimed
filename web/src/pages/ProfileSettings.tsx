import React from 'react';
import { User, Shield, AlertOctagon, HelpCircle } from 'lucide-react';
import { useVeriMedStore } from '../lib/store';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';

export const ProfileSettings: React.FC = () => {
  const { isOnline, setOnline, clearHistory, recentScans } = useVeriMedStore();

  const handleResetHistory = () => {
    if (window.confirm("Are you sure you want to clear your local verification history?")) {
      clearHistory();
      alert("Scan history cleared.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white font-heading">
          Operator Profile
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Monitor node settings, identity parameters, and offline-first simulation flags
        </p>
      </div>

      {/* Operator profile card */}
      <GlassCard className="p-6 flex flex-col items-center text-center space-y-4" intensity="mid">
        <div className="w-16 h-16 rounded-full bg-brand-violet/10 border border-brand-violet/20 flex items-center justify-center text-brand-violet text-xl font-extrabold">
          SJ
        </div>
        
        <div>
          <h2 className="text-xl font-bold text-slate-100">Dr. Sarah Jenkins</h2>
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Licensed Pharmacist</span>
        </div>

        <div className="w-full border-t border-white/5 pt-4 flex flex-col gap-2.5 text-xs">
          <div className="flex justify-between items-center text-slate-400">
            <span>License Serial</span>
            <span className="font-semibold text-slate-200">PH-IND-80221</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Terminal Node</span>
            <span className="font-semibold text-slate-200">St. Jude Clinic, Bangalore</span>
          </div>
        </div>
      </GlassCard>

      {/* Control settings */}
      <h3 className="text-lg font-bold text-slate-100 mb-2 font-heading">Developer Simulation Tools</h3>
      <GlassCard className="p-5 space-y-5" intensity="low">
        {/* Toggle switch online */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-200">Simulate Online Connection</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Force backend offline mode to evaluate local SQLite cache lookups.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={isOnline} 
              onChange={(e) => setOnline(e.target.checked)}
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-teal" />
          </label>
        </div>

        <div className="border-t border-white/5" />

        {/* Clear history */}
        <div className="flex items-center justify-between gap-6">
          <div>
            <h4 className="text-sm font-bold text-slate-200">Clear Local Scan History</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Clear the dashboard activity feed ({recentScans.length} items logged).
            </p>
          </div>
          <GlassButton
            title="Reset Feed"
            variant="danger"
            onClick={handleResetHistory}
            className="py-2.5 px-4 text-xs"
          />
        </div>
      </GlassCard>

      {/* Disclosures card */}
      <GlassCard className="p-5 flex items-start gap-4" intensity="low">
        <Shield size={22} className="text-slate-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Regulatory Compliance</h4>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            VeriMed operates in compliance with India DCGI Schedule H track-and-trace requirements and WHO counterfeit vigilance protocols. Scans are logged locally and synced with central manufacturer databases.
          </p>
        </div>
      </GlassCard>
    </div>
  );
};
