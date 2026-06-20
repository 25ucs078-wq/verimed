import React, { useEffect, useState } from 'react';
import { Shield, ShieldAlert, Award, TrendingUp, ChevronRight, Activity } from 'lucide-react';
import { useVeriMedStore } from '../lib/store';
import { api } from '../lib/api';
import { GlassCard } from '../components/GlassCard';

interface DashboardProps {
  setActiveTab: (tab: string) => void;
  setSelectedScanResult: (res: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  setActiveTab,
  setSelectedScanResult,
}) => {
  const { isOnline, recentScans, pendingOutboxCount } = useVeriMedStore();
  const [risks, setRisks] = useState<any[]>([]);

  useEffect(() => {
    const fetchRisks = async () => {
      if (isOnline) {
        try {
          const res = await api.getRiskMap();
          setRisks(res);
        } catch (e) {
          console.error(e);
        }
      }
    };
    fetchRisks();
  }, [isOnline]);

  const defaultRisks = [
    { region: 'Sub-Saharan Africa', threat_index: 0.85, trend: 'increasing' },
    { region: 'South Asia', threat_index: 0.72, trend: 'stable' },
    { region: 'East Asia', threat_index: 0.68, trend: 'increasing' },
    { region: 'North America', threat_index: 0.45, trend: 'decreasing' },
  ];

  const riskData = risks.length > 0 ? risks : defaultRisks;

  const totalScans = recentScans.length;
  const counterfeitBlocked = recentScans.filter((s) => !s.isAuthentic).length;

  const handleViewResult = (scan: any) => {
    // Reconstruct detailed result structure from basic history row
    const mockDetailedResult = {
      is_authentic: scan.isAuthentic,
      confidence_score: scan.isAuthentic ? 0.96 : 0.42,
      deviations: {
        logo: scan.isAuthentic ? 0.02 : 0.09,
        typography: scan.isAuthentic ? 0.015 : 0.05,
        color_gamut: scan.isAuthentic ? 0.03 : 0.12,
      },
      flagged_categories: scan.isAuthentic ? [] : ['Logo Print Alignment', 'Typography Inconsistency'],
      brand_name: scan.brandName,
      generic_name: scan.genericName,
      manufacturer_name: scan.manufacturerName,
      batch_number: scan.batchNumber,
      qr_scan: scan.scanType === 'qr',
      signature_valid: scan.isAuthentic,
      batch_status: scan.isAuthentic ? 'active' : 'recalled',
      signature_token: scan.isAuthentic ? 'v1_sig_cached_mock' : 'v1_sig_invalid',
    };

    setSelectedScanResult(mockDetailedResult);
  };

  return (
    <div className="space-y-6">
      {/* Upper header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-heading">
            Ecosystem Overview
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time medicine integrity and counterfeit monitoring portal
          </p>
        </div>

        {/* Sync alert pill */}
        {pendingOutboxCount > 0 && (
          <div className="animate-pulse bg-brand-red/10 border border-brand-red/20 rounded-full px-3 py-1 text-xs text-brand-red font-semibold flex items-center gap-1.5">
            <Activity size={12} /> {pendingOutboxCount} Outbox Items Queued
          </div>
        )}
      </div>

      {/* Hero statistics widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <GlassCard className="p-6 flex items-center justify-between" intensity="mid">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Verifications
            </span>
            <h2 className="text-4xl font-extrabold tracking-tight text-brand-teal font-heading">
              {totalScans}
            </h2>
            <p className="text-xs text-slate-500 font-medium">Scans conducted globally</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center text-brand-teal">
            <Award size={28} />
          </div>
        </GlassCard>

        <GlassCard className="p-6 flex items-center justify-between" intensity="mid">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Counterfeits Intercepted
            </span>
            <h2 className="text-4xl font-extrabold tracking-tight text-brand-red font-heading">
              {counterfeitBlocked}
            </h2>
            <p className="text-xs text-slate-500 font-medium">Flagged packaging deviations</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red">
            <ShieldAlert size={28} />
          </div>
        </GlassCard>
      </div>

      {/* Quick launch routes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <GlassCard 
          className="p-6 cursor-pointer hover:border-brand-teal/30 hover:bg-brand-teal/[0.02]"
          intensity="low"
          onClick={() => setActiveTab('scan')}
        >
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-2">
              <Shield size={18} className="text-brand-teal" /> Verify Drug Packaging
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Analyze structural print parameters, alignment tolerances, and holograms using packaging computer vision.
            </p>
          </div>
        </GlassCard>

        <GlassCard 
          className="p-6 cursor-pointer hover:border-brand-teal/30 hover:bg-brand-teal/[0.02]"
          intensity="low"
          onClick={() => setActiveTab('scan')}
        >
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-2">
              <Activity size={18} className="text-brand-teal" /> Verify QR SmartID
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Decrypt serialization codes and verify batch status against national regulatory databases.
            </p>
          </div>
        </GlassCard>
      </div>

      {/* Regional Risk slider */}
      <div>
        <h3 className="text-lg font-bold text-slate-100 mb-4 font-heading">Regional Threat Indexes</h3>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
          {riskData.map((item, idx) => {
            const isHigh = item.threat_index >= 0.70;
            const colorClass = isHigh ? 'text-brand-red' : 'text-brand-amber';

            return (
              <GlassCard key={idx} className="p-5 min-w-[150px] shrink-0" intensity="low">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate block">
                  {item.region}
                </span>
                <span className={`text-3xl font-extrabold tracking-tight mt-1.5 block font-heading ${colorClass}`}>
                  {Math.round(item.threat_index * 100)}%
                </span>
                <span className="text-[9px] text-slate-500 font-bold uppercase mt-1 block">
                  Trend: {item.trend}
                </span>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* Recent scan logs */}
      <div>
        <h3 className="text-lg font-bold text-slate-100 mb-4 font-heading">Recent Activities</h3>
        {recentScans.length > 0 ? (
          <div className="space-y-3">
            {recentScans.map((scan) => {
              const isOk = scan.isAuthentic;
              return (
                <GlassCard 
                  key={scan.id} 
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.02]"
                  intensity="low"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base border
                      ${isOk 
                        ? 'border-brand-teal/20 text-brand-teal bg-brand-teal/5' 
                        : 'border-brand-red/20 text-brand-red bg-brand-red/5'}`}
                    >
                      {isOk ? '✓' : '⚠'}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-200">{scan.brandName}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Batch: {scan.batchNumber} • {scan.genericName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <span className={`text-xs font-semibold ${isOk ? 'text-brand-teal' : 'text-brand-red'}`}>
                        {isOk ? 'Verified Safe' : 'Suspect Fake'}
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        {new Date(scan.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <button 
                      onClick={() => handleViewResult(scan)}
                      className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        ) : (
          <GlassCard className="p-8 text-center text-slate-500 font-medium" intensity="low">
            No recent verification scans conducted.
          </GlassCard>
        )}
      </div>
    </div>
  );
};
