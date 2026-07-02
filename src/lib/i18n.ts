'use client';

import React, { useState, createContext, useContext, ReactNode } from 'react';
import { COUPLE_TRANSLATIONS, CoupleTranslationKey } from './i18n/couple';

export type Language = 'fr' | 'en';

const BASE_TRANSLATIONS = {
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
    free_cards_used: "{used}/{limit} cartes gratuites utilisées",
    free_cards_remaining_one: "Il vous reste 1 carte gratuite.",
    free_cards_remaining_many: "Il vous reste {remaining} cartes gratuites.",
    free_cards_empty: "Vous avez utilisé toutes vos cartes gratuites.",
    free_cards_gauge_label: "Jauge de cartes gratuites : {used} sur {limit} utilisées",
    no_offers_available: "Aucune offre disponible pour le moment.",
    secure_payment_guarantee: "Paiement sécurisé · Satisfait ou remboursé sous 7 jours",

    // Gameplay presentiel additions
    room_loading: "Initialisation de la table...",
    room_err_auth: "Session administrateur manquante. Veuillez créer la partie depuis l'accueil.",
    room_err_title: "Accès Refusé",
    room_err_btn: "Retour à l'accueil",

    setup_title: "Lobby de la Table",
    setup_desc: "Ajoutez les prénoms des joueurs présents autour de l'écran pour personnaliser le jeu.",
    setup_name_label: "Prénom du joueur",
    setup_name_placeholder: "Ex: Camille",
    setup_add_btn: "Ajouter",
    setup_rgpd_title: "Consentement Captain Bond",
    setup_rgpd_checkbox: "J'accepte que mes réponses soient utilisées pour générer mon profil de complicité ludique.",
    setup_safety_checkbox: "Je m'engage à respecter la bienveillance et le consentement de chacun autour de la table.",
    setup_safety_desc: "Captain Bond est un espace de connexion safe. Passez n'importe quelle carte sans jugement si elle vous met mal à l'aise.",
    setup_consent_btn: "Valider les Consentements",
    setup_couple_title: "Couples & Duos (Optionnel)",
    setup_couple_desc: "Associez les joueurs en couple pour générer des questions Date Night exclusives.",
    setup_couple_btn: "Créer un couple",
    setup_couple_link: "Associer",
    setup_couple_unlink: "Séparer",
    setup_deck_custom: "Utiliser un Deck Souvenir personnalisé",
    setup_start_btn: "Commencer la partie !",

    mode_title: "Choisissez votre ambiance",
    mode_desc: "Sélectionnez un mode de jeu adapté à votre groupe ce soir",
    mode_duration: "durée :",
    mode_intensity: "intensité :",
    mode_icebreaker_desc: "Brisez la glace avec des questions fun, légères et inattendues. Parfait pour démarrer la soirée !",
    mode_deep_desc: "Renforcez vos liens grâce à des questions introspectives, sincères et émotionnelles.",
    mode_spicy_desc: "Ajoutez un peu de piquant et de tension avec des questions audacieuses et révélatrices.",
    mode_imposteur_desc: "Un joueur reçoit une question secrète différente. Parviendrez-vous à le démasquer ?",
    mode_date_desc: "Conçu spécialement pour les couples. Redécouvrez-vous et approfondissez votre complicité.",
    mode_family_desc: "Des thèmes adaptés à toutes les générations pour rire et partager des souvenirs en famille.",

    stick_active: "Bâton de parole actif",
    stick_question_in_progress: "Question en cours :",
    stick_prepare_pointing: "Préparez-vous à pointer...",
    stick_reveal_voters: "Révéler les votes",
    stick_next_turn: "Tour suivant",
    stick_skip_question: "Passer la question",
    stick_back_mode: "Retour aux Modes",

    pass_title: "Meneur de Tour",
    pass_new_round: "• Nouveau Tour",
    pass_instruction: "Passez le téléphone à",
    pass_secret_warning: "Attention : ce mode contient des rôles secrets ! Cachez l'écran aux autres.",
    pass_theme_selection: "Tu es le premier joueur de cette manche : tu vas pouvoir choisir la thématique !",
    pass_ready_desc: "Prends l'appareil et prépare-toi à répondre.",
    pass_ready_btn: "👍 J'ai le téléphone en main !",

    theme_title: "Choix de la thématique",
    theme_desc: "Sélectionnez la question qui vous inspire le plus pour ce tour :",
    theme_keep_btn: "Garder la question par défaut",

    timer_paused: "PAUSE",
    timer_pause_btn: "Pause",
    timer_resume_btn: "Reprendre",

    end_summary_title: "Fin de la Partie",
    end_summary_desc: "Votre arbre relationnel a fleuri ! Voici l'analyse de complicité de votre session.",
    end_summary_score: "Score de Complicité",
    end_summary_badge: "Trophée de Session",
    end_summary_exit: "Fermer le salon",
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
    free_cards_used: "{used}/{limit} free cards used",
    free_cards_remaining_one: "You have 1 free card left.",
    free_cards_remaining_many: "You have {remaining} free cards left.",
    free_cards_empty: "You have used all your free cards.",
    free_cards_gauge_label: "Free cards gauge: {used} out of {limit} used",
    no_offers_available: "No offers available at the moment.",
    secure_payment_guarantee: "Secure payment · 7-day money-back guarantee",

    // Gameplay presentiel additions
    room_loading: "Initializing the table...",
    room_err_auth: "Missing administrator session. Please create the game from the homepage.",
    room_err_title: "Access Denied",
    room_err_btn: "Back to Home",

    setup_title: "Table Lobby",
    setup_desc: "Add the first names of the players present around the screen to customize the game.",
    setup_name_label: "Player first name",
    setup_name_placeholder: "E.g., Camille",
    setup_add_btn: "Add",
    setup_rgpd_title: "Captain Bond Consent",
    setup_rgpd_checkbox: "I accept that my answers are used to generate my playful complicity profile.",
    setup_safety_checkbox: "I commit to respecting kindness and consent of everyone around the table.",
    setup_safety_desc: "Captain Bond is a safe space for connection. Skip any card without judgment if it makes you feel uncomfortable.",
    setup_consent_btn: "Accept Consents",
    setup_couple_title: "Couples & Duos (Optional)",
    setup_couple_desc: "Link players in couple to generate exclusive Date Night questions.",
    setup_couple_btn: "Create Couple",
    setup_couple_link: "Link",
    setup_couple_unlink: "Separate",
    setup_deck_custom: "Use a custom Memory Deck",
    setup_start_btn: "Start the game!",

    mode_title: "Choose your vibe",
    mode_desc: "Select a game mode adapted to your group tonight",
    mode_duration: "duration:",
    mode_intensity: "intensity:",
    mode_icebreaker_desc: "Break the ice with fun, light, and unexpected questions. Perfect to start the evening!",
    mode_deep_desc: "Strengthen your bonds with introspective, sincere, and emotional questions.",
    mode_spicy_desc: "Add some spice and tension with bold and revealing questions.",
    mode_imposteur_desc: "One player receives a different secret question. Will you be able to unmask them?",
    mode_date_desc: "Designed especially for couples. Rediscover each other and deepen your complicity.",
    mode_family_desc: "Themes adapted to all generations to laugh and share memories as a family.",

    stick_active: "Active Talking Stick",
    stick_question_in_progress: "Current question:",
    stick_prepare_pointing: "Prepare to point...",
    stick_reveal_voters: "Reveal votes",
    stick_next_turn: "Next turn",
    stick_skip_question: "Skip question",
    stick_back_mode: "Back to Modes",

    pass_title: "Turn Leader",
    pass_new_round: "• New Round",
    pass_instruction: "Pass the phone to",
    pass_secret_warning: "Warning: this mode contains secret roles! Hide the screen from others.",
    pass_theme_selection: "You are the first player of this round: you will be able to choose the theme!",
    pass_ready_desc: "Take the device and prepare to answer.",
    pass_ready_btn: "👍 I have the phone in hand!",

    theme_title: "Theme Choice",
    theme_desc: "Select the question that inspires you most for this turn:",
    theme_keep_btn: "Keep default question",

    timer_paused: "PAUSED",
    timer_pause_btn: "Pause",
    timer_resume_btn: "Resume",

    end_summary_title: "End of the Game",
    end_summary_desc: "Your relational tree has flowered! Here is the complicity analysis of your session.",
    end_summary_score: "Complicity Score",
    end_summary_badge: "Session Trophy",
    end_summary_exit: "Close lobby",
  },
} as const;

const TRANSLATIONS = {
  fr: { ...BASE_TRANSLATIONS.fr, ...COUPLE_TRANSLATIONS.fr },
  en: { ...BASE_TRANSLATIONS.en, ...COUPLE_TRANSLATIONS.en },
} as const;

type BaseTranslationKey = keyof typeof BASE_TRANSLATIONS.fr;
type TranslationKey = BaseTranslationKey | CoupleTranslationKey;

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, replacements?: Record<string, string | number>) => string;
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

  const t = (key: TranslationKey, replacements?: Record<string, string | number>): string => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.fr;
    let translation: string = (dict[key] as string | undefined) || (TRANSLATIONS.fr[key] as string | undefined) || String(key);

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
    return {
      language: 'fr' as Language,
      setLanguage: () => {},
      t: (key: TranslationKey, replacements?: Record<string, string | number>) => {
        let translation: string = (TRANSLATIONS.fr[key] as string | undefined) || String(key);
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
