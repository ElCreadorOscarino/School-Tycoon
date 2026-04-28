'use client';
import React from 'react';
import type { GameEvent } from '@/lib/game-types';

interface TabProps {
  events: GameEvent[];
  pendingEvents: GameEvent[];
  handleOpenEventDialog: (event: GameEvent) => void;
}

const EventsTab = React.memo(function EventsTab({
  events,
  pendingEvents,
  handleOpenEventDialog,
}: TabProps) {
  return (
    <div className="space-y-4">
      {pendingEvents.length > 0 && (
        <div>
          <h3 className="text-sm text-[#ffcc00] font-bold mb-3">⚡ Eventos pendientes ({pendingEvents.length})</h3>
          <div className="space-y-3">
            {pendingEvents.map((event) => (
              <div
                key={event.id}
                className={`bg-[#0d0d0d] border rounded-lg p-4 cursor-pointer transition-all hover:border-[#ffcc00]/50 ${
                  event.impact === 'positive' ? 'border-[#00ff88]/30' :
                  event.impact === 'negative' ? 'border-[#ff4444]/30' :
                  'border-[#ffcc00]/30'
                }`}
                onClick={() => handleOpenEventDialog(event)}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{event.emoji}</span>
                  <div className="flex-1">
                    <div className="font-bold text-sm text-white">{event.title}</div>
                    <div className="text-xs text-[#aaaaaa] mt-1">{event.description}</div>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {event.options.map((opt, oi) => (
                        <span key={oi} className="text-[10px] bg-[#111111] border border-[#333333] rounded px-2 py-0.5 text-[#aaaaaa]">
                          {opt.text}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="text-[10px] text-[#555555]">S{Math.floor(event.day / 7)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {events.length > 0 && (
        <div>
          <h3 className="text-sm text-[#aaaaaa] font-bold mb-3">📜 Eventos pasados ({events.filter(e => e.resolved).length})</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {events.filter(e => e.resolved).reverse().slice(0, 20).map((event) => (
              <div key={event.id} className="bg-[#0d0d0d] border border-[#222222] rounded px-3 py-2 text-xs flex items-start gap-2">
                <span>{event.emoji}</span>
                <div className="flex-1">
                  <span className="text-[#cccccc]">{event.title}</span>
                  {event.chosenOption !== undefined && event.options[event.chosenOption] && (
                    <span className="text-[#555555] ml-2">→ {event.options[event.chosenOption].text}</span>
                  )}
                </div>
                <span className="text-[#555555] shrink-0">S{Math.floor(event.day / 7)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {pendingEvents.length === 0 && events.length === 0 && (
        <div className="text-center py-8 text-[#aaaaaa] text-sm">
          No hay eventos aun. Los eventos aleatorios ocurriran con el tiempo.
        </div>
      )}
    </div>
  );
});

export default EventsTab;
