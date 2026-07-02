'use client';

import React, { useRef, useState, useEffect } from 'react';
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

const content = {
  fr: {
    category: "Team Building & Séminaires",
    heroTitle: "Organisez le Team-Building idéal en 30 secondes",
    heroDesc: "Brisez la glace, encouragez la parole et connectez vos collaborateurs avec une animation interactive sur écran géant (zéro logistique).",
    quoteBtn: "Demander un devis",
    estimateBtn: "Estimer mon événement",
    bookInstantBtn: "Réserver mon Team Building (299€ HT)",
    discoverTitle: "Découvrez aussi nos solutions :",
    discoverOnboarding: "📂 Intégration & Onboarding",
    discoverQvt: "📊 Climat Social & QVT",
    discoverBars: "🍻 Animation de Bars",
    feat1Title: "Zéro friction technique",
    feat1Desc: "Pas d'application à installer. Les participants scannent un QR code avec leur smartphone pour rejoindre la partie.",
    feat2Title: "De 10 à 500+ joueurs",
    feat2Desc: "Jouez tous ensemble projetés sur un écran principal. Idéal pour vos séminaires physiques ou en distanciel.",
    feat3Title: "Questions adaptées au collectif",
    feat3Desc: "Des questions et dilemmes conçus pour stimuler l'intelligence collective, l'empathie et la synergie de groupe.",
    formSubmittedTitle: "Demande bien reçue !",
    formSubmittedDesc: "Merci d'avoir choisi Captain Bond. Un de nos conseillers B2B vous contactera sous 24h ouvrées pour affiner votre besoin.",
    formAnotherBtn: "Envoyer une autre demande",
    formTitle: "Demander un devis sur-mesure",
    formDesc: "Remplissez ce formulaire et notre équipe vous contactera sous 24h ouvrées.",
    formLabelName: "Votre nom",
    formLabelCompany: "Entreprise",
    formLabelEmail: "Email professionnel",
    formLabelParticipants: "Participants",
    formLabelDate: "Date estimée",
    formLabelNotes: "Notes ou besoins particuliers",
    formNotesPlaceholder: "Ex: Événement de fin d'année, 50% de collaborateurs à distance, etc.",
    formLabelFormula: "Formule estimée",
    formLabelEstimation: "Estimation",
    formSubmitBtn: "Envoyer ma demande",
    formSubmitting: "Envoi en cours...",
    errorGeneric: "Une erreur est survenue lors de l'envoi de votre demande."
  },
  en: {
    category: "Team Building & Seminars",
    heroTitle: "Organize the perfect Team Building in 30 seconds",
    heroDesc: "Break the ice, encourage sharing and connect your employees with an interactive animation on giant screens (zero logistics).",
    quoteBtn: "Request a Quote",
    estimateBtn: "Estimate My Event",
    bookInstantBtn: "Book Team Building (299€)",
    discoverTitle: "Discover our other solutions:",
    discoverOnboarding: "📂 Onboarding & Hiring",
    discoverQvt: "📊 CSR & Work Well-being",
    discoverBars: "🍻 Bar Entertainment",
    feat1Title: "Zero technical friction",
    feat1Desc: "No app to install. Participants simply scan a QR code with their smartphones to join the game.",
    feat2Title: "From 10 to 500+ players",
    feat2Desc: "Play together projected on a main screen. Ideal for physically present seminars or remote teams.",
    feat3Title: "Team-tailored questions",
    feat3Desc: "Questions and dilemmas designed to spark collective intelligence, empathy and group synergy.",
    formSubmittedTitle: "Request successfully received!",
    formSubmittedDesc: "Thank you for choosing Captain Bond. One of our B2B consultants will contact you within 24 business hours to refine your needs.",
    formAnotherBtn: "Submit another request",
    formTitle: "Request a Custom Quote",
    formDesc: "Fill in this form and our team will get in touch with you within 24 business hours.",
    formLabelName: "Your name",
    formLabelCompany: "Company name",
    formLabelEmail: "Work email",
    formLabelParticipants: "Participants",
    formLabelDate: "Estimated date",
    formLabelNotes: "Notes or special requests",
    formNotesPlaceholder: "E.g., End-of-year event, 50% remote team, etc.",
    formLabelFormula: "Estimated plan",
    formLabelEstimation: "Estimate",
    formSubmitBtn: "Send My Request",
    formSubmitting: "Sending...",
    errorGeneric: "An error occurred while sending your request."
  }
};

