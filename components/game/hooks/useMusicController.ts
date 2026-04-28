'use client';

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/lib/game-store';
import { sounds } from '@/lib/sounds';
import { music } from '@/lib/music';
import type { GameEvent } from '@/lib/game-types';

// ============================================
// useMusicController Hook
// Extracted from DashboardScreen.tsx
// Manages: music initialization, dynamic track
// selection, music fade during dialogs, victory
// pause handling, and game over pause handling.
// ============================================

interface UseMusicControllerParams {
  selectedEvent: GameEvent | null;
  staffEvent: GameEvent | null;
  setSelectedEvent: (event: GameEvent | null) => void;
  setStaffEvent: (event: GameEvent | null) => void;
  paused: boolean;
  gameOver: boolean;
  victoryAchieved: boolean;
  musicMuted: boolean;
  musicVolume: number;
  currentMusicTrack: string | null;
  money: number;
  reputation: number;
  gameStarted: boolean;
}

export function useMusicController({
  selectedEvent,
  staffEvent,
  setSelectedEvent,
  setStaffEvent,
  paused,
  gameOver,
  victoryAchieved,
  musicMuted,
  musicVolume,
  currentMusicTrack,
  money,
  reputation,
  gameStarted,
}: UseMusicControllerParams) {
  // ---- Refs ----
  const victoryHandledRef = useRef(false);
  const gameOverPlayedRef = useRef(false);
  const musicDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---- Store actions ----
  const togglePause = useGameStore((s) => s.togglePause);
  const setCurrentMusicTrack = useGameStore((s) => s.setCurrentMusicTrack);

  // ============================================
  // Music system - init on first user interaction
  // ============================================
  useEffect(() => {
    const init = () => {
      music.init();
      music.setVolume(musicVolume || 0.3);
    };
    document.addEventListener('click', init, { once: true });
    document.addEventListener('keydown', init, { once: true });
    return () => {
      document.removeEventListener('click', init);
      document.removeEventListener('keydown', init);
    };
  }, []);

  // ============================================
  // Dynamic music based on game state (debounced to prevent rapid switching)
  // ============================================
  useEffect(() => {
    if (paused || gameOver) {
      music.stop();
      return;
    }
    if (musicMuted) return;
    music.setVolume(musicVolume || 0.3);

    let targetTrack: string | null = null;
    if (money < 5000 || reputation < 30) targetTrack = 'tension';
    else if (victoryAchieved) targetTrack = 'celebration';
    else targetTrack = 'active';

    // Don't switch if already on the right track
    if (currentMusicTrack === targetTrack) return;

    // Debounce track switches to prevent rapid toggling
    if (musicDebounceRef.current) clearTimeout(musicDebounceRef.current);
    musicDebounceRef.current = setTimeout(() => {
      if (targetTrack) {
        music.play(targetTrack as 'ambient' | 'active' | 'tension' | 'celebration' | 'menu');
        setCurrentMusicTrack(targetTrack);
      }
    }, 2000);

    return () => {
      if (musicDebounceRef.current) clearTimeout(musicDebounceRef.current);
    };
  }, [money, reputation, victoryAchieved, paused, gameOver, musicMuted, musicVolume, currentMusicTrack, setCurrentMusicTrack]);

  // ============================================
  // Music fade during event dialogs
  // ============================================
  useEffect(() => {
    if (selectedEvent || staffEvent) {
      music.fadeOut(800);
    } else if (!paused && !gameOver && !musicMuted && gameStarted) {
      // Re-trigger music after a delay when dialog closes
      const timer = setTimeout(() => {
        music.fadeIn(1200);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [selectedEvent, staffEvent, paused, gameOver, musicMuted, gameStarted]);

  // ============================================
  // Victory: pause game, clear competing dialogs, play sound
  // ============================================
  useEffect(() => {
    if (victoryAchieved && !victoryHandledRef.current) {
      victoryHandledRef.current = true;
      sounds.success();
      // Clear any competing dialogs (deferred to avoid lint)
      setTimeout(() => {
        setSelectedEvent(null);
        setStaffEvent(null);
      }, 0);
      // Pause the game
      if (!paused) togglePause();
    }
  }, [victoryAchieved, paused, togglePause, setSelectedEvent, setStaffEvent]);

  // ============================================
  // Game over: pause game, clear competing dialogs, play sound
  // ============================================
  useEffect(() => {
    if (gameOver && !gameOverPlayedRef.current) {
      gameOverPlayedRef.current = true;
      sounds.gameOver();
      // Clear any competing dialogs (deferred to avoid lint)
      setTimeout(() => {
        setSelectedEvent(null);
        setStaffEvent(null);
      }, 0);
      // Pause the game
      if (!paused) togglePause();
    }
  }, [gameOver, paused, togglePause, setSelectedEvent, setStaffEvent]);
}
