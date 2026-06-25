'use client';

import { useState } from 'react';

interface DailyQuestionProps {
  questionText: string;
  partnerName: string;
  userName: string;
  initialUserAnswer?: string | null;
  initialPartnerAnswer?: string | null;
  onSubmitAnswer: (answer: string) => Promise<void>;
  resonancePercent?: number;
}

export function DailyQuestion({
  questionText,
  partnerName,
  userName,
  initialUserAnswer = null,
  initialPartnerAnswer = null,
  onSubmitAnswer,
  resonancePercent = 88,
}: DailyQuestionProps) {
  const [answerInput, setAnswerInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userAnswer, setUserAnswer] = useState<string | null>(initialUserAnswer);
  const partnerAnswer = initialPartnerAnswer;
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!answerInput.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await onSubmitAnswer(answerInput);
      setUserAnswer(answerInput);
    } catch (err) {
      console.error(err);
      setError('Impossible d\'enregistrer votre réponse.');
    } finally {
      setLoading(false);
    }
  };

  const isBothAnswered = !!userAnswer && !!partnerAnswer;
  const isWaitingPartner = !!userAnswer && !partnerAnswer;

  return (
    <div className="w-full max-w-md p-6 bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-700/50 shadow-2xl">
      <div className="flex items-center gap-2 mb-4">
        <span className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
        </span>
        <h3 className="text-xs font-bold uppercase tracking-widest text-amber-500 font-mono">
          QUESTION DU JOUR • 20H
        </h3>
      </div>

      <p className="text-lg font-medium text-slate-100 mb-6 italic leading-relaxed">
        &quot;{questionText}&quot;
      </p>

      {/* State 1: Unanswered */}
      {!userAnswer && (
        <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
          <textarea
            value={answerInput}
            onChange={(e) => setAnswerInput(e.target.value)}
            disabled={loading}
            placeholder="Répondez sincèrement et à cœur ouvert..."
            className="w-full h-32 px-4 py-3 bg-slate-950/40 border border-slate-800 focus:border-amber-500/50 rounded-2xl text-slate-200 text-sm focus:outline-none transition-all placeholder:text-slate-600 resize-none font-sans"
            maxLength={300}
          />
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-650 font-medium font-mono">
              {answerInput.length}/300 caractères
            </span>
            {error && <span className="text-xs text-rose-450 font-medium">{error}</span>}
          </div>
          <button
            onClick={handleSubmit}
            disabled={!answerInput.trim() || loading}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 disabled:from-slate-800 disabled:to-slate-800 text-slate-950 disabled:text-slate-600 font-bold rounded-2xl cursor-pointer disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Soumettre ma réponse
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </div>
      )}

      {/* State 2: Waiting Partner */}
      {isWaitingPartner && (
        <div className="flex flex-col items-center justify-center py-6 text-center space-y-4 animate-[fadeIn_0.3s_ease-out]">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-amber-500/10 border-t-amber-500 animate-spin flex items-center justify-center">
              <span className="text-2xl animate-pulse">⏳</span>
            </div>
          </div>
          <h4 className="text-base font-bold text-slate-200">Réponse enregistrée</h4>
          <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
            Votre réponse est bien scellée. Dès que <span className="text-amber-400 font-semibold">{partnerName}</span> aura répondu, vos réponses seront révélées en même temps.
          </p>
          <div className="p-4 bg-slate-950/30 rounded-2xl border border-slate-800/40 w-full text-left italic text-xs text-slate-500">
            &quot;{userAnswer}&quot;
          </div>
        </div>
      )}

      {/* State 3: Both Answered (Revealed) */}
      {isBothAnswered && (
        <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* User Answer */}
            <div className="p-4 bg-slate-950/40 border border-slate-800/50 rounded-2xl space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{userName}</span>
              <p className="text-sm text-slate-250 italic leading-relaxed">&quot;{userAnswer}&quot;</p>
            </div>

            {/* Partner Answer */}
            <div className="p-4 bg-slate-950/40 border border-slate-800/50 rounded-2xl space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{partnerName}</span>
              <p className="text-sm text-slate-250 italic leading-relaxed">&quot;{partnerAnswer}&quot;</p>
            </div>
          </div>

          {/* Resonance Score Display */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/5 to-yellow-500/5 border border-amber-500/10 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Résonance sémantique</span>
              <p className="text-xs text-slate-400">Vos cœurs battent sur la même fréquence.</p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400 font-mono">
                {resonancePercent}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
