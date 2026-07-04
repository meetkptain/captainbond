'use client';

import BrandHub from '@/components/landing/BrandHub';

export default function HomePageClient({ defaultLang = 'en' }: { defaultLang?: 'fr' | 'en' }) {
  return <BrandHub defaultLang={defaultLang} />;
}
