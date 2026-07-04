'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { LandingLayout } from '@/components/landing/LandingLayout';
import { LandingButton } from '@/components/landing/LandingButton';
import { Section } from '@/components/landing/Section';
import { FeatureShowcase } from '@/components/landing/FeatureShowcase';
import { CorporateVisualMockup } from '@/components/landing/CorporateVisualMockup';
import { CorporatePricingCalculator } from '@/components/landing/CorporatePricingCalculator';
import { CalendlyBookingButton } from '@/components/CalendlyBookingButton';
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

  const contactSchema = useMemo(() => z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    company: z.string(),
    email: z.string().email('Please enter a valid email'),
    participants: z.coerce.number().min(MIN_PARTICIPANTS, `Minimum ${MIN_PARTICIPANTS} participants`).max(500, 'Maximum 500 participants'),
    date: z.string(),
    notes: z.string(),
  }), []);

  const { register, handleSubmit: rhfHandleSubmit, formState: { errors }, watch, reset } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      company: '',
      email: '',
      participants: 50,
      date: '',
      notes: '',
    },
  });

  const watchedParticipants = watch('participants');
  useEffect(() => {
    setParticipants(Math.max(MIN_PARTICIPANTS, parseInt(String(watchedParticipants), 10) || MIN_PARTICIPANTS));
  }, [watchedParticipants]);

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

  const onSubmit = async (data: z.infer<typeof contactSchema>) => {
    setSubmitting(true);
    setError(null);

    try {
      await api.post('/api/corporate/contact', {
        ...data,
        estimatedPrice,
        formula: quote.formula,
        source: 'corporate',
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
            <LandingButton
              onClick={() => contactRef.current?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t.quoteBtn}
            </LandingButton>
            <LandingButton
              variant="secondary"
              onClick={handleBookInstant}
              disabled={isBooking}
            >
              {isBooking ? t.formSubmitting : t.bookInstantBtn}
            </LandingButton>
            <CalendlyBookingButton label={lang === 'fr' ? 'Réserver une démo 15 min' : 'Book a 15-min demo'} variant="secondary" />
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
                onClick={() => { setSubmitted(false); reset(); }}
                className="text-sm text-white/50 hover:text-white transition-colors cursor-pointer bg-transparent border-none underline"
              >
                {t.formAnotherBtn}
              </button>
            </div>
          ) : (
            <form onSubmit={rhfHandleSubmit(onSubmit)} className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:p-10">
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
                  <Label htmlFor="name" className="text-xs font-mono uppercase text-white/50 mb-2">
                    {t.formLabelName}
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    {...register('name')}
                    placeholder="Jean Dupont"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors text-sm"
                    disabled={submitting}
                  />
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <Label htmlFor="company" className="text-xs font-mono uppercase text-white/50 mb-2">
                    {t.formLabelCompany}
                  </Label>
                  <Input
                    id="company"
                    type="text"
                    {...register('company')}
                    placeholder="Acme Corp"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors text-sm"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-xs font-mono uppercase text-white/50 mb-2">
                  {t.formLabelEmail}
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="jean.dupont@acme.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors text-sm"
                  disabled={submitting}
                />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="participants" className="text-xs font-mono uppercase text-white/50 mb-2">
                    {t.formLabelParticipants} ({participants})
                  </Label>
                  <Input
                    id="participants"
                    type="number"
                    {...register('participants')}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors text-sm"
                    disabled={submitting}
                  />
                  {errors.participants && <p className="text-red-400 text-xs mt-1">{errors.participants.message}</p>}
                </div>
                <div>
                  <Label htmlFor="date" className="text-xs font-mono uppercase text-white/50 mb-2">
                    {t.formLabelDate}
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    {...register('date')}
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
                <Label htmlFor="notes" className="text-xs font-mono uppercase text-white/50 mb-2">
                  {t.formLabelNotes}
                </Label>
                <Textarea
                  id="notes"
                  {...register('notes')}
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

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? t.formSubmitting : t.formSubmitBtn}
              </Button>
            </form>
          )}
        </div>
      </Section>
    </LandingLayout>
  );
}
