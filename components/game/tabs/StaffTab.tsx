'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import type { StaffMember } from '@/lib/game-types';

interface TabProps {
  staff: StaffMember[];
  money: number;
  currency: string;
  morale: number;
  hireStaff: (id: string) => void;
  fireStaffMember: (id: string) => void;
  generateStaffCandidates: () => void;
  sounds: { click: () => void; success: () => void; error: () => void };
}

const StaffTab = React.memo(function StaffTab({
  staff,
  money,
  currency,
  morale,
  hireStaff,
  fireStaffMember,
  generateStaffCandidates,
  sounds,
}: TabProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">👤 Personal Adicional</h3>
        <span className="text-xs text-[#888899]">Moral: {morale}%</span>
      </div>
      {/* Morale bar */}
      <div className="w-full h-2 bg-[#111111] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${morale}%`, backgroundColor: morale >= 60 ? '#00ff88' : morale >= 30 ? '#ffcc00' : '#ff4444' }} />
      </div>
      {/* Hired staff list */}
      <div className="grid gap-2">
        {staff.filter(s => s.hired).map(s => (
          <div key={s.id} className="bg-[#0a0a10] border border-[#1e1e2e] rounded-lg p-3 flex justify-between items-center">
            <div>
              <div className="text-xs font-bold text-white">{s.name}</div>
              <div className="text-[10px] text-[#888899]">{s.role === 'psychologist' ? '🧠 Psicologo' : s.role === 'nurse' ? '🏥 Enfermeria' : s.role === 'security' ? '🛡️ Seguridad' : s.role === 'gardener' ? '🌱 Jardinero' : '🧹 Conserje'} · {currency}{s.salary}/sem</div>
            </div>
            <button onClick={() => { fireStaffMember(s.id); sounds.click(); }} className="text-[10px] text-[#ff4444] hover:text-[#ff6666]">Despedir</button>
          </div>
        ))}
        {staff.filter(s => s.hired).length === 0 && (
          <div className="text-xs text-[#555555] text-center py-4">Sin personal adicional contratado</div>
        )}
      </div>
      {/* Generate candidates */}
      <Button onClick={() => { generateStaffCandidates(); sounds.click(); }} variant="outline" className="w-full text-xs border-[#333333] hover:border-[#00ff88] hover:text-[#00ff88]">
        📋 Buscar Candidatos
      </Button>
      {/* Available candidates */}
      {staff.filter(s => !s.hired).length > 0 && (
        <div className="space-y-2">
          <div className="text-[10px] text-[#888899]">Candidatos disponibles:</div>
          {staff.filter(s => !s.hired).map(s => (
            <div key={s.id} className="bg-[#0a0a10] border border-[#1e1e2e] rounded-lg p-3 flex justify-between items-center">
              <div>
                <div className="text-xs font-bold text-white">{s.name}</div>
                <div className="text-[10px] text-[#888899]">{s.role === 'psychologist' ? '🧠' : s.role === 'nurse' ? '🏥' : s.role === 'security' ? '🛡️' : s.role === 'gardener' ? '🌱' : '🧹'} · Salario: {currency}{s.salary}/sem</div>
              </div>
              <button onClick={() => { if (money >= s.salary * 4) { hireStaff(s.id); sounds.success(); } else { sounds.error(); } }} className={`text-[10px] px-2 py-1 rounded ${money >= s.salary * 4 ? 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/30' : 'text-[#555555]'}`}>
                Contratar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default StaffTab;
