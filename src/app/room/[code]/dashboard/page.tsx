'use client';

export const runtime = 'edge';

import React, { Suspense, useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useTranslation, Language } from '@/lib/i18n';
import { BackgroundOrbs } from '@/components/BackgroundOrbs';
import { Icon } from '@/components/Icon';
import type { RoomDashboardStats } from '@/services/roomService';

interface Props {
  defaultLang?: Language;
}

function DashboardContent({ defaultLang }: Props) {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomCode = (params.code as string).toUpperCase();
  const token = searchParams.get('token');
  const { t, language, setLanguage } = useTranslation();

  const [stats, setStats] = useState<RoomDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (defaultLang) {
      setLanguage(defaultLang);
    }
  }, [defaultLang, setLanguage]);

  useEffect(() => {
    if (!roomCode) return;

    let url = `/api/room/stats?roomCode=${roomCode}`;
    if (token) {
      url += `&token=${token}`;
    }

    fetch(url)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Impossible de charger les statistiques.');
      })
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching stats:', err);
        setError(err.message || 'Une erreur est survenue.');
        setLoading(false);
      });
  }, [roomCode, token]);

  const handleShare = () => {
    if (typeof window === 'undefined') return;
    const publicUrl = `${window.location.origin}${language === 'fr' ? '/fr' : ''}/room/${roomCode}/dashboard`;
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white relative">
        <BackgroundOrbs />
        <div className="w-12 h-12 border-4 border-white/10 border-t-amber-500 rounded-full animate-spin mb-4" />
        <p className="text-slate-400 font-medium z-10">Calcul des indices de cohésion...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-6 text-center relative">
        <BackgroundOrbs />
        <div className="glass-panel p-8 max-w-md w-full flex flex-col items-center gap-6 z-10">
          <span className="text-5xl">🔒</span>
          <h2 className="text-2xl font-bold text-slate-200">Accès Refusé</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            {error || 'Impossible de charger les statistiques de cette session.'}
          </p>
          <button
            onClick={() => router.push(language === 'fr' ? '/fr' : '/')}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition-all cursor-pointer border border-slate-700"
          >
            Retour à l&apos;accueil
          </button>
        </div>
      </div>
    );
  }

  // Label representing team alignment levels
  const getIceLabel = (score: number) => {
    if (score >= 85) return language === 'fr' ? 'Cohésion Exceptionnelle 🚀' : 'Exceptional Cohesion 🚀';
    if (score >= 70) return language === 'fr' ? 'Bonne Synergie de Groupe 🤝' : 'Good Team Synergy 🤝';
    if (score >= 50) return language === 'fr' ? 'Alignement en Progrès 📈' : 'Alignment in Progress 📈';
    return language === 'fr' ? 'Besoin de Team Building ☕' : 'Team Building Needed ☕';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-y-auto px-4 py-8 md:py-12">
      <BackgroundOrbs />

      <div className="max-w-4xl mx-auto w-full z-10 relative space-y-8">
        
        {/* Header section (hidden during print) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold tracking-widest text-amber-500 uppercase">
              Rapport de Cohésion B2B
            </span>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              Captain Bond
              <span className="px-3 py-1 text-sm bg-white/5 border border-white/10 rounded-lg font-mono text-amber-400 font-bold tracking-widest shadow-[0_0_10px_rgba(245,158,11,0.15)]">
                {roomCode}
              </span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {stats.isAdmin && (
              <button
                onClick={handlePrint}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-slate-200 font-semibold rounded-xl border border-white/10 transition-all flex items-center gap-2 cursor-pointer shadow-md text-sm"
              >
                <Icon name="check" className="w-4 h-4 text-emerald-400" />
                {language === 'fr' ? 'Exporter en PDF / Imprimer' : 'Export to PDF / Print'}
              </button>
            )}
            <button
              onClick={handleShare}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-550 to-yellow-500 hover:brightness-110 text-slate-950 font-black rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-lg text-sm"
            >
              <Icon name="coffee" className="w-4 h-4 text-slate-950" />
              {copied
                ? (language === 'fr' ? 'Lien copié !' : 'Link copied!')
                : (language === 'fr' ? 'Partager les stats anonymisées' : 'Share anonymized stats')}
            </button>
          </div>
        </div>

        {/* Printable title block */}
        <div className="hidden print:block text-center space-y-2 border-b border-slate-200 pb-6 mb-8 text-slate-900">
          <h1 className="text-4xl font-black">Rapport de Cohésion Captain Bond</h1>
          <p className="text-lg font-medium text-slate-600">Session : {roomCode} — Type : B2B Corporate</p>
        </div>

        {/* Main statistics cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* ICE circular rating card */}
          <div className="glass-panel p-6 border border-white/10 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 bg-white/[0.02] shadow-xl relative overflow-hidden">
            <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
              Indice de Cohésion Collective (ICE)
            </span>
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="54" className="stroke-white/10 fill-none" strokeWidth="10" />
                <circle
                  cx="64"
                  cy="64"
                  r="54"
                  className="stroke-amber-500 fill-none transition-all duration-1000"
                  strokeWidth="10"
                  strokeDasharray={339}
                  strokeDashoffset={339 - (339 * stats.iceScore) / 100}
                />
              </svg>
              <span className="absolute text-3xl font-black">{stats.iceScore}%</span>
            </div>
            <span className="text-sm font-bold text-amber-400">{getIceLabel(stats.iceScore)}</span>
          </div>

          {/* Participation rate card */}
          <div className="glass-panel p-6 border border-white/10 rounded-2xl flex flex-col justify-between space-y-4 bg-white/[0.02] shadow-xl relative">
            <div>
              <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase block mb-1">
                Taux de Participation Activer
              </span>
              <span className="text-4xl font-black">{stats.participationRate}%</span>
            </div>
            <div className="space-y-2">
              <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stats.participationRate}%` }} />
              </div>
              <p className="text-xs text-slate-400">
                {language === 'fr'
                  ? `Pourcentage de réponses émises par rapport au maximum possible.`
                  : `Percentage of answers submitted compared to max potential.`}
              </p>
            </div>
          </div>

          {/* Consensus Alignment rate card */}
          <div className="glass-panel p-6 border border-white/10 rounded-2xl flex flex-col justify-between space-y-4 bg-white/[0.02] shadow-xl relative">
            <div>
              <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase block mb-1">
                Indice d&apos;Alignement (Consensus)
              </span>
              <span className="text-4xl font-black">{stats.consensusRate}%</span>
            </div>
            <div className="space-y-2">
              <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-violet-500 rounded-full" style={{ width: `${stats.consensusRate}%` }} />
              </div>
              <p className="text-xs text-slate-400">
                {language === 'fr'
                  ? `Degré de consensus ou d'accord collectif obtenu sur les choix majeurs.`
                  : `Degree of consensus or collective agreement reached on key choices.`}
              </p>
            </div>
          </div>
        </div>

        {/* Nudge QVT / Psychologist Recommendations */}
        <div className="glass-panel p-6 border border-white/10 rounded-2xl bg-white/[0.02] shadow-xl space-y-3 relative overflow-hidden">
          <div className="flex items-center gap-3">
            <span className="text-xl">💡</span>
            <h3 className="text-lg font-bold text-slate-200">
              {language === 'fr' ? 'Recommandations d\'experts QVT' : 'QVT Expert Insights'}
            </h3>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed italic">
            {stats.iceScore >= 85
              ? (language === 'fr'
                  ? "Votre équipe affiche une cohésion exceptionnelle ! C'est le moment idéal pour lancer de nouveaux projets transverses ou donner plus d'autonomie à vos collaborateurs. Célébrez cette réussite sur vos canaux internes."
                  : "Your team displays outstanding cohesion! This is the perfect time to launch cross-functional projects or grant more autonomy to team members. Celebrate this synergy on your internal channels.")
              : stats.iceScore >= 70
              ? (language === 'fr'
                  ? "Bonne synergie globale. Quelques silos peuvent encore exister entre certains départements. N'hésitez pas à organiser un déjeuner d'équipe informel pour renforcer ces ponts."
                  : "Good general synergy. Some minor silos might still exist between departments. Consider hosting an informal team lunch to build stronger bonds.")
              : (language === 'fr'
                  ? "Alignement en cours de construction. Le dialogue au sein du groupe peut être fluidifié. Nous vous conseillons d'intégrer des sessions courtes de jeu (15 min) lors de vos réunions d'équipe hebdomadaires pour libérer la parole."
                  : "Alignment is still building up. Communication within the unit can be fluidified. We recommend integrating short 15-minute game sessions into your weekly team syncs to open up discussions.")
            }
          </p>
        </div>

        {/* Dynamic game mode breakdowns & players mapping */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Players overview panel */}
          <div className="glass-panel p-6 border border-white/10 rounded-2xl bg-white/[0.02] shadow-xl space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2 border-b border-white/10 pb-3">
              <span>👥</span>
              {language === 'fr' ? 'Membres de la Cellule' : 'Unit Members'}
              <span className="text-xs bg-white/5 border border-white/10 px-2 py-0.5 rounded-md text-slate-400 font-mono font-bold">
                {stats.playersCount}
              </span>
            </h3>
            <div className="flex flex-wrap gap-2 max-h-[220px] overflow-y-auto pr-2">
              {stats.players?.map((p) => (
                <div
                  key={p.id}
                  className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {p.name}
                </div>
              ))}
            </div>
          </div>

          {/* Session breakdown panel */}
          <div className="glass-panel p-6 border border-white/10 rounded-2xl bg-white/[0.02] shadow-xl space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2 border-b border-white/10 pb-3">
              <span>📊</span>
              {language === 'fr' ? 'Détails des Activités' : 'Activities Breakdown'}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm border-b border-white/5 pb-2">
                <span className="text-slate-400">Total Manches Jouées</span>
                <span className="font-mono font-bold text-white">{stats.roundCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm border-b border-white/5 pb-2">
                <span className="text-slate-400">Dossiers Secrets Révélés</span>
                <span className="font-mono font-bold text-white">{stats.customAnecdotesCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm pb-1">
                <span className="text-slate-400">Statut de la Pièce</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold uppercase tracking-wider">
                  {stats.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Custom secrets list (Shown only to administrators) */}
        {stats.isAdmin && stats.customAnecdotes && stats.customAnecdotes.length > 0 && (
          <div className="glass-panel p-6 border border-white/10 rounded-2xl bg-white/[0.02] shadow-xl space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2 border-b border-white/10 pb-3">
              <span>🕵️</span>
              {language === 'fr' ? 'Dossiers Secrets Collectés' : 'Secrets Files Collected'}
            </h3>
            <div className="grid grid-cols-1 gap-3.5 max-h-[300px] overflow-y-auto pr-2">
              {stats.customAnecdotes.map((anec, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row justify-between sm:items-center gap-3"
                >
                  <p className="text-sm font-medium italic text-slate-300">
                    &ldquo;{anec.question}&rdquo;
                  </p>
                  <span className="px-3 py-1 bg-violet-950/20 border border-violet-850/80 rounded-lg text-xs font-bold text-violet-400 shrink-0 self-start sm:self-auto">
                    Auteur : {anec.answer}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-white/10 border-t-amber-500 rounded-full animate-spin mb-4" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
export { DashboardContent };
