'use client';

import { useRouter } from 'next/navigation';
import { BackgroundOrbs } from '@/components/BackgroundOrbs';
import { Icon } from '@/components/Icon';
import { useCoupleData } from '../_hooks/useCoupleDashboardContext';

export function OnboardingInvite() {
  const router = useRouter();
  const { userId } = useCoupleData();
  const inviteLink = userId && typeof window !== 'undefined'
    ? `${window.location.origin}/couple?invite=${userId}`
    : '';

  return (
    <div className="couple-page">
      <BackgroundOrbs />
      <div className="couple-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div className="couple-card couple-empty" style={{ maxWidth: '440px', width: '100%', padding: '2rem' }}>
          <span className="couple-empty-icon" style={{ background: 'rgba(168, 85, 247, 0.1)', borderColor: 'rgba(168, 85, 247, 0.2)' }}>
            <Icon name="heart" className="w-8 h-8 text-purple-400" />
          </span>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginTop: '1.25rem', marginBottom: '0.5rem' }}>Créez votre Espace Couple</h2>
          <p className="couple-empty-text" style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Envoyez ce lien magique à votre partenaire. Une fois qu&apos;il l&apos;aura ouvert, votre espace de connexion partagé sera créé.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '0.75rem',
              padding: '0.75rem 1rem',
              fontSize: '0.75rem',
              color: '#cbd5e1',
              fontFamily: 'monospace',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              textAlign: 'left'
            }}>
              {inviteLink}
            </div>
            <button
              className="couple-action-btn"
              onClick={() => {
                navigator.clipboard.writeText(inviteLink);
                if (typeof navigator !== 'undefined' && navigator.vibrate) {
                  navigator.vibrate(50);
                }
                alert('Lien copié ! Envoyez-le à votre partenaire.');
              }}
            >
              <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ width: '1rem', height: '1rem' }}><path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg> Copier le lien
            </button>
            <button
              className="couple-action-btn"
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', opacity: 0.8 }}
              onClick={() => router.push('/')}
            >
              Retour à l&apos;accueil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
