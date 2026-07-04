// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OnboardingInvite } from './OnboardingInvite';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock('../_hooks/useCoupleDashboardContext', () => ({
  useCoupleData: () => ({ userId: 'user-1' }),
}));

vi.mock('@/lib/api/client', () => ({
  api: {
    post: vi.fn().mockResolvedValue({ token: 'token-1', url: 'http://localhost/invite/token-1' }),
  },
  ApiClientError: class ApiClientError extends Error {},
}));

describe('OnboardingInvite', () => {
  it('renders the invite screen and solo ritual CTA', async () => {
    render(<OnboardingInvite />);

    expect(await screen.findByText('Créez votre Espace Couple')).toBeDefined();
    expect(screen.getByRole('button', { name: /Répondre à la première question en solo/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Retour à l'accueil/i })).toBeDefined();
  });

  it('navigates to /couple when clicking the solo ritual CTA', async () => {
    render(<OnboardingInvite />);

    const soloBtn = await screen.findByRole('button', { name: /Répondre à la première question en solo/i });
    fireEvent.click(soloBtn);

    expect(pushMock).toHaveBeenCalledWith('/couple?draft=true');
  });
});
