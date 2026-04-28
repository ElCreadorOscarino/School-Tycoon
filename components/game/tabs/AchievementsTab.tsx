'use client';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import type { Achievement } from '@/lib/game-types';

interface TabProps {
  achievements: Achievement[];
}

const AchievementsTab = React.memo(function AchievementsTab({ achievements }: TabProps) {
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[#aaaaaa]">Logros desbloqueados</span>
        <Badge variant="outline" className="border-[#ffcc00] text-[#ffcc00]">{unlockedCount}/{achievements.length}</Badge>
      </div>
      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {achievements.map(a => (
          <div key={a.id} className={`bg-[#0d0d0d] border rounded-lg p-3 flex items-center gap-3 transition-all ${
            a.unlocked ? 'border-[#00ff88]/30' : 'border-[#222222] opacity-60'
          }`}>
            <span className={`text-2xl ${a.unlocked ? '' : 'grayscale'}`}>{a.emoji}</span>
            <div className="flex-1">
              <div className={`text-sm font-bold ${a.unlocked ? 'text-[#00ff88]' : 'text-[#666666]'}`}>{a.name}</div>
              <div className="text-[10px] text-[#aaaaaa]">{a.description}</div>
              {a.unlocked && a.unlockedAt && (
                <div className="text-[9px] text-[#555555] mt-1">Desbloqueado en semana {Math.floor(a.unlockedAt / 7)}</div>
              )}
            </div>
            {a.unlocked && <span className="text-[#00ff88] text-lg">✓</span>}
          </div>
        ))}
      </div>
    </div>
  );
});

export default AchievementsTab;
