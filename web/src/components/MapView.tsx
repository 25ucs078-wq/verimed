import React from 'react';
import { ShieldAlert, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { colors } from '../theme/colors';

interface MapPoint {
  region: string;
  threat_index: number;
  counterfeit_percent: number;
  seizure_count: number;
  trend: string;
  x: number;
  y: number;
}

interface MapViewProps {
  points: MapPoint[];
  onSelectPoint: (point: MapPoint) => void;
  filterMode: 'all' | 'high' | 'moderate';
}

export const MapView: React.FC<MapViewProps> = ({
  points,
  onSelectPoint,
  filterMode,
}) => {
  const filteredPoints = points.filter((pt) => {
    if (filterMode === 'high') return pt.threat_index >= 0.7;
    if (filterMode === 'moderate') return pt.threat_index < 0.7;
    return true;
  });

  return (
    <div className="relative w-full h-[360px] bg-[#03050c] rounded-3xl border border-glass-border overflow-hidden select-none">
      {/* Grid line grid overlay background */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px',
        }}
      />

      <svg width="100%" height="100%" viewBox="0 0 500 350" className="w-full h-full relative z-10">
        {/* Connection mesh lines */}
        <path
          d="M 100 120 L 230 260 L 340 200 L 420 160"
          fill="none"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />

        {/* Global coordinate baseline guides */}
        <line x1="20" y1="175" x2="480" y2="175" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="1" />
        <line x1="250" y1="20" x2="250" y2="330" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="1" />

        {/* Pulse radar circles */}
        <circle cx="250" cy="175" r="90" stroke="rgba(45, 224, 194, 0.01)" strokeWidth="1.5" fill="none" />
        <circle cx="250" cy="175" r="160" stroke="rgba(139, 123, 255, 0.01)" strokeWidth="1.5" fill="none" />

        {/* Dynamic hot regions */}
        {filteredPoints.map((pt, index) => {
          const isHigh = pt.threat_index >= 0.70;
          const markerColor = isHigh ? '#FF5577' : '#FFB648'; // Red vs Amber
          
          return (
            <g
              key={index}
              className="cursor-pointer group"
              onClick={() => onSelectPoint(pt)}
            >
              {/* Pulsing ring overlays */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r="24"
                fill={markerColor}
                className="opacity-10 animate-ping"
                style={{ animationDuration: isHigh ? '2s' : '3s' }}
              />
              <circle
                cx={pt.x}
                cy={pt.y}
                r="12"
                fill={markerColor}
                className="opacity-20 group-hover:scale-110 transition-transform duration-200"
              />
              <circle
                cx={pt.x}
                cy={pt.y}
                r="5"
                fill={markerColor}
              />

              {/* Text labels */}
              <text
                x={pt.x}
                y={pt.y - 28}
                fill="#F8FAFC"
                fontSize="10"
                fontWeight="bold"
                textAnchor="middle"
                className="opacity-80 group-hover:opacity-100 transition-opacity font-heading"
              >
                {pt.region}
              </text>
              <text
                x={pt.x}
                y={pt.y - 18}
                fill={markerColor}
                fontSize="9"
                fontWeight="bold"
                textAnchor="middle"
              >
                {Math.round(pt.threat_index * 100)}% Risk
              </text>
            </g>
          );
        })}
      </svg>

      {/* Info card footer */}
      <div className="absolute bottom-4 left-6 right-6 flex justify-between items-center z-20 text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
        <span>VeriMed Threat Radar V1.0</span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-pulse" /> Live Tracking Active
        </span>
      </div>
    </div>
  );
};
