import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Jeu d'Onboarding & Intégration de Collaborateurs | Captain Bond",
  description: "Fédérez vos nouveaux arrivants par le jeu. Générez un deck de questions personnalisé via l'IA Gemini à partir de votre livret d'accueil.",
  alternates: {
    canonical: 'https://captainbond.com/corporate/onboarding-recrutement',
  },
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
