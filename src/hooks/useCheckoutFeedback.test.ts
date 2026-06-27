// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCheckoutFeedback } from './useCheckoutFeedback';

describe('useCheckoutFeedback', () => {
  const roomCode = 'ABCD';
  const playerId = 'player-123';

  function createRefreshEntitlements() {
    return vi.fn().mockResolvedValue(undefined);
  }

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('returns no message when no paid product is provided and no query param is present', () => {
    vi.stubGlobal('location', { ...window.location, search: '' });
    vi.stubGlobal('history', { replaceState: vi.fn() });
    const refreshEntitlements = createRefreshEntitlements();

    const { result } = renderHook(() =>
      useCheckoutFeedback({ roomCode, playerId, refreshEntitlements })
    );

    expect(result.current.paidMessage).toBeNull();
    expect(result.current.isVisible).toBe(false);
    expect(refreshEntitlements).not.toHaveBeenCalled();
  });

  it('derives the message from the ?paid=pass query param', async () => {
    const replaceState = vi.fn();
    vi.stubGlobal('location', { ...window.location, search: '?paid=pass' });
    vi.stubGlobal('history', { replaceState });
    const refreshEntitlements = createRefreshEntitlements();

    const { result } = renderHook(() =>
      useCheckoutFeedback({ roomCode, playerId, refreshEntitlements })
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.paidMessage).toBe(
      '🎉 Pass 24h activé ! Tous les modes sont débloqués.'
    );
    expect(result.current.isVisible).toBe(true);
    expect(refreshEntitlements).toHaveBeenCalledTimes(1);
    expect(replaceState).toHaveBeenCalledWith({}, '', `/room/${roomCode}/player`);
  });

  it('derives the message from the ?paid=profile query param', async () => {
    const replaceState = vi.fn();
    vi.stubGlobal('location', { ...window.location, search: '?paid=profile' });
    vi.stubGlobal('history', { replaceState });
    const refreshEntitlements = createRefreshEntitlements();

    const { result } = renderHook(() =>
      useCheckoutFeedback({ roomCode, playerId, refreshEntitlements })
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.paidMessage).toBe(
      '🎉 Dossier débloqué ! Retournez à la fin de partie pour le voir.'
    );
    expect(refreshEntitlements).toHaveBeenCalledTimes(1);
    expect(replaceState).toHaveBeenCalledWith({}, '', `/room/${roomCode}/player`);
  });

  it('shows the pass message and refreshes entitlements when paid="pass"', async () => {
    const replaceState = vi.fn();
    vi.stubGlobal('history', { replaceState });
    const refreshEntitlements = createRefreshEntitlements();

    const { result } = renderHook(() =>
      useCheckoutFeedback({ roomCode, playerId, refreshEntitlements, paid: 'pass' })
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.paidMessage).toBe(
      '🎉 Pass 24h activé ! Tous les modes sont débloqués.'
    );
    expect(result.current.isVisible).toBe(true);
    expect(refreshEntitlements).toHaveBeenCalledTimes(1);
    expect(replaceState).toHaveBeenCalledWith({}, '', `/room/${roomCode}/player`);
  });

  it('shows the profile message and refreshes entitlements when paid="profile"', async () => {
    const replaceState = vi.fn();
    vi.stubGlobal('history', { replaceState });
    const refreshEntitlements = createRefreshEntitlements();

    const { result } = renderHook(() =>
      useCheckoutFeedback({ roomCode, playerId, refreshEntitlements, paid: 'profile' })
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.paidMessage).toBe(
      '🎉 Dossier débloqué ! Retournez à la fin de partie pour le voir.'
    );
    expect(refreshEntitlements).toHaveBeenCalledTimes(1);
    expect(replaceState).toHaveBeenCalledWith({}, '', `/room/${roomCode}/player`);
  });

  it('calls onPaid callback with the detected product', async () => {
    vi.stubGlobal('history', { replaceState: vi.fn() });
    const refreshEntitlements = createRefreshEntitlements();
    const onPaid = vi.fn();

    renderHook(() =>
      useCheckoutFeedback({ roomCode, playerId, refreshEntitlements, onPaid, paid: 'profile' })
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(onPaid).toHaveBeenCalledWith('profile');
  });

  it('auto-clears the message after 5 seconds', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('history', { replaceState: vi.fn() });
    const refreshEntitlements = createRefreshEntitlements();

    const { result } = renderHook(() =>
      useCheckoutFeedback({ roomCode, playerId, refreshEntitlements, paid: 'pass' })
    );

    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.isVisible).toBe(true);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.paidMessage).toBeNull();
    expect(result.current.isVisible).toBe(false);
  });

  it('manually clears the message and cancels the auto-dismiss timer', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('history', { replaceState: vi.fn() });
    const refreshEntitlements = createRefreshEntitlements();

    const { result } = renderHook(() =>
      useCheckoutFeedback({ roomCode, playerId, refreshEntitlements, paid: 'pass' })
    );

    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.isVisible).toBe(true);

    act(() => {
      result.current.clearPaidMessage();
    });

    expect(result.current.paidMessage).toBeNull();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.paidMessage).toBeNull();
  });

  it('does nothing when playerId is null', async () => {
    vi.stubGlobal('history', { replaceState: vi.fn() });
    const refreshEntitlements = createRefreshEntitlements();

    const { result } = renderHook(() =>
      useCheckoutFeedback({ roomCode, playerId: null, refreshEntitlements, paid: 'pass' })
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.paidMessage).toBeNull();
    expect(refreshEntitlements).not.toHaveBeenCalled();
  });

  it('re-triggers when playerId changes after being null', async () => {
    vi.stubGlobal('history', { replaceState: vi.fn() });
    const refreshEntitlements = createRefreshEntitlements();

    const { result, rerender } = renderHook(
      ({ currentPlayerId }: { currentPlayerId: string | null }) =>
        useCheckoutFeedback({
          roomCode,
          playerId: currentPlayerId,
          refreshEntitlements,
          paid: 'pass',
        }),
      { initialProps: { currentPlayerId: null as string | null } }
    );

    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.paidMessage).toBeNull();

    rerender({ currentPlayerId: playerId });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.paidMessage).toBe(
      '🎉 Pass 24h activé ! Tous les modes sont débloqués.'
    );
    expect(refreshEntitlements).toHaveBeenCalledTimes(1);
  });

  it('cleans up the timeout on unmount', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('history', { replaceState: vi.fn() });
    const refreshEntitlements = createRefreshEntitlements();

    const { result, unmount } = renderHook(() =>
      useCheckoutFeedback({ roomCode, playerId, refreshEntitlements, paid: 'pass' })
    );

    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.isVisible).toBe(true);

    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
