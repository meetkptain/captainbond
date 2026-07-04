'use client';

import { useState, useEffect } from 'react';
import { estimateB2BPrice, getB2BQuote, type B2BFormula } from '@/lib/pricing/b2b';

interface CorporatePricingCalculatorProps {
  participants: number;
  onChange: (participants: number) => void;
}

const MIN_PARTICIPANTS = 10;
const MAX_PARTICIPANTS = 300;

export function CorporatePricingCalculator({ participants, onChange }: CorporatePricingCalculatorProps) {
  const [lang, setLang] = useState<'fr' | 'en'>('en');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isFr = window.location.pathname.startsWith('/fr');
      setLang(isFr ? 'fr' : 'en');
    }
  }, []);

  const clamped = Math.max(MIN_PARTICIPANTS, Math.min(MAX_PARTICIPANTS, participants));
  const quote = getB2BQuote(participants, lang);
  const estimatedPrice = estimateB2BPrice(participants, lang);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1) {
      onChange(value);
    } else if (e.target.value === '') {
      onChange(MIN_PARTICIPANTS);
    }
  };

  return (
    <div className="w-full rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:p-10 space-y-8">
      <div className="space-y-2">
        <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
          {lang === 'fr' ? 'Estimer votre événement' : 'Estimate your event'}
        </h3>
        <p className="text-sm text-white/60">
          {lang === 'fr' 
            ? 'Ajustez le nombre de participants pour obtenir une estimation instantanée.' 
            : 'Adjust the number of participants to get an instant estimate.'}
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <label htmlFor="participants-slider" className="text-sm font-medium text-white/80">
            {lang === 'fr' ? 'Nombre de participants' : 'Number of participants'}
          </label>
          <div className="flex items-center gap-2">
            <input
              id="participants-number"
              type="number"
              min={MIN_PARTICIPANTS}
              value={participants}
              onChange={handleNumberChange}
              className="w-24 text-right bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-white/30 transition-colors"
              aria-label={lang === 'fr' ? 'Nombre de participants' : 'Number of participants'}
            />
            <span className="text-sm text-white/50">{lang === 'fr' ? 'pers.' : 'people'}</span>
          </div>
        </div>

        <input
          id="participants-slider"
          type="range"
          min={MIN_PARTICIPANTS}
          max={MAX_PARTICIPANTS}
          value={clamped}
          onChange={handleSliderChange}
          className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
          aria-valuemin={MIN_PARTICIPANTS}
          aria-valuemax={MAX_PARTICIPANTS}
          aria-valuenow={clamped}
          aria-label={lang === 'fr' ? 'Slider nombre de participants' : 'Participant count slider'}
        />
        <div className="flex justify-between text-xs text-white/40 font-mono">
          <span>{MIN_PARTICIPANTS}</span>
          <span>{MAX_PARTICIPANTS}+</span>
        </div>
      </div>

      <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/60">{lang === 'fr' ? 'Formule recommandée' : 'Recommended formula'}</span>
          <span className="text-sm font-bold text-white">{quote.label}</span>
        </div>
        <p className="text-sm text-white/50 leading-relaxed">{quote.description}</p>
        <div className="pt-4 border-t border-white/10 flex items-end justify-between">
          <span className="text-sm text-white/60">{lang === 'fr' ? 'Estimation' : 'Estimate'}</span>
          <div className="text-right">
            <span data-testid="estimated-price" className="text-3xl md:text-4xl font-black text-white">
              {estimatedPrice.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')} €
            </span>
            {quote.formula === 'custom' && (
              <span className="block text-xs text-white/40 mt-1">
                {lang === 'fr' ? 'Prix indicatif — devis sur mesure' : 'Indicative price — custom quote'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export type { B2BFormula };
