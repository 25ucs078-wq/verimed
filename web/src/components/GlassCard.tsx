import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  intensity?: 'low' | 'mid' | 'high';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  intensity = 'mid',
  ...props
}) => {
  const getBlurClass = () => {
    switch (intensity) {
      case 'low': return 'backdrop-blur-sm bg-opacity-25';
      case 'high': return 'backdrop-blur-xl bg-opacity-50';
      case 'mid':
      default:
        return 'backdrop-blur-md bg-opacity-35';
    }
  };

  return (
    <div
      className={`
        bg-[#10132b] ${getBlurClass()} 
        border border-glass-border rounded-3xl 
        shadow-2xl relative overflow-hidden transition-all duration-300
        ${className}
      `}
      {...props}
    >
      {/* Dynamic top highlight glow edge */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="relative z-10">{children}</div>
    </div>
  );
};
