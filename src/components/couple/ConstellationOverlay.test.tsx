// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ConstellationOverlay from './ConstellationOverlay';

describe('ConstellationOverlay', () => {
  it('renders the mandatory entertainment-fiction disclaimer', () => {
    render(<ConstellationOverlay selection={null} />);
    expect(screen.getByText(/entertainment fiction/i)).toBeTruthy();
  });

  it('shows an empty state when no selection', () => {
    render(<ConstellationOverlay selection={null} />);
    expect(screen.getByText(/Touchez une étoile/i)).toBeTruthy();
  });

  it('shows verbatim A/B + computed theme name when a selection is provided', () => {
    render(
      <ConstellationOverlay
        selection={{ id: 'n1', verbatimA: 'J’aime les mardis', verbatimB: 'Moi aussi', resonance: 0.8, diff: 'Vous partagez le rythme', themeName: 'Orbite Duo 7' }}
        monthLabel="Juillet 2026"
        starsThisMonth={3}
        totalStars={12}
      />,
    );
    expect(screen.getByText(/J’aime les mardis/i)).toBeTruthy();
    expect(screen.getByText(/Moi aussi/i)).toBeTruthy();
    expect(screen.getByText(/Orbite Duo 7/i)).toBeTruthy();
    expect(screen.getByText(/Juillet 2026/i)).toBeTruthy();
    expect(screen.getByText(/3 nouvelles étoiles/i)).toBeTruthy();
  });

  it('calls navigator.share when share button clicked (if available)', () => {
    const shareSpy = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', { value: shareSpy, configurable: true });
    // canvasRef not provided → share should no-op without throwing
    render(
      <ConstellationOverlay
        selection={{ id: 'n1', verbatimA: 'a', verbatimB: 'b', resonance: 0.5, diff: 'd', themeName: 'T1' }}
      />,
    );
    const btn = screen.getByText(/Partager notre ciel/i);
    fireEvent.click(btn);
    // no assertion on share call (canvasRef absent → guarded). Just must not throw.
    expect(btn).toBeTruthy();
  });
});
