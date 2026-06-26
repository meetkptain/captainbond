// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useHostSession, getHostSession } from './useHostSession';

describe('useHostSession', () => {
  let mockGetItem: ReturnType<typeof vi.fn>;
  let originalSessionStorage: Storage;

  beforeEach(() => {
    mockGetItem = vi.fn().mockReturnValue(null);
    originalSessionStorage = globalThis.sessionStorage;
    Object.defineProperty(globalThis, 'sessionStorage', {
      value: { getItem: mockGetItem },
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(globalThis, 'sessionStorage', {
      value: originalSessionStorage,
      configurable: true,
      writable: true,
    });
  });

  it('returns nulls on the server (no window)', () => {
    const originalWindow = globalThis.window;
    Object.defineProperty(globalThis, 'window', {
      value: undefined,
      writable: true,
      configurable: true,
    });
    try {
      expect(getHostSession('ROOM')).toEqual({ hostId: null, hostToken: null });
      expect(mockGetItem).not.toHaveBeenCalled();
    } finally {
      Object.defineProperty(globalThis, 'window', {
        value: originalWindow,
        writable: true,
        configurable: true,
      });
    }
  });

  it('parses host session from sessionStorage', () => {
    mockGetItem.mockImplementation((key: string) =>
      key === 'host_ROOM' ? JSON.stringify({ hostId: 'host-1', hostToken: 'token-1' }) : null
    );

    expect(getHostSession('ROOM')).toEqual({ hostId: 'host-1', hostToken: 'token-1' });
    expect(mockGetItem).toHaveBeenCalledWith('host_ROOM');
  });

  it('returns nulls when keys are missing or have wrong types', () => {
    mockGetItem.mockImplementation((key: string) =>
      key === 'host_ROOM' ? JSON.stringify({ hostId: 123, hostToken: true }) : null
    );

    expect(getHostSession('ROOM')).toEqual({ hostId: null, hostToken: null });
  });

  it('returns nulls on malformed JSON', () => {
    mockGetItem.mockReturnValue('not valid json');

    expect(getHostSession('ROOM')).toEqual({ hostId: null, hostToken: null });
  });

  it('memoizes the value in the hook', () => {
    mockGetItem.mockReturnValue(JSON.stringify({ hostId: 'host-1', hostToken: 'token-1' }));

    const { result, rerender } = renderHook(({ code }) => useHostSession(code), {
      initialProps: { code: 'ROOM' },
    });

    expect(result.current).toEqual({ hostId: 'host-1', hostToken: 'token-1' });

    mockGetItem.mockReturnValue(JSON.stringify({ hostId: 'host-2', hostToken: 'token-2' }));
    rerender({ code: 'ROOM' });

    expect(result.current).toEqual({ hostId: 'host-1', hostToken: 'token-1' });

    rerender({ code: 'OTHER' });

    expect(result.current).toEqual({ hostId: 'host-2', hostToken: 'token-2' });
  });
});
