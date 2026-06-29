'use client';

export const runtime = 'edge';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { BackgroundOrbs } from '@/components/BackgroundOrbs';
import { Icon } from '@/components/Icon';
import { joinGroupSession, leaveGroupSession, broadcastGroupState, broadcastPlayerVote, GroupMember, GroupEvent } from '@/services/distanciel/GroupService';
import { api } from '@/lib/api/client';
import { Question } from '@/lib/db/types';
import { useVoiceChat } from '@/hooks/useVoiceChat';

const content = {
  fr: {
    lobbyTitle: "Lobby de Groupe",
    lobbyDesc: "Rejoignez la session de groupe à distance pour explorer la complicité de votre équipe.",
    nameLabel: "Votre Nom d'Agent",
    namePlaceholder: "Ex: Agent Bond",
    joinBtn: "Rejoindre le Salon",
    headerTitle: "Mission Groupe Distanciel",
    headerSessionId: "ID Session :",
    vocalActive: "Vocal Activé",
    vocalConnect: "Se Connecter Vocal",
    lobbyWaitingTitle: "Lobby en attente",
    lobbyWaitingDesc: "En attente du lancement de la mission par l'hôte. Profitez-en pour vous connecter au salon vocal !",
    launchMissionBtn: "Lancer la Mission",
    roundLabel: "Round",
    voteRecordedTitle: "Vote enregistré !",
    voteRecordedDesc: "Vous avez répondu : \"{myAnswer}\". En attente du reste de l'équipe.",
    revealResultsBtn: "Révéler les Résultats",
    resultsTitle: "Révélation des Réponses",
    anonymousAgent: "Agent Anonyme",
    nextRoundBtn: "Manche Suivante",
    teamTitle: "Équipe",
    hostLabel: "Hôte",
  },
  en: {
    lobbyTitle: "Group Lobby",
    lobbyDesc: "Join the remote group session to explore your team's complicity.",
    nameLabel: "Your Agent Name",
    namePlaceholder: "E.g., Agent Bond",
    joinBtn: "Join Lobby",
    headerTitle: "Remote Group Mission",
    headerSessionId: "Session ID:",
    vocalActive: "Voice Connected",
    vocalConnect: "Connect Voice Chat",
    lobbyWaitingTitle: "Waiting Lobby",
    lobbyWaitingDesc: "Waiting for the host to launch the mission. Feel free to connect to the voice chat in the meantime!",
    launchMissionBtn: "Launch Mission",
    roundLabel: "Round",
    voteRecordedTitle: "Vote Recorded!",
    voteRecordedDesc: "You answered: \"{myAnswer}\". Waiting for the rest of the team.",
    revealResultsBtn: "Reveal Results",
    resultsTitle: "Answers Revelation",
    anonymousAgent: "Anonymous Agent",
    nextRoundBtn: "Next Round",
    teamTitle: "Team",
    hostLabel: "Host",
  }
};

