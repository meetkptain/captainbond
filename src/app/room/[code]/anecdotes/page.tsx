'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api/client';

interface Anecdote {
  id: string;
  question: string;
  answer: string;
}

export default function AnecdotesPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const roomCode = params.code as string;
  
  const [anecdotes, setAnecdotes] = useState<Anecdote[]>([
    { id: '1', question: 'Quelle est sa plus grande manie ou habitude bizarre ?', answer: '' },
    { id: '2', question: 'Quel est son pire secret ou dossier de soirée ?', answer: '' },
    { id: '3', question: 'Quel est son plus grand rêve inavoué ?', answer: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hostId = searchParams.get('hostId');

  useEffect(() => {
    if (!hostId) {
      setError('ID Hôte manquant. Seul l\'hôte peut accéder à cette page.');
    }
  }, [hostId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostId) return;
    setLoading(true);
    setError(null);
    try {
      await api.post('/api/room/anecdotes', {
        roomCode,
        hostId,
        anecdotes: anecdotes.filter(a => a.answer.trim() !== ''),
      });
      setSuccess(true);
      setTimeout(() => {
        router.push(`/room/${roomCode}/player`);
      }, 1500);
    } catch (err) {
      setError('Impossible de sauvegarder les anecdotes.');
    } finally {
      setLoading(false);
    }
  };

  const updateAnswer = (id: string, text: string) => {
    setAnecdotes(prev => prev.map(a => a.id === id ? { ...a, answer: text } : a));
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 p-4 justify-center items-center">
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-800/80 p-6 shadow-2xl relative overflow-hidden">
        
        {/* Glow Effects */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">🤫</span>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight uppercase">Dossiers Secrets</h1>
            <p className="text-xs text-slate-400">Injectez des anecdotes réelles pour pimenter la soirée !</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3 mb-4 text-xs">
            {error}
          </div>
        )}

        {success ? (
          <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
            <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.2)] animate-bounce">
              <span className="text-2xl">✓</span>
            </div>
            <h2 className="text-lg font-bold text-green-400">Anecdotes Enregistrées !</h2>
            <p className="text-xs text-slate-400">Le DJ Émotionnel prépare les questions personnalisées...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            {anecdotes.map((anec, idx) => (
              <div key={anec.id} className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">
                  Question {idx + 1} : {anec.question}
                </label>
                <textarea
                  value={anec.answer}
                  onChange={e => updateAnswer(anec.id, e.target.value)}
                  placeholder="Écrivez une anecdote croustillante..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-pink-500/50 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-pink-500/30 transition-all text-slate-200"
                  rows={2}
                />
              </div>
            ))}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.push(`/room/${roomCode}/player`)}
                className="flex-1 py-3 border border-slate-800 hover:bg-slate-800/40 rounded-xl text-xs font-bold text-slate-400 transition-all"
              >
                Passer cette étape
              </button>
              <button
                type="submit"
                disabled={loading || !hostId}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-[0_0_20px_rgba(236,72,153,0.2)] disabled:opacity-50"
              >
                {loading ? 'Sauvegarde...' : 'Valider & Lancer'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
