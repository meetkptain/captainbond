'use client';
import React, { useState, useEffect } from 'react';

interface CountdownProps {
  initialSeconds: number;
  onZero?: () => void;
  className?: string;
}

export function Countdown({ initialSeconds, onZero, className }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState(() => Math.max(0, initialSeconds));

  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      setTimeLeft(Math.max(0, initialSeconds));
    });
    return () => cancelAnimationFrame(rafId);
  }, [initialSeconds]);

  useEffect(() => {
    // Si on commence avec 0 ou moins, on stoppe directement
    if (initialSeconds <= 0) {
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          if (onZero) onZero();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [initialSeconds, onZero]);

  // Éviter l'affichage de valeurs négatives
  const displayTime = Math.max(0, timeLeft);

  return (
    <div className={className || "text-5xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-300 to-rose-400 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] animate-pulse"}>
      {displayTime}
    </div>
  );
}
