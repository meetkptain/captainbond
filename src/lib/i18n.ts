'use client';

import React, { useState, createContext, useContext, ReactNode } from 'react';

export type Language = 'fr' | 'en';

const TRANSLATIONS = {
  fr: {
    title: "CAPTAIN BOND",
    distanciel: "Distanciel",
    onboarding_title: "Comment ça marche ?",
    onboarding_understood: "C'est compris !",
    onboarding_next: "Suivant",
    onboarding_title_1: "Un seul téléphone",
    onboarding_desc_1: "Pas besoin de synchroniser plusieurs manettes. Captain Bond se joue en faisant tourner ce téléphone de main en main.",
    onboarding_title_2: "Le bâton de parole",
    onboarding_desc_2: "Quand le téléphone affiche votre prénom, c'est à vous de parler. Lisez la question et répondez sincèrement à haute voix.",
    onboarding_title_3: "Savourez l'échange",
    onboarding_desc_3: "Le sablier est là pour guider, pas pour stresser. Si une discussion s'engage, appuyez sur Pause et profitez du moment.",
    paywall_title: "Votre arbre a germé",
    paywall_desc: "Ces 3 premières questions ont planté la graine de la connexion. Débloquez l'accès illimité pour voir grandir votre arbre de complicité.",
    paywall_loading: "Chargement des offres...",
    paywall_error: "Impossible de charger les offres.",
    paywall_exit: "Retour au menu principal",
    streak_title: "Série de Connexion",
    streak_days: "Jours",
    tree_title: "L'Arbre Neural",
    tree_nodes: "Nœuds sémantiques",
    tree_resonances: "Fruits de résonance générés",
    tree_explore: "Explorer l'Arbre Neural",
    dj_title: "DJ IA — Configuration",
    dj_mood: "Ambiance du DJ",
    dj_generate: "Générer une question DJ IA",
    daily_badge: "QUESTION DU JOUR • 20H",
    daily_submit: "Soumettre ma réponse",
    daily_char_counter: "caractères",
    daily_waiting: "Réponse enregistrée",
    daily_waiting_desc: "Votre réponse est bien scellée. Dès que {name} aura répondu, vos réponses seront révélées en même temps.",
    daily_resonance: "Résonance sémantique",
    daily_resonance_desc: "Vos cœurs battent sur la même fréquence.",
    tree_header: "L'ARBRE NEURAL SÉMANTIQUE",
    tree_subtitle: "Complicité et similarités cosinus",
    tree_back: "Retour au Foyer",
    tree_weekly_summary: "🏆 Résumé Hebdo",
    tree_search_placeholder: "Rechercher une question...",
    tree_filter_category: "Catégorie",
    tree_filter_intensity: "Intensité",
    tree_legend_chill: "Chill",
    tree_legend_deep: "Deep",
    tree_legend_spicy: "Spicy",
    tree_select_node_title: "Sélectionnez un nœud",
    tree_select_node_desc: "Cliquez sur une question de l'arbre pour révéler ses connexions et l'historique de complicité.",
    weekly_title: "RÉSUMÉ HEBDOMADAIRE",
    weekly_subtitle: "Votre connexion avec {name}",
    weekly_resonance_avg: "Résonance Moyenne",
    weekly_active_streak: "Série Active",
    weekly_gold_node: "Nœud d'Or de la Semaine ({score}%)",
    weekly_dj_analysis: "Analyse du DJ IA",
    weekly_pdf_btn: "Sauvegarder en PDF",
    weekly_close_btn: "Fermer"
  },
  en: {
    title: "CAPTAIN BOND",
    distanciel: "Remote",
    onboarding_title: "How it works?",
    onboarding_understood: "Understood!",
    onboarding_next: "Next",
    onboarding_title_1: "One phone",
    onboarding_desc_1: "No need to sync multiple controllers. Captain Bond is played by passing this single phone from hand to hand.",
    onboarding_title_2: "Talking Stick",
    onboarding_desc_2: "When the phone displays your name, it's your turn to speak. Read the question and answer sincerely out loud.",
    onboarding_title_3: "Savor the exchange",
    onboarding_desc_3: "The hourglass is here to guide, not to stress. If a discussion starts, press Pause and enjoy the moment.",
    paywall_title: "Your tree has sprouted",
    paywall_desc: "These first 3 questions have planted the seed of connection. Unlock unlimited access to see your tree of complicity grow.",
    paywall_loading: "Loading offers...",
    paywall_error: "Unable to load offers.",
    paywall_exit: "Back to main menu",
    streak_title: "Connection Streak",
    streak_days: "Days",
    tree_title: "Neural Tree",
    tree_nodes: "Semantic nodes",
    tree_resonances: "Resonance fruits generated",
    tree_explore: "Explore the Neural Tree",
    dj_title: "AI DJ — Setup",
    dj_mood: "DJ Mood",
    dj_generate: "Generate AI DJ Question",
    daily_badge: "DAILY QUESTION • 8 PM",
    daily_submit: "Submit my answer",
    daily_char_counter: "characters",
    daily_waiting: "Answer recorded",
    daily_waiting_desc: "Your answer is sealed. As soon as {name} answers, both of your responses will be revealed.",
    daily_resonance: "Semantic Resonance",
    daily_resonance_desc: "Your hearts beat on the same frequency.",
    tree_header: "SEMANTIC NEURAL TREE",
    tree_subtitle: "Complicity and cosine similarities",
    tree_back: "Back to Foyer",
    tree_weekly_summary: "🏆 Weekly Summary",
    tree_search_placeholder: "Search a question...",
    tree_filter_category: "Category",
    tree_filter_intensity: "Intensity",
    tree_legend_chill: "Chill",
    tree_legend_deep: "Deep",
    tree_legend_spicy: "Spicy",
    tree_select_node_title: "Select a node",
    tree_select_node_desc: "Click on any node in the tree to reveal its connections and history of complicity.",
    weekly_title: "WEEKLY REPORT",
    weekly_subtitle: "Your connection with {name}",
    weekly_resonance_avg: "Average Resonance",
    weekly_active_streak: "Active Streak",
    weekly_gold_node: "Golden Node of the Week ({score}%)",
    weekly_dj_analysis: "AI DJ Insights",
    weekly_pdf_btn: "Save as PDF",
    weekly_close_btn: "Close"
  }
};

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof TRANSLATIONS.fr, replacements?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextProps | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'fr';
    const stored = localStorage.getItem('cb_language') as Language;
    if (stored === 'fr' || stored === 'en') return stored;
    const browserLang = navigator.language.substring(0, 2).toLowerCase();
    return browserLang === 'en' ? 'en' : 'fr';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cb_language', lang);
    }
  };

  const t = (key: keyof typeof TRANSLATIONS.fr, replacements?: Record<string, string | number>): string => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.fr;
    let translation = dict[key] || TRANSLATIONS.fr[key] || String(key);
    
    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => {
        translation = translation.replace(`{${k}}`, String(v));
      });
    }
    return translation;
  };

  return React.createElement(LanguageContext.Provider, { value: { language, setLanguage, t } }, children);
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Return a safe fallback context if hook is used outside the provider (e.g. in test environments)
    return {
      language: 'fr' as Language,
      setLanguage: () => {},
      t: (key: keyof typeof TRANSLATIONS.fr, replacements?: Record<string, string | number>) => {
        let translation = TRANSLATIONS.fr[key] || String(key);
        if (replacements) {
          Object.entries(replacements).forEach(([k, v]) => {
            translation = translation.replace(`{${k}}`, String(v));
          });
        }
        return translation;
      }
    };
  }
  return context;
}
