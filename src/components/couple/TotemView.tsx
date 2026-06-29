'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TotemOrbe } from './TotemOrbe';
import { TotemFusion } from './TotemFusion';
import { useTotemRealtime } from '@/hooks/useTotemRealtime';
import { api } from '@/lib/api/client';
import { Icon } from '@/components/Icon';
import type { OrbeState, FusionState } from '@/lib/db/types';

interface TotemViewProps {
  coupleId: string;
  userId: string;
  user1Id: string;
}

interface TotemStateResponse {
  myOrbe: OrbeState;
  fusionState: FusionState;
  streakDays: number;
  lastRitualAt: string | null;
}

interface FuseResponse {
  fusionState: FusionState;
  streakDays: number;
  lastRitualAt: string | null;
  evolutionStage: number;
}

/**
 * Vue principale du Totem : affiche l'Orbe individuel ET la Sphère de Fusion.
 * Bascule entre mode "Solo" (mon Orbe) et mode "Fusion" (téléphones côte à côte).
 */
export function TotemView({ coupleId, userId, user1Id }: TotemViewProps) {
  const [myOrbe, setMyOrbe] = useState<OrbeState | null>(null);
  const [fusionState, setFusionState] = useState<FusionState | null>(null);
  const [streakDays, setStreakDays] = useState(0);
  const [lastRitualAt, setLastRitualAt] = useState<string | null>(null);
  const [showFusion, setShowFusion] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fusing, setFusing] = useState(false);

  // States pour la synchronisation par geste
  const [partnerTouching, setPartnerTouching] = useState(false);
  const [partnerReachedEdge, setPartnerReachedEdge] = useState(false);
  const [myReachedEdge, setMyReachedEdge] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);
  const [incomingParticle, setIncomingParticle] = useState<{ y: number; vy: number; hue: number } | null>(null);

  const role = useMemo(() => {
    return userId === user1Id ? 'A' : 'B';
  }, [userId, user1Id]);

  // Realtime sync & broadcast tactile synchronization
  const { sendTactileSync } = useTotemRealtime({
    coupleId,
    onUpdate: useCallback((data) => {
      setFusionState(data.fusionState);
      setStreakDays(data.streakDays);
      setLastRitualAt(data.lastRitualAt);
    }, []),
    onBroadcastMessage: useCallback((event: string, payload: any) => {
      if (payload?.senderId === userId) return; // ignore self
      
      switch (event) {
        case 'TOUCH_START':
          setPartnerTouching(true);
          break;
        case 'TOUCH_END':
          setPartnerTouching(false);
          setPartnerReachedEdge(false);
          break;
        case 'REACHED_EDGE':
          setPartnerReachedEdge(true);
          break;
        case 'PARTICLE_CROSS':
          setIncomingParticle(payload.particle);
          break;
      }
    }, [userId]),
  });

  // Charger l'état initial
  useEffect(() => {
    async function load() {
      try {
        const data = await api.get<TotemStateResponse>(
          `/api/totem/state?coupleId=${coupleId}`
        );
        setMyOrbe(data.myOrbe);
        setFusionState(data.fusionState);
        setStreakDays(data.streakDays);
        setLastRitualAt(data.lastRitualAt);
      } catch {
        // Totem pas encore créé : valeurs par défaut
        setMyOrbe({
          hue: userId === user1Id ? 220 : 280,
          saturation: 70,
          lightness: 50,
          energy: 0.5,
          attachmentStyle: 'secure',
          particleDensity: 0.5,
          pulseRate: 1.0,
        });
        setFusionState({
          harmonyRate: 0.5,
          tensionLevel: 0,
          fusionTexture: 'silk',
          faultLineVisible: false,
          syncScore: 0,
          evolutionStage: 1,
        });
        setLastRitualAt(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [coupleId, userId, user1Id]);

  // Déclencher la fusion (rituel complété)
  const handleFuse = useCallback(async () => {
    setFusing(true);
    
    // Déclencheur haptique initial (cœur)
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([100, 100, 100, 300]);
    }

    // Synthèse sonore Web Audio API
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        // Oscillateur pour la basse sourde
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(55, ctx.currentTime); // Note de basse (La/A1)
        
        // Pitch bend ascendant doux
        osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 1.2);
        
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start();
        osc.stop(ctx.currentTime + 1.5);
      }
    } catch (e) {
      // Ignorer si audio bloqué ou non supporté
    }

    try {
      const result = await api.post<FuseResponse>('/api/totem/fuse', { coupleId });
      setFusionState(result.fusionState);
      setStreakDays(result.streakDays);
      setLastRitualAt(result.lastRitualAt);
      
      // Haptique de succès final
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([50, 50, 50, 50, 400]);
      }
      
      setShowFusion(true);
      setMyReachedEdge(false);
      setPartnerReachedEdge(false);
    } finally {
      setFusing(false);
    }
  }, [coupleId, role]);

  // Touch handlers à transmettre au TotemOrbe
  const handleDragProgress = useCallback((progress: number) => {
    setDragProgress(progress);
    if (progress === 0) {
      sendTactileSync('TOUCH_END', { senderId: userId });
      setMyReachedEdge(false);
    } else {
      sendTactileSync('TOUCH_START', { senderId: userId });
      
      // Vibration progressive (haptique) plus forte vers le bord
      if (progress > 0.3 && typeof navigator !== 'undefined' && navigator.vibrate) {
        const interval = Math.max(40, Math.floor(300 * (1 - progress)));
        // Petites vibrations d'intensité croissante
        navigator.vibrate([15, interval]);
      }
    }
  }, [sendTactileSync, userId]);

  const handleDragEnd = useCallback(() => {
    setMyReachedEdge(true);
    sendTactileSync('REACHED_EDGE', { senderId: userId });
  }, [sendTactileSync, userId]);

  const handleEmitCrossParticle = useCallback((y: number, vy: number, hue: number) => {
    sendTactileSync('PARTICLE_CROSS', {
      senderId: userId,
      particle: { y, vy, hue }
    });
  }, [sendTactileSync, userId]);

  // Fusion automatique si les deux index touchent la bordure
  useEffect(() => {
    if (myReachedEdge && partnerReachedEdge && !fusing) {
      handleFuse();
    }
  }, [myReachedEdge, partnerReachedEdge, fusing, handleFuse]);

  if (loading || !myOrbe || !fusionState) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
      </div>
    );
  }

  const hasPartnerReached = partnerReachedEdge;

  return (
    <div className="flex flex-col items-center gap-6 py-6 overflow-hidden">
      {/* Header Streak */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
        <Icon name="flame" className="w-5 h-5 text-amber-500" />
        <span className="text-sm text-white/80 font-medium">
          {streakDays} jour{streakDays > 1 ? 's' : ''} de rituel
        </span>
        <span className="text-xs text-white/40 ml-2">Stade {fusionState.evolutionStage}/10</span>
      </div>

      {/* Toggle Solo / Fusion */}
      <div className="flex rounded-full bg-white/5 p-1 border border-white/10">
        <button
          onClick={() => setShowFusion(false)}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
            !showFusion
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
              : 'text-white/50 hover:text-white/80'
          }`}
        >
          Mon Esprit
        </button>
        <button
          onClick={() => setShowFusion(true)}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
            showFusion
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
              : 'text-white/50 hover:text-white/80'
          }`}
        >
          Notre Lien
        </button>
      </div>

      {/* Visualisation Canvas */}
      <div className="relative w-full min-h-[350px] flex items-center justify-center">
        {/* Glow de proximité sur le bord opposé de l'écran */}
        {!showFusion && (partnerTouching || dragProgress > 0) && (
          <div
            className={`absolute top-0 bottom-0 w-2 blur-md transition-opacity duration-300 pointer-events-none bg-gradient-to-r ${
              role === 'A'
                ? 'right-0 from-purple-500 to-pink-500'
                : 'left-0 from-pink-500 to-purple-500'
            }`}
            style={{
              opacity: Math.max(dragProgress * 0.7, partnerTouching ? 0.3 : 0),
            }}
          />
        )}

        {!showFusion ? (
          <div className="animate-fade-in relative">
            {/* Indicateur de préparation du partenaire */}
            {partnerTouching && !partnerReachedEdge && (
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-pink-400 tracking-wider animate-pulse">
                PARTENAIRE CONNECTÉ…
              </div>
            )}
            {hasPartnerReached && (
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-emerald-400 tracking-wider animate-bounce">
                PARTENAIRE PRÊT SUR LE BORD !
              </div>
            )}
            <TotemOrbe
              state={myOrbe}
              size={280}
              lastRitualAt={lastRitualAt}
              role={role}
              onDragProgress={handleDragProgress}
              onDragEnd={handleDragEnd}
              onEmitCrossParticle={handleEmitCrossParticle}
              incomingParticle={incomingParticle}
            />
          </div>
        ) : (
          <div className="animate-fade-in">
            <TotemFusion state={fusionState} size={320} />
          </div>
        )}
      </div>

      {/* Action / Guide tactile */}
      {!showFusion && (
        <div className="text-center max-w-[280px]">
          <p className="text-xs text-slate-400 leading-relaxed font-medium">
            {partnerTouching
              ? "Collez vos écrans. Touchez votre Orbe et glissez-le vers le bord de l'autre téléphone."
              : "Attente du partenaire… Posez vos écrans tranches contre tranches."}
          </p>
        </div>
      )}
    </div>
  );
}
