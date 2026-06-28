'use client';

import { useState } from 'react';
import { Icon } from '@/components/Icon';
import { CustomDeck } from '@/lib/custom-decks/types';
import { getLocalDecks } from '@/lib/custom-decks/storage';
import { useTranslation } from '@/lib/i18n';

export interface Player {
  id: string;
  name: string;
}

interface PlayerSetupProps {
  onStart: (players: Player[]) => void;
  minPlayers?: number;
  maxPlayers?: number;
}

export function PlayerSetup({
  onStart,
  minPlayers = 2,
  maxPlayers = 6
}: PlayerSetupProps) {
  const { t, language } = useTranslation();
  const [players, setPlayers] = useState<Player[]>([]);
  const [newName, setNewName] = useState('');
  const [couples, setCouples] = useState<string[][]>([]);
  const [linkingPlayerId, setLinkingPlayerId] = useState<string | null>(null);

  // Consent states
  const [consentRGPD, setConsentRGPD] = useState(false);
  const [consentSafety, setConsentSafety] = useState(false);
  const [hasConsented, setHasConsented] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('captainbond_presentiel_consent_v1') === 'true';
  });
  const [localDecks] = useState<CustomDeck[]>(() => {
    if (typeof window === 'undefined') return [];
    return getLocalDecks().filter(d => d.isPurchased);
  });
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const active = sessionStorage.getItem('cb_active_custom_deck');
    if (!active) return null;
    try {
      const deck = JSON.parse(active) as CustomDeck;
      return deck.id;
    } catch {
      return null;
    }
  });

  const addPlayer = () => {
    const trimmed = newName.trim();
    if (trimmed && players.length < maxPlayers) {
      // Check for duplicates
      if (players.some(p => p.name.toLowerCase() === trimmed.toLowerCase())) {
        return;
      }
      setPlayers([
        ...players,
        { id: crypto.randomUUID(), name: trimmed }
      ]);
      setNewName('');
    }
  };

  const removePlayer = (id: string) => {
    const pToRemove = players.find(p => p.id === id);
    if (pToRemove) {
      setCouples(prev => prev.filter(c => !c.includes(pToRemove.name)));
    }
    setPlayers(players.filter(p => p.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addPlayer();
    }
  };

  const canStart = players.length >= minPlayers;

  const handleStart = () => {
    if (!canStart) return;
    if (selectedDeckId) {
      const deck = localDecks.find(d => d.id === selectedDeckId);
      if (deck) {
        sessionStorage.setItem('cb_active_custom_deck', JSON.stringify(deck));
      }
    } else {
      sessionStorage.removeItem('cb_active_custom_deck');
    }
    // Save presential couples
    sessionStorage.setItem('cb_presentiel_couples', JSON.stringify(couples));
    onStart(players);
  };

  if (!hasConsented) {
    return (
      <div className="flex flex-col gap-6 p-6 max-w-md mx-auto min-h-[500px] justify-between text-slate-100 bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-700/50 shadow-2xl">
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <div className="inline-block p-3 bg-amber-500/10 rounded-2xl mb-3 border border-amber-500/20">
              {/* Lock SVG Icon */}
              <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-amber-200 to-yellow-400 bg-clip-text text-transparent">
              {language === 'fr' ? 'Confiance & Sécurité' : 'Trust & Safety'}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {language === 'fr' ? 'Veuillez accepter la charte de jeu avant de commencer' : 'Please accept the game charter before starting'}
            </p>
          </div>

          <div className="flex flex-col gap-5 mt-2">
            {/* Checkbox A: RGPD */}
            <label className="flex items-start gap-3 cursor-pointer text-slate-300 hover:text-slate-200 bg-slate-800/20 p-4 border border-slate-700/30 rounded-2xl transition-all">
              <input
                type="checkbox"
                checked={consentRGPD}
                onChange={(e) => setConsentRGPD(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-slate-600 bg-slate-950 text-amber-500 focus:ring-amber-500/40 cursor-pointer"
              />
              <span className="text-xs leading-relaxed">
                <strong className="text-amber-400 block mb-1">
                  {language === 'fr' ? 'Prénoms & RGPD (Local-only)' : 'First Names & GDPR (Local-only)'}
                </strong>
                {language === 'fr' 
                  ? "J'accepte que les prénoms des joueurs soient saisis. En mode Présentiel local, toutes les réponses restent stockées localement sur ce téléphone et sont détruites à la fin de la partie (zéro transmission serveur)."
                  : "I agree that the players' first names will be entered. In local Presential mode, all answers remain stored locally on this phone and are destroyed at the end of the game (zero server transmission)."}
              </span>
            </label>

            {/* Checkbox B: Emotional Safety */}
            <label className="flex items-start gap-3 cursor-pointer text-slate-300 hover:text-slate-200 bg-slate-800/20 p-4 border border-slate-700/30 rounded-2xl transition-all">
              <input
                type="checkbox"
                checked={consentSafety}
                onChange={(e) => setConsentSafety(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-slate-600 bg-slate-950 text-amber-500 focus:ring-amber-500/40 cursor-pointer"
              />
              <span className="text-xs leading-relaxed">
                <strong className="text-amber-400 block mb-1">
                  {language === 'fr' ? 'Cadre Bienveillant & Safe Skip' : 'Kind Atmosphere & Safe Skip'}
                </strong>
                {language === 'fr'
                  ? "Nous acceptons de jouer dans un esprit de bienveillance (particulièrement en présence d'alcool). Chaque joueur est libre d'utiliser le bouton Safe Skip (Joker) à tout moment sans jugement."
                  : "We agree to play in a kind spirit (especially in the presence of alcohol). Every player is free to use the Safe Skip (Joker) button at any time without judgment."}
              </span>
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              if (consentRGPD && consentSafety) {
                setHasConsented(true);
                localStorage.setItem('captainbond_presentiel_consent_v1', 'true');
              }
            }}
            disabled={!consentRGPD || !consentSafety}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 disabled:from-slate-800 disabled:to-slate-800 text-slate-950 disabled:text-slate-600 font-bold text-lg rounded-2xl transition-all cursor-pointer disabled:cursor-not-allowed shadow-xl shadow-amber-500/10 flex items-center justify-center gap-2 border-none"
          >
            {language === 'fr' ? 'Confirmer & Continuer' : 'Confirm & Continue'}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </button>
          <p className="text-[10px] text-center text-slate-500 font-mono">
            {language === 'fr' ? 'Conforme RGPD 2026 • Données Privées' : 'GDPR Compliant 2026 • Private Data'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-6 max-w-md mx-auto min-h-[500px] justify-between text-slate-100 bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-700/50 shadow-2xl">
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <div className="inline-block p-3 bg-amber-500/10 rounded-2xl mb-3 border border-amber-500/20">
            {/* SVG Icon for Players Group */}
            <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-amber-200 to-yellow-400 bg-clip-text text-transparent">
            {language === 'fr' ? 'Qui joue ce soir ?' : 'Who is playing tonight?'}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {language === 'fr' ? `Ajoutez les prénoms des participants (2 à ${maxPlayers} joueurs)` : `Add participants' first names (2 to ${maxPlayers} players)`}
          </p>
        </div>

        {/* Input area */}
        {players.length < maxPlayers ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={language === 'fr' ? "Prénom..." : "First name..."}
              maxLength={20}
              className="flex-1 px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
            />
            <button
              onClick={addPlayer}
              disabled={!newName.trim()}
              className="px-5 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-semibold rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed flex items-center gap-1 shadow-lg shadow-amber-500/10 border-none"
            >
              {language === 'fr' ? 'Ajouter' : 'Add'}
            </button>
          </div>
        ) : (
          <p className="text-sm text-center text-amber-400 bg-amber-400/10 border border-amber-400/20 py-2 rounded-xl">
            {language === 'fr' ? `Nombre maximum de joueurs atteint (${maxPlayers})` : `Maximum number of players reached (${maxPlayers})`}
          </p>
        )}

        {/* Players List */}
        <div className="flex flex-col gap-2 max-h-[240px] overflow-y-auto pr-1">
          {players.map((player, index) => (
            <div
              key={player.id}
              className="flex items-center justify-between p-3.5 bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/30 rounded-xl transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 text-xs font-bold text-slate-400 group-hover:text-amber-400 group-hover:bg-amber-500/10 border border-slate-700 transition-all">
                  {index + 1}
                </span>
                <div className="flex flex-col">
                  <span className="font-medium text-slate-200">
                    {player.name}
                  </span>
                  {couples.some(c => c.includes(player.name)) && (
                    <span className="text-[10px] text-rose-400 font-semibold mt-0.5">
                      <Icon name="heart" className="w-3 h-3 inline text-rose-400" /> {language === 'fr' ? 'Couple avec' : 'Couple with'} {couples.find(c => c.includes(player.name))?.find(n => n !== player.name)}
                    </span>
                  )}
                  {linkingPlayerId === player.id && (
                    <span className="text-[10px] text-rose-300 font-semibold mt-0.5 animate-pulse">
                      <Icon name="heart" className="w-3 h-3 inline text-rose-300" /> {language === 'fr' ? "Qui est le partenaire ? (Cliquez sur l'autre)" : 'Who is the partner? (Click on the other)'}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Heart Button for Coupling */}
                <button
                  type="button"
                  onClick={() => {
                    const couplePair = couples.find(c => c.includes(player.name));
                    if (couplePair) {
                      setCouples(couples.filter(c => !c.includes(player.name)));
                    } else if (linkingPlayerId) {
                      const partner = players.find(p => p.id === linkingPlayerId);
                      if (partner && partner.id !== player.id) {
                        setCouples([...couples, [partner.name, player.name]]);
                      }
                      setLinkingPlayerId(null);
                    } else {
                      setLinkingPlayerId(player.id);
                    }
                  }}
                  className={`p-1 rounded-lg transition-all cursor-pointer border-none bg-transparent ${
                    couples.some(c => c.includes(player.name))
                      ? 'text-rose-500 bg-rose-500/10 hover:bg-rose-500/20'
                      : linkingPlayerId === player.id
                      ? 'text-rose-400 bg-rose-500/20 animate-pulse'
                      : 'text-slate-500 hover:text-rose-400 hover:bg-rose-500/10'
                  }`}
                  title={
                    couples.some(c => c.includes(player.name))
                      ? `${language === 'fr' ? 'Couple avec' : 'Couple with'} ${couples.find(c => c.includes(player.name))?.find(n => n !== player.name)}`
                      : linkingPlayerId === player.id
                      ? (language === 'fr' ? "Liaison en cours..." : "Linking in progress...")
                      : (language === 'fr' ? "Lier ce joueur en couple" : "Link this player in couple")
                  }
                >
                  <Icon name="heart" className={`w-5 h-5 ${couples.some(c => c.includes(player.name)) ? 'text-rose-500' : 'text-current'}`} />
                </button>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => removePlayer(player.id)}
                  className="p-1 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded-lg transition-all cursor-pointer border-none bg-transparent"
                  title={language === 'fr' ? "Supprimer" : "Delete"}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}

          {players.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-slate-500 border-2 border-dashed border-slate-800 rounded-2xl">
              <p className="text-sm">{language === 'fr' ? "Aucun joueur enregistré" : "No players registered"}</p>
            </div>
          )}
        </div>
      </div>

      {/* Selector of Decks */}
      {localDecks.length > 0 && (
        <div className="space-y-3 bg-slate-900/60 border border-slate-800 rounded-3xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono font-bold text-amber-500 tracking-wider">
              {language === 'fr' ? "Jouer un Deck Souvenir ?" : "Play a Memory Deck?"}
            </span>
            {selectedDeckId && (
              <button
                onClick={() => setSelectedDeckId(null)}
                className="text-xs text-red-400 hover:text-red-300 font-bold underline cursor-pointer border-none bg-transparent"
              >
                {language === 'fr' ? "Réinitialiser" : "Reset"}
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-2 max-h-[150px] overflow-y-auto pr-1">
            {localDecks.map(deck => {
              const isSelected = selectedDeckId === deck.id;
              return (
                <button
                  key={deck.id}
                  onClick={() => setSelectedDeckId(deck.id)}
                  className={`w-full text-left py-3 px-4 border rounded-xl transition-all cursor-pointer flex justify-between items-center ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <div>
                    <span className="text-sm font-bold block">{deck.title}</span>
                    <span className="text-xs text-slate-500 font-mono block">
                      {deck.questions.length} {language === 'fr' ? 'cartes' : 'cards'} · {deck.friends.join(', ')}
                    </span>
                  </div>
                  {isSelected && <Icon name="check" className="w-5 h-5 text-amber-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Start Button */}
      <div className="flex flex-col gap-3">
        <button
          onClick={handleStart}
          disabled={!canStart}
          className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 disabled:from-slate-800 disabled:to-slate-800 text-slate-950 disabled:text-slate-600 font-bold text-lg rounded-2xl transition-all cursor-pointer disabled:cursor-not-allowed shadow-xl shadow-amber-500/10 flex items-center justify-center gap-2 border-none"
        >
          {language === 'fr' ? "C'est parti !" : "Let's go!"}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>

        <p className="text-xs text-center text-slate-500">
          {language === 'fr' 
            ? `${players.length} / ${maxPlayers} joueurs (minimum ${minPlayers} requis)`
            : `${players.length} / ${maxPlayers} players (minimum ${minPlayers} required)`}
        </p>
      </div>
    </div>
  );
}
