'use client';

import React, { useState, useEffect } from 'react';
import { LandingLayout } from '@/components/landing/LandingLayout';
import { LandingButton } from '@/components/landing/LandingButton';
import { Section } from '@/components/landing/Section';
import { FeatureShowcase } from '@/components/landing/FeatureShowcase';
import { Icon } from '@/components/Icon';
import { api } from '@/lib/api/client';

const content = {
  fr: {
    category: "Pubs, Bars & Restos",
    heroTitle: "Remplissez votre bar les soirs de semaine",
    heroDesc: "Attirez des groupes de clients les mardis et mercredis soirs grâce à un jeu interactif 100% autonome diffusé sur vos écrans géants de télévision.",
    subscribe: "S'abonner (Offre Bar - 99€/mois)",
    demoKit: "Demander mon kit de démo",
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
    subscribe: "Subscribe (Bar Plan - 99€/month)",
    demoKit: "Request my demo kit",
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

export default function BarsCafesLandingPage() {
  const [lang, setLang] = useState<'fr' | 'en'>('en');
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    notes: 'Demande de kit de communication physique pour établissement.',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isFr = window.location.pathname.startsWith('/fr');
      setLang(isFr ? 'fr' : 'en');
    }
  }, []);

  const t = content[lang];

  const handleSubStripe = () => {
    window.location.href = '/api/checkout?plan=bar_monthly';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/api/corporate/contact', {
        ...formData,
        participants: 10,
        estimatedPrice: 99,
        formula: 'BAR_KIT_REQUEST',
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
            <LandingButton onClick={handleSubStripe}>
              {t.subscribe}
            </LandingButton>
            <LandingButton
              variant="secondary"
              onClick={() => {
                const element = document.getElementById('contact-kit');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {t.demoKit}
            </LandingButton>
          </div>
        </div>
      </Section>

      {/* Feature Spotlights */}
      <Section>
        <div className="space-y-24 md:space-y-32">
          <FeatureShowcase
            title={t.feat1Title}
            description={t.feat1Desc}
            visual={
              <div className="aspect-video bg-[#0a0f1e] rounded-2xl border border-white/10 flex items-center justify-center">
                <Icon name="check" className="w-20 h-20 text-white/20" />
              </div>
            }
          />
          <FeatureShowcase
            title={t.feat2Title}
            description={t.feat2Desc}
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
            <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:p-10">
              <div className="text-center space-y-2">
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                  {t.formTitle}
                </h2>
                <p className="text-sm text-white/60">
                  {t.formDesc}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-xs font-mono uppercase text-white/50 mb-2">{t.formLabelName}</label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-indigo-500/50 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="company" className="block text-xs font-mono uppercase text-white/50 mb-2">{t.formLabelEstablishment}</label>
                  <input
                    id="company"
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-indigo-500/50 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs font-mono uppercase text-white/50 mb-2">{t.formLabelEmail}</label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-indigo-500/50 text-sm"
                  />
                </div>
              </div>

              <LandingButton type="submit" disabled={submitting} className="w-full bg-indigo-600 hover:bg-indigo-700">
                {submitting ? t.formSubmitting : t.formSubmitBtn}
              </LandingButton>
            </form>
          )}
        </div>
      </Section>
    </LandingLayout>
  );
}
