'use client';
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import type { GameNotification } from '@/lib/game-types';

interface StatBarProps {
  label: string;
  emoji: string;
  value: number;
  max: number;
  color: string;
}

const StatBar = React.memo(function StatBar({ label, emoji, value, max, color }: StatBarProps) {
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

interface TabProps {
  parentSatisfaction: number;
  parentEvents: number;
  money: number;
  currency: string;
  currentDay: number;
  ptaMeetingOpen: boolean;
  setPtaMeetingOpen: (v: boolean) => void;
  adjustMoney: (amount: number) => void;
  adjustReputation: (amount: number) => void;
  adjustMorale: (amount: number) => void;
  addNotification: (n: GameNotification) => void;
  sounds: { click: () => void; success: () => void; error: () => void };
}

const ParentsTab = React.memo(function ParentsTab({
  parentSatisfaction,
  parentEvents,
  money,
  currency,
  currentDay,
  ptaMeetingOpen,
  setPtaMeetingOpen,
  adjustMoney,
  adjustReputation,
  adjustMorale,
  addNotification,
  sounds,
}: TabProps) {
  const ptaTopics = [
    { id: 'curriculum', label: '📚 Revision de Curriculo', cost: 500, repBonus: 3, satBonus: 2 },
    { id: 'safety', label: '🛡️ Seguridad Escolar', cost: 800, repBonus: 5, satBonus: 3 },
    { id: 'activities', label: '🎭 Actividades Extracurriculares', cost: 1200, repBonus: 4, satBonus: 5 },
    { id: 'nutrition', label: '🍽️ Nutricion y Cafeteria', cost: 600, repBonus: 2, satBonus: 4 },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">👨‍👩‍👧 Sistema de Padres</h3>
        <span className="text-xs text-[#888899]">{parentEvents} reuniones</span>
      </div>
      <div className="bg-[#0a0a10] border border-[#1e1e2e] rounded-lg p-3">
        <div className="text-[10px] text-[#888899] mb-1">Satisfaccion de Padres</div>
        <StatBar label="" emoji="" value={Math.round(parentSatisfaction)} max={100} color="#00ff88" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[#0a0a10] border border-[#1e1e2e] rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-white">{parentEvents}</div>
          <div className="text-[10px] text-[#888899]">Reuniones PTA</div>
        </div>
        <div className="bg-[#0a0a10] border border-[#1e1e2e] rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-[#00ff88]">{Math.round(parentSatisfaction)}%</div>
          <div className="text-[10px] text-[#888899]">Satisfaccion</div>
        </div>
      </div>
      {/* PTA Meeting Button */}
      <button
        onClick={() => { setPtaMeetingOpen(true); sounds.click(); }}
        className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-left hover:bg-[#252525] hover:border-[#00ff88]/50 transition-all"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🤝</span>
          <div>
            <div className="text-sm font-bold text-white">Convocar Reunion PTA</div>
            <div className="text-[10px] text-[#aaaaaa]">Costo: {currency}500-{currency}1,200 · +Reputacion y Satisfaccion</div>
          </div>
        </div>
      </button>
      <div className="bg-[#0a0a10] border border-[#1e1e2e] rounded-lg p-3">
        <h4 className="text-xs font-bold text-white mb-2">💡 Consejos para Padres</h4>
        <div className="space-y-1 text-[10px] text-[#aaaaaa]">
          <p>• Organiza reuniones PTA regulares para mantener comunicacion</p>
          <p>• Responde rapido a las quejas de padres</p>
          <p>• Los voluntarios mejoran la satisfaccion parental</p>
          <p>• La calidad de la comida afecta directamente la opinion de padres</p>
          <p>• Las campanas de marketing atraen familias nuevas</p>
        </div>
      </div>
      {/* PTA Meeting Dialog */}
      <Dialog open={ptaMeetingOpen} onOpenChange={setPtaMeetingOpen}>
        <DialogContent className="bg-[#0d0d0d] border-[#222222] text-white max-w-md">
          <DialogHeader>
            <DialogTitle>🤝 Convocar Reunion PTA</DialogTitle>
            <DialogDescription className="text-[#aaaaaa]">Selecciona un tema para la reunion. Cada reunion tiene un costo pero otorga bonos.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            {ptaTopics.map(topic => (
              <button
                key={topic.id}
                onClick={() => {
                  if (money >= topic.cost) {
                    adjustMoney(-topic.cost);
                    adjustReputation(topic.repBonus);
                    adjustMorale(topic.satBonus);
                    sounds.success();
                    addNotification({ id: `pta-${Date.now()}`, day: currentDay, message: `🤝 Reunion PTA: ${topic.label} completada (+${topic.repBonus} rep, +${topic.satBonus} sat)`, emoji: '🤝', read: false });
                    setPtaMeetingOpen(false);
                  } else {
                    sounds.error();
                  }
                }}
                className={`w-full bg-[#111111] border rounded-lg p-3 text-left transition-all ${money >= topic.cost ? 'border-[#333] hover:border-[#00ff88]/50 hover:bg-[#1a1a1a]' : 'border-[#222222] opacity-50 cursor-not-allowed'}`}
              >
                <div className="text-sm font-bold text-white">{topic.label}</div>
                <div className="text-[10px] text-[#aaaaaa] mt-1">Costo: {currency}{topic.cost.toLocaleString()} · +{topic.repBonus} reputacion · +{topic.satBonus} satisfaccion</div>
              </button>
            ))}
          </div>
          <DialogFooter>
            <button onClick={() => setPtaMeetingOpen(false)} className="text-xs text-[#aaaaaa] hover:text-white">Cancelar</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

export default ParentsTab;
