import React, { useEffect, useState } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import { useVeriMedStore } from '../lib/store';
import { api } from '../lib/api';
import { AlertCard } from '../components/AlertCard';
import { GlassCard } from '../components/GlassCard';

export const AlertsFeed: React.FC = () => {
  const { isOnline } = useVeriMedStore();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [activeSeverity, setActiveSeverity] = useState('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const fetchAlerts = async () => {
    setRefreshing(true);
    try {
      let data = [];
      if (isOnline) {
        data = await api.getAlerts();
      } else {
        // Fallback local alerts
        data = [
          {
            article_id: "local-1",
            publish_date: new Date().toISOString(),
            source: "Internal Risk System",
            title: "Offline Sync Warning: South Asia",
            severity_level: "HIGH",
            message_body: "Elevated failure signature counts logged in local workspace cache. Complete online synchronization in Sync Center to retrieve latest manufacturer public cryptographic keys.",
            targeted_batch_prefixes: ["CNT-"],
            targeted_manufacturers: []
          },
          {
            article_id: "local-2",
            publish_date: new Date(Date.now() - 86400000).toISOString(),
            source: "WHO Alert",
            title: "Falsified Rabies Vaccine Batches Detected in South Asia",
            severity_level: "CRITICAL",
            message_body: "The World Health Organization has issued an alert regarding falsified batches of Rabies Vaccines detected in regional clinical channels. Batch numbers RV-20612 and RV-20613 are reported to have failed laboratory authentication.",
            targeted_batch_prefixes: ["RV-206"],
            targeted_manufacturers: ["AsiaVax Corp"]
          }
        ];
      }
      setAlerts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [isOnline]);

  const filteredAlerts = alerts.filter((item) => {
    if (activeSeverity === 'ALL') return true;
    return item.severity_level.toUpperCase() === activeSeverity.toUpperCase();
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-heading">
            Regulatory News Hub
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Global safety alerts issued by WHO and national regulatory monitors
          </p>
        </div>
        <button
          onClick={fetchAlerts}
          className="p-2 border border-glass-border hover:border-brand-teal/30 hover:text-brand-teal hover:bg-brand-teal/5 transition-all rounded-xl text-slate-400"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Filter severity chips */}
      <div className="flex gap-3">
        {['ALL', 'CRITICAL', 'HIGH', 'INFO'].map((sev) => (
          <button
            key={sev}
            onClick={() => setActiveSeverity(sev)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all duration-200
              ${activeSeverity === sev 
                ? 'bg-brand-violet/10 text-brand-violet border-brand-violet/20' 
                : 'border-glass-border text-slate-400 hover:text-slate-200'}`}
          >
            {sev}
          </button>
        ))}
      </div>

      {/* Feed list */}
      <div className="space-y-4">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((item, idx) => (
            <AlertCard
              key={item.article_id || idx}
              title={item.title}
              source={item.source}
              severity={item.severity_level}
              body={item.message_body}
              date={new Date(item.publish_date).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
              batches={item.targeted_batch_prefixes}
              manufacturers={item.targeted_manufacturers}
            />
          ))
        ) : (
          <GlassCard className="p-8 text-center text-slate-500 font-medium" intensity="low">
            No active safety alerts logged for this severity level.
          </GlassCard>
        )}
      </div>
    </div>
  );
};
