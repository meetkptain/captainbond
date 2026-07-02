import { ReactNode } from 'react';

export default function B2BLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {children}
    </div>
  );
}
