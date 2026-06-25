'use client';
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import { safeJsonParse } from '@/lib/json';
import type { GameModePlayerControllerProps } from '../types';

export default function PlayerController({ question, hasSubmitted, onSubmitAnswer }: GameModePlayerControllerProps) {
  const [answer, setAnswer] = useState('');
  const [isUndo, setIsUndo] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  
  const params = useParams();
  const roomCode = (params.code as string).toUpperCase();

  const handleSendHeart = async () => {
    const channel = supabase.channel(`room-events-${roomCode}`);
    await channel.send({
      type: 'broadcast',
      event: 'HEART',
      payload: { timestamp: Date.now() }
    });
  };

  const handleTyping = async (text: string) => {
    setAnswer(text);
    
    const storedCreds = sessionStorage.getItem(`player_${roomCode}`);
    const pId = storedCreds ? safeJsonParse<{ id?: string }>(storedCreds, {}).id ?? 'unknown' : 'unknown';

    if (!isTyping) {
      setIsTyping(true);
      await supabase.channel(`room-events-${roomCode}`).send({
        type: 'broadcast', event: 'TYPING', payload: { playerId: pId, isTyping: true }
      });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(async () => {
      setIsTyping(false);
      await supabase.channel(`room-events-${roomCode}`).send({
        type: 'broadcast', event: 'TYPING', payload: { playerId: pId, isTyping: false }
      });
    }, 1500);
  };

  const handleSkip = () => {
    if (confirm("Passer votre tour sur cette carte ?")) {
      onSubmitAnswer('__SKIP__');
    }
  };

  if (hasSubmitted && !isUndo) {
    return (
      <div className="flex flex-col items-center text-center gap-8 w-full px-4 animate-in fade-in duration-500">
        <div className="text-slate-400 font-medium">
          <p className="text-lg text-white mb-2">Message envoyé.</p>
          <p className="text-sm">Attendez que le Captain retourne les cartes.</p>
        </div>
        
        <div className="w-full flex flex-col gap-4 mt-4">
          <button 
            onClick={() => setIsUndo(true)}
            className="text-sm text-slate-400 underline decoration-slate-600 hover:text-white transition-colors py-2"
          >
            J&apos;ai dit une bêtise (Modifier)
          </button>

          <div className="h-px w-full bg-white/10 my-4" />
          
          <p className="text-xs text-neon-purple uppercase tracking-widest font-bold mb-2">Validation Anonyme</p>
          <button 
            onClick={handleSendHeart}
            className="w-20 h-20 mx-auto rounded-full bg-neon-pink/10 border border-neon-pink/30 flex items-center justify-center text-4xl shadow-[0_0_20px_rgba(236,72,153,0.2)] active:scale-95 transition-transform"
          >
            🤍
          </button>
          <p className="text-xs text-slate-500">Envoyer du soutien à la table</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-sm px-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-2">
        <p className="text-neon-purple text-xs uppercase tracking-widest font-bold">Deep Connection</p>
        <p className="text-slate-400 text-sm italic mt-1 font-sans">La Règle d&apos;Or : Taper le Titre. Raconter l&apos;histoire.</p>
      </div>

      <div className="relative w-full">
        <input
          type="text"
          maxLength={60}
          value={answer}
          onChange={(e) => handleTyping(e.target.value)}
          placeholder="Titre de ton histoire (5 mots max)..."
          className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 pr-16 text-lg text-white placeholder-slate-500 focus:outline-none focus:border-neon-purple focus:ring-1 focus:ring-neon-purple transition-all"
          autoFocus
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-mono">
          {answer.length}/60
        </span>
      </div>
      
      <div className="flex flex-col gap-3">
        <button 
          onClick={() => {
            setIsUndo(false);
            onSubmitAnswer(answer);
          }}
          disabled={!answer.trim()}
          className="cb-btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed py-4 text-lg"
        >
          Valider ma réponse
        </button>
        
        <button 
          onClick={handleSkip}
          className="text-sm text-slate-500 hover:text-slate-300 py-2 transition-colors"
        >
          Je préfère passer mon tour
        </button>
      </div>
    </div>
  );
}
