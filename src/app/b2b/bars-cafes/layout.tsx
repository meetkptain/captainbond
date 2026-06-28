import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Animation de Pubs, Bars & Cafés | Captain Bond",
  description: "Remplissez vos tables les soirs de semaine. Un jeu de quiz interactif autonome sur écran géant (TV) à 99€/mois. Ambiance de folie garantie.",
  alternates: {
    canonical: 'https://captainbond.com/b2b/bars-cafes',
  },
};

export default function BarsCafesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
