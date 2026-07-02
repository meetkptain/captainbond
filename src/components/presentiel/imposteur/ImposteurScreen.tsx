'use client';

import { ReactNode } from 'react';

interface ImposteurScreenProps {
  children: ReactNode;
  stripeColor?: string;
}

export function ImposteurScreen({ children, stripeColor }: ImposteurScreenProps) {
  return (
    <div className="flex flex-col items-center justify-between gap-6 p-6 max-w-md mx-auto min-h-[500px] text-slate-100 bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-700/50 shadow-2xl text-center w-full relative overflow-hidden">
      {stripeColor && (
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none animate-[pulse_3s_infinite]"
          style={{
            background: `repeating-linear-gradient(45deg, ${stripeColor}, ${stripeColor} 10px, #000 10px, #000 20px)`,
          }}
        ></div>
      )}
      {children}
    </div>
  );
}
