'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

interface UseTypewriterOptions {
  text: string;
  enabled?: boolean;
  speed?: number;
  reduceMotion?: boolean;
}

function getInitialMotionReduced(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useTypewriter({
  text,
  enabled = true,
  speed = 30,
  reduceMotion = false,
}: UseTypewriterOptions) {
  const isReduced = reduceMotion || getInitialMotionReduced();
  const initialText = useMemo(() => {
    if (!enabled) return '';
    if (isReduced) return text;
    return '';
  }, [enabled, isReduced, text]);

  const initialDone = enabled && isReduced;

  const [displayedText, setDisplayedText] = useState(initialText);
  const [isDone, setIsDone] = useState(initialDone);
  const indexRef = useRef(0);

  const skip = useCallback(() => {
    setDisplayedText(text);
    setIsDone(true);
    indexRef.current = text.length;
  }, [text]);

  useEffect(() => {
    if (!enabled || isReduced) return;

    indexRef.current = 0;

    const interval = setInterval(() => {
      indexRef.current += 1;
      const nextText = text.slice(0, indexRef.current);
      setDisplayedText(nextText);

      if (indexRef.current >= text.length) {
        clearInterval(interval);
        setIsDone(true);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, enabled, speed, isReduced]);

  return { displayedText, isDone, skip };
}
