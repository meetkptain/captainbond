import React, { useEffect, useState } from 'react';
import { MONETIZATION_CONFIG } from '@/lib/config/monetization';
import { api } from '@/lib/api/client';
import { ShareSheet } from '@/components/ShareSheet';
import { capture, AnalyticsEvents } from '@/lib/analytics';

interface PlayerProfile {
  archetype: string;
  archetypeEmoji: string;
  barnumText: string;
  axes: { alignment: number; perspicacity: number; deception: number };
  confidencePercent: number;
  questionsAnswered: number;
  isReady: boolean;
  funniestTrait?: string;
}

interface ClassifiedDossierPlayerProps {
  playerName: string;
  playerId: string;
  roomCode: string;
}

function hashCoupleScores(seed: string): { complicity: number; attraction: number; alignment: number } {
  const code = seed.toLowerCase().split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  const next = (offset: number) => 70 + ((code + offset) % 25);
  return {
    complicity: next(0),
    attraction: next(7),
    alignment: next(13),
  };
}

export function ClassifiedDossierPlayer({ playerName, playerId, roomCode }: ClassifiedDossierPlayerProps) {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [currentMode, setCurrentMode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [connectionsTeaser, setConnectionsTeaser] = useState<{ hasConnections: boolean; teaseName?: string } | null>(null);
  const [revealedConnections, setRevealedConnections] = useState<Array<{ voterName: string; voteCount: number }>>([]);

  // Fetch le profil calculé à l'ouverture
  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await api.get<{ profile?: PlayerProfile; currentMode?: string }>(
          `/api/room/profile?roomCode=${roomCode}&playerId=${playerId}`
        );
        if (data.profile) {
          setProfile(data.profile);
        }
        if (data.currentMode) {
          setCurrentMode(data.currentMode);
        }
      } catch (e) {
        console.error('Erreur récupération profil:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [roomCode, playerId]);

  // Fetch teaser of connection votes
  useEffect(() => {
    async function fetchTeaser() {
      try {
        const data = await api.get<{ hasConnections: boolean; teaseName?: string }>(
          `/api/room/connections?roomCode=${roomCode}&playerId=${playerId}`
        );
        setConnectionsTeaser(data);
      } catch (e) {
        console.error('Error fetching connections teaser:', e);
      }
    }
    fetchTeaser();
  }, [roomCode, playerId]);

  // Fetch revealed connection details if unlocked
  useEffect(() => {
    async function fetchRevealed() {
      if (!unlocked) return;
      try {
        const data = await api.post<{ connections: Array<{ voterName: string; voteCount: number }> }>(
          '/api/room/connections',
          { roomCode, playerId }
        );
        if (data.connections) {
          setRevealedConnections(data.connections);
        }
      } catch (e) {
        console.error('Error fetching revealed connections:', e);
      }
    }
    fetchRevealed();
  }, [unlocked, roomCode, playerId]);

  // Vérifier les entitlements au montage
  useEffect(() => {
    async function checkEntitlements() {
      try {
        const data = await api.get<{ accessibleFeatures?: string[] }>(
          `/api/me/entitlements?playerId=${playerId}&roomCode=${roomCode}`
        );
        const isCouple = currentMode === 'DATE_NIGHT';
        const shouldUnlock = isCouple
          ? data.accessibleFeatures?.includes('profile_couple') || data.accessibleFeatures?.includes('profiles') || data.accessibleFeatures?.includes('profile')
          : data.accessibleFeatures?.includes('profile') || data.accessibleFeatures?.includes('profiles');
        setUnlocked(!!shouldUnlock);
      } catch (e) {
        console.error('Erreur vérification entitlements:', e);
      }
    }
    if (currentMode) checkEntitlements();
  }, [playerId, roomCode, currentMode]);

  // Paiement Stripe réel
  const handlePayment = async () => {
    setPaying(true);
    try {
      const successUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/room/${roomCode}/player?paid=profile`;
      const cancelUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/room/${roomCode}/player`;
      const data = await api.post<{ sessionUrl?: string; error?: string }>('/api/checkout/profile', {
        playerId,
        roomCode,
        successUrl,
        cancelUrl,
      });
      if (data.sessionUrl) {
        window.location.href = data.sessionUrl;
      } else {
        console.error('Erreur paiement:', data.error);
      }
    } catch (e) {
      console.error('Erreur paiement:', e);
    } finally {
      setPaying(false);
    }
  };

  // Vérifier si l'utilisateur revient d'un paiement Stripe réussi
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('paid') === 'profile') {
      // Re-vérifier les entitlements serveur
      api.get<{ accessibleFeatures?: string[] }>(`/api/me/entitlements?playerId=${playerId}&roomCode=${roomCode}`)
        .then(data => {
          const isCouple = currentMode === 'DATE_NIGHT';
          const shouldUnlock = isCouple
            ? data.accessibleFeatures?.includes('profile_couple') || data.accessibleFeatures?.includes('profiles') || data.accessibleFeatures?.includes('profile')
            : data.accessibleFeatures?.includes('profile') || data.accessibleFeatures?.includes('profiles');
          setUnlocked(!!shouldUnlock);
          window.history.replaceState({}, '', `/room/${roomCode}/player`);
        })
        .catch(e => console.error('Erreur refresh entitlements:', e));
    }
  }, [roomCode, playerId, currentMode]);

  const isDateNight = currentMode === 'DATE_NIGHT';
  const isCoupleShared = isDateNight && unlocked;
  const coupleScores = isCoupleShared ? hashCoupleScores(`${playerName}-${roomCode}`) : null;
  const priceCents = isDateNight ? MONETIZATION_CONFIG.COUPLE_PROFILE_PRICE_CENTS : MONETIZATION_CONFIG.PROFILE_PRICE_CENTS;
  const priceString = `${(priceCents / 100).toFixed(2).replace('.', ',')}€`;

  // --- Loading ---
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
        <div className="w-10 h-10 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin mb-4" />
        <p className="text-slate-400 font-mono text-sm">Compilation du dossier en cours...</p>
      </div>
    );
  }

  // --- Modal de Partage Story (9:16) ---
  if (showShareModal && profile) {
    const emojiStr = isCoupleShared ? '🥂❤️' : profile.archetypeEmoji;
    const titleStr = isCoupleShared ? 'Complices Absolus' : profile.archetype;
    const traitStr = isCoupleShared
      ? `${playerName} & son partenaire — ${coupleScores?.complicity}% de complicité estimée en jeu. Capables d'anticiper la moindre réaction de l'autre.`
      : profile.funniestTrait || `${playerName} — ${profile.barnumText.slice(0, 80)}...`;

    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white p-6 overflow-y-auto animate-fade-in">
        {/* En-tête */}
        <div className="flex justify-between items-center mb-6 w-full max-w-sm mx-auto">
          <span className="text-xs text-slate-500 font-mono tracking-widest uppercase">Format Story 9:16</span>
          <button 
            onClick={() => setShowShareModal(false)}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-slate-300 active:scale-95 transition-all text-xl"
          >
            ✕
          </button>
        </div>

        {/* Instructions */}
        <div className="text-center mb-4 max-w-xs mx-auto">
          <p className="text-neon-pink font-bold text-sm mb-1 animate-pulse">📸 Capturez votre écran !</p>
          <p className="text-slate-400 text-xs leading-relaxed">
            Faites une capture d&apos;écran et partagez-la directement en Story TikTok ou Instagram.
          </p>
        </div>

        {/* Le visuel 9:16 Dossier CIA */}
        <div className="w-full max-w-sm aspect-[9/16] mx-auto bg-slate-900 border-2 border-red-500/50 rounded-3xl relative overflow-hidden flex flex-col justify-between p-6 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
          {/* Ornements visuels */}
          <div className="absolute top-0 left-0 w-full h-1 bg-red-500/30" />
          <div className="absolute bottom-0 left-0 w-full h-1 bg-red-500/30" />
          
          {/* Header */}
          <div className="flex justify-between items-start border-b border-red-500/20 pb-3">
            <div>
              <p className="text-[10px] font-mono text-red-500 tracking-widest uppercase font-bold">DOSSIER DE SÉCURITÉ</p>
              <p className="text-lg font-black tracking-tight text-white mt-1">CAPTAIN BOND</p>
            </div>
            <span className="text-[9px] font-mono text-red-500 border border-red-500/50 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider rotate-[5deg]">
              {isCoupleShared ? 'COUPLE' : 'TOP SECRET'}
            </span>
          </div>

          {/* Badge Agent & Photo */}
          <div className="flex gap-4 items-center mt-6">
            <div className="w-20 h-20 bg-slate-950 border border-white/10 rounded-2xl flex items-center justify-center relative overflow-hidden shadow-inner">
              <span className="text-4xl opacity-10 font-bold select-none">{isCoupleShared ? '👥' : '👤'}</span>
              <div className="absolute inset-0 bg-red-500/5 backdrop-blur-[1px]" />
              <div className="absolute bottom-1 w-full text-center">
                <span className="text-[8px] font-mono text-red-500 font-bold uppercase">
                  {isCoupleShared ? 'COUPLE DECLASSIFIED' : 'AGENT ACTIVE'}
                </span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">IDENTITÉ</p>
              <p className="text-xl font-black text-white tracking-wide">{playerName.toUpperCase()}</p>
              <p className="text-[10px] font-mono text-red-400 mt-0.5">CODE ACCÈS : {roomCode}</p>
            </div>
          </div>

          {/* Section Archetype */}
          <div className="my-auto py-6 flex flex-col items-center justify-center text-center">
            <div className="text-7xl mb-4 filter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              {emojiStr}
            </div>
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1 font-bold">
              {isCoupleShared ? 'RÉSULTAT DUO' : 'PROFIL LUDIQUE'}
            </p>
            <h3 className="text-2xl font-black text-red-500 tracking-tight leading-none uppercase">
              {titleStr}
            </h3>
          </div>

          {/* Trait drôle dynamique */}
          <div className="bg-slate-950/80 border border-red-500/20 rounded-2xl p-4 mb-4 shadow-inner">
            <p className="text-red-400 font-mono text-[10px] font-bold uppercase tracking-wider mb-1">
              ✓ ANALYSE COMPORTEMENTALE :
            </p>
            <p className="text-slate-200 text-xs leading-relaxed font-mono">
              &ldquo;{traitStr}&rdquo;
            </p>
          </div>

          {/* Footer Card */}
          <div className="border-t border-red-500/20 pt-3 flex justify-between items-center">
            <div>
              <p className="text-[8px] font-mono text-slate-500 uppercase font-bold tracking-widest">Testez vos amis sur :</p>
              <p className="text-xs font-black text-white tracking-tight mt-0.5 font-mono">captainbond.com</p>
            </div>
            {/* Simulation de code-barres */}
            <div className="flex flex-col gap-0.5 opacity-55">
              <div className="flex gap-0.5 h-6">
                <div className="w-[1px] bg-white h-full" />
                <div className="w-[2px] bg-white h-full" />
                <div className="w-[1px] bg-white h-full" />
                <div className="w-[3px] bg-white h-full" />
                <div className="w-[1px] bg-white h-full" />
                <div className="w-[2px] bg-white h-full" />
                <div className="w-[1px] bg-white h-full" />
              </div>
              <span className="text-[7px] font-mono text-slate-600 text-center select-none">BOND-9827-X</span>
            </div>
          </div>
        </div>

        {/* Partage natif / WhatsApp / SMS */}
        <div className="w-full max-w-sm mx-auto mt-6 mb-8">
          <ShareSheet
            title={isCoupleShared ? 'Notre Dossier Couple Captain Bond' : 'Mon Dossier Captain Bond'}
            text={traitStr}
            url={`https://captainbond.com/join/${roomCode}`}
            onClose={() => setShowShareModal(false)}
            onShare={(channel) => capture(AnalyticsEvents.PROFILE_SHARED, { room_code: roomCode, channel })}
          />
        </div>
      </div>
    );
  }

  // --- Modal de partage message ---
  if (showShareSheet) {
    const shareTitle = isCoupleShared ? 'Notre Dossier Couple Captain Bond' : 'Mon Dossier Captain Bond';
    const shareText = isCoupleShared
      ? `${playerName} & son partenaire — ${coupleScores?.complicity}% de complicité de jeu sur Captain Bond.`
      : profile
      ? `${playerName} — ${profile.archetype} ${profile.archetypeEmoji} sur Captain Bond.`
      : `${playerName} a joué à Captain Bond.`;

    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm p-6">
        <div className="w-full max-w-sm glass-panel p-6 text-center">
          <h3 className="text-xl font-black text-white mb-2">Partager le dossier</h3>
          <p className="text-slate-400 text-sm mb-6">Invitez vos amis à découvrir Captain Bond.</p>
          <ShareSheet
            title={shareTitle}
            text={shareText}
            url={`https://captainbond.com/join/${roomCode}`}
            onClose={() => setShowShareSheet(false)}
            onShare={(channel) => capture(AnalyticsEvents.PROFILE_SHARED, { room_code: roomCode, channel })}
          />
        </div>
      </div>
    );
  }

  // --- Date Night : Débloqué ---
  if (isDateNight && unlocked) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center bg-black/60 border-2 border-green-500/50 rounded-2xl relative overflow-hidden shadow-[0_0_40px_rgba(34,197,94,0.15)] animate-fade-in">
        <div className="absolute top-0 right-0 p-3 opacity-30">
          <span className="font-mono text-xs text-green-400 font-bold border border-green-400 p-1">COMPATIBILITÉ DE JEU</span>
        </div>

        <div className="text-6xl mb-4 mt-4">🥂❤️</div>
        <h2 className="text-2xl font-black text-green-400 mb-1 tracking-tight">Complices Absolus</h2>
        <p className="text-slate-500 text-xs font-mono mb-4">Dossier Couple N°84</p>

        {/* Warning Banner */}
        <div className="w-full bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-6 text-amber-400 text-[10px] font-mono leading-relaxed flex items-start gap-2 text-left animate-fade-in">
          <span>⚠️</span>
          <span>
            <strong>Fiction de divertissement :</strong> Ce profil relationnel est une fiction ludique (effet Barnum). Il ne constitue en aucun cas un diagnostic relationnel, clinique ou thérapeutique.
          </span>
        </div>

        <p className="text-slate-200 text-base mb-4 px-2 leading-relaxed italic">
          &ldquo;À titre de divertissement, votre complicité est estimée à un niveau extrêmement élevé. Votre capacité à anticiper les réactions de l&apos;autre est votre plus grande force — en jeu, du moins.&rdquo;
        </p>
        <p className="text-slate-500 text-xs text-center font-mono mb-6">
          Résultat fictif, à prendre comme un jeu. Pas un diagnostic relationnel.
        </p>

        {/* Radar des axes de couple */}
        <div className="w-full grid grid-cols-3 gap-3 mb-8">
          <AxisBar label="Complicité" value={coupleScores?.complicity ?? 94} color="purple" />
          <AxisBar label="Attraction" value={coupleScores?.attraction ?? 88} color="blue" />
          <AxisBar label="Alignement" value={coupleScores?.alignment ?? 85} color="red" />
        </div>

        <button 
          onClick={() => setShowShareModal(true)}
          className="w-full bg-gradient-to-r from-neon-purple to-neon-pink text-white font-black py-4 px-4 rounded-xl text-sm hover:opacity-90 transition-all shadow-[0_0_20px_rgba(139,92,246,0.4)] animate-pulse"
        >
          Partager notre Story (TikTok / Insta) 📸
        </button>
        <button
          onClick={() => setShowShareSheet(true)}
          className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all mt-3"
        >
          📤 Partager par message
        </button>
      </div>
    );
  }

  // --- Date Night : Paywall ---
  if (isDateNight && !unlocked) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center bg-black/60 border border-red-500/50 rounded-2xl relative overflow-hidden shadow-2xl animate-fade-in">
        <div className="absolute top-0 right-0 p-3 opacity-20">
          <span className="font-mono text-sm text-red-500 font-bold border border-red-500 p-1">DATE NIGHT</span>
        </div>

        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4 mt-6 animate-pulse">
          <span className="text-3xl">❤️</span>
        </div>

        <h2 className="text-2xl font-black text-red-500 mb-3 uppercase tracking-wider">Dossier Couple Scellé</h2>

        {/* Warning Banner */}
        <div className="w-full bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-4 text-amber-400 text-[10px] font-mono leading-relaxed flex items-start gap-2 text-left">
          <span>⚠️</span>
          <span>
            <strong>Fiction de divertissement :</strong> Ce profil relationnel est une fiction ludique (effet Barnum). Il ne constitue en aucun cas un diagnostic relationnel, clinique ou thérapeutique.
          </span>
        </div>
        
        <p className="text-slate-300 text-base mb-2 px-2">
          L&apos;IA a analysé votre dynamique de couple ce soir.
        </p>
        <p className="text-red-400 font-bold text-sm mb-6 p-2 bg-red-500/10 rounded">
          Le score de complicité de jeu est prêt pour vous deux.
        </p>

        {/* Carte scellée floutée */}
        <div className="w-full p-6 bg-red-500/5 border border-red-500/20 rounded-xl mb-6 relative overflow-hidden">
          <div className="filter blur-md select-none">
            <h3 className="font-bold text-lg text-white mb-2">Les Partenaires de Crime</h3>
            <p className="text-xs text-slate-400">{coupleScores?.complicity ?? 94}% de complicité • 3 axes comportementaux</p>
          </div>
          <div className="absolute inset-0 bg-red-500/10 backdrop-blur-[4px] flex items-center justify-center">
            <span className="font-mono text-red-500 font-black text-lg rotate-[-10deg] border-4 border-red-500 px-3 py-1 shadow-[0_0_15px_rgba(239,68,68,0.5)]">SCELLÉ N°84</span>
          </div>
        </div>

        {/* Bouton de paiement */}
        <button
          onClick={handlePayment}
          disabled={paying}
          className="w-full bg-gradient-to-r from-neon-purple to-neon-pink text-white font-black py-4 px-4 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-3 text-lg shadow-[0_0_20px_rgba(139,92,246,0.4)]"
        >
          {paying ? (
            <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-6 h-6" />
          ) : (
            <>🔓 Révéler notre Compatibilité — {priceString}</>
          )}
        </button>
        <p className="text-slate-500 text-xs mt-3 font-mono">Déverrouillage instantané pour les 2 écrans</p>
      </div>
    );
  }

  // --- Mode Standard : Données Insuffisantes ---
  if (profile && !profile.isReady) {
    return (
      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="flex flex-col items-center justify-center p-6 text-center bg-black/60 border border-amber-500/50 rounded-2xl relative overflow-hidden animate-fade-in">
          <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mb-4 mt-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-black text-amber-400 mb-3 uppercase tracking-wider">Analyse Incomplète</h2>
          
          {/* Jauge de confiance */}
          <div className="w-full bg-white/5 rounded-full h-4 mb-3 border border-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-500 via-amber-500 to-green-500 rounded-full transition-all duration-1000"
              style={{ width: `${profile.confidencePercent}%` }}
            />
          </div>
          <p className="text-amber-400 font-mono text-sm font-bold mb-6">
            FIABILITÉ : {profile.confidencePercent}% — {profile.questionsAnswered}/10 RÉPONSES
          </p>

          <p className="text-slate-300 text-base mb-6 px-2">
            L&apos;IA n&apos;a pas récolté assez de données sur vos décisions. 
            <strong className="text-amber-300 block mt-3">Votre masque social n&apos;est pas encore tombé. Relancez une partie pour finaliser le calibrage.</strong>
          </p>

          <div className="w-full bg-white/5 border border-white/10 rounded-xl p-3">
            <p className="text-slate-500 text-xs font-mono">DOSSIER DE {playerName.toUpperCase()} — EN ATTENTE DE DONNÉES</p>
          </div>
        </div>

        {/* Cross-Sell Card */}
        <div className="glass-panel p-5 border-rose-500/20 bg-gradient-to-r from-rose-950/20 to-amber-950/20 rounded-2xl text-center space-y-3 shadow-[0_0_30px_rgba(244,63,94,0.05)]">
          <div className="flex items-center justify-center gap-2 text-rose-400">
            <span className="text-xl">💖</span>
            <h3 className="font-bold text-sm uppercase tracking-wider font-mono">Vous jouez à deux ?</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Prenez soin de votre dynamique de couple au quotidien. Essayez notre rituel de 5 minutes par jour.
          </p>
          <button
            onClick={() => window.location.href = '/couple'}
            className="w-full py-2.5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer border-none"
          >
            Découvrir le Rituel Couple
          </button>
        </div>
      </div>
    );
  }

  // --- Mode Standard : Déverrouillé ---
  if (unlocked && profile) {
    return (
      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="flex flex-col items-center justify-center p-6 text-center bg-black/60 border-2 border-green-500/50 rounded-2xl relative overflow-hidden shadow-[0_0_40px_rgba(34,197,94,0.15)] animate-fade-in">
          <div className="absolute top-0 right-0 p-3 opacity-30">
            <span className="font-mono text-xs text-green-400 font-bold border border-green-400 p-1">DÉCLASSIFIÉ</span>
          </div>

          <div className="text-6xl mb-4 mt-4">{profile.archetypeEmoji}</div>
          <h2 className="text-2xl font-black text-green-400 mb-1 tracking-tight">{profile.archetype}</h2>
          <p className="text-slate-500 text-xs font-mono mb-4">Agent {playerName.toUpperCase()} • Fiabilité {profile.confidencePercent}%</p>

          {/* Warning Banner */}
          <div className="w-full bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-6 text-amber-400 text-[10px] font-mono leading-relaxed flex items-start gap-2 text-left animate-fade-in">
            <span>⚠️</span>
            <span>
              <strong>Fiction de divertissement :</strong> Ce profil est une fiction ludique (effet Barnum). Il ne constitue en aucun cas un diagnostic psychologique, clinique ou thérapeutique.
            </span>
          </div>

          <p className="text-slate-200 text-base mb-6 px-2 leading-relaxed italic">
            &ldquo;{profile.barnumText}&rdquo;
          </p>

          {revealedConnections.length > 0 && (
            <div className="w-full bg-green-500/10 border border-green-500/20 rounded-2xl p-4 mb-6 text-left animate-fade-in shadow-inner">
              <p className="text-green-400 font-mono text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span>🕵️</span> CONNEXIONS SECRÈTES DÉVOILÉES
              </p>
              <div className="space-y-1.5">
                {revealedConnections.map((conn, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs text-slate-300 font-mono border-b border-white/5 pb-1 last:border-0 last:pb-0">
                    <span>{conn.voterName}</span>
                    <span className="text-green-400 font-bold">{conn.voteCount} votes d&apos;affinité</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Radar des 3 axes débloqué */}
          <div className="w-full grid grid-cols-3 gap-3 mb-8">
            <AxisBar label="Tendance au consensus" value={profile.axes.alignment} color="purple" />
            <AxisBar label="Empathie" value={profile.axes.perspicacity} color="blue" />
            <AxisBar label="Esprit de jeu / Bluff" value={profile.axes.deception} color="red" />
          </div>

          <button 
            onClick={() => setShowShareModal(true)}
            className="w-full bg-gradient-to-r from-neon-purple to-neon-pink text-white font-black py-4 px-4 rounded-xl text-sm hover:opacity-90 transition-all shadow-[0_0_20px_rgba(139,92,246,0.4)] animate-pulse"
          >
            Partager ma Story (TikTok / Insta) 📸
          </button>
          <button
            onClick={() => setShowShareSheet(true)}
            className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all mt-3"
          >
            📤 Partager par message
          </button>
        </div>

        {/* Cross-Sell Card */}
        <div className="glass-panel p-5 border-rose-500/20 bg-gradient-to-r from-rose-950/20 to-amber-950/20 rounded-2xl text-center space-y-3 shadow-[0_0_30px_rgba(244,63,94,0.05)]">
          <div className="flex items-center justify-center gap-2 text-rose-400">
            <span className="text-xl">💖</span>
            <h3 className="font-bold text-sm uppercase tracking-wider font-mono">Vous jouez à deux ?</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Prenez soin de votre dynamique de couple au quotidien. Essayez notre rituel de 5 minutes par jour.
          </p>
          <button
            onClick={() => window.location.href = '/couple'}
            className="w-full py-2.5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer border-none"
          >
            Découvrir le Rituel Couple
          </button>
        </div>
      </div>
    );
  }

  // --- Mode Standard : Freemium Teaser & Paywall ---
  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="flex flex-col items-center justify-center p-6 text-center bg-black/60 border border-red-500/50 rounded-2xl relative overflow-hidden shadow-2xl animate-fade-in">
        <div className="absolute top-0 right-0 p-3 opacity-20">
          <span className="font-mono text-sm text-red-500 font-bold border border-red-500 p-1">TOP SECRET</span>
        </div>

        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4 mt-6">
          <span className="text-3xl">🔒</span>
        </div>

        <h2 className="text-2xl font-black text-red-500 mb-3 uppercase tracking-wider">Dossier Prêt</h2>

        {/* Warning Banner */}
        <div className="w-full bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-4 text-amber-400 text-[10px] font-mono leading-relaxed flex items-start gap-2 text-left">
          <span>⚠️</span>
          <span>
            <strong>Fiction de divertissement :</strong> Ce profil est une fiction ludique (effet Barnum). Il ne constitue en aucun cas un diagnostic psychologique, clinique ou thérapeutique.
          </span>
        </div>
        
        {/* Mini jauge verte */}
        <div className="w-full bg-white/5 rounded-full h-2 mb-4 border border-white/10 overflow-hidden">
          <div className="h-full bg-green-500 rounded-full" style={{ width: `${profile?.confidencePercent || 0}%` }} />
        </div>
        <p className="text-green-400 font-mono text-xs font-bold mb-4">FIABILITÉ : {profile?.confidencePercent}% ✓</p>

        {/* FREEMIUM TEASER : Archétype et émoji visibles gratuitement */}
        <div className="w-full bg-white/5 border border-white/10 rounded-xl p-4 mb-4 relative overflow-hidden shadow-inner">
          <div className="text-5xl mb-2">{profile?.archetypeEmoji || '👤'}</div>
          <div className="text-slate-400 text-xs font-mono uppercase tracking-wider">Votre profil ludique :</div>
          <div className="text-xl font-black text-white mt-1 uppercase tracking-tight">{profile?.archetype}</div>
        </div>

        {/* FLIRT TEASER BOX */}
        {connectionsTeaser && connectionsTeaser.hasConnections && (
          <div className="w-full bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-500/20 rounded-xl p-4 mb-4 text-left animate-pulse">
            <p className="text-pink-400 font-mono text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span>🤫</span> FLIRT & CONNEXION SECRÈTE
            </p>
            <p className="text-xs text-slate-200 leading-relaxed font-mono">
              <strong>{connectionsTeaser.teaseName}</strong> (et peut-être d&apos;autres) a voté pour vous comme sa connexion secrète de la soirée. Débloquez votre rapport pour tout savoir !
            </p>
          </div>
        )}

        {/* Description Barnum floutée */}
        <div className="relative w-full p-4 bg-white/5 border border-white/10 rounded-xl overflow-hidden mb-6">
          <p className="text-slate-300 text-sm filter blur-sm select-none leading-relaxed italic">
            Tu lis en tes amis comme dans un livre ouvert. Tu sais exactement ce qu&apos;ils attendent de toi, et tu t&apos;en sers avec une précision chirurgicale. Dangereux, mais charmant. Les gens t&apos;adorent sans savoir qu&apos;ils sont dans ta main.
          </p>
          <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] flex items-center justify-center">
            <span className="font-mono text-xs text-red-400 font-bold bg-black/80 px-3 py-1.5 border border-red-500/30 rounded uppercase tracking-widest shadow-lg">
              Description Verrouillée
            </span>
          </div>
        </div>

        {/* Axes floutés */}
        <div className="w-full grid grid-cols-3 gap-3 mb-8 filter blur-[5px] select-none pointer-events-none opacity-60">
          <AxisBar label="Tendance au consensus" value={45} color="purple" />
          <AxisBar label="Empathie" value={72} color="blue" />
          <AxisBar label="Esprit de jeu / Bluff" value={60} color="red" />
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 w-full">
          {/* Déverrouillage payant */}
          <button
            onClick={handlePayment}
            disabled={paying}
            className="w-full bg-gradient-to-r from-neon-purple to-neon-pink text-white font-black py-4 px-4 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-3 text-lg shadow-[0_0_20px_rgba(139,92,246,0.4)]"
          >
            {paying ? (
              <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-6 h-6" />
            ) : (
              <>🔓 Révéler mes Stats & Axes — {priceString}</>
            )}
          </button>

          {/* VIRAL LOOP : Partage de l'archétype gratuit autorisé ! */}
          <button 
            onClick={() => setShowShareModal(true)}
            className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all"
          >
            Partager mon Archétype (Gratuit) 📸
          </button>
        </div>

        <p className="text-slate-500 text-xs mt-3 font-mono">Apple Pay • Google Pay • CB</p>
      </div>

      {/* Cross-Sell Card */}
      <div className="glass-panel p-5 border-rose-500/20 bg-gradient-to-r from-rose-950/20 to-amber-950/20 rounded-2xl text-center space-y-3 shadow-[0_0_30px_rgba(244,63,94,0.05)]">
        <div className="flex items-center justify-center gap-2 text-rose-400">
          <span className="text-xl">💖</span>
          <h3 className="font-bold text-sm uppercase tracking-wider font-mono">Vous jouez à deux ?</h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Prenez soin de votre dynamique de couple au quotidien. Essayez notre rituel de 5 minutes par jour.
        </p>
        <button
          onClick={() => window.location.href = '/couple'}
          className="w-full py-2.5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer border-none"
        >
          Découvrir le Rituel Couple
        </button>
      </div>
    </div>
  );
}

// --- Composant auxiliaire : Barre d'axe ---
function AxisBar({ label, value, color }: { label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    purple: 'from-purple-500 to-purple-400',
    blue: 'from-blue-500 to-blue-400',
    red: 'from-red-500 to-red-400',
  };
  return (
    <div className="flex flex-col items-center">
      <span className="text-xs text-slate-400 mb-1 font-mono">{label}</span>
      <div className="w-full bg-white/5 rounded-full h-2 border border-white/10 overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${colorMap[color]} rounded-full transition-all duration-1000`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs text-white font-bold mt-1">{value}%</span>
    </div>
  );
}
