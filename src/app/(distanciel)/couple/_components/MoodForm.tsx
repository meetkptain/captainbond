'use client';

import { useDashboardActions, useDashboardUIState, useDashboardUISetters } from '../_hooks/useCoupleDashboardContext';

export function MoodForm() {
  const {
    moodEnergy,
    moodStress,
    moodFeeling,
    submittingMood,
  } = useDashboardUIState();
  const { setMoodEnergy, setMoodStress, setMoodFeeling } = useDashboardUISetters();
  const { submitMood } = useDashboardActions();

  return (
    <div className="mood-area" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', padding: '1rem 0' }}>
      <div style={{ background: 'rgba(147, 51, 234, 0.08)', border: '1px solid rgba(147, 51, 234, 0.2)', borderRadius: '0.75rem', padding: '0.75rem 1rem' }}>
        <p style={{ fontSize: '0.8125rem', color: '#c084fc', margin: 0, lineHeight: 1.5 }}>
          <strong>Météo Émotionnelle :</strong> Partagez brièvement votre état du jour. Si vous êtes stressé ou fatigué, le rituel s&apos;adaptera automatiquement avec des questions plus douces ou des gratitudes.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ fontSize: '0.8125rem', color: '#cbd5e1', fontWeight: 600 }}>Niveau d&apos;énergie : {moodEnergy} / 5</label>
        <input type="range" min="1" max="5" value={moodEnergy} onChange={(e) => setMoodEnergy(Number(e.target.value))} style={{ width: '100%', accentColor: '#a855f7' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: '#64748b' }}>
          <span>Épuisé(e)</span>
          <span>Plein d&apos;énergie</span>
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ fontSize: '0.8125rem', color: '#cbd5e1', fontWeight: 600 }}>Niveau de stress : {moodStress} / 5</label>
        <input type="range" min="1" max="5" value={moodStress} onChange={(e) => setMoodStress(Number(e.target.value))} style={{ width: '100%', accentColor: '#a855f7' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: '#64748b' }}>
          <span>Zen</span>
          <span>Très stressé(e)</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ fontSize: '0.8125rem', color: '#cbd5e1', fontWeight: 600 }}>Comment te sens-tu aujourd&apos;hui ? (optionnel)</label>
        <input type="text" className="answer-textarea" style={{ minHeight: '44px', padding: '0.5rem 1rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }} value={moodFeeling} onChange={(e) => setMoodFeeling(e.target.value)} placeholder="ex: fatigué(e), joyeux(se), distrait(e)..." />
      </div>

      <button className="answer-submit" onClick={submitMood} disabled={submittingMood}>
        {submittingMood ? <span className="couple-spinner" /> : "Enregistrer ma météo"}
      </button>
    </div>
  );
}
