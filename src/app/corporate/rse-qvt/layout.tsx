import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Bien-être au travail & QVT | Captain Bond",
  description: "Mesurez et améliorez la cohésion d'équipe et le climat social grâce à notre outil de jeu interactif. Recevez des rapports de cohésion détaillés pour votre Codir.",
  alternates: {
    canonical: 'https://captainbond.com/corporate/rse-qvt',
  },
};

export default function QVTLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
