'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '@/lib/game-store';
import { sounds } from '@/lib/sounds';
import type { GameEvent, WeatherState } from '@/lib/game-types';
import {
  getEligibleEvents,
  getRandomWeightedEvent,
  EVENT_COOLDOWN_WEEKS,
} from '@/lib/event-pool';
import type { LocalEventTemplate } from '@/lib/event-pool';
import { getWeatherEmoji } from '@/lib/weather-system';

// ============================================
// useGameLoop Hook
// Extracted from DashboardScreen.tsx
// Manages: game loop, event generation, weather
// ambient sounds, auto-popup, enrollment notify,
// and all event dialog handlers.
// ============================================

interface UseGameLoopParams {
  paused: boolean;
  gameOver: boolean;
  timeSpeed: number;
  currentWeek: number;
  currentDay: number;
  pendingEvents: GameEvent[];
  gameStarted: boolean;
  victoryAchieved: boolean;
  weather: WeatherState;
}

export function useGameLoop({
  paused,
  gameOver,
  timeSpeed,
  currentWeek,
  currentDay,
  pendingEvents,
  gameStarted,
  victoryAchieved,
  weather,
}: UseGameLoopParams) {
  // ---- Local State ----
  const [selectedEvent, setSelectedEvent] = useState<GameEvent | null>(null);
  const [eventResolved, setEventResolved] = useState(false);
  const [consequenceText, setConsequenceText] = useState('');
  const [staffEvent, setStaffEvent] = useState<GameEvent | null>(null);
  const [enrollNotify, setEnrollNotify] = useState<{ count: number } | null>(null);

  // ---- Store ref for non-reactive bulk reads ----
  const storeRef = useRef(useGameStore.getState());
  useEffect(() => {
    const unsub = useGameStore.subscribe((state) => {
      storeRef.current = state;
    });
    return unsub;
  }, []);

  // ---- Reactive subscriptions for values needed inside the hook ----
  const activeStudents = useGameStore((s) => s.activeStudents);
  const notifications = useGameStore((s) => s.notifications);
  const currentMonth = useGameStore((s) => s.currentMonth);
  const schoolName = useGameStore((s) => s.schoolName);
  const reputation = useGameStore((s) => s.reputation);
  const studentSatisfaction = useGameStore((s) => s.studentSatisfaction);
  const academicPerformance = useGameStore((s) => s.academicPerformance);
  const parentSatisfaction = useGameStore((s) => s.parentSatisfaction);
  const money = useGameStore((s) => s.money);
  const achievements = useGameStore((s) => s.achievements);
  const lastStaffEventWeek = useGameStore((s) => s.lastStaffEventWeek);

  // ---- Store actions ----
  const advanceWeek = useGameStore((s) => s.advanceWeek);
  const togglePause = useGameStore((s) => s.togglePause);
  const addPendingEvent = useGameStore((s) => s.addPendingEvent);
  const addNotification = useGameStore((s) => s.addNotification);
  const clearExtraPendingEvents = useGameStore((s) => s.clearExtraPendingEvents);
  const resolveEvent = useGameStore((s) => s.resolveEvent);
  const markNotificationRead = useGameStore((s) => s.markNotificationRead);
  const incrementStats = useGameStore((s) => s.incrementStats);
  const addDecisionRecord = useGameStore((s) => s.addDecisionRecord);
  const getMaxStudents = useGameStore((s) => s.getMaxStudents);

  const maxStudents = getMaxStudents();

  // ---- Refs ----
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const eventCooldownRef = useRef(6); // Start with 6 weeks before first event
  const lastWeekRef = useRef(currentWeek);
  const eventJustClosedRef = useRef(false); // Prevent immediate re-trigger after closing
  const dialogOpenRef = useRef(false);
  const wasManuallyPausedRef = useRef(false);
  const prevActiveStudentsRef = useRef(activeStudents);
  const weatherChangeRef = useRef(weather.current);
  const lastStaffEventWeekRef = useRef(lastStaffEventWeek); // Track locally to avoid store mutation
  const eventGeneratedThisWeekRef = useRef(false); // Prevent multiple events per week
  const justClosedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null); // Timer for eventJustClosedRef delayed clear
  const recentEventsRef = useRef<Map<string, number>>(new Map()); // title -> weekUsed
  const aiEventRetryRef = useRef(0); // track consecutive AI failures
  const lastEventShownWeekRef = useRef(0); // Week when last event dialog was shown
  const shownEventIdsRef = useRef<Set<string>>(new Set());
  const eventPopupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ============================================
  // Helper Functions
  // ============================================

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
      clearExtraPendingEvents();
      // Only resume if the user hadn't manually paused before the dialog
      if (!wasManuallyPausedRef.current && paused) {
        togglePause();
      }
    }
  }, [paused, togglePause, clearExtraPendingEvents]);

  // Helper to convert template to GameEvent
  const templateToGameEvent = useCallback(
    (template: LocalEventTemplate, prefix: string): GameEvent => ({
      id: `${prefix}-${currentWeek}-${Date.now()}`,
      day: currentDay,
      title: template.title,
      description: template.description,
      emoji: template.emoji,
      impact: template.impact,
      options: template.options.map((o) => ({
        text: o.text,
        reputationChange: o.reputationChange,
        moneyChange: o.moneyChange,
        satisfactionChange: o.satisfactionChange,
        consequence: o.consequence,
      })),
      resolved: false,
    }),
    [currentWeek, currentDay],
  );

  // ============================================
  // Game Loop - advanceWeek instead of advanceDay
  // ============================================
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
    }, intervalMs);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
  }, [paused, gameOver, timeSpeed, advanceWeek]);

  // ============================================
  // Event generation: AI first (every 3 weeks), fallback to local pool
  // ============================================
  useEffect(() => {
    if (dialogOpenRef.current) return;
    if (eventJustClosedRef.current) return; // Skip ticks while just-closed flag is active
    if (paused || gameOver || victoryAchieved) return;
    if (currentWeek === lastWeekRef.current) return;
    lastWeekRef.current = currentWeek;

    // Don't clear eventJustClosedRef immediately — use a delayed clear so it
    // blocks event generation for at least 2 seconds (~2-3 game weeks at speed 1).
    if (justClosedTimerRef.current) clearTimeout(justClosedTimerRef.current);
    justClosedTimerRef.current = setTimeout(() => {
      eventJustClosedRef.current = false;
    }, 2000);

    // Reset per-week generation flag at the start of each new week
    eventGeneratedThisWeekRef.current = false;

    // Decrease cooldown by 1 per week (not per tick)
    if (eventCooldownRef.current > 0) {
      eventCooldownRef.current -= 1;
      return;
    }
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
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const monthName = months[(currentMonth - 1 + 12) % 12];
    const seasonMap: Record<string, string> = {
      'Enero': 'winter', 'Febrero': 'winter', 'Marzo': 'spring', 'Abril': 'spring',
      'Mayo': 'spring', 'Junio': 'summer', 'Julio': 'summer', 'Agosto': 'summer',
      'Septiembre': 'fall', 'Octubre': 'fall', 'Noviembre': 'fall', 'Diciembre': 'winter',
    };
    const season = seasonMap[monthName] || 'spring';

    const store = storeRef.current;

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
      const tpl = getRandomWeightedEvent(eligible, store);
      if (!tpl) return;

      const newEvent = templateToGameEvent(tpl, 'event');
      addPendingEvent(newEvent);
      recentEventsRef.current.set(tpl.title, currentWeek);
      sounds.notification();
      addNotification({ id: `notif-event-${Date.now()}`, day: currentDay, message: `${tpl.emoji} ${tpl.title}`, emoji: tpl.emoji, read: false });
    };

    // Only ONE event type can generate per week to prevent stacking
    const rollForEvent = Math.random() < 0.30; // Reduced from 40% to 30%
    const rollForStaff = currentWeek - lastStaffEventWeekRef.current >= 10; // Increased from 8 to 10

    if (!rollForEvent && !rollForStaff) return;

    // Staff events have priority (every 10 weeks), otherwise regular event
    if (rollForStaff) {
      const staffEligible = getEligibleEvents(store, recentTitles, currentWeek).filter(e => e.isStaffEvent);
      if (staffEligible.length > 0) {
        const tpl = getRandomWeightedEvent(staffEligible, store);
        if (tpl) {
          lastStaffEventWeekRef.current = currentWeek;
          eventCooldownRef.current = 6; // Set cooldown to prevent stacking
          lastEventShownWeekRef.current = currentWeek;
          eventGeneratedThisWeekRef.current = true; // Mark this week as having generated an event
          const staffGameEvent = templateToGameEvent(tpl, 'staff');
          addPendingEvent(staffGameEvent);
          recentEventsRef.current.set(tpl.title, currentWeek);
          sounds.notification();
          addNotification({ id: `notif-staff-${Date.now()}`, day: currentDay, message: `👨‍🏫 ${tpl.title}`, emoji: tpl.emoji, read: false });
          return; // Only one event per tick
        }
      }
    }

    if (rollForEvent) {
      generateEvent();
    }
  }, [currentWeek, currentDay, paused, gameOver, victoryAchieved, pendingEvents.length, addPendingEvent, addNotification, lastStaffEventWeek, schoolName, reputation, studentSatisfaction, academicPerformance, parentSatisfaction, activeStudents, maxStudents, money, currentMonth, achievements, templateToGameEvent]);

  // ============================================
  // Weather ambient sounds
  // ============================================
  useEffect(() => {
    if (weather.current !== weatherChangeRef.current) {
      weatherChangeRef.current = weather.current;
      switch (weather.current) {
        case 'stormy':
          sounds.naturalDisaster();
          break;
        case 'rainy':
          sounds.eventNeutral();
          break;
        case 'hurricane':
          sounds.emergency();
          break;
        case 'sunny':
          sounds.eventPositive();
          break;
        case 'hot':
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

  // ============================================
  // Auto-popup new events AND PAUSE the game
  // (with delay to prevent stacking)
  // ============================================
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

  // ============================================
  // Auto-enrollment notification
  // ============================================
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

  // ============================================
  // Event Handlers
  // ============================================

  const handleResolveEvent = useCallback(
    (eventId: string, optionIndex: number) => {
      const event = pendingEvents.find((e) => e.id === eventId);
      if (!event) return;
      const option = event.options[optionIndex];
      if (!option) return;

      resolveEvent(eventId, optionIndex);
      setConsequenceText(option.consequence || 'Sin consecuencias adicionales.');
      setEventResolved(true);

      const relatedNotif = notifications.find((n) => n.message.includes(event.title));
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
    },
    [pendingEvents, resolveEvent, notifications, markNotificationRead, currentWeek, incrementStats, addDecisionRecord],
  );

  const handleCloseEventDialog = useCallback(() => {
    setSelectedEvent(null);
    setEventResolved(false);
    setConsequenceText('');
    closeDialogWithResume();
  }, [closeDialogWithResume]);

  const handleOpenEventDialog = useCallback(
    (event: GameEvent) => {
      setSelectedEvent(event);
      setEventResolved(false);
      setConsequenceText('');
      sounds.click();
      openDialogWithPause();
    },
    [openDialogWithPause],
  );

  const handleCloseStaffEvent = useCallback(() => {
    setStaffEvent(null);
    closeDialogWithResume();
  }, [closeDialogWithResume]);

  const handleResolveStaffEvent = useCallback(
    (optionIndex: number) => {
      if (!staffEvent) return;
      // Add to pendingEvents first so resolveEvent can find it
      addPendingEvent(staffEvent);
      resolveEvent(staffEvent.id, optionIndex);
      setStaffEvent(null);
      sounds.success();
      closeDialogWithResume();
    },
    [staffEvent, addPendingEvent, resolveEvent, closeDialogWithResume],
  );

  return {
    openDialogWithPause,
    closeDialogWithResume,
    handleResolveEvent,
    handleCloseEventDialog,
    handleOpenEventDialog,
    handleCloseStaffEvent,
    handleResolveStaffEvent,
    selectedEvent,
    setSelectedEvent,
    eventResolved,
    setEventResolved,
    consequenceText,
    staffEvent,
    setStaffEvent,
    enrollNotify,
  };
}
