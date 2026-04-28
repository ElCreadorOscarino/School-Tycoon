'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MARKETING_OPTIONS } from '@/lib/game-types';
import type { MarketingCampaign, GameNotification } from '@/lib/game-types';

interface TabProps {
  activeCampaigns: MarketingCampaign[];
  money: number;
  currency: string;
  currentWeek: number;
  currentDay: number;
  startCampaign: (campaign: MarketingCampaign) => void;
  addNotification: (n: GameNotification) => void;
  sounds: { success: () => void; click: () => void };
}

const MarketingTab = React.memo(function MarketingTab({
  activeCampaigns,
  money,
  currency,
  currentWeek,
  currentDay,
  startCampaign,
  addNotification,
  sounds,
}: TabProps) {
  return (
    <div className="space-y-4">
      {activeCampaigns.length > 0 && (
        <div>
          <h3 className="text-sm text-[#00ff88] font-bold mb-3">📢 Campanas activas ({activeCampaigns.length})</h3>
          <div className="space-y-2">
            {activeCampaigns.map(c => {
              const elapsed = currentWeek - c.startedAtWeek;
              const pct = Math.min(100, (elapsed / c.durationWeeks) * 100);
              return (
                <div key={c.id} className="bg-[#0d0d0d] border border-[#00ff88]/20 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-white">{c.emoji} {c.name}</span>
                    <Badge variant="outline" className="border-[#00ff88] text-[#00ff88] text-[10px]">
                      {c.durationWeeks - elapsed} sem restantes
                    </Badge>
                  </div>
                  <Progress value={pct} className="h-1.5 [&>div]:bg-[#00ff88]" />
                  <div className="flex gap-4 mt-2 text-[10px] text-[#aaaaaa]">
                    <span>Reputacion: +{c.reputationBoost}</span>
                    <span>Inscripcion: +{c.enrollmentBoost}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm text-[#aaaaaa] font-bold mb-3">Nuevas campanas</h3>
        <div className="space-y-2">
          {MARKETING_OPTIONS.map(opt => (
            <div key={opt.type} className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white">{opt.emoji} {opt.name}</div>
                <div className="text-[10px] text-[#aaaaaa] mt-1">
                  Costo: {currency}{opt.cost.toLocaleString()} | Duracion: {opt.durationWeeks} sem | Rep: +{opt.reputationBoost} | Inscripcion: +{opt.enrollmentBoost}
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  if (money < opt.cost) return;
                  startCampaign({
                    id: `campaign-${Date.now()}`,
                    type: opt.type,
                    emoji: opt.emoji,
                    name: opt.name,
                    cost: opt.cost,
                    reputationBoost: opt.reputationBoost,
                    enrollmentBoost: opt.enrollmentBoost,
                    durationWeeks: opt.durationWeeks,
                    startedAtWeek: currentWeek,
                    active: true,
                  });
                  sounds.success();
                  addNotification({
                    id: `notif-campaign-${Date.now()}`,
                    day: currentDay,
                    message: `📢 Campana "${opt.name}" iniciada`,
                    emoji: '📢',
                    read: false,
                  });
                }}
                disabled={money < opt.cost}
                className="text-[10px] h-8 bg-[#4488ff] hover:bg-[#5599ff] text-white"
              >{currency}{opt.cost.toLocaleString()}</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default MarketingTab;
