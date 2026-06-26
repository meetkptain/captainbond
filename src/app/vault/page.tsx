'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CustomDeck, CustomQuestion, DeckVibe, QuestionMode } from '@/lib/custom-decks/types';
import { getLocalDecks, saveLocalDeck, deleteLocalDeck } from '@/lib/custom-decks/storage';
import { BackgroundOrbs } from '@/components/BackgroundOrbs';
import './vault.css';

const VIBE_METADATA: Record<DeckVibe, { emoji: string; label: string; desc: string; colorClass: string }> = {
  ICEBREAKER: {
    emoji: '🧊',
    label: 'Brise-Glace',
    desc: 'Idéal pour démarrer la soirée en douceur et rire un bon coup.',
    colorClass: 'vibe-icebreaker',
  },
  SPICY: {
    emoji: '🔥',
    label: 'Pimenté',
    desc: 'Dilemmes croustillants, vérités gênantes et révélations.',
    colorClass: 'vibe-spicy',
  },
  SECRETS: {
    emoji: '🕵️',
    label: 'Secrets & Bluff',
    desc: 'Qui a fait quoi ? Devinez qui cache le mieux son jeu.',
    colorClass: 'vibe-secrets',
  },
  NOSTALGIA: {
    emoji: '🎒',
    label: 'Nostalgie',
    desc: 'Anecdotes d\'enfance, vieux souvenirs de vacances et nostalgie.',
    colorClass: 'vibe-nostalgia',
  },
};

const LOADING_MESSAGES = [
  "Analyse des dossiers secrets en cours... 🔎",
  "Rédaction des cartes Most Likely To... ✍️",
  "Mélange des vibes et des anecdotes... 🌪️",
  "Génération de questions piquantes sur mesure... 🌶️",
  "Scellage des 60 cartes dans votre coffre... 🔒",
  "Finalisation de la magie Captain Bond... 🪄"
];

