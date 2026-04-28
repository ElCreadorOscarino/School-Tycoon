'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { EXPANSION_OPTIONS } from '@/lib/game-types';
import type { BuildingExpansion, GameNotification } from '@/lib/game-types';

interface TabProps {
  expansions: BuildingExpansion[];
  money: number;
  currency: string;
  buildingSize: string;
  currentWeek: number;
  currentDay: number;
  addExpansion: (expansion: BuildingExpansion) => void;
  completeExpansions: () => void;
  addNotification: (n: GameNotification) => void;
  sounds: { success: () => void };
}

const ExpansionTab = React.memo(function ExpansionTab({
  expansions,
  money,
  currency,
  buildingSize,
  currentWeek,
  currentDay,
  addExpansion,
  completeExpansions,
  addNotification,
  sounds,
}: TabProps) {
  return (
    <div className="space-y-4">
      {expansions.length > 0 && (
        <div>
          <h3 className="text-sm text-[#00ff88] font-bold mb-3">🏗️ Expansiones en progreso ({expansions.length})</h3>
          <div className="space-y-2">
            {expansions.filter(e => !e.completed).map(exp => {
              const elapsed = currentWeek - exp.startedAtWeek;
              const pct = Math.min(100, (elapsed / exp.timeWeeks) * 100);
              const remaining = exp.timeWeeks - elapsed;
              return (
                <div key={exp.id} className="bg-[#0d0d0d] border border-[#00ff88]/20 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-white">{exp.name}</span>
                    <Badge variant="outline" className="border-[#00ff88] text-[#00ff88] text-[10px]">
                      {remaining > 0 ? `${remaining} sem` : 'Listo!'}
                    </Badge>
                  </div>
                  <Progress value={pct} className="h-2 [&>div]:bg-[#00ff88]" />
                  {remaining <= 0 && (
                    <Button size="sm" className="mt-2 text-[10px] h-7 bg-[#00ff88] text-black font-bold"
                      onClick={() => { completeExpansions(); sounds.success(); }}>
                      Completar
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm text-[#aaaaaa] font-bold mb-3">Nuevas expansiones</h3>
        <div className="space-y-2">
          {EXPANSION_OPTIONS.map((opt, i) => {
            const typeEmoji: Record<string, string> = { classroom: '🏫', library: '📚', cafeteria: '🍽️', sports: '⚽', lab: '💻' };
            return (
              <div key={i} className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-white">{typeEmoji[opt.type] || '🏗️'} {opt.name}</div>
                  <div className="text-[10px] text-[#aaaaaa] mt-1">
                    Costo: {currency}{opt.cost.toLocaleString()} | Tiempo: {opt.timeWeeks} sem
                    {opt.capacity > 0 ? ` | Capacidad: +${opt.capacity}` : ''}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    if (money < opt.cost) return;
                    addExpansion({
                      id: `expansion-${Date.now()}`,
                      type: opt.type,
                      name: opt.name,
                      cost: opt.cost,
                      timeWeeks: opt.timeWeeks,
                      startedAtWeek: currentWeek,
                      completed: false,
                    });
                    sounds.success();
                    addNotification({
                      id: `notif-exp-${Date.now()}`,
                      day: currentDay,
                      message: `🏗️ Expansion "${opt.name}" iniciada`,
                      emoji: '🏗️',
                      read: false,
                    });
                  }}
                  disabled={money < opt.cost}
                  className="text-[10px] h-8 bg-[#00ff88] hover:bg-[#33ffaa] text-black font-bold"
                >{currency}{opt.cost.toLocaleString()}</Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default ExpansionTab;
