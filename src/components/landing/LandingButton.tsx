'use client';

import React from 'react';

interface LandingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export function LandingButton({
  variant = 'primary',
  children,
  className = '',
  ...props
}: LandingButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-base font-bold transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles =
    variant === 'primary'
      ? 'bg-white text-black hover:bg-white/90'
      : 'border border-white/30 text-white hover:bg-white/10 bg-transparent';

  return (
    <button className={`${baseStyles} ${variantStyles} ${className}`} {...props}>
      {children}
    </button>
  );
}
