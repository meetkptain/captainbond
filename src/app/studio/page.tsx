'use client';

import React, { useState } from 'react';
import { Player } from '@remotion/player';
import { CaptainReunionClash } from '../../../remotion/CaptainReunionClash';
// import { CaptainBondConfession } from '../../../remotion/CaptainBondConfession';
// import { CaptainBondChat, ChatMessage } from '../../../remotion/CaptainBondChat';
import type { PlayerScript } from '../../../remotion/Root';
// Fallback type for chat message
export type ChatMessage = { id: string; sender: 'left' | 'right'; text: string; };
import './studio.css';

export default function StudioPage() {
  const [brand, setBrand] = useState('reunion');
  const [question, setQuestion] = useState("La vraie raison pour laquelle Mbappé a raté son action, c'est...");
  
  const [p1, setP1] = useState<PlayerScript>({
    name: 'Kévin',
    initial: 'K',
    answer: 'Il avait faim et pensait à un rougail saucisse',
    isWinner: false,
  });

  const [p2, setP2] = useState<PlayerScript>({
    name: 'Sarah',
    initial: 'S',
    answer: "Il avait oublié d'enlever ses Airpods",
    isWinner: true,
  });

  const [theme, setTheme] = useState('tiktok');

  // Captain Bond States
  const [bondMode, setBondMode] = useState<'confession' | 'chat'>('chat');
  const [bondAmorce, setBondAmorce] = useState("Quelle est ta plus grande peur inavouée ?");
  const [bondConfession, setBondConfession] = useState("Je vérifie toujours 3 fois si la porte est fermée à clé, mais au fond, j'ai surtout peur de ce qui est déjà à l'intérieur...");

  const [chatHeader, setChatHeader] = useState("Mon ex 🐍");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'left', text: 'On doit parler.' },
    { id: '2', sender: 'right', text: 'De quoi ? Il est 2h du mat.' },
    { id: '3', sender: 'left', text: 'J\'ai tout découvert.' },
    { id: '4', sender: 'right', text: 'Découvert quoi ?' },
    { id: '5', sender: 'left', text: 'Pour toi et ma soeur.' }
  ]);

  const addMessage = (sender: 'left' | 'right') => {
    setChatMessages([...chatMessages, { id: Math.random().toString(), sender, text: '' }]);
  };

  const updateMessage = (id: string, text: string) => {
    setChatMessages(chatMessages.map(msg => msg.id === id ? { ...msg, text } : msg));
  };

  const removeMessage = (id: string) => {
    setChatMessages(chatMessages.filter(msg => msg.id !== id));
  };

  return (
    <div className="studio-layout">
      {/* LEFT PANEL: CONTROLS */}
      <div className="studio-controls">
        
        {/* BRAND SWITCHER */}
        <div className="brand-switcher" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button 
            style={{ flex: 1, padding: '15px', borderRadius: '10px', fontWeight: 'bold', background: brand === 'reunion' ? '#22c55e' : '#222', color: brand === 'reunion' ? '#fff' : '#888', border: 'none', cursor: 'pointer', transition: '0.2s' }}
            onClick={() => setBrand('reunion')}
          >
            🏴‍☠️ Captain Réunion
          </button>
          <button 
            style={{ flex: 1, padding: '15px', borderRadius: '10px', fontWeight: 'bold', background: brand === 'bond' ? '#3b82f6' : '#222', color: brand === 'bond' ? '#fff' : '#888', border: 'none', cursor: 'pointer', transition: '0.2s' }}
            onClick={() => setBrand('bond')}
          >
            🤝 Captain Bond
          </button>
        </div>

        {brand === 'reunion' ? (
          <>
            <h1 className="studio-title">🎬 Studio Captain Réunion</h1>
            <p className="studio-subtitle">Générateur de Clash / Moukaterie</p>

            <div className="control-group">
              <label>Thème visuel</label>
              <select value={theme} onChange={(e) => setTheme(e.target.value)}>
                <option value="tiktok">TikTok (Noir/Bleu)</option>
                <option value="twitch">Twitch (Violet Foncé)</option>
                <option value="pei">Péi (Vert/Or)</option>
              </select>
            </div>

            <div className="control-group">
              <label>La Question / L&apos;Amorce</label>
              <textarea 
                rows={3} 
                value={question} 
                onChange={(e) => setQuestion(e.target.value)}
              />
            </div>

            <div className="player-controls">
              <div className="control-group">
                <label className="player-badge p1">🔵 Joueur 1</label>
                <input type="text" placeholder="Nom" value={p1.name} onChange={(e) => setP1({...p1, name: e.target.value, initial: e.target.value.charAt(0).toUpperCase()})} />
                <textarea placeholder="Réponse du joueur 1" value={p1.answer} onChange={(e) => setP1({...p1, answer: e.target.value})} />
                <label className="radio-label">
                  <input type="radio" checked={p1.isWinner} onChange={() => { setP1({...p1, isWinner: true}); setP2({...p2, isWinner: false}); }} />
                  Gagnant
                </label>
              </div>

              <div className="control-group">
                <label className="player-badge p2">🔴 Joueur 2</label>
                <input type="text" placeholder="Nom" value={p2.name} onChange={(e) => setP2({...p2, name: e.target.value, initial: e.target.value.charAt(0).toUpperCase()})} />
                <textarea placeholder="Réponse du joueur 2" value={p2.answer} onChange={(e) => setP2({...p2, answer: e.target.value})} />
                <label className="radio-label">
                  <input type="radio" checked={p2.isWinner} onChange={() => { setP2({...p2, isWinner: true}); setP1({...p1, isWinner: false}); }} />
                  Gagnant
                </label>
              </div>
            </div>
          </>
        ) : (
          <>
            <h1 className="studio-title" style={{ background: 'linear-gradient(to right, #60a5fa, #3b82f6)', WebkitBackgroundClip: 'text' }}>✨ Studio Captain Bond</h1>
            <p className="studio-subtitle">Générateur de Confessions & Fake Chat</p>

            <div className="brand-switcher" style={{ display: 'flex', gap: '10px', marginTop: '20px', marginBottom: '20px' }}>
              <button 
                style={{ flex: 1, padding: '10px', borderRadius: '5px', background: bondMode === 'confession' ? '#3b82f6' : '#222', color: bondMode === 'confession' ? '#fff' : '#888', border: 'none', cursor: 'pointer' }}
                onClick={() => setBondMode('confession')}
              >
                🤫 Confession
              </button>
              <button 
                style={{ flex: 1, padding: '10px', borderRadius: '5px', background: bondMode === 'chat' ? '#10b981' : '#222', color: bondMode === 'chat' ? '#fff' : '#888', border: 'none', cursor: 'pointer' }}
                onClick={() => setBondMode('chat')}
              >
                💬 Fake Chat
              </button>
            </div>

            {bondMode === 'confession' ? (
              <>
                <div className="control-group">
                  <label>L&apos;Amorce (La Question Posée)</label>
                  <input type="text" value={bondAmorce} onChange={(e) => setBondAmorce(e.target.value)} />
                </div>
                <div className="control-group">
                  <label>La Confession Secrète (Le texte anonyme)</label>
                  <textarea rows={5} value={bondConfession} onChange={(e) => setBondConfession(e.target.value)} />
                </div>
              </>
            ) : (
              <>
                <div className="control-group">
                  <label>Nom du contact (En haut)</label>
                  <input type="text" value={chatHeader} onChange={(e) => setChatHeader(e.target.value)} />
                </div>
                <div className="control-group">
                  <label>Conversation ({chatMessages.length} messages)</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                    {chatMessages.map((msg, idx) => (
                      <div key={msg.id} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: msg.sender === 'right' ? '#10b981' : '#6b7280' }}></div>
                        <input 
                          type="text" 
                          value={msg.text} 
                          onChange={(e) => updateMessage(msg.id, e.target.value)} 
                          style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '5px', color: '#fff' }}
                        />
                        <button onClick={() => removeMessage(msg.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>❌</button>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button onClick={() => addMessage('left')} style={{ flex: 1, padding: '10px', background: '#374151', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>+ Bulle Grise</button>
                    <button onClick={() => addMessage('right')} style={{ flex: 1, padding: '10px', background: '#059669', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>+ Bulle Verte</button>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* RIGHT PANEL: REMOTION PLAYER PREVIEW */}
      <div className="studio-render-area">
        {brand === 'reunion' ? (
          <div style={{ borderRadius: '40px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 0 12px #222' }}>
            <Player
              component={CaptainReunionClash}
              inputProps={{
                theme,
                question,
                p1,
                p2
              }}
              durationInFrames={450}
              compositionWidth={1080}
              compositionHeight={1920}
              fps={30}
              style={{
                width: '400px', // Scaled down for preview
                height: '711px',
              }}
              controls
              autoPlay
              loop
            />
          </div>
        ) : (
          <div style={{ borderRadius: '40px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 0 12px #222' }}>
            {bondMode === 'confession' ? (
              <div className="text-center p-8 text-slate-400">Composant CaptainBondConfession manquant</div>
            ) : (
              <div className="text-center p-8 text-slate-400">Composant CaptainBondChat manquant</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
