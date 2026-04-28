'use client';

import { useEffect } from 'react';
import { sounds } from '@/lib/sounds';

// ============================================
// useKeyboardShortcuts Hook
// Extracted from DashboardScreen.tsx
// Manages keyboard shortcuts:
//   Space  = togglePause
//   1      = setTimeSpeed(1) Normal
//   2      = setTimeSpeed(2) Rapido
//   5      = setTimeSpeed(5) Muy rapido
//   0      = setTimeSpeed(10) Ultra
//   T/t    = setTimeSpeed(50) TURBO
// ============================================

interface UseKeyboardShortcutsParams {
  gameStarted: boolean;
  togglePause: () => void;
  setTimeSpeed: (speed: number) => void;
}

export function useKeyboardShortcuts({
  gameStarted,
  togglePause,
  setTimeSpeed,
}: UseKeyboardShortcutsParams) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) return;
      if (!gameStarted) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePause();
          sounds.click();
          break;
        case '1':
          setTimeSpeed(1);
          sounds.click();
          break;
        case '2':
          setTimeSpeed(2);
          sounds.click();
          break;
        case '5':
          setTimeSpeed(5);
          sounds.click();
          break;
        case '0':
          setTimeSpeed(10);
          sounds.click();
          break;
        case 't':
        case 'T':
          setTimeSpeed(50);
          sounds.click();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted, togglePause, setTimeSpeed]);
}
