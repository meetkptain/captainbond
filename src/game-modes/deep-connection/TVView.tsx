'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import type { GameModeTVViewProps } from '../types';
import { getDiscussionPrompt } from '../prompts';

export default function TVView({ question, responses, gameState }: GameModeTVViewProps) {
  const params = useParams();
  const roomCode = (params.code as string).toUpperCase();
  const [hearts, setHearts] = useState<{ id: number, left: number, delay: number }[]>([]);
  const [showPledge, setShowPledge] = useState(gameState === 'VOTING');
  
  // Typing Indicator
  const [typingPlayers, setTypingPlayers] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Escalate pledge removal after 10s or when entering REVEALING/DISCUSSION state
    if (gameState === 'REVEALING' || gameState === 'DISCUSSION') {
      requestAnimationFrame(() => {
        setShowPledge(false);
      });
    } else {
      const t = setTimeout(() => setShowPledge(false), 8000);
      return () => clearTimeout(t);
    }
  }, [gameState]);

  useEffect(() => {
    const channel = supabase.channel(`room-events-${roomCode}`);
    channel.on('broadcast', { event: 'HEART' }, (payload) => {
      // Add a heart particle
      setHearts(prev => [...prev, {
        id: Date.now() + Math.random(),
        left: Math.random() * 80 + 10, // random left percentage
        delay: Math.random() * 0.5
      }].slice(-20)); // Keep max 20 hearts
    });
    
    channel.on('broadcast', { event: 'TYPING' }, (payload) => {
      setTypingPlayers(prev => {
        const newSet = new Set(prev);
        if (payload.payload.isTyping) {
          newSet.add(payload.payload.playerId);
        } else {
          newSet.delete(payload.payload.playerId);
        }
        return newSet;
      });
    });

    channel.subscribe();

    return () => { channel.unsubscribe(); };
  }, [roomCode]);

  return (
    <div className="relative flex flex-col items-center gap-10 p-8 w-full max-w-4xl min-h-[60vh] justify-center">
      
      {/* Floating Hearts Animation Container */}
      {hearts.map(h => (
        <div 
          key={h.id} 
          className="absolute bottom-0 text-neon-pink text-4xl animate-float-up opacity-0 drop-shadow-[0_0_15px_rgba(236,72,153,0.8)]"
          style={{ left: `${h.left}%`, animationDelay: `${h.delay}s` }}
        >
          🤍
        </div>
      ))}

      {showPledge ? (
        <div className="text-center animate-in fade-in zoom-in duration-1000">
          <h2 className="text-2xl text-neon-purple font-mono tracking-widest uppercase mb-4 opacity-80">Contrat Social</h2>
          <p className="text-4xl font-light italic leading-tight text-white/90 max-w-2xl mx-auto">
            &ldquo;Ce qui se dit ici, reste ici. L&apos;absence de jugement est la seule règle.&rdquo;
          </p>
        </div>
      ) : gameState === 'VOTING' && (
        <div className="flex flex-col items-center gap-12 animate-in fade-in duration-700 w-full">
          <h2 className="text-4xl font-bold text-center leading-snug">
            {question?.text || "Chargement..."}
          </h2>
          
          <div className="h-12 flex items-center justify-center">
            {typingPlayers.size > 0 ? (
              <div className="flex items-center gap-3 text-slate-400 font-mono text-sm uppercase tracking-widest animate-pulse">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-neon-pink rounded-full animate-bounce" style={{ animationDelay: '0ms' }}/>
                  <span className="w-1.5 h-1.5 bg-neon-pink rounded-full animate-bounce" style={{ animationDelay: '150ms' }}/>
                  <span className="w-1.5 h-1.5 bg-neon-pink rounded-full animate-bounce" style={{ animationDelay: '300ms' }}/>
                </div>
                {typingPlayers.size} {typingPlayers.size === 1 ? 'personne écrit' : 'personnes écrivent'} le titre de leur histoire...
              </div>
            ) : (
              <div className="text-slate-600 font-mono text-sm uppercase tracking-widest opacity-50">
                La table réfléchit...
              </div>
            )}
          </div>
        </div>
      )}

      {(gameState === 'REVEALING' || gameState === 'DISCUSSION') && (
        <div className="absolute inset-0 bg-black/95 z-10 flex flex-col items-center justify-center animate-in fade-in duration-1000">
          {gameState === 'DISCUSSION' ? (
            <>
              {(() => {
                const prompt = getDiscussionPrompt('DEEP_CONNECTION', { questionText: question?.text as string });
                return (
                  <>
                    <span className="text-emerald-400 font-mono tracking-widest font-bold uppercase mb-4">Moment de vulnérabilité</span>
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-6 text-center px-4">{prompt.title}</h2>
                    <p className="text-xl text-slate-300 mb-2 text-center px-4">{prompt.subtitle}</p>
                    <p className="text-lg text-neon-pink font-medium mt-4 text-center px-4">{prompt.action}</p>
                    <div className="mt-8 text-6xl">🤍</div>
                  </>
                );
              })()}
            </>
          ) : (
            <>
              <div className="w-4 h-4 rounded-full bg-neon-purple/50 animate-pulse mb-8 blur-[2px]" />
              <h3 className="text-xl font-light italic text-white/50 tracking-widest text-center">
                Regardez-vous.
                <br/><br/>
                <span className="text-sm">Le Captain a les cartes en main.</span>
              </h3>
            </>
          )}
        </div>
      )}

      {/* Global CSS for heart animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float-up {
          0% { transform: translateY(0) scale(0.5); opacity: 0; }
          20% { opacity: 1; transform: translateY(-50px) scale(1.2); }
          100% { transform: translateY(-300px) scale(1); opacity: 0; }
        }
        .animate-float-up { animation: float-up 2.5s ease-out forwards; }
      `}} />
    </div>
  );
}
