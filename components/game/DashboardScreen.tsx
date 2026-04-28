'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useGameStore } from '@/lib/game-store';
import { sounds } from '@/lib/sounds';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type {
  GameEvent,
  GameNotification,
  Achievement,
  Loan,
  MarketingCampaign,
  BuildingExpansion,
  MonthlyReport,
} from '@/lib/game-types';
import {
  LOAN_OPTIONS,
  MARKETING_OPTIONS,
  EXPANSION_OPTIONS,
} from '@/lib/game-types';
import { LOCAL_EVENTS, getEligibleEvents, getRandomWeightedEvent, EVENT_COOLDOWN_WEEKS } from '@/lib/event-pool';
import type { LocalEventTemplate } from '@/lib/event-pool';
import { generateWeather, getWeatherEmoji, getSeasonName } from '@/lib/weather-system';
import { getCompetitionInfo } from '@/lib/school-rivals';
import { music } from '@/lib/music';
import DeleteGameDialog from '@/components/game/DeleteGameDialog';
import OverviewTab from '@/components/game/tabs/OverviewTab';
import EventsTab from '@/components/game/tabs/EventsTab';
import TeachersTab from '@/components/game/tabs/TeachersTab';
import StudentsTab from '@/components/game/tabs/StudentsTab';
import BuildingTab from '@/components/game/tabs/BuildingTab';
import FinancesTab from '@/components/game/tabs/FinancesTab';
import AiAdvisorTab from '@/components/game/tabs/AiAdvisorTab';
import AchievementsTab from '@/components/game/tabs/AchievementsTab';
import MarketingTab from '@/components/game/tabs/MarketingTab';
import LoansTab from '@/components/game/tabs/LoansTab';
import ExpansionTab from '@/components/game/tabs/ExpansionTab';
import SettingsTab from '@/components/game/tabs/SettingsTab';
import WeatherTab from '@/components/game/tabs/WeatherTab';
import RivalsTab from '@/components/game/tabs/RivalsTab';
import SkillsTab from '@/components/game/tabs/SkillsTab';
import NewsTab from '@/components/game/tabs/NewsTab';
import ShopTab from '@/components/game/tabs/ShopTab';
import ChallengesTab from '@/components/game/tabs/ChallengesTab';
import TransportTab from '@/components/game/tabs/TransportTab';
import CampusTab from '@/components/game/tabs/CampusTab';
import DecisionsTab from '@/components/game/tabs/DecisionsTab';
import StaffTab from '@/components/game/tabs/StaffTab';
import AlumniTab from '@/components/game/tabs/AlumniTab';
import DecorationTab from '@/components/game/tabs/DecorationTab';
import ParentsTab from '@/components/game/tabs/ParentsTab';
import RecordsTab from '@/components/game/tabs/RecordsTab';
import MiniGamesTab from '@/components/game/tabs/MiniGamesTab';

// LOCAL_EVENTS is now imported from '@/lib/event-pool' (77 events)

