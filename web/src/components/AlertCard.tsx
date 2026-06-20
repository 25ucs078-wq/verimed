import React from 'react';
import { GlassCard } from './GlassCard';

export interface AlertCardProps {
  title: string;
  source: string;
  severity: string; // CRITICAL, HIGH, INFO
  body: string;
  date: string;
  batches?: string[];
  manufacturers?: string[];
}

export const AlertCard: React.FC<AlertCardProps> = ({
  title,
  source,
  severity,
  body,
  date,
  batches = [],
  manufacturers = [],
}) => {
  const getSeverityColors = () => {
    switch (severity.toUpperCase()) {
      case 'CRITICAL':
        return { text: 'text-brand-red', border: 'border-brand-red', bg: 'bg-brand-red' };
      case 'HIGH':
        return { text: 'text-brand-amber', border: 'border-brand-amber', bg: 'bg-brand-amber' };
      case 'INFO':
      default:
        return { text: 'text-brand-violet', border: 'border-brand-violet', bg: 'bg-brand-violet' };
    }
  };

  const colors = getSeverityColors();

  return (
    <GlassCard className="mb-4 overflow-hidden relative" intensity="low">
      <div className="flex min-h-[110px]">
        {/* Left accent color bar */}
        <div className={`w-[6px] ${colors.bg}`} />
        
        {/* Content wrapper */}
        <div className="flex-1 p-5">
          <div className="flex justify-between items-center mb-3">
            <span className={`text-[10px] font-bold tracking-wider uppercase border rounded-md px-2 py-0.5 ${colors.text} ${colors.border}`}>
              {source}
            </span>
            <span className="text-[11px] text-slate-400 font-semibold">{date}</span>
          </div>

          <h3 className="text-base font-bold text-slate-100 mb-2">{title}</h3>
          <p className="text-sm text-slate-300 leading-relaxed font-normal">{body}</p>

          {(batches.length > 0 || manufacturers.length > 0) && (
            <div className="mt-4 pt-3 border-t border-white/5 flex flex-col gap-1.5 text-xs text-slate-400">
              {batches.length > 0 && (
                <div>
                  <span className="font-semibold text-slate-300">Targeted Batches: </span>
                  {batches.join(', ')}
                </div>
              )}
              {manufacturers.length > 0 && (
                <div>
                  <span className="font-semibold text-slate-300">Targeted Manufacturers: </span>
                  {manufacturers.join(', ')}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
};
