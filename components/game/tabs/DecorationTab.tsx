'use client';
import React from 'react';
import { Input } from '@/components/ui/input';

interface TabProps {
  decorations: Array<{ id: string; name: string; emoji: string; cost: number; reputation: number; purchased: boolean }>;
  uniformColors: { primary: string; secondary: string };
  schoolMotto: string;
  schoolMascot: string;
  money: number;
  currency: string;
  purchaseDecoration: (id: string) => void;
  setUniformColors: (primary: string, secondary: string) => void;
  setSchoolMotto: (v: string) => void;
  setSchoolMascot: (v: string) => void;
  sounds: { purchase: () => void; click: () => void; error: () => void };
}

const DecorationTab = React.memo(function DecorationTab({
  decorations,
  uniformColors,
  schoolMotto,
  schoolMascot,
  money,
  currency,
  purchaseDecoration,
  setUniformColors,
  setSchoolMotto,
  setSchoolMascot,
  sounds,
}: TabProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">🎨 Decoraciones del Campus</h3>
        <span className="text-xs text-[#888899]">{decorations.filter(d => d.purchased).length}/{decorations.length}</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {decorations.map(d => (
          <div key={d.id} className={`bg-[#0a0a10] border rounded-lg p-3 text-center ${d.purchased ? 'border-[#00ff88]/30' : 'border-[#1e1e2e]'}`}>
            <div className="text-2xl">{d.emoji}</div>
            <div className="text-[10px] font-bold text-white mt-1">{d.name}</div>
            <div className="text-[9px] text-[#ffcc00]">+{d.reputation} rep</div>
            {d.purchased ? (
              <div className="text-[9px] text-[#00ff88] mt-1">✅ Comprado</div>
            ) : (
              <button
                onClick={() => { if (money >= d.cost) { purchaseDecoration(d.id); sounds.purchase(); } else sounds.error(); }}
                className={`text-[9px] mt-1 px-2 py-0.5 rounded ${money >= d.cost ? 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/30 hover:bg-[#00ff88]/20' : 'text-[#555555]'}`}
              >
                {currency}{d.cost.toLocaleString()}
              </button>
            )}
          </div>
        ))}
      </div>
      {/* School customization */}
      <div className="bg-[#0a0a10] border border-[#1e1e2e] rounded-lg p-3 space-y-2">
        <h4 className="text-xs font-bold text-white">🏫 Personalizacion</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-[#888899]">Motto</label>
            <Input value={schoolMotto} onChange={e => setSchoolMotto(e.target.value)} placeholder="Lema de la escuela" className="h-7 text-[10px] bg-[#111111] border-[#222222]" />
          </div>
          <div>
            <label className="text-[10px] text-[#888899]">Mascota</label>
            <Input value={schoolMascot} onChange={e => setSchoolMascot(e.target.value)} placeholder="Ej: Aguila" className="h-7 text-[10px] bg-[#111111] border-[#222222]" />
          </div>
        </div>
      </div>
      {/* Uniform Designer */}
      <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-4 mt-3">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">👔</span>
          <h3 className="text-sm text-[#aaaaaa] font-bold">Disenador de Uniformes</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs text-[#aaaaaa]">Color Primario:</label>
            <input type="color" value={uniformColors.primary} onChange={(e) => { setUniformColors(e.target.value, uniformColors.secondary); sounds.click(); }} className="w-8 h-8 rounded cursor-pointer border border-[#333] bg-transparent" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-[#aaaaaa]">Color Secundario:</label>
            <input type="color" value={uniformColors.secondary} onChange={(e) => { setUniformColors(uniformColors.primary, e.target.value); sounds.click(); }} className="w-8 h-8 rounded cursor-pointer border border-[#333] bg-transparent" />
          </div>
          {/* Uniform Preview */}
          <div className="flex items-center gap-2 ml-auto">
            <div className="w-12 h-16 rounded-t-lg border-2 border-[#333]" style={{ backgroundColor: uniformColors.primary }} />
            <div className="relative">
              <div className="w-12 h-10 rounded-t-lg" style={{ backgroundColor: uniformColors.primary }} />
              <div className="w-12 h-8 rounded-b-lg" style={{ backgroundColor: uniformColors.secondary }} />
              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border border-white/30" style={{ backgroundColor: uniformColors.primary }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default DecorationTab;
