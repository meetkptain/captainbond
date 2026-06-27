// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVoteCountdown } from './useVoteCountdown';

describe('useVoteCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts in idle state with countdown at 3', () => {
    const { result } = renderHook(() => useVoteCountdown());
    expect(result.current.voteState).toBe('idle');
    expect(result.current.countdown).toBe(3);
  });

  it('counts down from 3 to reveal', () => {
    const { result } = renderHook(() => useVoteCountdown());

    act(() => {
      result.current.start();
    });
    expect(result.current.voteState).toBe('countdown');
    expect(result.current.countdown).toBe(3);

    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.voteState).toBe('countdown');
    expect(result.current.countdown).toBe(2);

    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.countdown).toBe(1);

    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.voteState).toBe('reveal');
  });

  it('reset returns to idle and stops the countdown', () => {
    const { result } = renderHook(() => useVoteCountdown());

    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(2500));
    expect(result.current.countdown).toBe(1);

    act(() => result.current.reset());
    expect(result.current.voteState).toBe('idle');
    expect(result.current.countdown).toBe(3);

    act(() => vi.advanceTimersByTime(5000));
    expect(result.current.voteState).toBe('idle');
    expect(result.current.countdown).toBe(3);
  });

  it('clears the interval on unmount', () => {
    const { result, unmount } = renderHook(() => useVoteCountdown());

    act(() => result.current.start());
    expect(vi.getTimerCount()).toBeGreaterThan(0);

    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