export default function VaultPage() {
  const router = useRouter();

  // Navigation / views
  const [view, setView] = useState<'list' | 'wizard-friends' | 'wizard-vibes' | 'wizard-dossiers' | 'loading' | 'preview' | 'editor'>('list');
  const [decks, setDecks] = useState<CustomDeck[]>(() => {
    if (typeof window === 'undefined') return [];
    return getLocalDecks();
  });
  const [activeDeck, setActiveDeck] = useState<CustomDeck | null>(null);

  // Wizard state
  const [friends, setFriends] = useState<string[]>([]);
  const [friendInput, setFriendInput] = useState('');
  const [selectedVibes, setSelectedVibes] = useState<DeckVibe[]>([]);
  const [dossiers, setDossiers] = useState<Record<string, string>>({});
  const [groupContext, setGroupContext] = useState('');

  // UI state
  const [isLaunching, setIsLaunching] = useState(false);
  const [loadingMessageIdx, setLoadingMessageIdx] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Editor state
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [newCardText, setNewCardText] = useState('');
  const [newCardMode, setNewCardMode] = useState<QuestionMode>('ICEBREAKER');
  const [newCardPlayers, setNewCardPlayers] = useState<string[]>([]);
  const [showAddCardForm, setShowAddCardForm] = useState(false);
  const [deckTitle, setDeckTitle] = useState('');

  // Sync list when view changes to list
  useEffect(() => {
    if (view === 'list' && typeof window !== 'undefined') {
      const currentDecks = getLocalDecks();
      requestAnimationFrame(() => {
        setDecks(currentDecks);
      });
    }
  }, [view]);

  // Loading screen messages rotation
  useEffect(() => {
    if (view !== 'loading') return;
    const interval = setInterval(() => {
      setLoadingMessageIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [view]);

  // Add a friend chip
  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    const name = friendInput.trim();
    if (!name) return;
    if (friends.some((f) => f.toLowerCase() === name.toLowerCase())) return;
    if (friends.length >= 10) return;
    setFriends([...friends, name]);
    setFriendInput('');
  };

  // Remove a friend chip
  const handleRemoveFriend = (name: string) => {
    setFriends(friends.filter((f) => f !== name));
    // clean up associated dossier
    const updatedDossiers = { ...dossiers };
    delete updatedDossiers[name];
    setDossiers(updatedDossiers);
  };

  // Toggle vibe selection
  const handleToggleVibe = (vibe: DeckVibe) => {
    if (selectedVibes.includes(vibe)) {
      setSelectedVibes(selectedVibes.filter((v) => v !== vibe));
    } else {
      setSelectedVibes([...selectedVibes, vibe]);
    }
  };

  // Dynamic dossier templates based on selected vibes
  const getDossierPlaceholder = (friendName: string) => {
    if (selectedVibes.includes('SPICY')) {
      return `Le plus gros secret de ${friendName} c'est...`;
    }
    if (selectedVibes.includes('SECRETS')) {
      return `${friendName} ne veut surtout pas qu'on sache que...`;
    }
    if (selectedVibes.includes('NOSTALGIA')) {
      return `Le meilleur souvenir d'enfance ou de vacances avec ${friendName} c'est...`;
    }
    return `La fois où ${friendName} a fait quelque chose de drôle/bizarre...`;
  };

  // Launch AI Generation
  const handleGenerateDeck = async () => {
    setView('loading');
    setErrorMsg(null);

    const formattedDossiers = Object.entries(dossiers)
      .filter(([, text]) => text.trim().length > 0)
      .map(([target, text]) => ({ target, text }));

    try {
      const res = await fetch('/api/questions/generate-themed-deck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          friends,
          vibes: selectedVibes,
          groupContext,
          dossiers: formattedDossiers,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erreur lors de la génération');
      }

      const generatedQuestions: CustomQuestion[] = await res.json();

      const newDeck: CustomDeck = {
        id: `deck-${Date.now()}`,
        title: `Deck de ${friends.slice(0, 3).join(', ')}${friends.length > 3 ? '...' : ''}`,
        createdAt: new Date().toISOString(),
        friends,
        vibes: selectedVibes,
        groupContext,
        questions: generatedQuestions,
        isPurchased: false, // Starts locked
      };

      saveLocalDeck(newDeck);
      setActiveDeck(newDeck);
      setDeckTitle(newDeck.title);
      setView('preview');
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'La génération a échoué. Veuillez vérifier la connexion Internet.';
      setErrorMsg(msg);
      setView('wizard-dossiers');
    }
  };

  // Unlock/purchase deck (mocked for now, instant unlock)
  const handleUnlockDeck = () => {
    if (!activeDeck) return;
    const unlocked = { ...activeDeck, isPurchased: true };
    saveLocalDeck(unlocked);
    setActiveDeck(unlocked);
    setView('editor');
  };

  // Launch local game with active deck
  const handlePlayDeck = async (deck: CustomDeck) => {
    setIsLaunching(true);
    try {
      sessionStorage.setItem('cb_active_custom_deck', JSON.stringify(deck));
      const res = await fetch('/api/room/create', { method: 'POST' });
      if (!res.ok) throw new Error('Impossible de créer la room');
      const data = await res.json();

      sessionStorage.setItem(
        `host_${data.roomCode}`,
        JSON.stringify({ hostId: data.hostId, hostToken: data.hostToken })
      );

      router.push(`/room/${data.roomCode}`);
    } catch (err) {
      console.error(err);
      alert('Impossible de lancer la partie.');
      setIsLaunching(false);
    }
  };

  // Delete deck
  const handleDeleteDeck = (deckId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Voulez-vous vraiment supprimer ce deck personnalisé ?')) {
      deleteLocalDeck(deckId);
      setDecks(getLocalDecks());
    }
  };

  // Save changes from editor
  const handleSaveChanges = () => {
    if (!activeDeck) return;
    const updated = {
      ...activeDeck,
      title: deckTitle,
    };
    saveLocalDeck(updated);
    setActiveDeck(updated);
    setDecks(getLocalDecks());
    alert('Deck sauvegardé !');
  };

  // Start editing a card
  const startEditingCard = (id: string, text: string) => {
    setEditingCardId(id);
    setEditingText(text);
  };

  // Save edited card
  const saveEditedCard = (id: string) => {
    if (!activeDeck) return;
    const updatedQuestions = activeDeck.questions.map((q) =>
      q.id === id ? { ...q, text: editingText } : q
    );
    const updatedDeck = { ...activeDeck, questions: updatedQuestions };
    setActiveDeck(updatedDeck);
    saveLocalDeck(updatedDeck);
    setEditingCardId(null);
  };

  // Delete card from deck
  const deleteCard = (id: string) => {
    if (!activeDeck) return;
    const updatedQuestions = activeDeck.questions.filter((q) => q.id !== id);
    const updatedDeck = { ...activeDeck, questions: updatedQuestions };
    setActiveDeck(updatedDeck);
    saveLocalDeck(updatedDeck);
  };

  // Add custom card
  const handleAddCard = () => {
    if (!activeDeck || !newCardText.trim()) return;

    const newQuestion: CustomQuestion = {
      id: `custom-q-manual-${Date.now()}`,
      text: newCardText.trim(),
      mode: newCardMode,
      intensityLevel: 1,
      involvedPlayers: newCardPlayers,
      isGeneric: newCardPlayers.length === 0,
    };

    const updatedDeck = {
      ...activeDeck,
      questions: [...activeDeck.questions, newQuestion],
    };
    setActiveDeck(updatedDeck);
    saveLocalDeck(updatedDeck);

    // reset card form
    setNewCardText('');
    setNewCardPlayers([]);
    setShowAddCardForm(false);
  };

  // Toggle player selection for new manual card
  const togglePlayerForNewCard = (player: string) => {
    if (newCardPlayers.includes(player)) {
      setNewCardPlayers(newCardPlayers.filter((p) => p !== player));
    } else {
      setNewCardPlayers([...newCardPlayers, player]);
    }
  };

  return (
    <div className="vault-container min-h-screen flex flex-col items-center text-white relative px-4 sm:px-6">
      <BackgroundOrbs />

      {/* Header */}
      <header className="w-full max-w-5xl mx-auto flex justify-between items-center py-6 z-10">
        <button
          onClick={() => {
            if (view !== 'list') setView('list');
            else router.push('/');
          }}
          className="text-sm font-bold tracking-tight text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
        >
          <span>←</span> <span>Retour</span>
        </button>
        <span className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">
          CAPTAIN BOND VAULT
        </span>
      </header>

      <main className="w-full max-w-4xl flex flex-col items-stretch z-10 flex-1 py-6 sm:py-10">
        {/* VIEW 1: LIST / LIBRARY */}
        {view === 'list' && (
          <div className="space-y-8 animate-[slideUp_0.3s_ease-out]">
            <div className="text-center space-y-3">
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
                Mon Coffre aux <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">Souvenirs</span> 🔒
              </h1>
              <p className="text-slate-400 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
                Générez des decks de questions 100% uniques basés sur vos anecdotes privées, vos amis et vos pires dossiers.
              </p>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => {
                  setFriends([]);
                  setSelectedVibes([]);
                  setDossiers({});
                  setGroupContext('');
                  setView('wizard-friends');
                }}
                className="px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black text-lg rounded-2xl transition-all hover:scale-[1.02] cursor-pointer shadow-lg shadow-amber-500/15 flex items-center gap-2"
              >
                <span>✨</span>
                <span>Créer un nouveau Deck Souvenir</span>
              </button>
            </div>

            {/* Deck List */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold uppercase tracking-wider text-amber-500/80 font-mono">Mes Decks Privés</h2>
              {decks.length === 0 ? (
                <div className="glass-panel p-10 text-center space-y-4 border-white/5">
                  <span className="text-4xl block">📦</span>
                  <p className="text-slate-400 text-sm">Vous n&apos;avez pas encore créé de deck.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {decks.map((deck) => (
                    <div
                      key={deck.id}
                      onClick={() => {
                        setActiveDeck(deck);
                        setDeckTitle(deck.title);
                        setView(deck.isPurchased ? 'editor' : 'preview');
                      }}
                      className="deck-list-item flex flex-col justify-between p-6 glass-panel border-white/5 hover:border-amber-500/30 transition-all cursor-pointer group"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="text-lg font-black text-slate-100 group-hover:text-amber-400 transition-colors">
                            {deck.title}
                          </h3>
                          {!deck.isPurchased && (
                            <span className="text-[10px] uppercase font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-md">
                              Bloqué
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 font-mono">
                          {deck.questions.length} cartes · {deck.friends.length} amis
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          Membres : {deck.friends.join(', ')}
                        </p>
                      </div>

                      <div className="flex gap-2 mt-6 pt-4 border-t border-white/5 items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(deck.createdAt).toLocaleDateString('fr-FR')}
                        </span>

                        <div className="flex gap-2">
                          {deck.isPurchased && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePlayDeck(deck);
                              }}
                              disabled={isLaunching}
                              className="px-3 py-1.5 bg-violet-600/80 hover:bg-violet-600 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1"
                            >
                              <span>🎮</span>
                              <span>Jouer</span>
                            </button>
                          )}
                          <button
                            onClick={(e) => handleDeleteDeck(deck.id, e)}
                            className="p-1.5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: STEP 1 - FRIENDS */}
        {view === 'wizard-friends' && (
          <div className="wizard-step max-w-xl mx-auto space-y-6 glass-panel p-8 animate-[slideUp_0.3s_ease-out]">
            <div className="space-y-1">
              <span className="text-xs uppercase font-mono font-bold text-amber-500 tracking-wider">Étape 1 sur 3</span>
              <h2 className="text-2xl font-black text-slate-200">Qui participe à la soirée ? 👥</h2>
              <p className="text-xs text-slate-400">
                Ajoutez les prénoms des joueurs qui seront présents autour de la table pour personnaliser les questions.
              </p>
            </div>

            {/* Friend Chips */}
            <div className="flex flex-wrap gap-2 min-h-[4rem] p-4 bg-slate-950/40 rounded-2xl border border-white/5">
              {friends.length === 0 ? (
                <span className="text-slate-500 text-xs self-center">Aucun ami ajouté pour l&apos;instant...</span>
              ) : (
                friends.map((friend) => (
                  <span key={friend} className="friend-chip px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-bold flex items-center gap-1.5">
                    {friend}
                    <button
                      onClick={() => handleRemoveFriend(friend)}
                      className="text-xs text-amber-400/60 hover:text-amber-400 cursor-pointer font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleAddFriend} className="flex gap-2">
              <input
                type="text"
                placeholder="Ex: Camille"
                value={friendInput}
                onChange={(e) => setFriendInput(e.target.value)}
                maxLength={15}
                className="flex-1 cb-input"
              />
              <button
                type="submit"
                className="px-6 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl transition-all font-bold cursor-pointer"
              >
                Ajouter
              </button>
            </form>

            <div className="flex justify-between pt-6 border-t border-white/5">
              <button
                onClick={() => setView('list')}
                className="px-6 py-3 text-slate-400 hover:text-white font-bold transition-all text-sm cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={() => setView('wizard-vibes')}
                disabled={friends.length < 2}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 disabled:from-slate-800 disabled:text-slate-600 font-bold rounded-xl transition-all text-sm cursor-pointer disabled:cursor-not-allowed"
              >
                Suivant →
              </button>
            </div>
          </div>
        )}

        {/* VIEW 3: STEP 2 - VIBES */}
        {view === 'wizard-vibes' && (
          <div className="wizard-step max-w-2xl mx-auto space-y-6 glass-panel p-8 animate-[slideUp_0.3s_ease-out]">
            <div className="space-y-1">
              <span className="text-xs uppercase font-mono font-bold text-amber-500 tracking-wider">Étape 2 sur 3</span>
              <h2 className="text-2xl font-black text-slate-200">Choisis l&apos;ambiance générale 🎭</h2>
              <p className="text-xs text-slate-400">
                Sélectionnez une ou plusieurs vibes pour guider l&apos;intelligence artificielle dans le ton de vos cartes.
              </p>
            </div>

            {/* Vibes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(Object.keys(VIBE_METADATA) as DeckVibe[]).map((vibe) => {
                const meta = VIBE_METADATA[vibe];
                const isActive = selectedVibes.includes(vibe);
                return (
                  <button
                    key={vibe}
                    onClick={() => handleToggleVibe(vibe)}
                    className={`vibe-btn p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-2 ${
                      isActive
                        ? 'bg-amber-500/10 border-amber-500 shadow-md shadow-amber-500/5'
                        : 'bg-white/5 border-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{meta.emoji}</span>
                      <h3 className="font-bold text-lg text-slate-100">{meta.label}</h3>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{meta.desc}</p>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between pt-6 border-t border-white/5">
              <button
                onClick={() => setView('wizard-friends')}
                className="px-6 py-3 text-slate-400 hover:text-white font-bold transition-all text-sm cursor-pointer"
              >
                ← Retour
              </button>
              <button
                onClick={() => setView('wizard-dossiers')}
                disabled={selectedVibes.length === 0}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 disabled:from-slate-800 disabled:text-slate-600 font-bold rounded-xl transition-all text-sm cursor-pointer disabled:cursor-not-allowed"
              >
                Suivant →
              </button>
            </div>
          </div>
        )}

        {/* VIEW 4: STEP 3 - DOSSIERS & CONTEXT */}
        {view === 'wizard-dossiers' && (
          <div className="wizard-step max-w-2xl mx-auto space-y-6 glass-panel p-8 animate-[slideUp_0.3s_ease-out]">
            <div className="space-y-1">
              <span className="text-xs uppercase font-mono font-bold text-amber-500 tracking-wider">Étape 3 sur 3</span>
              <h2 className="text-2xl font-black text-slate-200">Injecte des dossiers croustillants 🤫</h2>
              <p className="text-xs text-slate-400">
                Écrivez une phrase ou une anecdote rapide pour vos amis. Ces éléments seront utilisés par Gemini pour créer des cartes exclusives et hilarantes.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Dossiers Input List */}
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {friends.map((friend) => (
                <div key={friend} className="dossier-card p-4 bg-slate-950/40 border border-white/5 rounded-2xl space-y-2">
                  <label className="text-sm font-bold text-slate-300 block">
                    Anecdote / Secret sur <span className="text-amber-400">{friend}</span>
                  </label>
                  <p className="dossier-prompt text-[11px] text-slate-500 italic">
                    Idée : {getDossierPlaceholder(friend)}
                  </p>
                  <textarea
                    placeholder="Tape ici son dossier..."
                    rows={2}
                    value={dossiers[friend] || ''}
                    onChange={(e) => setDossiers({ ...dossiers, [friend]: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 text-white"
                  />
                </div>
              ))}
            </div>

            {/* Group Context */}
            <div className="space-y-2 pt-2">
              <label className="text-sm font-bold text-slate-300 block">
                Contexte du groupe / Lieu (Optionnel)
              </label>
              <input
                type="text"
                placeholder="Ex: Vacances Ibiza 2025, coloc à Lyon, weekend à la campagne..."
                value={groupContext}
                onChange={(e) => setGroupContext(e.target.value)}
                maxLength={100}
                className="w-full cb-input"
              />
            </div>

            <div className="flex justify-between pt-6 border-t border-white/5">
              <button
                onClick={() => setView('wizard-vibes')}
                className="px-6 py-3 text-slate-400 hover:text-white font-bold transition-all text-sm cursor-pointer"
              >
                ← Retour
              </button>
              <button
                onClick={handleGenerateDeck}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold rounded-xl transition-all text-sm cursor-pointer hover:scale-[1.02] shadow-lg shadow-amber-500/10 flex items-center gap-1.5"
              >
                <span>Générer mon Deck !</span> <span>🪄</span>
              </button>
            </div>
          </div>
        )}

        {/* VIEW 5: LOADING SHOW */}
        {view === 'loading' && (
          <div className="loading-show fixed inset-0 z-50 bg-[#020617] flex flex-col items-center justify-center space-y-8 animate-[fadeIn_0.3s_ease-out]">
            <BackgroundOrbs />

            <div className="loading-card w-24 h-36 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center shadow-2xl relative">
              <div className="absolute inset-1 border-2 border-slate-950/40 rounded-xl flex items-center justify-center">
                <span className="text-4xl text-slate-950">🕵️</span>
              </div>
            </div>

            <div className="space-y-3 text-center px-4 max-w-sm">
              <p className="loading-message text-lg font-bold text-slate-200 min-h-[2rem]">
                {LOADING_MESSAGES[loadingMessageIdx]}
              </p>
              <p className="text-xs text-slate-500 font-mono">
                Gemini 2.0 rédige les 60 cartes en se basant sur vos dossiers... Cela prend environ 5 à 15 secondes.
              </p>
            </div>
          </div>
        )}

        {/* VIEW 6: PREVIEW & PAYWALL */}
        {view === 'preview' && activeDeck && (
          <div className="space-y-8 animate-[slideUp_0.3s_ease-out] max-w-2xl mx-auto">
            <div className="text-center space-y-2">
              <span className="text-xs uppercase font-mono font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-0.5 rounded-full border border-emerald-400/20">
                Génération réussie
              </span>
              <h1 className="text-3xl font-black">Ton Coffre est Prêt ! 📦</h1>
              <p className="text-slate-400 text-sm">
                Découvrez un aperçu des 3 premières cartes générées.
              </p>
            </div>

            {/* Questions Preview */}
            <div className="space-y-4">
              {activeDeck.questions.slice(0, 3).map((q, idx) => (
                <div key={q.id} className="preview-card p-6 glass-panel border-white/5 space-y-2 relative">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest font-mono">
                      Carte {idx + 1} · {q.mode}
                    </span>
                  </div>
                  <p className="text-base text-slate-100 font-semibold leading-relaxed">
                    {q.text}
                  </p>
                </div>
              ))}

              {/* Locked/Blurred Questions Preview */}
              <div className="space-y-4 relative mt-4">
                {[1, 2].map((i) => (
                  <div key={i} className="preview-card locked p-6 glass-panel border-white/5 opacity-40 blur-xs space-y-2 select-none pointer-events-none">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-500 font-mono">CARTE LOCKED</span>
                    </div>
                    <p className="text-base text-slate-500">
                      Ici s&apos;affiche une question croustillante générée par l&apos;IA...
                    </p>
                  </div>
                ))}

                {/* Paywall Overlay */}
                <div className="paywall-overlay absolute inset-0 flex flex-col items-center justify-center bg-slate-950/70 border border-slate-800 rounded-3xl p-6 text-center space-y-4">
                  <span className="text-3xl">🔒</span>
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-amber-400 uppercase tracking-wide">
                      Débloquer les 57 autres cartes
                    </h3>
                    <p className="text-xs text-slate-400 max-w-xs">
                      Obtenez l&apos;accès complet à votre deck personnalisé de 60 cartes, modifiable à volonté et jouable indéfiniment.
                    </p>
                  </div>

                  <button
                    onClick={handleUnlockDeck}
                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black rounded-2xl transition-all hover:scale-[1.02] cursor-pointer shadow-lg shadow-amber-500/15"
                  >
                    Débloquer le Deck Complet • 3€
                  </button>

                  <button
                    onClick={() => setView('list')}
                    className="text-xs text-slate-500 hover:text-slate-400 font-bold underline transition-colors"
                  >
                    Retourner au coffre
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 7: EDITOR */}
        {view === 'editor' && activeDeck && (
          <div className="space-y-6 animate-[slideUp_0.3s_ease-out]">
            {/* Editor Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/40 p-6 rounded-3xl border border-white/5">
              <div className="space-y-2 flex-1 w-full">
                <input
                  type="text"
                  value={deckTitle}
                  onChange={(e) => setDeckTitle(e.target.value)}
                  className="bg-transparent border-b border-transparent hover:border-white/20 focus:border-amber-500 focus:outline-none text-2xl font-black text-white w-full transition-colors"
                  placeholder="Titre du Deck"
                />
                <p className="text-xs text-slate-400 font-mono">
                  {activeDeck.questions.length} cartes personnalisées · Amis : {activeDeck.friends.join(', ')}
                </p>
              </div>

              <div className="flex gap-2 self-end sm:self-center">
                <button
                  onClick={handleSaveChanges}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-white/10 transition-all flex items-center gap-1 cursor-pointer"
                >
                  💾 Sauvegarder
                </button>
                <button
                  onClick={() => handlePlayDeck(activeDeck)}
                  disabled={isLaunching}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-xs font-black rounded-xl transition-all hover:scale-[1.02] cursor-pointer shadow-md shadow-amber-500/10 flex items-center gap-1"
                >
                  <span>🎮</span>
                  <span>Lancer la Partie !</span>
                </button>
              </div>
            </div>

            {/* Grid of editable questions */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-black text-slate-200">Liste des Cartes</h2>
                <button
                  onClick={() => setShowAddCardForm(!showAddCardForm)}
                  className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold rounded-lg hover:bg-amber-500/20 transition-all"
                >
                  {showAddCardForm ? 'Fermer' : '+ Ajouter une carte'}
                </button>
              </div>

              {/* Add Card Form Inline */}
              {showAddCardForm && (
                <div className="p-5 bg-slate-900/60 border border-amber-500/20 rounded-2xl space-y-4 animate-[fadeIn_0.2s_ease-out]">
                  <h3 className="text-sm font-bold text-amber-400">Ajouter une nouvelle question</h3>
                  
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-mono block">Texte de la carte</label>
                    <textarea
                      placeholder="Ex: Qui est le plus susceptible de rater son avion pour Ibiza ?"
                      rows={2}
                      value={newCardText}
                      onChange={(e) => setNewCardText(e.target.value)}
                      className="w-full bg-slate-950/40 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-mono block">Mode de jeu</label>
                      <select
                        value={newCardMode}
                        onChange={(e) => setNewCardMode(e.target.value as QuestionMode)}
                        className="w-full bg-slate-950/40 border border-white/10 rounded-xl p-3 text-xs focus:outline-none text-white"
                      >
                        <option value="ICEBREAKER">🧊 Icebreaker</option>
                        <option value="SPICY">🔥 Spicy</option>
                        <option value="DEEP_CONNECTION">🕯️ Deep Connection</option>
                        <option value="IMPOSTEUR">🎭 Imposteur</option>
                        <option value="MOST_LIKELY_TO">🎯 Most Likely To</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-mono block">Impliquer des joueurs spécifiques (Optionnel)</label>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {activeDeck.friends.map((friend) => {
                          const isSel = newCardPlayers.includes(friend);
                          return (
                            <button
                              key={friend}
                              type="button"
                              onClick={() => togglePlayerForNewCard(friend)}
                              className={`px-2 py-1 rounded-md text-[10px] font-bold border transition-colors ${
                                isSel
                                  ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                                  : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                              }`}
                            >
                              {friend}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleAddCard}
                    disabled={!newCardText.trim()}
                    className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl disabled:bg-slate-800 disabled:text-slate-600 transition-colors"
                  >
                    Ajouter au deck
                  </button>
                </div>
              )}

              {/* Cards Listing */}
              <div className="deck-grid grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeDeck.questions.map((q, index) => {
                  const isEditing = editingCardId === q.id;
                  return (
                    <div
                      key={q.id}
                      className="deck-card p-5 bg-slate-950/40 border border-white/5 rounded-2xl space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                            Carte {index + 1}
                          </span>
                          <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-md ${
                            q.mode === 'SPICY'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : q.mode === 'DEEP_CONNECTION'
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                              : q.mode === 'IMPOSTEUR'
                              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                              : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}>
                            {q.mode}
                          </span>
                        </div>

                        {isEditing ? (
                          <textarea
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            rows={3}
                            className="w-full bg-slate-900 border border-amber-500/35 rounded-xl p-3 text-sm focus:outline-none text-white"
                          />
                        ) : (
                          <p className="card-text text-sm text-slate-200 leading-relaxed font-medium">
                            {q.text}
                          </p>
                        )}
                      </div>

                      {q.involvedPlayers.length > 0 && (
                        <div className="flex flex-wrap gap-1 items-center">
                          <span className="text-[9px] text-slate-500 font-mono uppercase mr-1">Joueurs ciblés:</span>
                          {q.involvedPlayers.map((p) => (
                            <span key={p} className="px-1.5 py-0.5 bg-slate-800 text-[9px] rounded text-slate-300 font-medium">
                              {p}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2 justify-end pt-2 border-t border-white/5">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => setEditingCardId(null)}
                              className="px-2.5 py-1.5 hover:bg-white/5 text-slate-400 text-xs font-bold rounded-lg transition-colors"
                            >
                              Annuler
                            </button>
                            <button
                              onClick={() => saveEditedCard(q.id)}
                              className="px-2.5 py-1.5 bg-amber-500 text-slate-950 text-xs font-bold rounded-lg transition-all"
                            >
                              Valider
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEditingCard(q.id, q.text)}
                              className="edit-btn p-1.5 hover:bg-amber-500/10 text-slate-400 hover:text-amber-400 rounded-lg transition-colors"
                              title="Modifier"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => deleteCard(q.id)}
                              className="delete-btn p-1.5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                              title="Supprimer"
                            >
                              🗑️
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                onClick={() => setView('list')}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl border border-white/5 transition-all cursor-pointer"
              >
                ← Retour au Coffre
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