export default function RemoteGroupPage({ defaultLang = 'en' }: { defaultLang?: 'fr' | 'en' }) {
  const params = useParams();
  const groupId = params.id as string;

  const [lang, setLang] = useState<'fr' | 'en'>(defaultLang);

  // Player & Group State
  const [playerId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(`group_player_id_${groupId}`) || crypto.randomUUID();
    }
    return null;
  });
  const [playerName, setPlayerName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(`group_player_name_${groupId}`) || '';
    }
    return '';
  });
  const [isJoined, setIsJoined] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return !!(localStorage.getItem(`group_player_id_${groupId}`) && localStorage.getItem(`group_player_name_${groupId}`));
    }
    return false;
  });
  const [isHost, setIsHost] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(`group_is_host_${groupId}`) === 'true';
    }
    return false;
  });
  
  // Realtime Sync States
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [status, setStatus] = useState<'LOBBY' | 'PLAYING' | 'VOTED' | 'RESULTS'>('LOBBY');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [round, setRound] = useState(1);
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [myAnswer, setMyAnswer] = useState<string | null>(null);
  
  // Voice Chat States
  const [isVoiceConnected, setIsVoiceConnected] = useState(false);
  const { isMuted, toggleMute } = useVoiceChat({
    groupId,
    playerId: playerId || '',
    isEnabled: isVoiceConnected,
  });

  // Autodetect language
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isFr = window.location.pathname.startsWith('/fr');
      setLang(isFr ? 'fr' : 'en');
    }
  }, []);

  const t = content[lang];

  // Sync session handler
  const handleEvent = useCallback((event: GroupEvent) => {
    switch (event.type) {
      case 'state_changed':
        const { currentQuestionId, status: newStatus, round: newRound } = event.payload;
        setStatus(newStatus);
        setRound(newRound);
        if (currentQuestionId) {
          // Fetch question details
          api.get<{ question: Question }>(`/api/questions/get?id=${currentQuestionId}`)
            .then((res) => {
              if (res.question) setCurrentQuestion(res.question);
            })
            .catch(console.error);
        } else {
          setCurrentQuestion(null);
        }
        // Reset local votes for new round
        if (newStatus === 'PLAYING') {
          setVotes({});
          setMyAnswer(null);
        }
        break;
      case 'player_voted':
        const { playerId: voterId, answer } = event.payload;
        setVotes((prev) => ({ ...prev, [voterId]: answer }));
        break;
      default:
        break;
    }
  }, []);

  const handlePresenceSync = useCallback((syncedMembers: GroupMember[]) => {
    setMembers(syncedMembers);
  }, []);

  // Join handler
  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || !playerId) return;

    localStorage.setItem(`group_player_id_${groupId}`, playerId);
    localStorage.setItem(`group_player_name_${groupId}`, playerName);
    
    // First joining member defaults to host
    const hostStatus = members.length === 0;
    setIsHost(hostStatus);
    localStorage.setItem(`group_is_host_${groupId}`, String(hostStatus));
    
    setIsJoined(true);
  };

  // Subscribe to realtime channel when joined
  useEffect(() => {
    if (!isJoined || !playerId || !playerName) return;

    joinGroupSession(
      groupId,
      playerId,
      playerName,
      isHost,
      handleEvent,
      handlePresenceSync
    );

    return () => {
      leaveGroupSession(groupId);
    };
  }, [isJoined, groupId, playerId, playerName, isHost, handleEvent, handlePresenceSync]);

  // Actions
  const handleStartGame = async () => {
    if (!isHost) return;
    
    try {
      // Mock question id or fetch from deck
      const questionId = '550e8400-e29b-41d4-a716-446655440000';
      await broadcastGroupState(groupId, playerId!, questionId, 'PLAYING', round + 1);
      
      // Fetch question local details
      const res = await api.get<{ question: Question }>(`/api/questions/get?id=${questionId}`);
      if (res.question) {
        setCurrentQuestion(res.question);
        setStatus('PLAYING');
        setVotes({});
        setMyAnswer(null);
      }
    } catch (err) {
      console.error('Failed to start next round:', err);
    }
  };

  const handleVote = async (answer: string) => {
    if (!playerId) return;
    setMyAnswer(answer);
    setStatus('VOTED');
    await broadcastPlayerVote(groupId, playerId, playerId, currentQuestion?.id || 'q-1', answer);
  };

  const handleEndRound = async () => {
    if (!isHost) return;
    await broadcastGroupState(groupId, playerId!, currentQuestion?.id || null, 'RESULTS', round);
    setStatus('RESULTS');
  };

  // Voice chat controls
  const toggleVoice = () => {
    setIsVoiceConnected(!isVoiceConnected);
  };

  if (!isJoined) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-slate-950 text-white overflow-hidden font-sans">
        <BackgroundOrbs />
        <div className="relative z-10 w-full max-w-md p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-500 to-violet-600 flex items-center justify-center mb-6 shadow-lg shadow-pink-500/20">
            <Icon name="users" className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-400">
            {t.lobbyTitle}
          </h1>
          <p className="text-sm text-slate-400 mb-6 text-center">
            {t.lobbyDesc}
          </p>

          <form onSubmit={handleJoin} className="w-full flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                {t.nameLabel}
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder={t.namePlaceholder}
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-pink-500/50 transition-all font-medium"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 font-semibold text-white tracking-wide transition-all shadow-lg shadow-pink-500/20 hover:shadow-pink-500/30 flex items-center justify-center gap-2 border-none cursor-pointer"
            >
              {t.joinBtn}
              <Icon name="arrowRight" className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-white overflow-hidden font-sans">
      <BackgroundOrbs />
      
      {/* Top Header */}
      <header className="relative z-10 w-full px-6 py-4 flex items-center justify-between border-b border-white/5 bg-slate-950/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-violet-600 flex items-center justify-center shadow-md shadow-pink-500/10">
            <Icon name="users" className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight">{t.headerTitle}</h2>
            <p className="text-xs text-slate-400">{t.headerSessionId} {groupId.slice(0, 8)}</p>
          </div>
        </div>

        {/* Voice Chat Panel */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleVoice}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-semibold border transition-all cursor-pointer ${
              isVoiceConnected 
                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Icon name="volume" className="w-3.5 h-3.5" />
            {isVoiceConnected ? t.vocalActive : t.vocalConnect}
          </button>
          {isVoiceConnected && (
            <button
              onClick={toggleMute}
              className={`p-2 rounded-lg border transition-all cursor-pointer ${
                isMuted 
                  ? 'bg-rose-500/20 border-rose-500/30 text-rose-400' 
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <Icon name="volume" className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Main Grid Layout */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Side: Game Controller */}
        <section className="lg:col-span-3 flex flex-col gap-6">
          {status === 'LOBBY' && (
            <div className="w-full p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col items-center justify-center text-center py-16">
              <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 animate-pulse">
                <Icon name="hourglass" className="w-8 h-8 text-pink-400" />
              </div>
              <h3 className="text-2xl font-bold mb-2">{t.lobbyWaitingTitle}</h3>
              <p className="text-slate-400 max-w-sm mb-8 text-sm">
                {t.lobbyWaitingDesc}
              </p>
              {isHost && (
                <button
                  onClick={handleStartGame}
                  className="px-8 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 font-bold transition-all shadow-lg shadow-pink-500/25 hover:shadow-pink-500/35 border-none cursor-pointer"
                >
                  {t.launchMissionBtn}
                </button>
              )}
            </div>
          )}

          {status === 'PLAYING' && currentQuestion && (
            <div className="w-full p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col gap-6">
              <span className="text-xs font-semibold text-pink-400 uppercase tracking-widest">
                {t.roundLabel} {round}
              </span>
              <h3 className="text-3xl font-extrabold leading-tight">
                {currentQuestion.text}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {(currentQuestion.options || ['Choice A', 'Choice B', 'Choice C', 'Choice D']).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleVote(opt)}
                    className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-pink-500/40 text-left hover:bg-slate-900 hover:scale-[1.01] transition-all font-medium flex items-center justify-between cursor-pointer"
                  >
                    <span>{opt}</span>
                    <Icon name="arrowRight" className="w-4 h-4 text-slate-500" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {status === 'VOTED' && (
            <div className="w-full p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col items-center justify-center text-center py-16">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-6">
                <Icon name="check" className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold mb-2">{t.voteRecordedTitle}</h3>
              <p className="text-slate-400 max-w-sm mb-6 text-sm">
                {t.voteRecordedDesc.replace('{myAnswer}', myAnswer || '')}
              </p>
              {isHost && (
                <button
                  onClick={handleEndRound}
                  className="px-6 py-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-850 font-bold transition-all text-sm cursor-pointer"
                >
                  {t.revealResultsBtn}
                </button>
              )}
            </div>
          )}

          {status === 'RESULTS' && (
            <div className="w-full p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col gap-6">
              <h3 className="text-2xl font-bold">{t.resultsTitle}</h3>
              
              <div className="flex flex-col gap-4 mt-4">
                {Object.entries(votes).map(([vId, val]) => {
                  const m = members.find((member) => member.playerId === vId);
                  return (
                    <div key={vId} className="flex items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                      <span className="font-semibold text-slate-300">{m?.name || t.anonymousAgent}</span>
                      <span className="px-4 py-1.5 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400 font-semibold text-sm">
                        {val}
                      </span>
                    </div>
                  );
                })}
              </div>

              {isHost && (
                <button
                  onClick={handleStartGame}
                  className="px-8 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 font-bold transition-all mt-6 border-none cursor-pointer text-white"
                >
                  {t.nextRoundBtn}
                </button>
              )}
            </div>
          )}
        </section>

        {/* Right Side: Presence / Members List */}
        <section className="lg:col-span-1 flex flex-col gap-6">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <Icon name="users" className="w-4 h-4 text-pink-400" />
              {t.teamTitle} ({members.length})
            </h3>
            <div className="flex flex-col gap-3">
              {members.map((member) => (
                <div
                  key={member.playerId}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-800/80"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-sm font-semibold">{member.name}</span>
                  </div>
                  {member.isHost && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-violet-500/20 border border-violet-500/30 text-violet-400">
                      {t.hostLabel}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
