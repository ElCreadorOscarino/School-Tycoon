'use client';
import React from 'react';
import { Button } from '@/components/ui/button';

interface TabProps {
  alumni: any[];
  currency: string;
  processAlumniDonation: () => void;
  sounds: { moneyIn: () => void };
}

const AlumniTab = React.memo(function AlumniTab({
  alumni,
  currency,
  processAlumniDonation,
  sounds,
}: TabProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">🎓 Red de Ex-Alumnos</h3>
        <span className="text-xs text-[#888899]">{alumni.length} egresados</span>
      </div>
      {/* Total donations */}
      <div className="bg-[#0a0a10] border border-[#1e1e2e] rounded-lg p-3">
        <div className="text-[10px] text-[#888899]">Donaciones totales acumuladas</div>
        <div className="text-lg font-bold text-[#00ff88]">{currency}{alumni.reduce((s: number, a: any) => s + a.donationAmount, 0).toLocaleString()}</div>
      </div>
      {/* Process donations button */}
      {alumni.length > 0 && (
        <Button onClick={() => { processAlumniDonation(); sounds.moneyIn(); }} variant="outline" className="w-full text-xs border-[#333333] hover:border-[#ffcc00] hover:text-[#ffcc00]">
          💰 Recibir Donaciones de Alumni
        </Button>
      )}
      {/* Alumni list */}
      <div className="grid gap-2 max-h-80 overflow-y-auto">
        {alumni.map((a: any) => (
          <div key={a.id} className="bg-[#0a0a10] border border-[#1e1e2e] rounded-lg p-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs font-bold text-white">{a.name}</div>
                <div className="text-[10px] text-[#888899]">{a.career} · Clase {a.graduationYear}</div>
              </div>
              <div className="text-[10px] text-[#ffcc00]">{'⭐'.repeat(a.prestige)}</div>
            </div>
            <div className="text-[10px] text-[#00ff88] mt-1">Donacion: {currency}{a.donationAmount.toLocaleString()}</div>
          </div>
        ))}
        {alumni.length === 0 && (
          <div className="text-xs text-[#555555] text-center py-4">Aun no hay ex-alumnos. Gradua estudiantes para crear la red de alumni.</div>
        )}
      </div>
    </div>
  );
});

export default AlumniTab;
