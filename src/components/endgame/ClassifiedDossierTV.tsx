import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface PlayerDossier {
  id: string;
  name: string;
}

export interface PlayerProfile {
  playerId: string;
  isUnlocked: boolean;
  profile?: {
    archetype?: string;
    archetypeEmoji?: string;
    funniestTrait?: string;
    axes?: { alignment: number; perspicacity: number; deception: number };
  };
}

interface ClassifiedDossierTVProps {
  players: PlayerDossier[];
  roomCode: string;
  currentMode?: string;
  profiles?: PlayerProfile[];
}

function hashScores(names: string[]): { complicity: number; attraction: number; alignment: number } {
  const seed = names.join('').toLowerCase().split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  const next = (offset: number) => 70 + ((seed + offset) % 25);
  return {
    complicity: next(0),
    attraction: next(7),
    alignment: next(13),
  };
}

export function ClassifiedDossierTV({ players, roomCode, currentMode, profiles = [] }: ClassifiedDossierTVProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => (p < 100 ? p + 1 : 100));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const isDateNight = currentMode === 'DATE_NIGHT';
  const anyUnlocked = profiles.some(pr => pr.isUnlocked);
  const isDecryptedDateNight = isDateNight && anyUnlocked;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center p-8 bg-black/80 border-2 border-red-500/50 rounded-2xl relative overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.2)]">
      <div className="absolute top-0 left-0 w-full h-1 bg-red-500/20">
        <div className="h-full bg-red-500 transition-all duration-75" style={{ width: `${progress}%` }} />
      </div>
      
      <h2 className="text-4xl md:text-6xl font-black text-red-500 tracking-widest mb-2 uppercase drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">
        {isDateNight ? 'Dossier Scellé' : 'Protocole de Sécurité'}
      </h2>
      <p className="text-red-400/80 mb-6 text-lg md:text-xl font-mono">
        {isDateNight 
          ? 'Score de complicité calculé. Résultat fictif, à prendre comme un jeu.' 
          : 'Analyse comportementale terminée. Compilation des dossiers en cours...'}
      </p>

      {/* Warning Banner */}
      <div className="w-full max-w-lg bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-8 text-amber-400 text-xs font-mono leading-relaxed flex items-start gap-2 text-left">
        <span className="text-sm">⚠️</span>
        <span>
          <strong>Fiction de divertissement :</strong> Les profils affichés sont des fictions de divertissement (effet Barnum) et ne constituent en aucun cas des diagnostics relationnels, psychologiques ou cliniques.
        </span>
      </div>

      {isDateNight ? (
        isDecryptedDateNight ? (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-green-500/80 bg-green-500/20 rounded-2xl w-full max-w-lg transition-all duration-500 shadow-[0_0_30px_rgba(34,197,94,0.15)] animate-fade-in">
            <div className="text-7xl mb-4">🥂❤️✨</div>
            <h3 className="font-bold text-green-400 mb-1 text-3xl uppercase tracking-wider">Complices Absolus</h3>
            <p className="text-slate-400 text-sm font-mono mb-6 uppercase tracking-wider text-center">
              {players[0]?.name || 'Agent A'} &amp; {players[1]?.name || 'Agent B'}
            </p>
            
            <p className="text-slate-200 text-center text-sm leading-relaxed mb-6 italic">
              &ldquo;À titre de divertissement, votre complicité est estimée à un niveau extrêmement élevé. Votre capacité à anticiper les réactions de l&apos;autre est votre plus grande force — en jeu, du moins.&rdquo;
            </p>
            <p className="text-slate-500 text-xs text-center font-mono mb-6">
              Résultat fictif, à prendre comme un jeu. Pas un diagnostic relationnel.
            </p>

            {
              (() => {
                const unlockedProfiles = profiles.filter((p) => p.isUnlocked && p.profile);
                const axesA = unlockedProfiles[0].profile?.axes;
                const axesB = unlockedProfiles[1].profile?.axes;
                const scores = axesA && axesB
                  ? {
                      complicity: Math.round((axesA.perspicacity + axesB.perspicacity) / 2),
                      attraction: Math.round((axesA.alignment + axesB.alignment) / 2),
                      alignment: Math.round((axesA.alignment + axesB.alignment) / 2),
                    }
                  : hashScores(players.map((p) => p.name));
                return (
                  <div className="w-full grid grid-cols-3 gap-3 mb-6 bg-black/40 p-4 rounded-xl border border-white/5">
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-slate-400 mb-1 font-mono">Complicité</span>
                      <span className="text-xl font-black text-purple-400">{scores.complicity}%</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-slate-400 mb-1 font-mono">Attraction</span>
                      <span className="text-xl font-black text-blue-400">{scores.attraction}%</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-slate-400 mb-1 font-mono">Alignement</span>
                      <span className="text-xl font-black text-red-400">{scores.alignment}%</span>
                    </div>
                  </div>
                );
              })()
            }

            <span className="text-sm font-mono px-4 py-2 rounded font-black tracking-widest bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.6)]">
              DÉCRYPTÉ & SÉCURISÉ
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-amber-500/50 bg-amber-500/5 rounded-2xl w-full max-w-lg transition-all duration-500 shadow-[0_0_30px_rgba(245,158,11,0.15)] animate-fade-in">
            <div className="text-7xl mb-4 animate-pulse">❤️🔒🥂</div>
            <h3 className="font-bold text-white mb-2 text-2xl">Dossier Secret N°84</h3>
            <p className="text-slate-400 text-sm font-mono mb-6 uppercase tracking-wider text-center">
              {players[0]?.name || 'Agent A'} & {players[1]?.name || 'Agent B'}
            </p>
            <span className="text-sm font-mono px-4 py-2 rounded font-black tracking-widest bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.6)]">
              SCELLÉ & VERROUILLÉ
            </span>
            <p className="text-slate-400 text-xs mt-6 text-center font-mono">
              CONSULTEZ VOS TÉLÉPHONES POUR DÉVERROUILLER
            </p>
          </div>
        )
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full">
          {players.map(p => {
            const profileData = profiles.find(pr => pr.playerId === p.id);
            const isDecrypted = !!profileData?.isUnlocked;
            const playerProfile = profileData?.profile;

            return (
              <div key={p.id} className={`flex flex-col items-center p-6 border-2 ${isDecrypted ? 'border-green-500/80 bg-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.1)]' : 'border-red-500/30 bg-red-500/5'} rounded-2xl transition-all duration-500 transform hover:scale-[1.02]`}>
                {/* Avatar/Emoji Section */}
                <div className={`w-20 h-20 rounded-full mb-4 flex items-center justify-center border-2 ${isDecrypted ? 'border-green-400 bg-black' : 'border-red-500/50 bg-black/60'} overflow-hidden shadow-inner relative`}>
                  {isDecrypted ? (
                    <span className="text-4xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] select-none">
                      {playerProfile?.archetypeEmoji || '🕵️'}
                    </span>
                  ) : (
                    <span className="text-3xl opacity-40 select-none">🔒</span>
                  )}
                  {isDecrypted && (
                    <div className="absolute inset-0 bg-green-500/5 animate-pulse pointer-events-none" />
                  )}
                </div>

                {/* Player Name */}
                <span className="font-black text-white mb-1 text-xl tracking-wide uppercase">{p.name}</span>

                {/* Archetype / Status */}
                {isDecrypted ? (
                  <div className="text-center w-full mt-2">
                    <span className="text-xs font-mono px-3 py-1 rounded bg-green-500 text-black font-black tracking-wider uppercase block truncate max-w-full">
                      {playerProfile?.archetype || 'DÉCRYPTÉ'}
                    </span>
                    {playerProfile?.funniestTrait && (
                      <p className="text-slate-300 text-xs mt-3 leading-snug font-mono italic px-2 py-1 bg-black/40 rounded border border-white/5">
                        &ldquo;{playerProfile.funniestTrait}&rdquo;
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center w-full mt-2">
                    <span className="text-xs font-mono px-3 py-1 rounded bg-red-500 text-black font-black tracking-wider uppercase block">
                      VERROUILLÉ
                    </span>
                    <p className="text-slate-500 text-[10px] font-mono mt-3 uppercase tracking-wider">
                      Scannez pour révéler
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      <div className="mt-12 text-slate-500 font-mono text-sm">
        ATTENTE DE L&apos;AUTORISATION DES AGENTS SUR LEURS TERMINAUX MOBILES...
      </div>

      <div className="mt-10 flex flex-col items-center gap-3 p-6 bg-white/5 border border-white/10 rounded-2xl">
        <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">Partager la partie</p>
        <QRCodeSVG value={`https://captainbond.com/join/${roomCode}`} size={128} bgColor="transparent" fgColor="#ffffff" />
        <p className="text-white font-mono text-xs">captainbond.com/join/{roomCode}</p>
      </div>
    </div>
  );
}
