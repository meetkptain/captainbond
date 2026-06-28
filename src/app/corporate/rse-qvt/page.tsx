'use client';

import React, { useState } from 'react';
import { LandingLayout } from '@/components/landing/LandingLayout';
import { LandingButton } from '@/components/landing/LandingButton';
import { Section } from '@/components/landing/Section';
import { FeatureShowcase } from '@/components/landing/FeatureShowcase';
import { Icon } from '@/components/Icon';
import { api } from '@/lib/api/client';

export default function QvtLandingPage() {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    notes: 'Intérêt pour la mesure de la cohésion QVT / RSE.',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportReady, setReportReady] = useState(false);

  const handleDownloadReport = () => {
    setGeneratingReport(true);
    setTimeout(() => {
      setGeneratingReport(false);
      setReportReady(true);
    }, 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/api/corporate/contact', {
        ...formData,
        participants: 50,
        estimatedPrice: 399,
        formula: 'QVT_PACK',
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LandingLayout variant="corporate">
      {/* Hero */}
      <Section className="pt-10 md:pt-20">
        <div className="text-center space-y-8 max-w-3xl mx-auto">
          <span className="inline-block text-xs font-mono uppercase tracking-widest text-purple-400 border border-purple-500/20 bg-purple-500/5 px-3 py-1 rounded-full">
            Qualité de Vie au Travail (QVT)
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1]">
            Renforcez et mesurez la cohésion sociale de vos collaborateurs
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-xl mx-auto leading-relaxed">
            Un baromètre QVT interactif et ludique sous forme de jeu. Engagez 95% de vos collaborateurs et obtenez un rapport d&apos;impact concret pour votre direction RSE.
          </p>
          <div className="pt-4">
            <button
              onClick={handleDownloadReport}
              disabled={generatingReport}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-purple-500/20 text-center text-white border-none cursor-pointer inline-block"
            >
              {generatingReport ? 'Génération du PDF...' : 'Télécharger un exemple de Rapport QVT'}
            </button>
          </div>
        </div>
      </Section>

      {/* Simulated QVT Report Display */}
      {reportReady && (
        <Section className="bg-slate-900/60 border-y border-white/5 py-12">
          <div className="max-w-2xl mx-auto px-4 bg-slate-950 border border-white/10 rounded-3xl p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-mono text-purple-400 block">RAPPORT D&apos;IMPACT QVT</span>
                <span className="text-lg font-bold text-white">Séminaire Afterwork - Captain Bond</span>
              </div>
              <span className="text-xs font-mono text-white/40">28 Juin 2026</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
                <span className="text-2xl font-black text-purple-400 block">96%</span>
                <span className="text-[10px] uppercase font-mono text-white/50">Taux de participation</span>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
                <span className="text-2xl font-black text-purple-400 block">4.8/5</span>
                <span className="text-[10px] uppercase font-mono text-white/50">Index de sécurité psychologique</span>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
                <span className="text-2xl font-black text-purple-400 block">+38%</span>
                <span className="text-[10px] uppercase font-mono text-white/50">Complicité inter-équipes</span>
              </div>
            </div>

            <div className="space-y-2 text-sm text-white/80">
              <span className="text-xs font-mono text-purple-400 block">Verbatim anonyme de collaborateur :</span>
              <p className="italic bg-white/5 rounded-xl p-3 border-l-2 border-purple-500">
                &quot;C&apos;est la première fois qu&apos;on fait une activité d&apos;équipe où je rigole sincèrement avec les développeurs sans me sentir mal à l&apos;aise. À refaire absolument !&quot;
              </p>
            </div>
            
            <button
              onClick={() => setReportReady(false)}
              className="text-xs text-white/40 hover:text-white underline cursor-pointer bg-transparent border-none block mx-auto"
            >
              Fermer la prévisualisation
            </button>
          </div>
        </Section>
      )}

      {/* Feature Spotlights */}
      <Section>
        <div className="space-y-24 md:space-y-32">
          <FeatureShowcase
            title="L&apos;Index de Sécurité Psychologique"
            description="Le jeu est conçu pour éviter toute mise en situation gênante ou question personnelle intrusive. Chaque collaborateur dispose d'un bouton Safe Word à tout moment."
            visual={
              <div className="aspect-video bg-[#0a0f1e] rounded-2xl border border-white/10 flex items-center justify-center">
                <Icon name="target" className="w-20 h-20 text-white/20" />
              </div>
            }
          />
          <FeatureShowcase
            title="Dashboard pour le Codir"
            description="Justifiez votre budget QVT. Recevez par email les données d'engagement clés et la progression de complicité sociale des équipes pour vos reportings internes."
            visual={
              <div className="aspect-video bg-[#0a0f1e] rounded-2xl border border-white/10 flex items-center justify-center">
                <Icon name="users" className="w-20 h-20 text-white/20" />
              </div>
            }
            reverse
          />
        </div>
      </Section>

      {/* Contact Form */}
      <Section id="contact">
        <div className="max-w-xl mx-auto px-4">
          {submitted ? (
            <div className="text-center py-16 space-y-4 rounded-3xl border border-white/10 bg-white/[0.02]">
              <div className="mx-auto w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                <span className="text-2xl text-green-400">✓</span>
              </div>
              <h2 className="text-2xl font-black text-white">Demande QVT reçue !</h2>
              <p className="text-white/60 max-w-md mx-auto px-6 text-sm">
                Un conseiller QVT de Captain Bond va vous contacter sous 24h ouvrées.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:p-10">
              <div className="text-center space-y-2">
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                  Prendre contact pour un Essai Pilote
                </h2>
                <p className="text-sm text-white/60">
                  Découvrez comment intégrer Captain Bond dans vos rituels QVT.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-xs font-mono uppercase text-white/50 mb-2">Votre nom</label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-purple-500/50 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="company" className="block text-xs font-mono uppercase text-white/50 mb-2">Nom de l&apos;entreprise</label>
                  <input
                    id="company"
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-purple-500/50 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs font-mono uppercase text-white/50 mb-2">Email professionnel</label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-purple-500/50 text-sm"
                  />
                </div>
              </div>

              <LandingButton type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700">
                {submitting ? 'Envoi en cours...' : 'Demander mon Essai Pilote'}
              </LandingButton>
            </form>
          )}
        </div>
      </Section>
    </LandingLayout>
  );
}
