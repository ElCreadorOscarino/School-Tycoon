'use client';
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface TabProps {
  activeChallenges: any[];
}

const ChallengesTab = React.memo(function ChallengesTab({ activeChallenges }: TabProps) {
  const challenges = activeChallenges || [];
  return (
    <div className="space-y-4">
      <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-4">
        <h3 className="text-sm font-bold text-[#ffcc00] mb-1">Desafios Semanales</h3>
        <p className="text-[10px] text-[#aaaaaa]">Completa desafios para ganar recompensas.</p>
      </div>
      <div className="space-y-2">
        {challenges.length === 0 ? (
          <p className="text-center text-[#aaaaaa] text-xs py-8">No hay desafios activos. Los desafios se generan cada 4 semanas.</p>
        ) : challenges.map((ch: any) => {
          const pct = ch.targetValue > 0 ? Math.min(100, (ch.currentValue / ch.targetValue) * 100) : 0;
          return (
            <div key={ch.id} className={`bg-[#0d0d0d] border rounded-lg p-3 ${ch.completed ? 'border-[#00ff88]/30' : ch.failed ? 'border-[#ff4444]/30' : 'border-[#222222]'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span>{ch.emoji || '🎯'}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white">{ch.name}</div>
                  <div className="text-[10px] text-[#aaaaaa]">{ch.description}</div>
                </div>
                {ch.completed && <Badge className="text-[9px] bg-[#00ff88]/20 text-[#00ff88] border-0">Completado</Badge>}
                {ch.failed && <Badge className="text-[9px] bg-[#ff4444]/20 text-[#ff4444] border-0">Fallido</Badge>}
              </div>
              {!ch.completed && !ch.failed && (
                <>
                  <div className="w-full h-2 bg-[#111111] rounded-full overflow-hidden">
                    <div className="h-full bg-[#ffcc00] rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between mt-1 text-[9px] text-[#555555]">
                    <span>{ch.currentValue}/{ch.targetValue}</span>
                    <span>Limite: S{ch.deadline}</span>
                    <span className="text-[#ffcc00]">Recompensa: +{ch.reward?.value || 0} {ch.reward?.type || ''}</span>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default ChallengesTab;