export default function CorporateLandingPage({ defaultLang = 'en' }: { defaultLang?: 'fr' | 'en' }) {
  const [lang, setLang] = useState<'fr' | 'en'>(defaultLang);
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
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isFr = window.location.pathname.startsWith('/fr');
      setLang(isFr ? 'fr' : 'en');
    }
  }, []);

  const t = content[lang];
  const quote = getB2BQuote(participants);
  const estimatedPrice = estimateB2BPrice(participants);

  const handleBookInstant = async () => {
    setIsBooking(true);
    setError(null);
    try {
      const response = await api.post<{ sessionUrl: string }>('/api/checkout/b2b', {
        successUrl: window.location.origin + getLocalizedPath('/vault?b2bSuccess=true'),
        cancelUrl: window.location.href,
      });
      if (response.sessionUrl) {
        window.location.href = response.sessionUrl;
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof ApiClientError ? err.message : t.errorGeneric);
    } finally {
      setIsBooking(false);
    }
  };

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
      setError(err instanceof ApiClientError ? err.message : t.errorGeneric);
    } finally {
      setSubmitting(false);
    }
  };

  const getLocalizedPath = (path: string) => {
    return lang === 'fr' ? `/fr${path}` : path;
  };

  return (
    <LandingLayout variant="corporate">
      {/* Hero */}
      <Section className="pt-10 md:pt-20">
        <div className="text-center space-y-8 max-w-3xl mx-auto">
          <span className="inline-block text-xs font-mono uppercase tracking-widest text-white/50 border border-white/10 px-3 py-1 rounded-full">
            {t.category}
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1]">
            {t.heroTitle}
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-xl mx-auto leading-relaxed">
            {t.heroDesc}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <LandingButton onClick={handleBookInstant} disabled={isBooking} className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black">
              {isBooking ? t.formSubmitting : t.bookInstantBtn}
            </LandingButton>
            <LandingButton
              variant="secondary"
              onClick={() => contactRef.current?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t.quoteBtn}
            </LandingButton>
          </div>

          {/* Cocon sémantique B2B - Interlinking */}
          <div className="pt-8 border-t border-white/5 flex flex-wrap justify-center gap-6 text-sm text-white/50 font-mono">
            <span>{t.discoverTitle}</span>
            <a href={getLocalizedPath('/corporate/onboarding-recrutement')} className="text-white hover:text-pink-400 hover:underline transition-colors decoration-none font-bold">
              {t.discoverOnboarding}
            </a>
            <a href={getLocalizedPath('/corporate/rse-qvt')} className="text-white hover:text-purple-400 hover:underline transition-colors decoration-none font-bold">
              {t.discoverQvt}
            </a>
            <a href={getLocalizedPath('/b2b/bars-cafes')} className="text-white hover:text-indigo-400 hover:underline transition-colors decoration-none font-bold">
              {t.discoverBars}
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
            title={t.feat1Title}
            description={t.feat1Desc}
            titleAs="h2"
            visual={
              <div className="aspect-video bg-[#0a0f1e] rounded-2xl border border-white/10 flex items-center justify-center">
                <Icon name="qrCode" className="w-20 h-20 text-white/20" />
              </div>
            }
          />
          <FeatureShowcase
            title={t.feat2Title}
            description={t.feat2Desc}
            titleAs="h2"
            visual={
              <div className="aspect-video bg-[#0a0f1e] rounded-2xl border border-white/10 flex items-center justify-center">
                <Icon name="users" className="w-20 h-20 text-white/20" />
              </div>
            }
            reverse
          />
          <FeatureShowcase
            title={t.feat3Title}
            description={t.feat3Desc}
            titleAs="h2"
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
        <div className="max-w-2xl mx-auto space-y-6">
          <CorporatePricingCalculator participants={participants} onChange={setParticipants} />
          {participants <= 40 && (
            <div className="text-center">
              <LandingButton onClick={handleBookInstant} disabled={isBooking} className="w-full md:w-auto px-10 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black">
                {isBooking ? t.formSubmitting : t.bookInstantBtn}
              </LandingButton>
            </div>
          )}
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
              <h2 className="text-2xl font-black text-white">{t.formSubmittedTitle}</h2>
              <p className="text-white/60 max-w-md mx-auto px-6">
                {t.formSubmittedDesc}
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-sm text-white/50 hover:text-white transition-colors cursor-pointer bg-transparent border-none underline"
              >
                {t.formAnotherBtn}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:p-10">
              <div className="text-center space-y-2">
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                  {t.formTitle}
                </h2>
                <p className="text-sm text-white/60">
                  {t.formDesc}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-xs font-mono uppercase text-white/50 mb-2">
                    {t.formLabelName}
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
                    {t.formLabelCompany}
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
                  {t.formLabelEmail}
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
                    {t.formLabelParticipants} ({participants})
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
                    {t.formLabelDate}
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
                  <span className="block text-xs text-white/50">{t.formLabelFormula}</span>
                  <span className="text-sm font-bold text-white">{quote.label}</span>
                </div>
                <div className="text-right">
                  <span className="block text-xs text-white/50">{t.formLabelEstimation}</span>
                  <span className="text-lg font-black text-white">{estimatedPrice.toLocaleString('fr-FR')} €</span>
                </div>
              </div>

              <div>
                <label htmlFor="notes" className="block text-xs font-mono uppercase text-white/50 mb-2">
                  {t.formLabelNotes}
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={t.formNotesPlaceholder}
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
                {submitting ? t.formSubmitting : t.formSubmitBtn}
              </LandingButton>
            </form>
          )}
        </div>
      </Section>
    </LandingLayout>
  );
}
