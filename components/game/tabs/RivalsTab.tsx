'use client';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { getCompetitionInfo } from '@/lib/school-rivals';

interface TabProps {
  rivals: any[];
  schoolName: string;
  reputation: number;
  activeStudents: number;
}

const RivalsTab = React.memo(function RivalsTab({
  rivals,
  schoolName,
  reputation,
  activeStudents,
}: TabProps) {
  const comp = getCompetitionInfo(activeStudents, reputation, rivals || []);
  return (
    <div className="space-y-4">
      <div className="bg-[#0d0d0d] border border-[#ffcc00]/30 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-bold text-[#ffcc00]">Clasificacion Escolar</h3>
          <Badge variant="outline" className={`text-[10px] ${comp.isLeading ? 'border-[#00ff88] text-[#00ff88]' : 'border-[#ff4444] text-[#ff4444]'}`}>
            #{comp.ranking}/{comp.totalSchools} - {comp.isLeading ? 'Lider' : 'Siguiendo'}
          </Badge>
        </div>
        <div className="text-xs text-[#aaaaaa]">Participacion de mercado: <span className="text-white font-bold">{comp.marketShare}%</span></div>
      </div>
      <div className="space-y-2">
        {/* Player */}
        <div className="bg-[#0d0d0d] border border-[#00ff88]/30 rounded-lg p-3 flex items-center gap-3">
          <span className="text-lg">🏫</span>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-[#00ff88] truncate">{schoolName} (Tu escuela)</div>
            <div className="text-[10px] text-[#aaaaaa]">{activeStudents} alumnos | Rep: {Math.round(reputation)}</div>
          </div>
        </div>
        {(rivals || []).map((r: any) => (
          <div key={r.id} className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-3 flex items-center gap-3">
            <span className="text-lg">{r.emoji || '🏫'}</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white truncate">{r.name}</div>
              <div className="text-[10px] text-[#aaaaaa]">{r.students} alumnos | Rep: {r.reputation}</div>
              <div className="flex gap-1 mt-1 flex-wrap">
                {(r.strengths || []).slice(0, 3).map((s: string) => <span key={s} className="text-[9px] bg-[#111111] border border-[#333] rounded px-1">{s}</span>)}
              </div>
            </div>
            <span className="text-lg">{r.trend === 'rising' ? '📈' : r.trend === 'declining' ? '📉' : '📊'}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

export default RivalsTab;
