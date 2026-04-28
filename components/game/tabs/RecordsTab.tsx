'use client';
import React from 'react';

interface TabProps {
  bestSchoolStats: { maxStudents: number; maxReputation: number; maxMoney: number; totalEventsResolved: number; totalPlayTime: number };
  totalPlayTime: number;
  eventsResolved: number;
  activeStudents: number;
  reputation: number;
  currentWeek: number;
  schoolName: string;
  currency: string;
  rivals: any[];
}

const RecordsTab = React.memo(function RecordsTab({
  bestSchoolStats,
  totalPlayTime,
  eventsResolved,
  activeStudents,
  reputation,
  currentWeek,
  schoolName,
  currency,
  rivals,
}: TabProps) {
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-white">📊 Records y Estadisticas</h3>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[#0a0a10] border border-[#1e1e2e] rounded-lg p-3 text-center game-card">
          <div className="text-lg font-bold text-[#00ff88]">{bestSchoolStats.maxStudents}</div>
          <div className="text-[10px] text-[#888899]">Max Estudiantes</div>
        </div>
        <div className="bg-[#0a0a10] border border-[#1e1e2e] rounded-lg p-3 text-center game-card">
          <div className="text-lg font-bold text-[#ffcc00]">{bestSchoolStats.maxReputation}</div>
          <div className="text-[10px] text-[#888899]">Max Reputacion</div>
        </div>
        <div className="bg-[#0a0a10] border border-[#1e1e2e] rounded-lg p-3 text-center game-card">
          <div className="text-lg font-bold text-[#4488ff]">{currency}{bestSchoolStats.maxMoney.toLocaleString()}</div>
          <div className="text-[10px] text-[#888899]">Max Dinero</div>
        </div>
        <div className="bg-[#0a0a10] border border-[#1e1e2e] rounded-lg p-3 text-center game-card">
          <div className="text-lg font-bold text-[#aa44ff]">{formatTime(bestSchoolStats.totalPlayTime)}</div>
          <div className="text-[10px] text-[#888899]">Tiempo Jugado</div>
        </div>
      </div>
      {/* Current session stats */}
      <div className="bg-[#0a0a10] border border-[#1e1e2e] rounded-lg p-3">
        <h4 className="text-xs font-bold text-white mb-2">📊 Sesion Actual</h4>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-sm font-bold text-white">{activeStudents}</div>
            <div className="text-[9px] text-[#888899]">Estudiantes</div>
          </div>
          <div>
            <div className="text-sm font-bold text-white">{Math.round(reputation)}</div>
            <div className="text-[9px] text-[#888899]">Reputacion</div>
          </div>
          <div>
            <div className="text-sm font-bold text-white">Semana {currentWeek}</div>
            <div className="text-[9px] text-[#888899]">Tiempo</div>
          </div>
        </div>
      </div>
      {/* Rivals comparison */}
      <div className="bg-[#0a0a10] border border-[#1e1e2e] rounded-lg p-3">
        <h4 className="text-xs font-bold text-white mb-2">🏫 Ranking de Escuelas</h4>
        <div className="space-y-1">
          <div className="flex justify-between text-[10px]"><span className="text-[#00ff88] font-bold">{schoolName}</span><span>{Math.round(reputation)} rep · {activeStudents} est</span></div>
          {rivals.slice(0, 5).map((r: any) => (
            <div key={r.id} className="flex justify-between text-[10px] text-[#aaaaaa]">
              <span>{r.name}</span>
              <span>{r.reputation} rep · {r.students} est</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default RecordsTab;
