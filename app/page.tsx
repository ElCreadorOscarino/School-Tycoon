'use client';

import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '@/lib/game-store';
import { sounds } from '@/lib/sounds';
import { music } from '@/lib/music';
import ErrorBoundary from '@/components/ErrorBoundary';

// Direct imports — avoids SSR bailout errors from next/dynamic({ ssr: false })
// All screens are 'use client' components, so they only hydrate on the client side
import ApiConfigScreen from '@/components/game/ApiConfigScreen';
import ProfileScreen from '@/components/game/ProfileScreen';
import BuildingScreen from '@/components/game/BuildingScreen';
import OfficeScreen from '@/components/game/OfficeScreen';
import ClassroomsScreen from '@/components/game/ClassroomsScreen';
import BathroomsCafeteriaScreen from '@/components/game/BathroomsCafeteriaScreen';
import TechnologyScreen from '@/components/game/TechnologyScreen';
import ServicesScreen from '@/components/game/ServicesScreen';
import RulesScreen from '@/components/game/RulesScreen';
import TeachersScreen from '@/components/game/TeachersScreen';
import CalendarScreen from '@/components/game/CalendarScreen';
import StudentsScreen from '@/components/game/StudentsScreen';
import ReviewScreen from '@/components/game/ReviewScreen';
import OpeningScreen from '@/components/game/OpeningScreen';
import DashboardScreen from '@/components/game/DashboardScreen';

// Floating particles component — renders ONLY on client to avoid hydration mismatch
function FloatingParticles() {
  const [particles, setParticles] = useState<Array<{
    id: number; left: string; size: string; glow: string;
    bg: string; anim: string;
  }> | null>(null);

  useEffect(() => {
    const colors = [
      [0, 255, 136],
      [68, 136, 255],
      [170, 68, 255],
    ];
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: client-only particle generation to avoid hydration mismatch
    setParticles(
      Array.from({ length: 6 }, (_, i) => {
        const [r, g, b] = colors[i % 3];
        const sz = 1 + Math.random() * 2;
        const op = 0.1 + Math.random() * 0.2;
        return {
          id: i,
          left: `${(Math.random() * 100).toFixed(4)}%`,
          size: `${sz.toFixed(4)}px`,
          glow: `0 0 ${(sz * 2).toFixed(4)}px rgba(${r},${g},${b},${(op * 0.5).toFixed(4)})`,
          bg: `rgba(${r},${g},${b},${op.toFixed(4)})`,
          anim: `particleFloat ${(15 + Math.random() * 20).toFixed(4)}s ${(Math.random() * 15).toFixed(4)}s linear infinite`,
        };
      })
    );
  }, []);

  if (!particles) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden" style={{ contain: 'layout paint' }}>
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.left,
            bottom: '-10px',
            width: p.size,
            height: p.size,
            backgroundColor: p.bg,
            boxShadow: p.glow,
            animation: p.anim,
          }}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const currentScreen = useGameStore((s) => s.currentScreen);
  const musicMuted = useGameStore((s) => s.musicMuted);
  const musicVolume = useGameStore((s) => s.musicVolume);
  const soundVolume = useGameStore((s) => s.soundVolume);
  const prevScreenRef = useRef(currentScreen);
  const musicInitializedRef = useRef(false);

  // Initialize audio on first user interaction
  useEffect(() => {
    const initAudio = () => {
      sounds.init();
      sounds.setVolume(soundVolume);
      if (!musicInitializedRef.current) {
        music.init();
        music.setVolume(musicVolume || 0.3);
        musicInitializedRef.current = true;
      }
    };
    document.addEventListener('click', initAudio, { once: true });
    document.addEventListener('touchstart', initAudio, { once: true });
    document.addEventListener('keydown', initAudio, { once: true });
    return () => {
      document.removeEventListener('click', initAudio);
      document.removeEventListener('touchstart', initAudio);
      document.removeEventListener('keydown', initAudio);
    };
  }, []);

  // Sync sound volume from store
  useEffect(() => {
    sounds.setVolume(soundVolume);
  }, [soundVolume]);

  // Music based on screen (menu only — DashboardScreen handles its own music dynamically)
  useEffect(() => {
    if (!musicInitializedRef.current || musicMuted) return;
    music.setVolume(musicVolume || 0.3);

    // Don't control music when on dashboard — DashboardScreen manages it
    if (currentScreen === 'dashboard') {
      music.stop();
      return;
    }
    music.play('menu');
  }, [currentScreen, musicMuted, musicVolume]);

  // Sound on screen change + scroll to top
  useEffect(() => {
    if (currentScreen !== prevScreenRef.current) {
      sounds.menuOpen();
      prevScreenRef.current = currentScreen;
      window.scrollTo({ top: 0, behavior: 'auto' as ScrollBehavior });
    }
  }, [currentScreen]);

  // Typing sound on keyboard input (only for text fields)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) {
        if (e.key.length === 1) {
          sounds.typing();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[#050508] text-white bg-grid-animated bg-orbs relative">
      {/* Noise texture overlay for premium feel */}
      <div className="noise-overlay" />

      {/* Subtle scanline overlay for terminal aesthetic */}
      <div className="scanline-overlay" />

      {/* Third ambient orb - purple */}
      <div className="orb-purple" />

      {/* Floating particles */}
      <FloatingParticles />

      {/* Content wrapped in ErrorBoundary */}
      <div className="relative z-10">
        <ErrorBoundary>
          {currentScreen === 'api-config' && <ApiConfigScreen />}
          {currentScreen === 'profile' && <ProfileScreen />}
          {currentScreen === 'building' && <BuildingScreen />}
          {currentScreen === 'office' && <OfficeScreen />}
          {currentScreen === 'classrooms' && <ClassroomsScreen />}
          {currentScreen === 'bathrooms-cafeteria' && <BathroomsCafeteriaScreen />}
          {currentScreen === 'technology' && <TechnologyScreen />}
          {currentScreen === 'services' && <ServicesScreen />}
          {currentScreen === 'rules' && <RulesScreen />}
          {currentScreen === 'teachers' && <TeachersScreen />}
          {currentScreen === 'calendar' && <CalendarScreen />}
          {currentScreen === 'students' && <StudentsScreen />}
          {currentScreen === 'review' && <ReviewScreen />}
          {currentScreen === 'opening' && <OpeningScreen />}
          {currentScreen === 'dashboard' && <DashboardScreen />}
        </ErrorBoundary>
      </div>
    </div>
  );
}
