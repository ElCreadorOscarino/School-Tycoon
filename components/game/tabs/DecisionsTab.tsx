'use client';
import React from 'react';

interface TabProps {
  decisionHistory: any[];
  eventsResolved: number;
  currency: string;
}

const DecisionsTab = React.memo(function DecisionsTab({
  decisionHistory,
  eventsResolved,
  currency,
}: TabProps) {
  const records = decisionHistory || [];
  return (
    <div className="space-y-4">
      <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-4">
        <h3 className="text-sm font-bold text-[#aaaaaa] mb-1">Historial de Decisiones</h3>
        <p className="text-[10px] text-[#555555]">{records.length} decisiones tomadas. Eventos positivos: {eventsResolved || 0}</p>
      </div>
      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {records.length === 0 ? (
          <p className="text-center text-[#aaaaaa] text-xs py-8">Sin decisiones registradas aun.</p>
        ) : (
          records.slice().reverse().slice(0, 30).map((d: any, i: number) => (
            <div key={i} className="bg-[#0d0d0d] border border-[#222222] rounded px-3 py-2">
              <div className="flex justify-between items-start">
                <div className="text-xs font-bold text-white">{d.eventTitle}</div>
                <span className="text-[9px] text-[#555555]">S{d.week}</span>
              </div>
              <div className="text-[10px] text-[#aaaaaa] mt-1">Elegiste: <span className="text-white">{d.chosenOption}</span></div>
              <div className="text-[10px] text-[#555555] mt-0.5">{d.outcome}</div>
              <div className="flex gap-2 mt-1">
                {(d.reputationChange || 0) !== 0 && <span className={`text-[9px] ${d.reputationChange > 0 ? 'text-[#00ff88]' : 'text-[#ff4444]'}`}>Rep {d.reputationChange > 0 ? '+' : ''}{d.reputationChange}</span>}
                {(d.moneyChange || 0) !== 0 && <span className={`text-[9px] ${d.moneyChange > 0 ? 'text-[#00ff88]' : 'text-[#ff4444]'}`}>{currency}{d.moneyChange}</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
});

export default DecisionsTab;
