// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { VideoExport } from '../VideoExport';

// Mock @remotion/player
vi.mock('@remotion/player', () => ({
  Player: () => <div data-testid="mock-remotion-player" />,
}));

describe('VideoExport Component', () => {
  const defaultProps = {
    onClose: vi.fn(),
    questionText: 'Quel est ton plat préféré ?',
    partnerAName: 'Sam',
    partnerAAnswer: 'Lasagnes',
    partnerBName: 'Alex',
    partnerBAnswer: 'Pizza',
  };

  it('renders correctly with preview player and couple answers data', () => {
    render(<VideoExport {...defaultProps} />);

    expect(screen.getByTestId('mock-remotion-player')).toBeDefined();
    expect(screen.getByText('Quel est ton plat préféré ?')).toBeDefined();
    expect(screen.getByText('Sam')).toBeDefined();
    expect(screen.getByText('Alex')).toBeDefined();
  });

  it('handles onClose trigger', () => {
    render(<VideoExport {...defaultProps} />);
    
    // Find close button (Icon name is x)
    const closeBtn = screen.getByRole('button', { name: '' });
    fireEvent.click(closeBtn);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('simulates exporting progress successfully', async () => {
    vi.useFakeTimers();
    render(<VideoExport {...defaultProps} />);

    const exportBtn = screen.getByRole('button', { name: /Générer le format TikTok/i });
    fireEvent.click(exportBtn);

    // Should display progress info
    expect(screen.getByText(/Génération de la vidéo/i)).toBeDefined();

    // Fast-forward progress
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.getByText(/Vidéo générée avec succès/i)).toBeDefined();
    vi.useRealTimers();
  });
});
