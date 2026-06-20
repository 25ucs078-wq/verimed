import React from 'react';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  title,
  variant = 'primary',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'border-brand-teal text-brand-teal hover:bg-brand-teal/10 shadow-brand-teal/10';
      case 'danger':
        return 'border-brand-red text-brand-red hover:bg-brand-red/10 shadow-brand-red/10';
      case 'warning':
        return 'border-brand-amber text-brand-amber hover:bg-brand-amber/10 shadow-brand-amber/10';
      case 'secondary':
        return 'border-glass-border text-slate-300 hover:bg-white/5';
      case 'primary':
      default:
        return 'border-glass-border text-slate-100 hover:border-brand-teal/50 hover:text-brand-teal hover:bg-brand-teal/5';
    }
  };

  return (
    <button
      disabled={disabled || loading}
      className={`
        flex items-center justify-center gap-2 px-6 py-3.5 
        border rounded-2xl font-semibold tracking-wide 
        transition-all duration-200 active:scale-95 active:duration-75
        shadow-lg backdrop-blur-md bg-white/5
        disabled:opacity-50 disabled:pointer-events-none
        ${getVariantStyles()}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {icon}
          {title}
        </>
      )}
    </button>
  );
};
