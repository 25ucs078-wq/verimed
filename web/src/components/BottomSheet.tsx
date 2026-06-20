import React from 'react';
import { X } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  title,
  children,
}) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      {/* Backdrop blur overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Sheet panel */}
      <GlassCard 
        className="
          w-full sm:max-w-lg rounded-t-[32px] sm:rounded-[32px] 
          max-h-[85vh] overflow-y-auto z-10 transition-all duration-300 translate-y-0
          border-x-0 border-b-0 sm:border-x sm:border-b
        "
        intensity="high"
      >
        {/* Pull bar on mobile */}
        <div className="flex justify-center py-3 sm:hidden">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>

        {/* Header container */}
        <div className="flex justify-between items-center px-6 pt-4 pb-3 border-b border-white/5">
          {title && <h2 className="text-xl font-bold text-slate-100">{title}</h2>}
          <button 
            className="p-1.5 rounded-full hover:bg-white/5 transition-all text-slate-400 hover:text-slate-200"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6">{children}</div>
      </GlassCard>
    </div>
  );
};