// ============================================
// Stat Bar Component (memoized for performance)
// ============================================
const StatBar = React.memo(function StatBar({ label, emoji, value, max, color }: { label: string; emoji: string; value: number; max: number; color: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const displayColor = pct >= 70 ? '#00ff88' : pct >= 40 ? '#ffcc00' : '#ff4444';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-[#aaaaaa]">{emoji} {label}</span>
        <span style={{ color: displayColor }} className="font-bold">{value}{max <= 100 ? '' : `/${max}`}</span>
      </div>
      <div className="w-full h-2 bg-[#111111] rounded-full overflow-hidden border border-[#222222]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: displayColor }}
        />
      </div>
    </div>
  );
});

// ============================================
// Confetti Component
// ============================================
function ConfettiEffect() {
  const colors = ['#00ff88', '#ffcc00', '#ff4444', '#4488ff', '#ff88ff', '#88ffcc'];
  const pieces = useMemo(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 4 + Math.random() * 8,
      isCircle: Math.random() > 0.5,
    })), []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden" style={{ pointerEvents: 'none' }}>
      {pieces.map(p => (
        <div
          key={p.id}
          className="absolute animate-bounce"
          style={{
            left: `${p.left}%`,
            top: '-10px',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.isCircle ? '50%' : '2px',
            animation: `confettiFall ${p.duration}s ${p.delay}s ease-in forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ============================================
// Main Dashboard Component
// ============================================
export default function DashboardScreen() {
  // Performance: use getState() for bulk data access (non-reactive),
  // individual selectors below handle reactive updates for hot values.
  // This prevents re-renders on every store change.
  const storeRef = useRef(useGameStore.getState());
  // Keep ref in sync without triggering re-render
  useEffect(() => {
    const unsub = useGameStore.subscribe((state) => {
      storeRef.current = state;
    });
    return unsub;
  }, []);
  const store = storeRef.current;
  // Performance: subscribe to individual slices for frequently-changing values
  // to minimize re-renders. The `store` ref is always current for non-reactive reads.
  const money = useGameStore((s) => s.money);
  const currentWeek = useGameStore((s) => s.currentWeek);
  const currentDay = useGameStore((s) => s.currentDay);
  const paused = useGameStore((s) => s.paused);
  const timeSpeed = useGameStore((s) => s.timeSpeed);
  const pendingEvents = useGameStore((s) => s.pendingEvents);
  const currentMusicTrack = useGameStore((s) => s.currentMusicTrack);
  const gameOver = useGameStore((s) => s.gameOver);
  const victoryAchieved = useGameStore((s) => s.victoryAchieved);
  const reputation = useGameStore((s) => s.reputation);
  const studentSatisfaction = useGameStore((s) => s.studentSatisfaction);
  const academicPerformance = useGameStore((s) => s.academicPerformance);
  const parentSatisfaction = useGameStore((s) => s.parentSatisfaction);
  const activeStudents = useGameStore((s) => s.activeStudents);
  const activeTeachers = useGameStore((s) => s.activeTeachers);
  const notifications = useGameStore((s) => s.notifications);
  const weather = useGameStore((s) => s.weather);
  const morale = useGameStore((s) => s.morale);
  const achievements = useGameStore((s) => s.achievements);
  const loans = useGameStore((s) => s.loans);
  const activeCampaigns = useGameStore((s) => s.activeCampaigns);
  const monthlyReports = useGameStore((s) => s.monthlyReports);
  const financialHistory = useGameStore((s) => s.financialHistory);
  const teachers = useGameStore((s) => s.teachers);
  const students = useGameStore((s) => s.students);
  const soundVolume = useGameStore((s) => s.soundVolume);
  const musicVolume = useGameStore((s) => s.musicVolume);
  const musicMuted = useGameStore((s) => s.musicMuted);
  const gameStarted = useGameStore((s) => s.gameStarted);
  const {
    schoolName, directorName, currency, currentMonth, currentYear,
    victoryType,
    events,
    scholarships, expansions,
    cafeteriaBuilt, cafeteriaSize, libraryEnabled, internetType,
    cameraCount, sportsAreaEnabled, buildingSize, classrooms,
    computerLabEnabled, meetingRoomEnabled, monthlyFee, tuition,
    lastStaffEventWeek, lastInspectionWeek,
    advanceWeek, setTimeSpeed, togglePause,
    resolveEvent, markNotificationRead, addPendingEvent, addNotification, clearExtraPendingEvents, adjustReputation, adjustAcademicPerformance,
    startNewGame, setScreen, setTuition, setMonthlyFee,
    removeTeacher, getMaxStudents, getTotalMonthlyExpenses, getWeeklyIncome, getTotalWeeklyExpenses,
    setSoundVolume, addLoan, makeLoanPayment, startCampaign, addExpansion, completeExpansions,
    rivals, directorSkills, transportRoutes, newsHistory, shopItems, activeChallenges,
    decisionHistory,
    upgradeSkill, purchaseShopItem, addTransportRoute, toggleTransportRoute,
    setMusicVolume, setMusicMuted, setCurrentMusicTrack, incrementStats,
    eventsResolved, addDecisionRecord,
    staff, alumni, uniformColors, schoolMotto, schoolMascot,
    decorations, saveSlots, campaignChapter, tutorialStep, totalPlayTime, bestSchoolStats, parentEvents,
    hireStaff, fireStaffMember, adjustMorale, addAlumni, processAlumniDonation,
    setUniformColors, setSchoolMotto, setSchoolMascot, purchaseDecoration,
    generateStaffCandidates,
    createSaveSlot, deleteSaveSlot, setTutorialStep,
  } = store;

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedEvent, setSelectedEvent] = useState<GameEvent | null>(null);
  const [eventResolved, setEventResolved] = useState(false);
  const [consequenceText, setConsequenceText] = useState('');
  const [fireTeacherId, setFireTeacherId] = useState<string | null>(null);
  const [expelStudentId, setExpelStudentId] = useState<string | null>(null);
  const [aiMessages, setAiMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [staffEvent, setStaffEvent] = useState<GameEvent | null>(null);
  const [enrollNotify, setEnrollNotify] = useState<{ count: number } | null>(null);
  const [ptaMeetingOpen, setPtaMeetingOpen] = useState(false);
  const [ptaTopic, setPtaTopic] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const eventCooldownRef = useRef(6); // Start with 6 weeks before first event
  const lastWeekRef = useRef(currentWeek);
  const eventJustClosedRef = useRef(false); // Prevent immediate re-trigger after closing
  const gameOverPlayedRef = useRef(false);
  const dialogOpenRef = useRef(false);
  const wasManuallyPausedRef = useRef(false);
  const [victoryDismissed, setVictoryDismissed] = useState(false);
  const prevActiveStudentsRef = useRef(activeStudents);
  const weatherChangeRef = useRef(weather.current);
  const lastStaffEventWeekRef = useRef(lastStaffEventWeek); // Track locally to avoid store mutation
  const eventGeneratedThisWeekRef = useRef(false); // Prevent multiple events per week
  const justClosedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null); // Timer for eventJustClosedRef delayed clear
  const maxStudents = getMaxStudents();

  // Daily Tips System
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [tipVisible, setTipVisible] = useState(true);
  const tips = useMemo(() => [
    '💡 Contratar profesores de calidad mejora la reputacion mas rapido que cualquier otra inversion',
    '💡 Una biblioteca bien equipada aumenta el rendimiento academico un 5%',
    '💡 No gastes todo tu capital en la construccion — guarda un fondo de emergencia',
    '💡 El clima tropical afecta la satisfaccion: instala aire acondicionado en la tienda',
    '💡 Los prestamos son utiles pero pueden bancarte si no tienes ingresos estables',
    '💡 Responde los eventos positivamente para ganar logros de diplomacia',
    '💡 La comida premium en cafeteria aumenta satisfaccion pero cuesta mas',
    '💡 Usa el asesor IA para obtener consejos personalizados sobre tu escuela',
    '💡 Las campanas de marketing atraen nuevos estudiantes cada semana',
    '💡 Revisa las estadisticas de rivales para saber donde mejorar',
    '💡 Los desafios semanales dan recompensas extra — no los ignores',
    '💡 Un buen sistema de reglas mejora la disciplina sin perder satisfaccion',
    '💡 Invertir en tecnologia (fibra optica) atrae estudiantes mas avanzados',
    '💡 Las becas aumentan matricula pero reducen ingresos — equilibra bien',
    '💡 El area deportiva mejora satisfaccion y abre eventos especiales',
    '💡 Los banos limpios son mas importantes de lo que piensas — contrata limpiadores',
  ], []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipVisible(false);
      setTimeout(() => {
        setCurrentTipIndex(prev => (prev + 1) % tips.length);
        setTipVisible(true);
      }, 400);
    }, 15000);
    return () => clearInterval(interval);
  }, [tips.length]);

  // Weekly income and expenses
  const weeklyIncome = getWeeklyIncome();
  const weeklyExpenses = getTotalWeeklyExpenses();
  const monthlyExpenses = getTotalMonthlyExpenses();

  // Pause on dialog open — saves manual pause state
  const openDialogWithPause = useCallback(() => {
    if (!dialogOpenRef.current) {
      dialogOpenRef.current = true;
      eventJustClosedRef.current = false;
      // Save whether the user had manually paused
      wasManuallyPausedRef.current = paused;
      if (!paused) togglePause();
    }
  }, [paused, togglePause]);

  const closeDialogWithResume = useCallback(() => {
    if (dialogOpenRef.current) {
      dialogOpenRef.current = false;
      // Set a minimum gap of 3 weeks after closing an event
      eventCooldownRef.current = Math.max(eventCooldownRef.current, 3);
      eventJustClosedRef.current = true;
      // CLEAR EXTRA PENDING EVENTS — keep only the most recent one
      // This prevents stacking: if multiple events queued up while dialog was open, discard all but the last
      clearExtraPendingEvents();
      // Only resume if the user hadn't manually paused before the dialog
      if (!wasManuallyPausedRef.current && paused) {
        togglePause();
      }
    }
  }, [paused, togglePause, clearExtraPendingEvents]);

  // Victory: pause game, clear competing dialogs, play sound
  const victoryHandledRef = useRef(false);
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
  }, [victoryAchieved, paused, togglePause]);

  // Game over: pause game, clear competing dialogs, play sound
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
  }, [gameOver, paused, togglePause]);

  // Music system - init on first user interaction
  useEffect(() => {
    const init = () => { music.init(); music.setVolume(musicVolume || 0.3); };
    document.addEventListener('click', init, { once: true });
    document.addEventListener('keydown', init, { once: true });
    return () => { document.removeEventListener('click', init); document.removeEventListener('keydown', init); };
  }, []);

  // Dynamic music based on game state (debounced to prevent rapid switching)
  const musicDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (paused || gameOver) { music.stop(); return; }
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

    return () => { if (musicDebounceRef.current) clearTimeout(musicDebounceRef.current); };
  }, [money, reputation, victoryAchieved, paused, gameOver, musicMuted, musicVolume, currentMusicTrack, setCurrentMusicTrack]);

  // Music fade during event dialogs
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

  // Keyboard shortcuts (Space=pause, 1/2/5/0=speed)
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
          setTimeSpeed(1); sounds.click(); break;
        case '2':
          setTimeSpeed(2); sounds.click(); break;
        case '5':
          setTimeSpeed(5); sounds.click(); break;
        case '0':
          setTimeSpeed(10); sounds.click(); break;
        case 't':
        case 'T':
          setTimeSpeed(50); sounds.click(); break;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted, togglePause, setTimeSpeed]);

  // Auto-enrollment notification
  useEffect(() => {
    if (activeStudents > prevActiveStudentsRef.current && currentWeek > 1) {
      const diff = activeStudents - prevActiveStudentsRef.current;
      setEnrollNotify({ count: diff });
      sounds.notification();
      const timer = setTimeout(() => setEnrollNotify(null), 3000);
      return () => clearTimeout(timer);
    }
    prevActiveStudentsRef.current = activeStudents;
  }, [activeStudents, currentWeek]);

  // Game Loop - advanceWeek instead of advanceDay
  useEffect(() => {
    if (paused || gameOver) {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    const intervals: Record<number, number> = { 1: 750, 2: 375, 5: 150, 10: 75, 50: 15 };
    const intervalMs = intervals[timeSpeed] || 3000;

    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }

    gameLoopRef.current = setInterval(() => {
      advanceWeek();
      // Cooldown is now managed per-week in the event generation effect, not per tick
    }, intervalMs);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
  }, [paused, gameOver, timeSpeed, advanceWeek]);

  // Track recently used event titles to prevent repetition
  const recentEventsRef = useRef<Map<string, number>>(new Map()); // title -> weekUsed
  const aiEventRetryRef = useRef(0); // track consecutive AI failures
  const lastEventShownWeekRef = useRef(0); // Week when last event dialog was shown

  // Helper to convert template to GameEvent
  const templateToGameEvent = useCallback((template: LocalEventTemplate, prefix: string): GameEvent => ({
    id: `${prefix}-${currentWeek}-${Date.now()}`,
    day: currentDay,
    title: template.title,
    description: template.description,
    emoji: template.emoji,
    impact: template.impact,
    options: template.options.map(o => ({
      text: o.text,
      reputationChange: o.reputationChange,
      moneyChange: o.moneyChange,
      satisfactionChange: o.satisfactionChange,
      consequence: o.consequence,
    })),
    resolved: false,
  }), [currentWeek, currentDay]);

  // Event generation: AI first (every 3 weeks), fallback to local pool
  useEffect(() => {
    if (dialogOpenRef.current) return;
    if (eventJustClosedRef.current) return; // Skip ticks while just-closed flag is active
    if (paused || gameOver || victoryAchieved) return;
    if (currentWeek === lastWeekRef.current) return;
    lastWeekRef.current = currentWeek;

    // Don't clear eventJustClosedRef immediately — use a delayed clear so it
    // blocks event generation for at least 2 seconds (≈2-3 game weeks at speed 1).
    // This prevents a race where the flag clears and an event generates in the same tick.
    if (justClosedTimerRef.current) clearTimeout(justClosedTimerRef.current);
    justClosedTimerRef.current = setTimeout(() => { eventJustClosedRef.current = false; }, 2000);

    // Reset per-week generation flag at the start of each new week
    eventGeneratedThisWeekRef.current = false;

    // Decrease cooldown by 1 per week (not per tick)
    if (eventCooldownRef.current > 0) {
      eventCooldownRef.current -= 1;
      return;
    }
    // Guard: don't generate if an event dialog is currently showing (selectedEvent or staffEvent)
    // This ref-based check prevents the effect from generating while a dialog is open,
    // since the dialog sets dialogOpenRef=true before the next tick can run.
    if (pendingEvents.length >= 1) return;

    // Absolute guard: only one event can be generated per week
    if (eventGeneratedThisWeekRef.current) return;

    // Minimum gap: at least 3 weeks since last event was shown
    if (currentWeek - lastEventShownWeekRef.current < 3) return;

    // Clean old events from recentEventsRef (past cooldown)
    for (const [title, week] of recentEventsRef.current) {
      if (currentWeek - week > EVENT_COOLDOWN_WEEKS) recentEventsRef.current.delete(title);
    }
    const recentTitles = new Set(recentEventsRef.current.keys());

    // Get month for season
    const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    const monthName = months[(currentMonth - 1 + 12) % 12];
    const seasonMap: Record<string, string> = { 'Enero':'winter','Febrero':'winter','Marzo':'spring','Abril':'spring','Mayo':'spring','Junio':'summer','Julio':'summer','Agosto':'summer','Septiembre':'fall','Octubre':'fall','Noviembre':'fall','Diciembre':'winter' };
    const season = seasonMap[monthName] || 'spring';

    const generateEvent = async () => {
      eventGeneratedThisWeekRef.current = true; // Mark this week as having generated an event
      eventCooldownRef.current = 6; // cooldown 6 weeks (managed per-week)
      lastEventShownWeekRef.current = currentWeek;

      // Try AI-generated event every 3 weeks (or every week if recent AI failures < 2)
      const useAI = (currentWeek % 3 === 0) || (aiEventRetryRef.current < 2 && currentWeek > 3);

      if (useAI) {
        try {
          const res = await fetch('/api/ai/events?XTransformPort=3000', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              schoolName, currentWeek,
              reputation: Math.round(reputation),
              studentSatisfaction: Math.round(studentSatisfaction),
              academicPerformance: Math.round(academicPerformance),
              parentSatisfaction: Math.round(parentSatisfaction),
              activeStudents, maxStudents: maxStudents,
              money, season, monthName,
              recentEvents: Array.from(recentTitles),
              achievements: achievements.filter(a => a.unlocked).map(a => a.name),
            }),
          });
          const data = await res.json();
          if (data.event && !recentTitles.has(data.event.title)) {
            const template: LocalEventTemplate = {
              title: data.event.title,
              description: data.event.description,
              emoji: data.event.emoji || '📰',
              impact: data.event.impact || 'neutral',
              category: data.event.category,
              options: (data.event.options || []).map((o: any) => ({
                text: o.text, reputationChange: o.reputationChange || 0,
                moneyChange: o.moneyChange || 0, satisfactionChange: o.satisfactionChange || 0,
                consequence: o.consequence || 'Sin consecuencias adicionales.',
              })),
            };
            if (template.options.length >= 2) {
              const newEvent = templateToGameEvent(template, 'ai');
              addPendingEvent(newEvent);
              recentEventsRef.current.set(template.title, currentWeek);
              sounds.notification();
              addNotification({ id: `notif-ai-${Date.now()}`, day: currentDay, message: `🤖 ${template.title}`, emoji: template.emoji, read: false });
              aiEventRetryRef.current = 0;
              return;
            }
          }
          aiEventRetryRef.current++;
        } catch {
          aiEventRetryRef.current++;
        }
      }

      // Fallback to local event pool
      const eligible = getEligibleEvents(store, recentTitles, currentWeek);
      if (eligible.length === 0) return;
      const template = getRandomWeightedEvent(eligible, store);
      if (!template) return;

      const newEvent = templateToGameEvent(template, 'event');
      addPendingEvent(newEvent);
      recentEventsRef.current.set(template.title, currentWeek);
      sounds.notification();
      addNotification({ id: `notif-event-${Date.now()}`, day: currentDay, message: `${template.emoji} ${template.title}`, emoji: template.emoji, read: false });
    };

    // Only ONE event type can generate per week to prevent stacking
    const rollForEvent = Math.random() < 0.30; // Reduced from 40% to 30%
    const rollForStaff = currentWeek - lastStaffEventWeekRef.current >= 10; // Increased from 8 to 10

    if (!rollForEvent && !rollForStaff) return;

    // Staff events have priority (every 8 weeks), otherwise regular event
    if (rollForStaff) {
      const staffEligible = getEligibleEvents(store, recentTitles, currentWeek).filter(e => e.isStaffEvent);
      if (staffEligible.length > 0) {
        const template = getRandomWeightedEvent(staffEligible, store);
        if (template) {
          lastStaffEventWeekRef.current = currentWeek;
          eventCooldownRef.current = 6; // Set cooldown to prevent stacking
          lastEventShownWeekRef.current = currentWeek;
          eventGeneratedThisWeekRef.current = true; // Mark this week as having generated an event
          const staffGameEvent = templateToGameEvent(template, 'staff');
          addPendingEvent(staffGameEvent);
          recentEventsRef.current.set(template.title, currentWeek);
          sounds.notification();
          addNotification({ id: `notif-staff-${Date.now()}`, day: currentDay, message: `👨‍🏫 ${template.title}`, emoji: template.emoji, read: false });
          return; // Only one event per tick
        }
      }
    }

    if (rollForEvent) {
      generateEvent();
    }
  }, [currentWeek, currentDay, paused, gameOver, victoryAchieved, pendingEvents.length, store, addPendingEvent, addNotification, lastStaffEventWeek, schoolName, reputation, studentSatisfaction, academicPerformance, parentSatisfaction, activeStudents, maxStudents, money, currentMonth, achievements, templateToGameEvent]);

  // Weather ambient sounds
  useEffect(() => {
    if (weather.current !== weatherChangeRef.current) {
      weatherChangeRef.current = weather.current;
      switch (weather.current) {
        case 'stormy':
          // Thunder + rain rumble
          sounds.naturalDisaster();
          break;
        case 'rainy':
          // Gentle rain sound
          sounds.eventNeutral();
          break;
        case 'hurricane':
          // Emergency alert
          sounds.emergency();
          break;
        case 'sunny':
          // Happy notification
          sounds.eventPositive();
          break;
        case 'hot':
          // Warning
          sounds.warning();
          break;
      }
      addNotification({
        id: `weather-${Date.now()}`,
        day: currentDay,
        message: `${getWeatherEmoji(weather.current)} Clima cambiado a: ${weather.current === 'sunny' ? 'Soleado' : weather.current === 'rainy' ? 'Lluvioso' : weather.current === 'stormy' ? 'Tormenta' : weather.current === 'hot' ? 'Caluroso' : weather.current === 'cloudy' ? 'Nublado' : weather.current === 'windy' ? 'Ventoso' : 'Huracan!'}`,
        emoji: getWeatherEmoji(weather.current),
        read: false,
      });
    }
  }, [weather.current, currentDay, addNotification]);

  // Track shown event ids to auto-popup new events
  const shownEventIdsRef = useRef<Set<string>>(new Set());

  // Auto-popup new events AND PAUSE the game (with delay to prevent stacking)
  const eventPopupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Only pop up if: events pending, no dialog currently shown, game not paused for other reasons
    if (pendingEvents.length > 0 && !selectedEvent && !staffEvent && !dialogOpenRef.current) {
      const firstNew = pendingEvents.find(e => !shownEventIdsRef.current.has(e.id));
      if (firstNew) {
        // Add a small delay before showing the next event to prevent stacking
        if (eventPopupTimerRef.current) clearTimeout(eventPopupTimerRef.current);
        eventPopupTimerRef.current = setTimeout(() => {
          // Double-check nothing opened in the meantime
          if (selectedEvent || staffEvent || dialogOpenRef.current) return;
          if (pendingEvents.length === 0) return;
          const stillPending = pendingEvents.find(e => e.id === firstNew.id);
          if (!stillPending) return;
          shownEventIdsRef.current.add(firstNew.id);
          setSelectedEvent(firstNew);
          setEventResolved(false);
          setConsequenceText('');
          // Pause the game when event dialog opens
          openDialogWithPause();
        }, 800); // Increased delay to prevent stacking
      }
    }
    return () => {
      if (eventPopupTimerRef.current) clearTimeout(eventPopupTimerRef.current);
    };
  }, [pendingEvents, selectedEvent, staffEvent, openDialogWithPause]);

  // Handle event resolution
  const handleResolveEvent = (eventId: string, optionIndex: number) => {
    const event = pendingEvents.find(e => e.id === eventId);
    if (!event) return;
    const option = event.options[optionIndex];
    if (!option) return;

    resolveEvent(eventId, optionIndex);
    setConsequenceText(option.consequence || 'Sin consecuencias adicionales.');
    setEventResolved(true);

    const relatedNotif = notifications.find(n => n.message.includes(event.title));
    if (relatedNotif) {
      markNotificationRead(relatedNotif.id);
    }

    sounds.success();
    incrementStats({ eventsResolved: 1 });
    addDecisionRecord({
      week: currentWeek,
      eventTitle: event.title,
      chosenOption: option.text,
      outcome: option.consequence || 'Sin consecuencias.',
      reputationChange: option.reputationChange,
      moneyChange: option.moneyChange,
    });
  };

  const handleCloseEventDialog = () => {
    setSelectedEvent(null);
    setEventResolved(false);
    setConsequenceText('');
    closeDialogWithResume();
  };

  const handleOpenEventDialog = (event: GameEvent) => {
    setSelectedEvent(event);
    setEventResolved(false);
    setConsequenceText('');
    sounds.click();
    openDialogWithPause();
  };

  const handleCloseStaffEvent = () => {
    setStaffEvent(null);
    closeDialogWithResume();
  };

  const handleResolveStaffEvent = (optionIndex: number) => {
    if (!staffEvent) return;
    // Add to pendingEvents first so resolveEvent can find it
    addPendingEvent(staffEvent);
    resolveEvent(staffEvent.id, optionIndex);
 setStaffEvent(null);
    sounds.success();
    closeDialogWithResume();
  };

  const handleFireTeacher = () => {
    if (!fireTeacherId) return;
    removeTeacher(fireTeacherId);
    sounds.click();
    addNotification({
      id: `notif-fire-${Date.now()}`,
      day: currentDay,
      message: '👨‍🏫 Un profesor fue despedido',
      emoji: '👨‍🏫',
      read: false,
    });
    setFireTeacherId(null);
    closeDialogWithResume();
  };

  const handleExpelStudent = () => {
    if (!expelStudentId) return;
    store.removeStudent(expelStudentId);
    sounds.click();
    addNotification({
      id: `notif-expel-${Date.now()}`,
      day: currentDay,
      message: '👩‍🎓 Un estudiante fue expulsado',
      emoji: '👩‍🎓',
      read: false,
    });
    setExpelStudentId(null);
    closeDialogWithResume();
  };

  // AI Advisor
  const handleAiSend = async () => {
    if (!aiInput.trim() || aiLoading) return;
    const userMsg = aiInput.trim();
    setAiInput('');
    setAiMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setAiLoading(true);

    const context = `Escuela: ${schoolName}. Director: ${directorName}. Semana: ${currentWeek}. Dinero: ${currency}${money.toLocaleString()}. Reputacion: ${Math.round(reputation)}. Satisfaccion: ${Math.round(studentSatisfaction)}. Rendimiento: ${Math.round(academicPerformance)}. Padres: ${Math.round(parentSatisfaction)}. Estudiantes: ${activeStudents}/${maxStudents}. Profesores: ${activeTeachers}. Ingreso semanal: ${currency}${weeklyIncome}. Gasto semanal: ${currency}${weeklyExpenses}. Prestamos activos: ${loans.length}. Campañas: ${activeCampaigns.length}.`;

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: `Eres un asesor experto en gestion escolar. Responde en español, de forma concisa (max 3 oraciones). ${context}` },
            { role: 'user', content: userMsg },
          ],
        }),
      });
      const data = await res.json();
      const aiContent = data.choices?.[0]?.message?.content || data.content || 'Lo siento, no pude procesar tu pregunta.';
      setAiMessages(prev => [...prev, { role: 'ai', text: aiContent }]);
    } catch {
      setAiMessages(prev => [...prev, { role: 'ai', text: 'Error de conexion. Intenta de nuevo.' }]);
    }
    setAiLoading(false);
    incrementStats({ aiAdvisorUses: 1 });
  };

  // Render stat sidebar
  const renderStatsSidebar = () => (
    <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 lg:gap-3 lg:min-w-[220px]">
      <StatBar label="Reputacion" emoji="🏆" value={Math.round(reputation)} max={100} color="#00ff88" />
      <StatBar label="Satisfaccion" emoji="😊" value={Math.round(studentSatisfaction)} max={100} color="#00ff88" />
      <StatBar label="Rendimiento" emoji="📊" value={Math.round(academicPerformance)} max={100} color="#00ff88" />
      <StatBar label="Padres" emoji="👨‍👩‍👧" value={Math.round(parentSatisfaction)} max={100} color="#00ff88" />
      <StatBar label="Moral Staff" emoji="😊" value={morale} max={100} color="#ffcc00" />
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-[#aaaaaa]">👩‍🎓 Estudiantes</span>
          <span className="font-bold text-white">{activeStudents}/{maxStudents}</span>
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-[#aaaaaa]">👨‍🏫 Profesores</span>
          <span className="font-bold text-white">{activeTeachers}</span>
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-[#aaaaaa]">💰 Ingreso semanal</span>
          <span className="font-bold text-[#00ff88]">+{currency}{weeklyIncome.toLocaleString()}</span>
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-[#aaaaaa]">💸 Gasto semanal</span>
          <span className="font-bold text-[#ff4444]">-{currency}{weeklyExpenses.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );

  // Tabs definition
  const tabs = [
    { id: 'overview', label: '📋' },
    { id: 'events', label: '⚡' },
    { id: 'teachers', label: '👨‍🏫' },
    { id: 'students', label: '👩‍🎓' },
    { id: 'finances', label: '💰' },
    { id: 'building', label: '🏗️' },
    { id: 'ai', label: '🤖' },
    { id: 'achievements', label: '🏆' },
    { id: 'weather', label: '🌤️' },
    { id: 'rivals', label: '🏫' },
    { id: 'skills', label: '🌟' },
    { id: 'news', label: '📰' },
    { id: 'shop', label: '🛒' },
    { id: 'challenges', label: '🎯' },
    { id: 'marketing', label: '📢' },
    { id: 'loans', label: '🏦' },
    { id: 'transport', label: '🚌' },
    { id: 'campus', label: '🗺️' },
    { id: 'decisions', label: '📝' },
    { id: 'expansion', label: '🔨' },
    { id: 'staff-new', label: '👤' },
    { id: 'alumni', label: '🎓' },
    { id: 'decoration', label: '🎨' },
    { id: 'parents', label: '👨‍👩‍👧' },
    { id: 'minigames', label: '🎮' },
    { id: 'records', label: '📊' },
    { id: 'settings', label: '⚙️' },
  ];

  // Speed labels for control buttons
  const speedLabels: Record<number, string> = {
    0: '⏸️',
    1: '▶️',
    2: '⏩',
    5: '⏩⏩',
    10: '⏩⏩⏩',
    50: '🔥',
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      {victoryAchieved && <ConfettiEffect />}

      {/* Auto-save indicator */}
      <div className={`save-indicator ${!paused && !gameOver ? 'visible' : ''}`}>
        💾 {paused ? '⏸ Pausado' : 'Guardando...'}
      </div>

      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a] border-b border-[#222222] px-3 py-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg">🏫</span>
          <div className="min-w-0">
            <div className="text-xs font-bold text-white truncate">{schoolName}</div>
            <div className="text-[10px] text-[#555555]">{directorName} | S{currentWeek} | {currentMonth}/{currentYear} | {getWeatherEmoji(weather.current)} {Math.round(weather.temperature)}°C</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-[#0d0d0d] border border-[#222222] rounded px-2 py-1 text-xs font-bold">
            <span className={money >= 0 ? 'text-[#00ff88]' : 'text-[#ff4444]'}>{currency}{money.toLocaleString()}</span>
            <span className={`text-[9px] ml-1 ${weeklyIncome - weeklyExpenses >= 0 ? 'text-[#00ff88]/60' : 'text-[#ff4444]/60'}`}>
              {weeklyIncome - weeklyExpenses >= 0 ? '▲' : '▼'}
            </span>
          </div>
          <Badge variant="outline" className={`text-[10px] border-[#ff4444] text-[#ff4444] ${pendingEvents.length > 0 ? 'animate-pulse' : ''}`}>
            {pendingEvents.length > 0 ? `${pendingEvents.length} ⚡` : '✓'}
          </Badge>
          <div className="flex gap-1">
            {([1, 2, 5, 10, 50] as const).map(speed => (
              <button
                key={speed}
                onClick={() => { setTimeSpeed(speed); sounds.click(); }}
                className={`px-1.5 py-1 rounded text-xs transition-all ${timeSpeed === speed ? 'bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/30' : 'bg-[#111111] text-[#555555] hover:text-white border border-[#222222]'}`}
              >{speedLabels[speed]}</button>
            ))}
            <button
              onClick={() => { togglePause(); sounds.click(); }}
              className={`px-1.5 py-1 rounded text-xs transition-all ${paused ? 'bg-[#ffcc00]/20 text-[#ffcc00] border border-[#ffcc00]/30' : 'bg-[#111111] text-[#555555] hover:text-white border border-[#222222]'}`}
            >{paused ? '▶️' : '⏸️'}</button>
          </div>
        </div>
      </header>

      {/* Tutorial Banner */}
      {tutorialStep > 0 && tutorialStep <= 5 && (
        <div className="bg-[#0a1a10] border border-[#00ff88]/30 px-3 py-2 flex items-center gap-2">
          <span className="text-sm">💡</span>
          <p className="text-xs text-[#00ff88] flex-1">
            {tutorialStep === 1 && '¡Bienvenido Director! Primero configura tu API de IA en la pantalla de inicio para habilitar eventos generados por IA.'}
            {tutorialStep === 2 && 'Consejo: Contrata profesores de calidad — es la inversion mas importante para tu escuela.'}
            {tutorialStep === 3 && 'Tip: No gastes todo tu capital en la construccion. Guarda un fondo de emergencia.'}
            {tutorialStep === 4 && 'Los eventos requieren decisiones sabias. Lee bien las consecuencias antes de elegir.'}
            {tutorialStep === 5 && 'Usa la velocidad Turbo (tecla T) para avanzar rapidamente cuando estes seguro.'}
          </p>
          <button onClick={() => { setTutorialStep(tutorialStep + 1); sounds.click(); }} className="text-[10px] text-[#888899] hover:text-white whitespace-nowrap">
            Siguiente →
          </button>
          <button onClick={() => { setTutorialStep(0); sounds.click(); }} className="text-[10px] text-[#555555] hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Rotating Tips Bar */}
      <div className="bg-[#0d0d0d] border-b border-[#222222] px-3 py-1.5 flex items-center justify-between overflow-hidden">
        <p
          className={`text-xs text-[#aaaaaa] transition-opacity duration-400 flex-1 ${tipVisible ? 'opacity-100' : 'opacity-0'}`}
        >
          {tips[currentTipIndex]}
        </p>
        <span className="text-[9px] text-[#444444] hidden sm:inline ml-3 whitespace-nowrap">⌨️ Space=Pausa 1/2/5/0=Vel T=Turbo</span>
      </div>

      {/* Main Content */}
      <main className="flex flex-col lg:flex-row gap-3 p-3">
        {/* Stats Sidebar */}
        <aside className="lg:sticky lg:top-16 lg:self-start">
          {renderStatsSidebar()}
        </aside>

        {/* Tab Content */}
        <div className="flex-1 min-w-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-[#0a0a0a] border border-[#222222] w-full h-10 flex overflow-x-auto scrollbar-hide">
              {tabs.map(tab => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="text-xs data-[state=active]:bg-[#111111] data-[state=active]:text-[#00ff88] data-[state=active]:shadow-none px-2 h-8 flex-shrink-0"
                >{tab.label}</TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="overview" className="mt-3"><OverviewTab schoolName={schoolName} currentWeek={currentWeek} activeStudents={activeStudents} maxStudents={maxStudents} activeTeachers={activeTeachers} reputation={reputation} studentSatisfaction={studentSatisfaction} academicPerformance={academicPerformance} parentSatisfaction={parentSatisfaction} money={money} currency={currency} weeklyIncome={weeklyIncome} weeklyExpenses={weeklyExpenses} monthlyExpenses={monthlyExpenses} weather={weather} buildingSize={buildingSize} monthlyReports={monthlyReports} financialHistory={financialHistory} morale={morale} loans={loans} notifications={notifications} /></TabsContent>
            <TabsContent value="events" className="mt-3"><EventsTab events={events} pendingEvents={pendingEvents} handleOpenEventDialog={handleOpenEventDialog} /></TabsContent>
            <TabsContent value="teachers" className="mt-3"><TeachersTab teachers={teachers} currency={currency} onFireTeacher={(id) => { sounds.click(); setFireTeacherId(id); openDialogWithPause(); }} /></TabsContent>
            <TabsContent value="students" className="mt-3"><StudentsTab students={students} activeStudents={activeStudents} maxStudents={maxStudents} studentSatisfaction={studentSatisfaction} onExpelStudent={(id) => { sounds.click(); setExpelStudentId(id); openDialogWithPause(); }} /></TabsContent>
            <TabsContent value="finances" className="mt-3"><FinancesTab money={money} currency={currency} loans={loans} teachers={teachers} weeklyIncome={weeklyIncome} weeklyExpenses={weeklyExpenses} monthlyExpenses={monthlyExpenses} monthlyFee={monthlyFee} activeStudents={activeStudents} storeData={store} /></TabsContent>
            <TabsContent value="building" className="mt-3"><BuildingTab classrooms={classrooms} cafeteriaBuilt={cafeteriaBuilt} cafeteriaSize={cafeteriaSize} libraryEnabled={libraryEnabled} computerLabEnabled={computerLabEnabled} meetingRoomEnabled={meetingRoomEnabled} sportsAreaEnabled={sportsAreaEnabled} buildingSize={buildingSize} cameraCount={cameraCount} internetType={internetType} bathroomCount={store.bathroomCount || 0} bathroomQuality={store.bathroomQuality || 'basic'} activeStudents={activeStudents} maxStudents={maxStudents} /></TabsContent>
            <TabsContent value="ai" className="mt-3"><AiAdvisorTab aiMessages={aiMessages} aiInput={aiInput} aiLoading={aiLoading} setAiInput={setAiInput} handleAiSend={handleAiSend} /></TabsContent>
            <TabsContent value="achievements" className="mt-3"><AchievementsTab achievements={achievements} /></TabsContent>
            <TabsContent value="marketing" className="mt-3"><MarketingTab activeCampaigns={activeCampaigns} money={money} currency={currency} currentWeek={currentWeek} currentDay={currentDay} startCampaign={startCampaign} addNotification={addNotification} sounds={sounds} /></TabsContent>
            <TabsContent value="loans" className="mt-3"><LoansTab loans={loans} money={money} currency={currency} currentDay={currentDay} addLoan={addLoan} makeLoanPayment={makeLoanPayment} addNotification={addNotification} sounds={sounds} /></TabsContent>
            <TabsContent value="expansion" className="mt-3"><ExpansionTab expansions={expansions} money={money} currency={currency} buildingSize={buildingSize} currentWeek={currentWeek} currentDay={currentDay} addExpansion={addExpansion} completeExpansions={completeExpansions} addNotification={addNotification} sounds={sounds} /></TabsContent>
            <TabsContent value="weather" className="mt-3"><WeatherTab weather={weather} currentMonth={currentMonth} /></TabsContent>
            <TabsContent value="rivals" className="mt-3"><RivalsTab rivals={rivals} schoolName={schoolName} reputation={reputation} activeStudents={activeStudents} /></TabsContent>
            <TabsContent value="skills" className="mt-3"><SkillsTab directorSkills={directorSkills} money={money} currency={currency} upgradeSkill={upgradeSkill} sounds={sounds} /></TabsContent>
            <TabsContent value="news" className="mt-3"><NewsTab newsHistory={newsHistory} /></TabsContent>
            <TabsContent value="shop" className="mt-3"><ShopTab shopItems={shopItems} money={money} currency={currency} purchaseShopItem={purchaseShopItem} sounds={sounds} /></TabsContent>
            <TabsContent value="challenges" className="mt-3"><ChallengesTab activeChallenges={activeChallenges} /></TabsContent>
            <TabsContent value="transport" className="mt-3"><TransportTab transportRoutes={transportRoutes} money={money} currency={currency} addTransportRoute={addTransportRoute} toggleTransportRoute={toggleTransportRoute} sounds={sounds} /></TabsContent>
            <TabsContent value="campus" className="mt-3"><CampusTab buildingSize={buildingSize} classrooms={classrooms} cafeteriaBuilt={cafeteriaBuilt} libraryEnabled={libraryEnabled} computerLabEnabled={computerLabEnabled} sportsAreaEnabled={sportsAreaEnabled} cameraCount={cameraCount} internetType={internetType} schoolName={schoolName} activeStudents={activeStudents} teachers={teachers} reputation={reputation} money={money} currency={currency} weather={weather} /></TabsContent>
            <TabsContent value="decisions" className="mt-3"><DecisionsTab decisionHistory={decisionHistory} eventsResolved={eventsResolved} currency={currency} /></TabsContent>
            <TabsContent value="staff-new" className="mt-3"><StaffTab staff={staff} money={money} currency={currency} morale={morale} hireStaff={hireStaff} fireStaffMember={fireStaffMember} generateStaffCandidates={generateStaffCandidates} sounds={sounds} /></TabsContent>
            <TabsContent value="alumni" className="mt-3"><AlumniTab alumni={alumni} currency={currency} processAlumniDonation={processAlumniDonation} sounds={sounds} /></TabsContent>
            <TabsContent value="decoration" className="mt-3"><DecorationTab decorations={decorations} uniformColors={uniformColors} schoolMotto={schoolMotto} schoolMascot={schoolMascot} money={money} currency={currency} purchaseDecoration={purchaseDecoration} setUniformColors={setUniformColors} setSchoolMotto={setSchoolMotto} setSchoolMascot={setSchoolMascot} sounds={sounds} /></TabsContent>
            <TabsContent value="parents" className="mt-3"><ParentsTab parentSatisfaction={parentSatisfaction} parentEvents={parentEvents} money={money} currency={currency} currentDay={currentDay} ptaMeetingOpen={ptaMeetingOpen} setPtaMeetingOpen={setPtaMeetingOpen} adjustMoney={store.adjustMoney.bind(store)} adjustReputation={adjustReputation} adjustMorale={adjustMorale} addNotification={addNotification} sounds={sounds} /></TabsContent>
            <TabsContent value="minigames" className="mt-3"><MiniGamesTab sounds={sounds} onEarnMoney={(amount) => store.adjustMoney(amount)} /></TabsContent>
            <TabsContent value="records" className="mt-3"><RecordsTab bestSchoolStats={bestSchoolStats} totalPlayTime={totalPlayTime} eventsResolved={eventsResolved} activeStudents={activeStudents} reputation={reputation} currentWeek={currentWeek} schoolName={schoolName} currency={currency} rivals={rivals} /></TabsContent>
            <TabsContent value="settings" className="mt-3"><SettingsTab soundVolume={soundVolume} musicVolume={musicVolume} musicMuted={musicMuted} timeSpeed={timeSpeed} currentMusicTrack={currentMusicTrack ?? ''} setSoundVolume={setSoundVolume} setMusicVolume={setMusicVolume} setMusicMuted={setMusicMuted} setCurrentMusicTrack={setCurrentMusicTrack} saveSlots={saveSlots} createSaveSlot={createSaveSlot} deleteSaveSlot={deleteSaveSlot} setDeleteDialogOpen={setDeleteDialogOpen} startNewGame={startNewGame} /></TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Auto-enrollment notification */}
      {enrollNotify && (
        <div className="fixed bottom-4 right-4 z-50 animate-bounce">
          <div className="bg-[#0a1a10] border border-[#00ff88]/50 rounded-lg px-4 py-3 shadow-lg shadow-[#00ff88]/10">
            <div className="text-sm font-bold text-[#00ff88]">👩‍🎓 +{enrollNotify.count} nuevos estudiantes</div>
            <div className="text-[10px] text-[#aaaaaa]">Inscripcion automatica</div>
          </div>
        </div>
      )}

      {/* Event Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => { if (!open) handleCloseEventDialog(); }}>
        <DialogContent className="bg-[#0d0d0d] border-[#333333] text-white max-w-md">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="text-2xl">{selectedEvent.emoji}</span>
                  <span>{selectedEvent.title}</span>
                </DialogTitle>
                <DialogDescription className="text-[#aaaaaa]">{selectedEvent.description}</DialogDescription>
              </DialogHeader>

              {!eventResolved ? (
                <div className="space-y-2">
                  {selectedEvent.options.map((opt, i) => {
                    const hasRep = opt.reputationChange !== 0;
                    const hasMoney = opt.moneyChange !== 0;
                    const hasSat = opt.satisfactionChange !== 0;
                    return (
                      <button
                        key={i}
                        onClick={() => handleResolveEvent(selectedEvent.id, i)}
                        className="w-full text-left bg-[#111111] border border-[#333333] rounded-lg px-4 py-3 hover:border-[#00ff88]/50 transition-all"
                      >
                        <div className="text-sm font-bold text-white">{opt.text}</div>
                        <div className="flex gap-3 mt-1 text-[10px]">
                          {hasRep && <span className={opt.reputationChange > 0 ? 'text-[#00ff88]' : 'text-[#ff4444]'}>🏆 {opt.reputationChange > 0 ? '+' : ''}{opt.reputationChange}</span>}
                          {hasMoney && <span className={opt.moneyChange > 0 ? 'text-[#00ff88]' : 'text-[#ff4444]'}>💰 {opt.moneyChange > 0 ? '+' : ''}{currency}{opt.moneyChange}</span>}
                          {hasSat && <span className={opt.satisfactionChange > 0 ? 'text-[#00ff88]' : 'text-[#ff4444]'}>😊 {opt.satisfactionChange > 0 ? '+' : ''}{opt.satisfactionChange}</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-[#111111] border border-[#00ff88]/30 rounded-lg p-4">
                  <div className="text-sm text-[#cccccc]">{consequenceText}</div>
                </div>
              )}

              <DialogFooter>
                <Button variant="ghost" size="sm" onClick={handleCloseEventDialog}
                  className="text-[#aaaaaa] hover:text-white">
                  {eventResolved ? 'Cerrar' : 'Ignorar'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Staff Event Dialog */}
      <Dialog open={!!staffEvent} onOpenChange={(open) => { if (!open) handleCloseStaffEvent(); }}>
        <DialogContent className="bg-[#0d0d0d] border-[#333333] text-white max-w-md">
          {staffEvent && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="text-2xl">{staffEvent.emoji}</span>
                  <span>{staffEvent.title}</span>
                  <Badge variant="outline" className="border-[#ffcc00] text-[#ffcc00] text-[10px]">Evento de personal</Badge>
                </DialogTitle>
                <DialogDescription className="text-[#aaaaaa]">{staffEvent.description}</DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                {staffEvent.options.map((opt, i) => {
                  const hasRep = opt.reputationChange !== 0;
                  const hasMoney = opt.moneyChange !== 0;
                  return (
                    <button
                      key={i}
                      onClick={() => handleResolveStaffEvent(i)}
                      className="w-full text-left bg-[#111111] border border-[#333333] rounded-lg px-4 py-3 hover:border-[#ffcc00]/50 transition-all"
                    >
                      <div className="text-sm font-bold text-white">{opt.text}</div>
                      <div className="flex gap-3 mt-1 text-[10px]">
                        {hasRep && <span className={opt.reputationChange > 0 ? 'text-[#00ff88]' : 'text-[#ff4444]'}>🏆 {opt.reputationChange > 0 ? '+' : ''}{opt.reputationChange}</span>}
                        {hasMoney && <span className={opt.moneyChange > 0 ? 'text-[#00ff88]' : 'text-[#ff4444]'}>💰 {opt.moneyChange > 0 ? '+' : ''}{currency}{opt.moneyChange}</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
              <DialogFooter>
                <Button variant="ghost" size="sm" onClick={handleCloseStaffEvent}
                  className="text-[#aaaaaa] hover:text-white">Ignorar</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Fire Teacher Confirmation */}
      <AlertDialog open={!!fireTeacherId} onOpenChange={(open) => { if (!open) { setFireTeacherId(null); closeDialogWithResume(); } }}>
        <AlertDialogContent className="bg-[#0d0d0d] border-[#333333] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#ff4444]">🔥 Despedir profesor</AlertDialogTitle>
            <AlertDialogDescription className="text-[#aaaaaa]">¿Estas seguro de que deseas despedir a este profesor? Esta accion no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#111111] border-[#333333] text-[#aaaaaa] hover:text-white" onClick={closeDialogWithResume}>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-[#ff4444] hover:bg-[#ff6666] text-white" onClick={handleFireTeacher}>Despedir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Expel Student Confirmation */}
      <AlertDialog open={!!expelStudentId} onOpenChange={(open) => { if (!open) { setExpelStudentId(null); closeDialogWithResume(); } }}>
        <AlertDialogContent className="bg-[#0d0d0d] border-[#333333] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#ff4444]">❌ Expulsar estudiante</AlertDialogTitle>
            <AlertDialogDescription className="text-[#aaaaaa]">¿Estas seguro de que deseas expulsar a este estudiante? Esta accion no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#111111] border-[#333333] text-[#aaaaaa] hover:text-white" onClick={closeDialogWithResume}>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-[#ff4444] hover:bg-[#ff6666] text-white" onClick={handleExpelStudent}>Expulsar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Victory Dialog */}
      <Dialog open={victoryAchieved && !victoryDismissed} onOpenChange={(open) => { if (!open) setVictoryDismissed(true); }}>
        <DialogContent className="bg-[#0d0d0d] border-[#ffcc00]/50 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl text-[#ffcc00]">🎉 ¡Felicidades! 🎉</DialogTitle>
            <DialogDescription className="text-center text-[#aaaaaa]">
              Has alcanzado la victoria por {victoryType}
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-4 space-y-3">
            <div className="text-6xl">🏆</div>
            <div className="text-sm text-[#cccccc]">Tu escuela ha sobrevivido y prosperado.</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#111111] rounded p-2">
                <div className="text-[10px] text-[#aaaaaa]">Semana</div>
                <div className="text-lg font-bold text-white">S{currentWeek}</div>
              </div>
              <div className="bg-[#111111] rounded p-2">
                <div className="text-[10px] text-[#aaaaaa]">Reputacion</div>
                <div className="text-lg font-bold text-[#00ff88]">{Math.round(reputation)}</div>
              </div>
              <div className="bg-[#111111] rounded p-2">
                <div className="text-[10px] text-[#aaaaaa]">Estudiantes</div>
                <div className="text-lg font-bold text-[#4488ff]">{activeStudents}</div>
              </div>
              <div className="bg-[#111111] rounded p-2">
                <div className="text-[10px] text-[#aaaaaa]">Dinero</div>
                <div className="text-lg font-bold text-[#ffcc00]">{currency}{money.toLocaleString()}</div>
              </div>
            </div>
            <div className="text-[10px] text-[#555555]">Logros: {achievements.filter(a => a.unlocked).length}/{achievements.length}</div>
          </div>
          <DialogFooter className="justify-center gap-3">
            <Button onClick={() => { setVictoryDismissed(true); togglePause(); sounds.click(); }} className="bg-[#ffcc00] text-black font-bold hover:bg-[#ffdd33]">
              Continuar jugando
            </Button>
            <Button onClick={() => { setVictoryDismissed(true); startNewGame(); sounds.click(); }} variant="outline" className="border-[#333] text-[#aaaaaa] hover:text-white">
              Nuevo Juego
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Game Over Dialog */}
      <Dialog open={gameOver && !victoryAchieved} onOpenChange={() => {}}>
        <DialogContent className="bg-[#0d0d0d] border-[#ff4444]/50 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl text-[#ff4444]">💀 ¡Bancarrota!</DialogTitle>
            <DialogDescription className="text-center text-[#aaaaaa]">
              Tu escuela se ha quedado sin dinero. El juego ha terminado.
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-4">
            <div className="text-6xl mb-3">😢</div>
            <div className="text-sm text-[#cccccc]">Llegaste a la semana S{currentWeek} con {activeStudents} estudiantes.</div>
          </div>
          <DialogFooter className="justify-center">
            <Button onClick={() => { startNewGame(); }} className="bg-[#ff4444] text-white font-bold hover:bg-[#ff6666]">
              Nuevo Juego
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Game Dialog */}
      <DeleteGameDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </div>
  );
}
