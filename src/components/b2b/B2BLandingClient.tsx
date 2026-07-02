'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api/client';

export default function B2BLandingClient() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    type: 'BAR', // BAR or CORPORATE
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post('/api/corporate/contact', formData);
      setSubmitted(true);
    } catch (err) {
      setError('Impossible d\'envoyer votre demande pour le moment. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubStripe = () => {
    // Rediriger vers Stripe pour abonnement Bar à 99€/mois
    window.location.href = '/api/checkout?plan=bar_monthly';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative overflow-hidden">
      {/* Background Decorative Blur blobs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-6 py-20 text-center relative z-10 space-y-8">
        <span className="bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-mono font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">
          Captain Bond Pro & Activation
        </span>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white uppercase leading-none max-w-3xl mx-auto">
          Transformez vos espaces en lieux de <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">vraies connexions</span>
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          Le premier jeu relationnel interactif sur écran géant (TV) qui connecte vos collaborateurs ou attire de nouveaux clients dans votre établissement.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <a href="#contact" className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-pink-500/20 text-center text-white border-none decoration-none">
            Demander un Kit Démo Gratuit
          </a>
          <button 
            onClick={handleSubStripe}
            className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl font-bold text-sm text-white tracking-wide transition-all"
          >
            S&apos;abonner (Offre Bar - 99€/mois)
          </button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-5xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-8 relative z-10">
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-3xl p-8 space-y-4 shadow-xl">
          <span className="text-3xl">🍻</span>
          <h3 className="text-2xl font-black text-white uppercase">Pour les Bars & Cafés</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Remplissez vos tables les mardis et mercredis soirs. Les clients scannent l&apos;écran géant du bar et s&apos;affrontent en direct ou collaborent depuis leurs tables. Ambiance électrique garantie.
          </p>
          <ul className="text-slate-300 text-xs font-mono space-y-2 pt-2">
            <li>✓ Augmentation moyenne du panier de boisson de 22%</li>
            <li>✓ Kit de communication physique inclus (sous-bocks)</li>
            <li>✓ Logo du bar affiché sur les exports vidéos des clients</li>
          </ul>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-3xl p-8 space-y-4 shadow-xl">
          <span className="text-3xl">💼</span>
          <h3 className="text-2xl font-black text-white uppercase">Pour les Team-Buildings</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Offrez à vos équipes un brise-glace interactif moderne. Parfait pour l&apos;intégration des nouveaux arrivants, les séminaires ou les afterworks réguliers.
          </p>
          <ul className="text-slate-300 text-xs font-mono space-y-2 pt-2">
            <li>✓ Dashboard d&apos;impact et cohésion d&apos;équipe anonymisé</li>
            <li>✓ Intégration vocale et distancielle pour les équipes hybrides</li>
            <li>✓ Rapprochement sincère des collaborateurs sans la lourdeur habituelle</li>
          </ul>
        </div>
      </div>

      {/* Contact Form Section */}
      <div id="contact" className="max-w-xl mx-auto px-6 py-20 relative z-10">
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-black text-white uppercase tracking-tight">Contactez-nous</h2>
            <p className="text-slate-400 text-xs mt-1">Laissez vos coordonnées pour un essai pilote gratuit.</p>
          </div>

          {submitted ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center border border-green-500/30 mx-auto shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                <span className="text-2xl">✓</span>
              </div>
              <h3 className="text-lg font-bold text-green-400">Demande Envoyée !</h3>
              <p className="text-xs text-slate-400">Notre équipe de facilitation prendra contact avec vous sous 24h.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3 text-xs">
                  {error}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 block">Nom complet</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Jean Dupont"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-pink-500/50 rounded-xl p-3 text-sm focus:outline-none text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 block">Adresse email pro</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="jean@entreprise.com"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-pink-500/50 rounded-xl p-3 text-sm focus:outline-none text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 block">Établissement / Entreprise</label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={e => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Le Bistro ou TechCorp"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-pink-500/50 rounded-xl p-3 text-sm focus:outline-none text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 block">Type de projet</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-pink-500/50 rounded-xl p-3 text-sm focus:outline-none text-slate-200"
                >
                  <option value="BAR">Bar / Établissement recevant du public</option>
                  <option value="CORPORATE">Entreprise (Team-building / Office)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 block">Votre message</label>
                <textarea
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Dites-nous en plus sur vos besoins..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-pink-500/50 rounded-xl p-3 text-sm focus:outline-none text-slate-200"
                  rows={3}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-[0_0_20px_rgba(236,72,153,0.2)]"
              >
                {loading ? 'Envoi...' : 'Envoyer ma demande'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
