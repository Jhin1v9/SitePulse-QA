// src/components/ui/Badge.jsx
import React from 'react';

const variants = {
  subtle: 'border-white/[0.08] bg-white/[0.03] text-text-secondary',
  accent: 'border-accent-blue/20 bg-accent-blue/10 text-blue-200',
  danger: 'border-accent-red/20 bg-accent-red/10 text-red-200',
  warning: 'border-accent-amber/20 bg-accent-amber/10 text-amber-200',
  success: 'border-accent-green/20 bg-accent-green/10 text-green-200',
};

const sizes = {
  xs: 'px-2 py-0.5 text-[10px]',
  sm: 'px-2.5 py-1 text-[11px]',
};

export function Badge({ 
  children, 
  variant = 'subtle', 
  size = 'sm',
  className = '',
  icon: Icon,
  ...props 
}) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full border uppercase tracking-[0.08em] font-medium
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {children}
    </span>
  );
}

