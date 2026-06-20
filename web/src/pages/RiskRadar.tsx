import React, { useEffect, useState } from 'react';
import { ShieldAlert, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { useVeriMedStore } from '../lib/store';
import { api } from '../lib/api';
import { GlassCard } from '../components/GlassCard';
import { BottomSheet } from '../components/BottomSheet';
import { MapView } from '../components/MapView';

interface MapPoint {
  region: string;
  threat_index: number;
  counterfeit_percent: number;
  seizure_count: number;
  trend: string;
  x: number;
  y: number;
}

const REGIONS_GEOMETRY = [
  { region: "North America", x: 100, y: 120 },
  { region: "Sub-Saharan Africa", x: 230, y: 260 },
  { region: "South Asia", x: 340, y: 200 },
  { region: "East Asia", x: 420, y: 160 }
];

export const RiskRadar: React.FC = () => {
  const { isOnline } = useVeriMedStore();
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [filterMode, setFilterMode] = useState<'all' | 'high' | 'moderate'>('all');
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRiskMap = async () => {
    setRefreshing(true);
    try {
      let riskData = [];
      if (isOnline) {
        riskData = await api.getRiskMap();
      } else {
        // Fallback local mock values
        riskData = [
          { region: 'Sub-Saharan Africa', threat_index: 0.85, counterfeit_percent: 18.5, seizure_count: 450, trend: 'increasing' },
          { region: 'South Asia', threat_index: 0.72, counterfeit_percent: 12.3, seizure_count: 890, trend: 'stable' },
          { region: 'East Asia', threat_index: 0.68, counterfeit_percent: 9.8, seizure_count: 1200, trend: 'increasing' },
          { region: 'North America', threat_index: 0.45, counterfeit_percent: 2.1, seizure_count: 120, trend: 'decreasing' }
        ];
      }

      // Map geometry coords
      const mappedPoints = REGIONS_GEOMETRY.map((geom) => {
        const item = riskData.find((r: any) => r.region === geom.region) || {
          threat_index: 0.2, counterfeit_percent: 1, seizure_count: 0, trend: 'stable'
        };
        return {
          ...geom,
          ...item
        } as MapPoint;
      });

      setPoints(mappedPoints);
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRiskMap();
  }, [isOnline]);

  const handleSelectPoint = (point: MapPoint) => {
    setSelectedPoint(point);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-heading">
            Threat Map Radar
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Geospatial intelligence showing active counterfeit seizure areas
          </p>
        </div>
        <button
          onClick={fetchRiskMap}
          className="p-2 border border-glass-border hover:border-brand-teal/30 hover:text-brand-teal hover:bg-brand-teal/5 transition-all rounded-xl text-slate-400"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Filter Mode Row */}
      <div className="flex gap-3">
        <button
          onClick={() => setFilterMode('all')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all duration-200
            ${filterMode === 'all' 
              ? 'bg-brand-teal/10 text-brand-teal border-brand-teal/20' 
              : 'border-glass-border text-slate-400 hover:text-slate-200'}`}
        >
          All Clusters
        </button>
        <button
          onClick={() => setFilterMode('high')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all duration-200
            ${filterMode === 'high' 
              ? 'bg-brand-red/10 text-brand-red border-brand-red/20' 
              : 'border-glass-border text-slate-400 hover:text-slate-200'}`}
        >
          High Threat (≥70%)
        </button>
        <button
          onClick={() => setFilterMode('moderate')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all duration-200
            ${filterMode === 'moderate' 
              ? 'bg-brand-amber/10 text-brand-amber border-brand-amber/20' 
              : 'border-glass-border text-slate-400 hover:text-slate-200'}`}
        >
          Moderate Threat
        </button>
      </div>

      {/* Interactive Map View */}
      <MapView
        points={points}
        onSelectPoint={handleSelectPoint}
        filterMode={filterMode}
      />

      {/* Drawer overlay for region stats */}
      <BottomSheet
        visible={selectedPoint !== null}
        onClose={() => setSelectedPoint(null)}
        title={selectedPoint?.region}
      >
        {selectedPoint && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <GlassCard className="p-4 text-center" intensity="low">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Threat Index
                </span>
                <span className={`text-2xl font-extrabold tracking-tight mt-1.5 block font-heading
                  ${selectedPoint.threat_index >= 0.70 ? 'text-brand-red' : 'text-brand-amber'}`}
                >
                  {Math.round(selectedPoint.threat_index * 100)}%
                </span>
              </GlassCard>

              <GlassCard className="p-4 text-center" intensity="low">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Counterfeit %
                </span>
                <span className="text-2xl font-extrabold tracking-tight text-slate-200 mt-1.5 block font-heading">
                  {selectedPoint.counterfeit_percent}%
                </span>
              </GlassCard>

              <GlassCard className="p-4 text-center" intensity="low">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Total Seizures
                </span>
                <span className="text-2xl font-extrabold tracking-tight text-slate-200 mt-1.5 block font-heading">
                  {selectedPoint.seizure_count}
                </span>
              </GlassCard>

              <GlassCard className="p-4 text-center" intensity="low">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Trend Indicator
                </span>
                <span className="text-2xl font-extrabold tracking-tight text-slate-200 mt-1.5 block font-heading uppercase">
                  {selectedPoint.trend}
                </span>
              </GlassCard>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-300">Dominant Local Anomaly Vectors</h4>
              <div className="flex flex-wrap gap-2">
                <span className="bg-white/5 border border-glass-border px-3 py-1.5 rounded-lg text-xs text-slate-200 font-semibold">
                  Route Deviation
                </span>
                <span className="bg-white/5 border border-glass-border px-3 py-1.5 rounded-lg text-xs text-slate-200 font-semibold">
                  SmartID Public Check Fail
                </span>
                {selectedPoint.threat_index >= 0.80 && (
                  <span className="bg-white/5 border border-glass-border px-3 py-1.5 rounded-lg text-xs text-slate-200 font-semibold">
                    Cold-chain Temperature Breach
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
};
