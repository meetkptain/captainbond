'use client';

import React, { useRef, useState } from 'react';
import { LandingLayout } from '@/components/landing/LandingLayout';
import { LandingButton } from '@/components/landing/LandingButton';
import { Section } from '@/components/landing/Section';
import { FeatureShowcase } from '@/components/landing/FeatureShowcase';
import { CorporateVisualMockup } from '@/components/landing/CorporateVisualMockup';
import { CorporatePricingCalculator } from '@/components/landing/CorporatePricingCalculator';
import { Icon } from '@/components/Icon';
import { api, ApiClientError } from '@/lib/api/client';
import { getB2BQuote, estimateB2BPrice } from '@/lib/pricing/b2b';

const MIN_PARTICIPANTS = 10;

export default function CorporateLandingPage() {
  const [participants, setParticipants] = useState(50);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    date: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const contactRef = useRef<HTMLElement>(null);
  const estimateurRef = useRef<HTMLElement>(null);

  const quote = getB2BQuote(participants);
  const estimatedPrice = estimateB2BPrice(participants);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.post('/api/corporate/contact', {
        ...formData,
        participants,
        estimatedPrice,
        formula: quote.formula,
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError(err instanceof ApiClientError ? err.message : 'Une erreur est survenue lors de l\'envoi de votre demande.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LandingLayout variant="corporate">
      {/* Hero */}
      <Section className="pt-10 md:pt-20">
        <div className="text-center space-y-8 max-w-3xl mx-auto">
          <span className="inline-block text-xs font-mono uppercase tracking-widest text-white/50 border border-white/10 px-3 py-1 rounded-full">
            Team Building & Séminaires
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1]">
            Organisez le Team-Building idéal en 30 secondes
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-xl mx-auto leading-relaxed">
            Brisez la glace, encouragez la parole et connectez vos collaborateurs avec une animation interactive sur écran géant (zéro logistique).
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <LandingButton onClick={() => contactRef.current?.scrollIntoView({ behavior: 'smooth' })}>
              Demander un devis
            </LandingButton>
            <LandingButton
              variant="secondary"
              onClick={() => estimateurRef.current?.scrollIntoView({ behavior: 'smooth' })}
            >
              Estimer mon événement
            </LandingButton>
          </div>

          {/* Cocon sémantique B2B - Interlinking */}
          <div className="pt-8 border-t border-white/5 flex flex-wrap justify-center gap-6 text-sm text-white/50 font-mono">
            <span>Découvrez aussi nos solutions :</span>
            <a href="/corporate/onboarding-recrutement" className="text-white hover:text-pink-400 hover:underline transition-colors decoration-none font-bold">
              📂 Intégration & Onboarding
            </a>
            <a href="/corporate/rse-qvt" className="text-white hover:text-purple-400 hover:underline transition-colors decoration-none font-bold">
              📊 Climat Social & QVT
            </a>
            <a href="/b2b/bars-cafes" className="text-white hover:text-indigo-400 hover:underline transition-colors decoration-none font-bold">
              🍻 Animation de Bars
            </a>
          </div>
        </div>
      </Section>

      {/* Visual Proof */}
      <Section compact>
        <CorporateVisualMockup />
      </Section>

      {/* Benefits */}
      <Section>
        <div className="space-y-24 md:space-y-32">
          <FeatureShowcase
            title="Zéro friction technique"
            description="Pas d'application à installer. Les participants scannent un QR code avec leur smartphone pour rejoindre la partie."
            visual={
              <div className="aspect-video bg-[#0a0f1e] rounded-2xl border border-white/10 flex items-center justify-center">
                <Icon name="qrCode" className="w-20 h-20 text-white/20" />
              </div>
            }
          />
          <FeatureShowcase
            title="De 10 à 500+ joueurs"
            description="Jouez tous ensemble projetés sur un écran principal. Idéal pour vos séminaires physiques ou en distanciel."
            visual={
              <div className="aspect-video bg-[#0a0f1e] rounded-2xl border border-white/10 flex items-center justify-center">
                <Icon name="users" className="w-20 h-20 text-white/20" />
              </div>
            }
            reverse
          />
          <FeatureShowcase
            title="Questions adaptées au collectif"
            description="Des questions et dilemmes conçus pour stimuler l'intelligence collective, l'empathie et la synergie de groupe."
            visual={
              <div className="aspect-video bg-[#0a0f1e] rounded-2xl border border-white/10 flex items-center justify-center">
                <Icon name="target" className="w-20 h-20 text-white/20" />
              </div>
            }
          />
        </div>
      </Section>

      {/* Calculator */}
      <Section ref={estimateurRef} id="estimateur" compact className="bg-white/[0.02]">
        <div className="max-w-2xl mx-auto">
          <CorporatePricingCalculator participants={participants} onChange={setParticipants} />
        </div>
      </Section>

      {/* Contact Form */}
      <Section ref={contactRef} id="contact">
        <div className="max-w-2xl mx-auto">
          {submitted ? (
            <div className="text-center py-16 space-y-4 rounded-3xl border border-white/10 bg-white/[0.02]">
              <div className="mx-auto w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                <Icon name="check" className="w-8 h-8 text-white/80" />
              </div>
              <h2 className="text-2xl font-black text-white">Demande bien reçue !</h2>
              <p className="text-white/60 max-w-md mx-auto px-6">
                Merci d&apos;avoir choisi Captain Bond. Un de nos conseillers B2B vous contactera sous 24h ouvrées pour affiner votre besoin.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-sm text-white/50 hover:text-white transition-colors cursor-pointer bg-transparent border-none underline"
              >
                Envoyer une autre demande
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:p-10">
              <div className="text-center space-y-2">
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                  Demander un devis sur-mesure
                </h2>
                <p className="text-sm text-white/60">
                  Remplissez ce formulaire et notre équipe vous contactera sous 24h ouvrées.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-xs font-mono uppercase text-white/50 mb-2">
                    Votre nom
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Jean Dupont"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors text-sm"
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label htmlFor="company" className="block text-xs font-mono uppercase text-white/50 mb-2">
                    Entreprise
                  </label>
                  <input
                    id="company"
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Acme Corp"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors text-sm"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-mono uppercase text-white/50 mb-2">
                  Email professionnel
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="jean.dupont@acme.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors text-sm"
                  disabled={submitting}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="participants" className="block text-xs font-mono uppercase text-white/50 mb-2">
                    Participants ({participants})
                  </label>
                  <input
                    id="participants"
                    type="number"
                    required
                    min={MIN_PARTICIPANTS}
                    value={participants}
                    onChange={(e) => setParticipants(Math.max(MIN_PARTICIPANTS, parseInt(e.target.value, 10) || MIN_PARTICIPANTS))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors text-sm"
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label htmlFor="date" className="block text-xs font-mono uppercase text-white/50 mb-2">
                    Date estimée
                  </label>
                  <input
                    id="date"
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors text-sm"
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* Estimate summary */}
              <div className="rounded-xl bg-white/5 border border-white/10 p-4 flex items-center justify-between">
                <div>
                  <span className="block text-xs text-white/50">Formule estimée</span>
                  <span className="text-sm font-bold text-white">{quote.label}</span>
                </div>
                <div className="text-right">
                  <span className="block text-xs text-white/50">Estimation</span>
                  <span className="text-lg font-black text-white">{estimatedPrice.toLocaleString('fr-FR')} €</span>
                </div>
              </div>

              <div>
                <label htmlFor="notes" className="block text-xs font-mono uppercase text-white/50 mb-2">
                  Notes ou besoins particuliers
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ex: Événement de fin d'année, 50% de collaborateurs à distance, etc."
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors text-sm resize-y"
                  disabled={submitting}
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm font-medium text-center bg-red-400/10 border border-red-400/20 rounded-xl p-3">
                  {error}
                </p>
              )}

              <LandingButton type="submit" disabled={submitting} className="w-full">
                {submitting ? 'Envoi en cours...' : 'Envoyer ma demande'}
              </LandingButton>
            </form>
          )}
        </div>
      </Section>
    </LandingLayout>
  );
}
