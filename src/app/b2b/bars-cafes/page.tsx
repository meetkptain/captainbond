'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { LandingLayout } from '@/components/landing/LandingLayout';
import { LandingButton } from '@/components/landing/LandingButton';
import { Section } from '@/components/landing/Section';
import { FeatureShowcase } from '@/components/landing/FeatureShowcase';
import { CalendlyBookingButton } from '@/components/CalendlyBookingButton';
import { Icon } from '@/components/Icon';
import { api, ApiClientError } from '@/lib/api/client';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  company: z.string().min(2, 'Establishment name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const content = {
  fr: {
    category: "Pubs, Bars & Restos",
    heroTitle: "Remplissez votre bar les soirs de semaine",
    heroDesc: "Attirez des groupes de clients les mardis et mercredis soirs grâce à un jeu interactif 100% autonome diffusé sur vos écrans géants de télévision.",
    subscribe: "S'abonner (99€/mois)",
    subscribeNow: "Payer mon abonnement 99€/mois",
    subscribeHero: "S'abonner maintenant",
    demoKit: "Demander mon kit de démo",
    bookDemo: "Réserver une démo 15 min",
    feat1Title: "Augmentation du panier moyen de boissons",
    feat1Desc: "Le jeu engage les tables qui consomment davantage tout en s'affrontant en direct. Augmentation moyenne constatée de 22% sur les commandes.",
    feat2Title: "100% autonome et sans effort",
    feat2Desc: "Pas besoin d'embaucher d'animateur de quiz de pub coûteux. Notre DJ vocal IA prend tout en charge, commente les scores et gère le rythme de la soirée sur la TV.",
    formSubmittedTitle: "Demande de kit reçue !",
    formSubmittedDesc: "Nous expédions votre kit d'essai physique (sous-bocks & affiches) sous 48h ouvrées.",
    formTitle: "Recevoir mon Kit de Com Physique Gratuit",
    formDesc: "Nous vous envoyons gratuitement des sous-bocks avec QR Code et des affiches pour votre établissement.",
    formLabelName: "Nom du gérant",
    formLabelEstablishment: "Nom de l'établissement",
    formLabelEmail: "Adresse email",
    formSubmitBtn: "Recevoir mon Kit Gratuit",
    formSubmitting: "Envoi en cours...",
  },
  en: {
    category: "Pubs, Bars & Restaurants",
    heroTitle: "Fill your bar on weeknights",
    heroDesc: "Attract groups of customers on Tuesday and Wednesday nights with a 100% autonomous interactive game played on your giant TV screens.",
    subscribe: "Subscribe (99€/month)",
    subscribeNow: "Pay my 99€/month subscription",
    subscribeHero: "Subscribe now",
    demoKit: "Request my demo kit",
    bookDemo: "Book a 15-min demo",
    feat1Title: "Increase average beverage ticket",
    feat1Desc: "The game engages tables to drink more while competing live. Observed average drink order increase of 22%.",
    feat2Title: "100% autonomous & effortless",
    feat2Desc: "No need to hire expensive trivia quiz hosts. Our AI voice DJ takes care of everything, commenting on scores and managing the party flow on TV.",
    formSubmittedTitle: "Kit request received!",
    formSubmittedDesc: "We ship your physical trial kit (coasters & posters) within 48 business hours.",
    formTitle: "Get my Free Physical Promo Kit",
    formDesc: "We will ship you free QR-code coasters and posters for your establishment.",
    formLabelName: "Manager's name",
    formLabelEstablishment: "Establishment name",
    formLabelEmail: "Email address",
    formSubmitBtn: "Get my Free Kit",
    formSubmitting: "Sending...",
  }
};

