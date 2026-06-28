'use client';

import React, { useState } from 'react';
import { LandingLayout } from '@/components/landing/LandingLayout';
import { LandingButton } from '@/components/landing/LandingButton';
import { Section } from '@/components/landing/Section';
import { FeatureShowcase } from '@/components/landing/FeatureShowcase';
import { Icon } from '@/components/Icon';
import { api } from '@/lib/api/client';

export default function OnboardingLandingPage() {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    notes: 'Intérêt pour l\'Onboarding / Intégration collaborateurs.',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [extractedQuestions, setExtractedQuestions] = useState<string[] | null>(null);

  const handleDemoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    // Simulate AI extraction of fun questions
    setTimeout(() => {
      setUploading(false);
      setExtractedQuestions([
        "Qui dans l'équipe a fait un stage de survie en Guyane pendant 3 mois ?",
        "Quel collaborateur a déjà partagé un café avec une célébrité sans le savoir ?",
        "Qui a rejoint l'équipe en premier après avoir habité à Tokyo ?"
      ]);
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/api/corporate/contact', {
        ...formData,
        participants: 20,
        estimatedPrice: 299,
        formula: 'ONBOARDING_PACK',
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
          <span className="inline-block text-xs font-mono uppercase tracking-widest text-pink-400 border border-pink-500/20 bg-pink-500/5 px-3 py-1 rounded-full">
            Intégration & Recrutement
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1]">
            Accélérez l&apos;intégration des collaborateurs par le jeu
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-xl mx-auto leading-relaxed">
            Transformez le livret d&apos;accueil barbant en un quiz interactif personnalisé par l&apos;IA Gemini. Créez des connexions immédiates entre anciens et nouveaux.
          </p>
          <div className="pt-4">
            <a href="#demo-ia" className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-pink-500/20 text-center text-white border-none decoration-none inline-block">
              Tester le Générateur de Questions IA
            </a>
          </div>
        </div>
      </Section>

      {/* Interactive AI Demo Simulator */}
      <Section id="demo-ia" className="bg-white/[0.02] border-y border-white/5 py-16">
        <div className="max-w-xl mx-auto space-y-8 px-4">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Démo : Générez vos questions d&apos;équipe</h2>
            <p className="text-sm text-white/60">Uploadez un livret d&apos;accueil factice (PDF) ou un court document texte de présentation d&apos;équipe pour simuler l&apos;extraction par l&apos;IA.</p>
          </div>

          <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-8 text-center space-y-6">
            {!extractedQuestions && !uploading && (
              <label className="border-2 border-dashed border-white/20 hover:border-pink-500/50 rounded-2xl p-10 block cursor-pointer transition-colors group">
                <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleDemoUpload} className="hidden" />
                <span className="text-4xl block mb-4">📂</span>
                <span className="text-sm font-bold text-white block group-hover:text-pink-400">Glissez-déposez votre PDF ici</span>
                <span className="text-xs text-white/40 block mt-1">Formats acceptés : PDF, TXT (Max 5Mo)</span>
              </label>
            )}

            {uploading && (
              <div className="py-12 space-y-4">
                <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-pink-400 font-mono">Gemini analyse le document...</p>
              </div>
            )}

            {extractedQuestions && (
              <div className="text-left space-y-4">
                <span className="text-xs font-mono text-pink-400 uppercase tracking-widest block">✓ 3 questions extraites avec succès :</span>
                <div className="space-y-3">
                  {extractedQuestions.map((q, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white/90">
                      {q}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setExtractedQuestions(null)}
                  className="w-full py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold rounded-xl transition-all"
                >
                  Réessayer un autre document
                </button>
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* Feature Spotlights */}
      <Section>
        <div className="space-y-24 md:space-y-32">
          <FeatureShowcase
            title="Importation par IA"
            description="Uploadez votre livret d'accueil ou trombinoscope. Gemini IA génère instantanément des questions de complicité basées sur les anecdotes réelles des collaborateurs."
            visual={
              <div className="aspect-video bg-[#0a0f1e] rounded-2xl border border-white/10 flex items-center justify-center">
                <Icon name="check" className="w-20 h-20 text-white/20" />
              </div>
            }
          />
          <FeatureShowcase
            title="Algorithme anti-silos"
            description="Le jeu regroupe intelligemment des personnes issues de départements différents pour les encourager à dialoguer et à se découvrir au-delà du cadre professionnel classique."
            visual={
              <div className="aspect-video bg-[#0a0f1e] rounded-2xl border border-white/10 flex items-center justify-center">
                <Icon name="users" className="w-20 h-20 text-white/20" />
              </div>
            }
            reverse
          />
        </div>
      </Section>

      {/* Contact form */}
      <Section id="contact">
        <div className="max-w-xl mx-auto px-4">
          {submitted ? (
            <div className="text-center py-16 space-y-4 rounded-3xl border border-white/10 bg-white/[0.02]">
              <div className="mx-auto w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                <span className="text-2xl text-green-400">✓</span>
              </div>
              <h2 className="text-2xl font-black text-white">Demande d&apos;Onboarding reçue !</h2>
              <p className="text-white/60 max-w-md mx-auto px-6 text-sm">
                Un conseiller spécialisé dans l&apos;intégration RH vous contactera sous 24h ouvrées.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:p-10">
              <div className="text-center space-y-2">
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                  Demander une Démo Onboarding
                </h2>
                <p className="text-sm text-white/60">
                  Validez la marque employeur et facilitez l&apos;intégration de vos équipes.
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
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-pink-500/50 text-sm"
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
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-pink-500/50 text-sm"
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
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-pink-500/50 text-sm"
                  />
                </div>
              </div>

              <LandingButton type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
                {submitting ? 'Envoi en cours...' : 'Planifier ma Démo Onboarding'}
              </LandingButton>
            </form>
          )}
        </div>
      </Section>
    </LandingLayout>
  );
}
