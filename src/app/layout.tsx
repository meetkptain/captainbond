import type { Metadata, Viewport } from "next";
import { Outfit, Inter } from "next/font/google";
import { LanguageProvider } from '@/lib/i18n';
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Captain Bond — Le DJ de votre soirée",
  description: "Jeu d'ambiance autour de la TV. Icebreaker, Spicy, Deep Connection, Imposteur, Date Night. 3 cartes gratuites, puis débloquez la soirée.",
  openGraph: {
    title: "Captain Bond — Le DJ de votre soirée",
    description: "Jeu d'ambiance autour de la TV. Icebreaker, Spicy, Deep Connection, Imposteur, Date Night. 3 cartes gratuites.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Captain Bond — Le DJ de votre soirée",
    description: "Jeu d'ambiance autour de la TV. 3 cartes gratuites.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${outfit.variable} ${inter.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-200 selection:bg-neon-purple/30">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
