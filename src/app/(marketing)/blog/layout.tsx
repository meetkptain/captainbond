import { ReactNode } from 'react';

export default function BlogLayout({ children }: { children: ReactNode }) {
  return <main className="min-h-screen bg-slate-950 text-slate-100">{children}</main>;
}
