import React, { useState } from 'react';
import { Database, RefreshCw, CheckCircle, Wifi, WifiOff } from 'lucide-react';
import { useVeriMedStore } from '../lib/store';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';

export const SyncCenter: React.FC = () => {
  const {
    isOnline,
    lastSyncTime,
    pendingOutboxCount,
    cachedMedsCount,
    cachedBatchesCount,
    syncWithBackend,
  } = useVeriMedStore();

  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    if (!isOnline) {
      alert("No active backend connection. Toggle Online State in Operator Settings to sync outbox logs.");
      return;
    }

    setSyncing(true);
    try {
      // Simulate sync delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await syncWithBackend();
      alert("Sync completed! Outbox uploaded and local database cache refreshed.");
    } catch (e: any) {
      alert(e.message || "Failed to execute sync.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white font-heading">
          Sync & Cache Center
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Synchronize offline verification outboxes and refresh local database keys
        </p>
      </div>

      {/* Connection widget card */}
      <GlassCard className="p-6 text-center space-y-4" intensity="mid">
        <div className="flex justify-center">
          <div className={`p-4 rounded-full border 
            ${isOnline 
              ? 'border-brand-teal/20 text-brand-teal bg-brand-teal/5 shadow-[0_0_15px_rgba(45,224,194,0.15)]' 
              : 'border-brand-amber/20 text-brand-amber bg-brand-amber/5'}`}
          >
            {isOnline ? <Wifi size={36} /> : <WifiOff size={36} />}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-100">
            {isOnline ? 'Network Link Active' : 'Offline Mirror Active'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {pendingOutboxCount > 0 
              ? `${pendingOutboxCount} verification records logged offline awaiting upload.` 
              : 'All verification logs dispatched to backend.'}
          </p>
        </div>

        <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
          Last Synchronized: {lastSyncTime ? new Date(lastSyncTime).toLocaleString() : 'Never'}
        </div>
      </GlassCard>

      {/* Mirror cache statistics */}
      <h3 className="text-lg font-bold text-slate-100 mb-2 font-heading">Offline Cache DB</h3>
      <div className="grid grid-cols-2 gap-5">
        <GlassCard className="p-5 text-center" intensity="low">
          <Database size={20} className="text-brand-teal mx-auto mb-2" />
          <span className="text-3xl font-extrabold tracking-tight text-slate-200 block font-heading">
            {cachedMedsCount}
          </span>
          <span className="text-[10px] text-slate-400 font-bold uppercase mt-1 block">
            Medicines Cached
          </span>
        </GlassCard>

        <GlassCard className="p-5 text-center" intensity="low">
          <Database size={20} className="text-brand-teal mx-auto mb-2" />
          <span className="text-3xl font-extrabold tracking-tight text-slate-200 block font-heading">
            {cachedBatchesCount}
          </span>
          <span className="text-[10px] text-slate-400 font-bold uppercase mt-1 block">
            Batches Cached
          </span>
        </GlassCard>
      </div>

      {/* Sync CTA button */}
      <div className="pt-2">
        {syncing ? (
          <div className="flex flex-col items-center justify-center p-6 border border-dashed border-brand-teal/20 rounded-2xl bg-brand-teal/5">
            <div className="w-8 h-8 border-2 border-brand-teal border-t-transparent rounded-full animate-spin mb-3" />
            <span className="text-xs font-bold text-brand-teal uppercase tracking-wider">
              Draining outbox logs and refreshing cache tables...
            </span>
          </div>
        ) : (
          <GlassButton
            title={isOnline ? 'Execute Complete Sync' : 'Network Connection Required'}
            disabled={!isOnline}
            variant="primary"
            onClick={handleSync}
            className="w-full py-4 rounded-2xl"
            icon={<RefreshCw size={18} />}
          />
        )}
      </div>
    </div>
  );
};
