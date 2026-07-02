'use client';

import React, { useState } from 'react';
import { Player } from './TalkingStick';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslation } from '@/lib/i18n';
import { PresentielCoupleCrossSell } from './PresentielCoupleCrossSell';

interface EndGameSummaryProps {
  roomCode: string;
  players: Player[];
  modeId: string;
  scores: Record<string, number>;
  onRestart: () => void;
  onExit: () => void;
}

export function EndGameSummary({
  roomCode,
  players,
  modeId,
  scores,
  onRestart,
  onExit
}: EndGameSummaryProps) {
  const [showStoryMode, setShowStoryMode] = useState(false);
  const { t, language } = useTranslation();

  // Determine Archetype
  let archetypeTitle = language === 'fr' ? "L'Archipel des Rires" : "The Archipelago of Laughter";
  let archetypeDescription = language === 'fr'
    ? "Votre groupe brille par sa légèreté et sa complicité spontanée. Toujours prêt à briser la glace avec le sourire."
    : "Your group shines with its lightness and spontaneous complicity. Always ready to break the ice with a smile.";
  let archetypeEmoji = "🏝️";

  if (modeId === 'DEEP_CONNECTION') {
    archetypeTitle = language === 'fr' ? "Le Cercle de Vulnérabilité" : "The Circle of Vulnerability";
    archetypeDescription = language === 'fr'
      ? "Un espace sacré d'écoute et d'authenticité. Vos partages sincères renforcent les fondations invisibles de votre lien."
      : "A sacred space of listening and authenticity. Your sincere sharing strengthens the invisible foundations of your bond.";
    archetypeEmoji = "🌳";
  } else if (modeId === 'SPICY') {
    archetypeTitle = language === 'fr' ? "La Tribu Audacieuse" : "The Bold Tribe";
    archetypeDescription = language === 'fr'
      ? "Des opinions tranchées, des éclats de rire et des débats piquants. L'intensité est votre moteur social."
      : "Strong opinions, bursts of laughter, and spicy debates. Intensity is your social engine.";
    archetypeEmoji = "🌋";
  } else if (modeId === 'IMPOSTEUR') {
    archetypeTitle = language === 'fr' ? "Le Manoir des Secrets" : "The Mansion of Secrets";
    archetypeDescription = language === 'fr'
      ? "Bluff, manipulation bienveillante et déduction. Vos regards en disent long sur votre complicité stratégique."
      : "Bluffing, kind manipulation, and deduction. Your glances speak volumes about your strategic complicity.";
    archetypeEmoji = "🎭";
  } else if (modeId === 'DATE_NIGHT') {
    archetypeTitle = language === 'fr' ? "Le Cocon Doré" : "The Golden Cocoon";
    archetypeDescription = language === 'fr'
      ? "Un espace intime suspendu dans le temps. Idéal pour cultiver la complicité et se redécouvrir à deux."
      : "An intimate space suspended in time. Ideal for cultivating complicity and rediscovering each other.";
    archetypeEmoji = "👩‍❤️‍👨";
  } else if (modeId === 'FAMILY') {
    archetypeTitle = language === 'fr' ? "L'Arbre des Générations" : "The Tree of Generations";
    archetypeDescription = language === 'fr'
      ? "Un partage chaleureux de souvenirs et de gratitudes. Vos racines familiales s'enrichissent de nouveaux récits."
      : "A warm sharing of memories and gratitude. Your family roots are enriched with new stories.";
    archetypeEmoji = "🏡";
  } else if (modeId === 'MOST_LIKELY_TO') {
    archetypeTitle = language === 'fr' ? "Le Tribunal des Sentences" : "The Sentencing Court";
    archetypeDescription = language === 'fr'
      ? "Des rires, des taquineries et des désignations unanimes. Un groupe soudé qui s'assume avec humour."
      : "Laughter, teasing, and unanimous designations. A tight-knit group that takes itself with humor.";
    archetypeEmoji = "⚖️";
  }

  const sortedPlayers = [...players]
    .map(p => ({ ...p, score: scores[p.id] || 0 }))
    .sort((a, b) => b.score - a.score);

  const hasScores = Object.values(scores).some(s => s > 0);

  const badges = sortedPlayers.map((p, idx) => {
    if (idx === 0) return {
      name: p.name,
      title: language === 'fr' ? "L'Œil de Lynx 🔍" : "The Lynx Eye 🔍",
      desc: language === 'fr' ? "A repéré tous les détails et dominé le scoreboard ce soir." : "Spotted all details and dominated the scoreboard tonight."
    };
    if (idx === sortedPlayers.length - 1 && sortedPlayers.length > 1) {
      return {
        name: p.name,
        title: language === 'fr' ? "Le Gardien du Fun 🎈" : "The Guardian of Fun 🎈",
        desc: language === 'fr' ? "Toujours prêt à lancer un éclat de rire et détendre l'atmosphère." : "Always ready to crack a laugh and ease the atmosphere."
      };
    }
    if (idx === 1) return {
      name: p.name,
      title: language === 'fr' ? "L'As du Bluff 🃏" : "The Bluffing Ace 🃏",
      desc: language === 'fr' ? "Expert en manipulation bienveillante et mystères." : "Expert in kind manipulation and mystery."
    };
    return {
      name: p.name,
      title: language === 'fr' ? "L'Ancre Sincère ⚓" : "The Sincere Anchor ⚓",
      desc: language === 'fr' ? "Apporte de l'authenticité et de la profondeur aux partages." : "Brings authenticity and depth to the sharing."
    };
  });

  if (showStoryMode) {
    return (
      <div className="flex flex-col items-center justify-center p-4 max-w-md mx-auto min-h-[500px] text-slate-100 bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl relative animate-[fadeIn_0.3s_ease-out]">
        {/* Story Card Container 9:16 */}
        <div className="w-[300px] h-[533px] bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-500/40 rounded-2xl relative p-6 flex flex-col justify-between items-center text-center overflow-hidden shadow-xl">
          {/* Decorative Radial Background */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

          {/* Header */}
          <div className="z-10 mt-2">
            <span className="text-xs font-black tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400">
              CAPTAIN BOND
            </span>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">
              {language === 'fr' ? 'Salon' : 'Lobby'} {roomCode}
            </p>
          </div>

          {/* Center Content */}
          <div className="z-10 flex flex-col items-center gap-4 my-auto w-full">
            <span className="text-5xl">{archetypeEmoji}</span>
            <div className="space-y-1">
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                {language === 'fr' ? 'Notre Archétype' : 'Our Archetype'}
              </span>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-100 uppercase">{archetypeTitle}</h2>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed px-4 italic animate-pulse">
              &quot;{archetypeDescription}&quot;
            </p>

            {/* Social Badges list in Story */}
            <div className="flex flex-col gap-2 w-full mt-3 px-2">
              {badges.slice(0, 3).map(b => (
                <div key={b.name} className="flex items-center justify-between text-left bg-white/5 border border-white/10 rounded-xl p-2 px-3">
                  <div>
                    <span className="text-[8px] font-bold text-amber-400 block">{b.title}</span>
                    <span className="text-xs font-black text-slate-100 uppercase">{b.name}</span>
                  </div>
                  <span className="text-[9px] text-slate-400 text-right max-w-[120px] leading-tight font-medium">
                    {b.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer with QR Code */}
          <div className="z-10 mb-2 flex items-center justify-center gap-3 bg-slate-950/60 p-2.5 rounded-xl border border-white/5 w-full">
            <div className="bg-white p-1 rounded shadow-lg">
              <QRCodeSVG
                value="https://captainbond.com/couple?ref=instagram_story"
                size={45}
                level="M"
              />
            </div>
            <div className="text-left font-sans">
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block">
                {language === 'fr' ? 'Scanner pour tester' : 'Scan to test'}
              </span>
              <span className="text-[10px] font-black text-amber-500/80 tracking-widest font-mono">CAPTAINBOND.COM</span>
            </div>
          </div>
        </div>

        {/* Back Button and Instructions */}
        <div className="w-full mt-6 space-y-4 px-4 text-center">
          <p className="text-xs text-slate-400 leading-relaxed">
            {language === 'fr' 
              ? "📸 **Prenez une capture d'écran** de ce format vertical pour la partager directement dans votre Story Instagram ou votre groupe WhatsApp !"
              : "📸 **Take a screenshot** of this vertical card to share it directly in your Instagram Story or WhatsApp group!"}
          </p>
          
          <button
            onClick={() => setShowStoryMode(false)}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition-all cursor-pointer border border-slate-700 text-sm border-none"
          >
            {language === 'fr' ? 'Retour au résumé' : 'Back to summary'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-between gap-6 p-6 max-w-md mx-auto min-h-[500px] text-slate-100 bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-700/50 shadow-2xl text-center w-full">
      <div className="flex flex-col items-center gap-3 mt-4">
        <span className="text-5xl animate-[pulse_2s_infinite]">{archetypeEmoji}</span>
        <h2 className="text-2xl font-black text-amber-400 tracking-tight uppercase">
          {language === 'fr' ? 'Partie Terminée !' : 'Game Over!'}
        </h2>
        <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
          {language === 'fr' 
            ? "Félicitations pour vos partages. Vous venez de renforcer la connexion de votre cercle ce soir."
            : "Congratulations on your sharing. You have strengthened the connection of your circle tonight."}
        </p>
      </div>

      {/* Archetype summary */}
      <div className="bg-slate-800/40 border border-slate-700/30 p-5 rounded-2xl w-full text-center space-y-2">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
          {language === 'fr' ? 'Archétype du Groupe' : 'Group Archetype'}
        </span>
        <h3 className="text-lg font-bold text-slate-200 uppercase">{archetypeTitle}</h3>
        <p className="text-xs text-slate-400 leading-relaxed font-medium">
          {archetypeDescription}
        </p>
      </div>

      {/* Optional Scoreboard */}
      {hasScores && (
        <div className="bg-slate-800/40 border border-slate-700/30 p-4 rounded-2xl w-full text-left space-y-2">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block text-center">
            {language === 'fr' ? 'Scoreboard Final' : 'Final Scoreboard'}
          </span>
          <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
            {sortedPlayers.map((player, idx) => (
              <div key={player.id} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 w-4 font-bold">{idx + 1}.</span>
                  <span className="text-slate-300 font-semibold">{player.name}</span>
                </div>
                <span className="text-amber-400 font-mono font-bold bg-amber-400/10 px-2.5 py-0.5 rounded-md text-xs">
                  {player.score} {player.score > 1 ? (language === 'fr' ? 'votes' : 'votes') : (language === 'fr' ? 'vote' : 'vote')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Couple Referral Hook */}
      <PresentielCoupleCrossSell language={language} />

      {/* Action CTA Grid */}
      <div className="w-full space-y-3 mt-2">
        <button
          onClick={() => setShowStoryMode(true)}
          className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black text-base rounded-2xl transition-all cursor-pointer shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 border-none"
        >
          <span>📸</span>
          <span>{language === 'fr' ? 'Fiche Story Instagram (9:16)' : 'Instagram Story Card (9:16)'}</span>
        </button>

        <div className="flex gap-3 w-full">
          <button
            onClick={onRestart}
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition-all cursor-pointer border border-slate-700 text-sm border-none"
          >
            {language === 'fr' ? 'Rejouer' : 'Replay'}
          </button>
          
          <button
            onClick={onExit}
            className="flex-1 py-3 bg-slate-900 hover:bg-slate-850 text-slate-400 font-bold rounded-xl transition-all cursor-pointer border border-slate-800 text-sm border-none"
          >
            {t('weekly_close_btn')}
          </button>
        </div>
      </div>
    </div>
  );
}