export default function BarsCafesLandingPage({ defaultLang = 'en' }: { defaultLang?: 'fr' | 'en' }) {
  const [lang, setLang] = useState<'fr' | 'en'>(defaultLang);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, trigger, getValues } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      company: '',
      email: '',
      notes: 'Demande de kit de communication physique pour établissement.',
    },
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isFr = window.location.pathname.startsWith('/fr');
      setLang(isFr ? 'fr' : 'en');
    }
  }, []);

  const t = content[lang];

  const scrollToForm = () => {
    const element = document.getElementById('contact-kit');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubscribe = async () => {
    const valid = await trigger();
    if (!valid) {
      scrollToForm();
      return;
    }
    const values = getValues();
    setSubmitting(true);
    setError(null);
    try {
      const origin = window.location.origin;
      const response = await api.post<{ sessionUrl?: string }>('/api/checkout/subscription', {
        plan: 'bar_monthly',
        name: values.name,
        email: values.email,
        company: values.company,
        successUrl: `${origin}/b2b/bars-cafes?subscribed=1`,
        cancelUrl: `${origin}/b2b/bars-cafes`,
      });
      if (response.sessionUrl) {
        window.location.href = response.sessionUrl;
      }
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Une erreur est survenue');
    } finally {
      setSubmitting(false);
    }
  };

  const onFormSubmit = async (data: FormValues) => {
    setSubmitting(true);
    setError(null);
    try {
      await api.post('/api/corporate/contact', {
        ...data,
        participants: 10,
        estimatedPrice: 99,
        formula: 'BAR_KIT_REQUEST',
        source: 'bar_kit',
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Une erreur est survenue');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LandingLayout variant="corporate">
      {/* Hero */}
      <Section className="pt-10 md:pt-20">
        <div className="text-center space-y-8 max-w-3xl mx-auto">
          <span className="inline-block text-xs font-mono uppercase tracking-widest text-indigo-400 border border-indigo-500/20 bg-indigo-500/5 px-3 py-1 rounded-full">
            {t.category}
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1]">
            {t.heroTitle}
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-xl mx-auto leading-relaxed">
            {t.heroDesc}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <LandingButton onClick={scrollToForm}>
              {t.subscribeHero}
            </LandingButton>
            <LandingButton variant="secondary" onClick={scrollToForm}>
              {t.demoKit}
            </LandingButton>
            <CalendlyBookingButton label={t.bookDemo} variant="secondary" />
          </div>
        </div>
      </Section>

      {/* Feature Spotlights */}
      <Section>
        <div className="space-y-24 md:space-y-32">
          <FeatureShowcase
            title={t.feat1Title}
            description={t.feat1Desc}
            titleAs="h2"
            visual={
              <div className="aspect-video bg-[#0a0f1e] rounded-2xl border border-white/10 flex items-center justify-center">
                <Icon name="check" className="w-20 h-20 text-white/20" />
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
        </div>
      </Section>

      {/* Contact Form for physical kit */}
      <Section id="contact-kit">
        <div className="max-w-xl mx-auto px-4">
          {submitted ? (
            <div className="text-center py-16 space-y-4 rounded-3xl border border-white/10 bg-white/[0.02]">
              <div className="mx-auto w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                <span className="text-2xl text-green-400">✓</span>
              </div>
              <h2 className="text-2xl font-black text-white">{t.formSubmittedTitle}</h2>
              <p className="text-white/60 max-w-md mx-auto px-6 text-sm">
                {t.formSubmittedDesc}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:p-10">
              <div className="text-center space-y-2">
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                  {t.formTitle}
                </h2>
                <p className="text-sm text-white/60">
                  {t.formDesc}
                </p>
              </div>

              {error && (
                <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-xs font-mono uppercase text-white/50 mb-2">{t.formLabelName}</Label>
                  <Input
                    id="name"
                    type="text"
                    {...register('name')}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-indigo-500/50 text-sm"
                  />
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <Label htmlFor="company" className="text-xs font-mono uppercase text-white/50 mb-2">{t.formLabelEstablishment}</Label>
                  <Input
                    id="company"
                    type="text"
                    {...register('company')}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-indigo-500/50 text-sm"
                  />
                  {errors.company && <p className="text-red-400 text-xs mt-1">{errors.company.message}</p>}
                </div>
                <div>
                  <Label htmlFor="email" className="text-xs font-mono uppercase text-white/50 mb-2">{t.formLabelEmail}</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-indigo-500/50 text-sm"
                  />
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button type="submit" disabled={submitting} className="w-full bg-indigo-600 hover:bg-indigo-700">
                  {submitting ? t.formSubmitting : t.formSubmitBtn}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={submitting}
                  onClick={handleSubscribe}
                  className="w-full"
                >
                  {t.subscribeNow}
                </Button>
                <CalendlyBookingButton label={t.bookDemo} variant="secondary" className="w-full" />
              </div>
            </form>
          )}
        </div>
      </Section>
    </LandingLayout>
  );
}
