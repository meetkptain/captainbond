'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type VoteState = 'idle' | 'countdown' | 'reveal';

export function useVoteCountdown() {
  const [voteState, setVoteState] = useState<VoteState>('idle');
  const [countdown, setCountdown] = useState(3);
  const intervalRef = useRef<number | null>(null);

  const start = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setVoteState('countdown');
    setCountdown(3);

    let currentCount = 3;
    intervalRef.current = window.setInterval(() => {
      currentCount -= 1;
      if (currentCount <= 0) {
        if (intervalRef.current) {
          window.clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setVoteState('reveal');
        setCountdown(0);
      } else {
        setCountdown(currentCount);
      }
    }, 1000);
  }, []);

  const reset = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setVoteState('idle');
    setCountdown(3);
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  return { voteState, countdown, start, reset };
}
