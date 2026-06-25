'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { safeJsonParse } from '@/lib/json';
import { api } from '@/lib/api/client';
import type { GameModePlayerControllerProps } from '../types';

export default function DateNightPlayerController({ question, isHost }: GameModePlayerControllerProps) {
  const [showQuestion, setShowQuestion] = useState(false);
  const [opener, setOpener] = useState<string>('');
  const [holdProgress, setHoldProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const params = useParams();
  const roomCode = (params.code as string).toUpperCase();

  // Reset states when a new question arrives
  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) {
        setShowQuestion(false);
        setHoldProgress(0);
        
        // Randomly select who opens
        const openers = ["C'est au Captain de répondre en premier.", "C'est à l'invité(e) de répondre en premier."];
        setOpener(openers[Math.floor(Math.random() * openers.length)]);
      }
    });

    // 3 seconds tension
    const tensionTimer = setTimeout(() => {
      if (active) setShowQuestion(true);
    }, 3000);

    return () => {
      active = false;
      clearTimeout(tensionTimer);
    };
  }, [question?.id]);

  const handleNextCard = async () => {
    try {
      // Pour le mode Date Night, on appelle directement le /next-round de l'API
      const storedCreds = sessionStorage.getItem(`player_${roomCode}`);
      const pId = storedCreds ? safeJsonParse<{ id?: string }>(storedCreds, {}).id ?? 'unknown' : 'unknown';
      
      await api.post('/api/room/next-round', { roomCode, hostId: pId });
    } catch (err) {
      console.error(err);
    }
  };

  const startHold = () => {
    if (!showQuestion || isPaused) return;
    setHoldProgress(0);
    
    const duration = 2000; // 2 seconds
    const intervalTime = 50;
    let elapsed = 0;

    holdIntervalRef.current = setInterval(() => {
      elapsed += intervalTime;
      setHoldProgress((elapsed / duration) * 100);
    }, intervalTime);

    holdTimerRef.current = setTimeout(() => {
      stopHold();
      handleNextCard();
    }, duration);
  };

  const stopHold = () => {
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    setHoldProgress(0);
  };

  if (!isHost) {
    return (
      <div className="flex flex-col items-center justify-center gap-8 w-full px-4 text-center animate-in fade-in duration-1000 h-full">
        <div className="w-20 h-20 bg-neon-purple/20 rounded-full flex items-center justify-center text-3xl animate-pulse">
          🍷
        </div>
        <div>
          <h2 className="text-2xl font-light italic mb-4">Posez ce téléphone.</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Pour ce mode, l&apos;expérience se passe uniquement sur le téléphone du Captain. 
            Regardez l&apos;écran central, ou mieux... regardez-vous dans les yeux.
          </p>
        </div>
      </div>
    );
  }

  // --- MODE BOUGIE (PAUSE) ---
  if (isPaused) {
    return (
      <div 
        className="fixed inset-0 bg-black z-[100] flex items-center justify-center cursor-pointer animate-in fade-in duration-1000"
        onClick={() => setIsPaused(false)}
      >
        {/* Pulsation lente évoquant une bougie */}
        <div className="w-32 h-32 bg-rose-600/10 rounded-full animate-ping blur-3xl" style={{ animationDuration: '4s' }} />
        <div className="absolute w-16 h-16 bg-orange-500/10 rounded-full animate-pulse blur-2xl" style={{ animationDuration: '2s' }} />
        
        <p className="absolute bottom-10 text-white/20 text-xs uppercase tracking-widest font-mono">
          Touchez pour reprendre
        </p>
      </div>
    );
  }

  // --- HOST VIEW (ACTIVE) ---
  return (
    <div className="flex flex-col items-center justify-center gap-6 w-full px-4 text-center h-[80vh] relative select-none">
      
      {/* Bouton Pause en haut */}
      <button 
        onClick={() => setIsPaused(true)}
        className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 hover:text-white transition-all z-10"
        aria-label="Mode Pause / Repas"
      >
        ⏸️
      </button>

      {/* Background Pulse during tension */}
      {!showQuestion && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           <div className="w-64 h-64 bg-neon-pink/5 rounded-full animate-ping blur-3xl" />
        </div>
      )}

      {/* The Tension Stare */}
      <div className={`transition-all duration-1000 absolute ${showQuestion ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
        <h2 className="text-2xl font-light italic text-white/50 tracking-widest">
          Regardez-vous dans les yeux.
        </h2>
      </div>

      {/* The Question */}
      <div className={`flex flex-col items-center w-full transition-all duration-1000 ${showQuestion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        
        <p className="text-neon-pink text-xs uppercase tracking-widest font-bold mb-6">Date Night</p>
        
        <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(236,72,153,0.1)] w-full mb-8 relative overflow-hidden">
          {/* Opener Badge */}
          <div className="absolute top-0 left-0 w-full bg-black/40 py-2 border-b border-white/5">
            <p className="text-neon-purple text-xs uppercase font-mono tracking-wider">{opener}</p>
          </div>

          <h2 className="text-3xl font-light leading-snug mt-10 mb-6 text-white">
            &ldquo;{question?.text || "Chargement..."}&rdquo;
          </h2>
          <p className="text-slate-500 text-sm italic">
            Répondez à voix haute. Laissez le temps au silence.
          </p>
        </div>

        {/* Action Bar (Hold to Proceed + Skip) */}
        <div className="flex flex-col gap-4 w-full px-2">
          
          {/* Hold to Proceed Button */}
          <button
            onMouseDown={startHold}
            onMouseUp={stopHold}
            onMouseLeave={stopHold}
            onTouchStart={startHold}
            onTouchEnd={stopHold}
            className="relative w-full h-16 rounded-2xl border border-white/20 bg-white/5 overflow-hidden active:scale-[0.98] transition-transform group"
          >
            <div 
              className="absolute top-0 left-0 h-full bg-neon-purple/40 transition-all duration-75 ease-linear"
              style={{ width: `${holdProgress}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold uppercase tracking-widest text-slate-300 group-active:text-white transition-colors">
                {holdProgress > 0 ? "Maintenez..." : "Suivant"}
              </span>
            </div>
          </button>

          {/* Large Joker Button */}
          <button 
            onClick={handleNextCard}
            className="w-full h-14 rounded-2xl border border-dashed border-slate-600 bg-transparent flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-400 transition-colors"
          >
            <span className="text-sm uppercase tracking-widest font-medium">Question Joker (Passer)</span>
          </button>

        </div>

      </div>

    </div>
  );
}
