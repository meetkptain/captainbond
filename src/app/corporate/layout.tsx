import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Team Building Interactif & Séminaires d'Entreprise | Captain Bond",
  description: "Fédérez vos équipes avec un brise-glace interactif moderne. Pas d'application à installer, jouable en présentiel ou en hybride.",
  alternates: {
    canonical: 'https://captainbond.com/corporate',
  },
};

export default function CorporateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
