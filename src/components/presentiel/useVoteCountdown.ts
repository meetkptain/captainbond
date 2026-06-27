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
    }

    setVoteState('countdown');
    setCountdown(3);

    let currentCount = 3;
    intervalRef.current = window.setInterval(() => {
      currentCount -= 1;
      if (currentCount <= 0) {
        if (intervalRef.current) {
          window.clearInterval(intervalRef.current);
        }
        setVoteState('reveal');
      } else {
        setCountdown(currentCount);
      }
    }, 1000);
  }, []);

  const reset = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }
    setVoteState('idle');
    setCountdown(3);
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, []);

  return { voteState, countdown, start, reset };
}
