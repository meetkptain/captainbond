import { ReactNode } from 'react';
import { SiteHeader } from '@/components/ui/SiteHeader';

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-slate-950 text-slate-100" id="main-content">{children}</main>
    </>
  );
}
