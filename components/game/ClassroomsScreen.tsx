'use client';

import { useState, useMemo, useEffect } from 'react';
import { useGameStore } from '@/lib/game-store';
import { sounds } from '@/lib/sounds';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SCREEN_ORDER } from '@/lib/game-types';
import type { Tier } from '@/lib/game-types';

const CHAIR_OPTIONS: { key: 'padded' | 'common'; emoji: string; label: string; costPerRoom: number; effect: string }[] = [
  { key: 'padded', emoji: '🪑', label: 'Acolchadas (premium)', costPerRoom: 5000, effect: '+Concentracion de estudiantes' },
  { key: 'common', emoji: '🪑', label: 'Comunes (basicas)', costPerRoom: 1000, effect: 'Puede reducir rendimiento' },
];

const SCREEN_SIZES = [
  { size: 32, label: '32"', tier: 'basic' as Tier, cost: 2000 },
  { size: 42, label: '42"', tier: 'basic' as Tier, cost: 3000 },
  { size: 55, label: '55"', tier: 'standard' as Tier, cost: 5000 },
  { size: 65, label: '65"', tier: 'standard' as Tier, cost: 6000 },
  { size: 75, label: '75"', tier: 'high' as Tier, cost: 7000 },
  { size: 86, label: '86"', tier: 'high' as Tier, cost: 8000 },
];

const RECORDING_OPTIONS: { key: 'paper' | 'laptop' | 'tablet'; emoji: string; label: string; setupCost: number; desc: string }[] = [
  { key: 'paper', emoji: '📄', label: 'Papel y lapiz', setupCost: 0, desc: 'Registro manual tradicional' },
  { key: 'laptop', emoji: '💻', label: 'Laptops estudiantes', setupCost: 30000, desc: 'Digital - setup completo' },
  { key: 'tablet', emoji: '📱', label: 'Tablets', setupCost: 15000, desc: 'Digital - mas economico' },
];

function ScreenSizeVisual({ size }: { size: number }) {
  const maxWidth = 100;
  const barWidth = Math.max(15, (size / 86) * maxWidth);
  return (
    <div className="flex items-end gap-1 h-6">
      <div
        className="bg-[#333333] border border-[#555555] rounded-sm transition-all duration-300 flex items-center justify-center"
        style={{ width: `${barWidth}%`, height: '100%' }}
      >
        <span className="text-[8px] text-[#aaaaaa] font-mono">{size}"</span>
      </div>
    </div>
  );
}

export default function ClassroomsScreen() {
  const {
    money, currency, classrooms,
    chairType, presentationSystem, digitalScreenSize, digitalScreenTier, recordingMethod,
    setChairType, setPresentationSystem, setDigitalScreenSize, setDigitalScreenTier, setRecordingMethod,
    adjustMoney, prevScreen, nextScreen,
  } = useGameStore();

  const totalClassrooms = classrooms.length;

  const [localChairType, setLocalChairType] = useState<'padded' | 'common'>(chairType || 'common');
  const [localPresentation, setLocalPresentation] = useState<'whiteboard' | 'digital'>(presentationSystem || 'whiteboard');
  const [localScreenSize, setLocalScreenSize] = useState(digitalScreenSize || 55);
  const [localScreenTier, setLocalScreenTier] = useState<Tier>(digitalScreenTier || 'standard');
  const [localRecording, setLocalRecording] = useState<'paper' | 'laptop' | 'tablet'>(recordingMethod || 'paper');

  const costBreakdown = useMemo(() => {
    const costs: { label: string; cost: number }[] = [];

    // Chair cost
    const chairConfig = CHAIR_OPTIONS.find((c) => c.key === localChairType);
    if (chairConfig) {
      costs.push({
        label: `🪑 ${chairConfig.label} x${totalClassrooms}`,
        cost: chairConfig.costPerRoom * totalClassrooms,
      });
    }

    // Presentation cost
    if (localPresentation === 'whiteboard') {
      costs.push({ label: '🖊️ Pizarra tradicional x' + totalClassrooms, cost: 500 * totalClassrooms });
    } else {
      const screenConfig = SCREEN_SIZES.find((s) => s.size === localScreenSize);
      if (screenConfig) {
        costs.push({
          label: `🖥️ Pantalla ${screenConfig.label} ${screenConfig.tier} x${totalClassrooms}`,
          cost: screenConfig.cost * totalClassrooms,
        });
      }
    }

    // Recording cost
    const recConfig = RECORDING_OPTIONS.find((r) => r.key === localRecording);
    if (recConfig) {
      costs.push({ label: `${recConfig.emoji} ${recConfig.label}`, cost: recConfig.setupCost });
    }

    return costs;
  }, [localChairType, localPresentation, localScreenSize, localRecording, totalClassrooms]);

  const totalCost = costBreakdown.reduce((sum, item) => sum + item.cost, 0);
  const canAfford = money >= totalCost;

  const handleConfirm = () => {
    if (!canAfford) {
      sounds.error();
      return;
    }

    adjustMoney(-totalCost);
    setChairType(localChairType);
    setPresentationSystem(localPresentation);
    setDigitalScreenSize(localScreenSize);
    setDigitalScreenTier(localScreenTier);
    setRecordingMethod(localRecording);
    sounds.success();
    setTimeout(() => nextScreen(), 500);
  };

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, []);

  const stepIndex = SCREEN_ORDER.indexOf('classrooms');
  const totalSteps = SCREEN_ORDER.length;

  // Capacity summary
  const capacitySummary = useMemo(() => {
    const summary: { level: string; emoji: string; count: number; totalCapacity: number }[] = [];
    const levels = [
      { key: 'kinder' as const, emoji: '🧒', label: 'Kinder' },
      { key: 'primary' as const, emoji: '📖', label: 'Primaria' },
      { key: 'secondary' as const, emoji: '📚', label: 'Secundaria' },
    ];
    for (const lvl of levels) {
      const rooms = classrooms.filter((c) => c.level === lvl.key);
      const totalCap = rooms.reduce((s, c) => s + c.capacity, 0);
      if (rooms.length > 0) {
        summary.push({ level: lvl.label, emoji: lvl.emoji, count: rooms.length, totalCapacity: totalCap });
      }
    }
    return summary;
  }, [classrooms]);

  return (
    <div className="screen-enter min-h-screen bg-black text-white font-mono flex flex-col">
      {/* Progress Bar */}
      <div className="w-full px-4 pt-4">
        <div className="flex items-center justify-between text-xs text-[#aaaaaa] mb-1">
          <span>Paso {stepIndex + 1} de {totalSteps}</span>
          <span>{Math.round(((stepIndex + 1) / totalSteps) * 100)}%</span>
        </div>
        <div className="w-full h-2 bg-[#111111] rounded-full overflow-hidden border border-[#222222]">
          <div
            className="h-full bg-[#00ff88] transition-all duration-500 rounded-full"
            style={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-8">
        <div className="w-full max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="text-5xl mb-3">📋</div>
            <h1 className="text-2xl font-bold text-[#00ff88] mb-1">Equipamiento de Aulas</h1>
            <p className="text-[#aaaaaa] text-sm">
              💰 Presupuesto: <span className="text-[#ffcc00] font-bold">{currency}{money.toLocaleString()}</span>
              {' '}| 🏫 Aulas: <span className="text-white font-bold">{totalClassrooms}</span>
            </p>
          </div>

          {totalClassrooms === 0 ? (
            <div className="bg-[#1a1a0a] border border-[#ffcc00] rounded-lg p-6 text-center">
              <div className="text-4xl mb-3">⚠️</div>
              <p className="text-[#ffcc00]">No has creado ninguna aula aun.</p>
              <p className="text-[#aaaaaa] text-sm mt-1">Vuelve a la pantalla de construccion para crear aulas.</p>
              <Button
                variant="ghost"
                onClick={() => { sounds.click(); prevScreen(); }}
                className="mt-4 border border-[#333333] text-[#aaaaaa] hover:text-white"
              >
                ← Volver a Construccion
              </Button>
            </div>
          ) : (
            <>
              {/* 1. Chair Type */}
              <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-5">
                <h2 className="text-sm text-[#aaaaaa] mb-3 font-bold uppercase tracking-wider">
                  🪑 1. Material de sillas
                </h2>
                <p className="text-[10px] text-[#555555] mb-3">Se aplica a las {totalClassrooms} aulas</p>
                <div className="space-y-2">
                  {CHAIR_OPTIONS.map((opt) => {
                    const isSelected = localChairType === opt.key;
                    return (
                      <button
                        key={opt.key}
                        onClick={() => { sounds.click(); setLocalChairType(opt.key); }}
                        className={`w-full flex items-center justify-between p-4 rounded-lg border text-left transition-all ${
                          isSelected
                            ? 'border-[#00ff88] bg-[#0a1a10]'
                            : 'border-[#333333] bg-[#111111] hover:border-[#555555]'
                        }`}
                      >
                        <div>
                          <div className="text-sm font-bold text-white">{opt.emoji} {opt.label}</div>
                          <div className="text-[10px] text-[#aaaaaa] mt-0.5">{opt.effect}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-[#ffcc00]">{currency}{opt.costPerRoom.toLocaleString()}/aula</div>
                          <div className="text-[10px] text-[#aaaaaa]">{currency}{(opt.costPerRoom * totalClassrooms).toLocaleString()} total</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Presentation System */}
              <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-5">
                <h2 className="text-sm text-[#aaaaaa] mb-3 font-bold uppercase tracking-wider">
                  🖥️ 2. Sistema de presentacion
                </h2>
                <div className="space-y-4">
                  {/* Whiteboard option */}
                  <button
                    onClick={() => { sounds.click(); setLocalPresentation('whiteboard'); }}
                    className={`w-full flex items-center justify-between p-4 rounded-lg border text-left transition-all ${
                      localPresentation === 'whiteboard'
                        ? 'border-[#00ff88] bg-[#0a1a10]'
                        : 'border-[#333333] bg-[#111111] hover:border-[#555555]'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-bold text-white">🖊️ Pizarra tradicional</div>
                      <div className="text-[10px] text-[#aaaaaa] mt-0.5">Economica y clasica</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-[#ffcc00]">{currency}500/aula</div>
                      <div className="text-[10px] text-[#aaaaaa]">{currency}{(500 * totalClassrooms).toLocaleString()} total</div>
                    </div>
                  </button>

                  {/* Digital option */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => { sounds.click(); setLocalPresentation('digital'); }}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sounds.click(); setLocalPresentation('digital'); } }}
                    className={`w-full p-4 rounded-lg border text-left transition-all cursor-pointer ${
                      localPresentation === 'digital'
                        ? 'border-[#00ff88] bg-[#0a1a10]'
                        : 'border-[#333333] bg-[#111111] hover:border-[#555555]'
                    }`}
                  >
                    <div className="text-sm font-bold text-white mb-3">🖥️ Pantalla digital</div>

                    {/* Size comparison */}
                    <div className="space-y-1.5 mb-3">
                      {SCREEN_SIZES.map((s) => {
                        const isSelected = localScreenSize === s.size && localPresentation === 'digital';
                        return (
                          <button
                            key={s.size}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              sounds.click();
                              setLocalPresentation('digital');
                              setLocalScreenSize(s.size);
                              setLocalScreenTier(s.tier);
                            }}
                            className={`w-full flex items-center gap-3 p-1.5 rounded text-left transition-all ${
                              isSelected ? 'bg-[#0a1a10] border border-[#00ff88]' : 'hover:bg-[#1a1a1a] border border-transparent'
                            }`}
                          >
                            <div className="w-24 flex-shrink-0">
                              <ScreenSizeVisual size={s.size} />
                            </div>
                            <div className="flex-1">
                              <span className="text-xs text-white">{s.label}</span>
                              <span className="text-[10px] text-[#555555] ml-1">({s.tier})</span>
                            </div>
                            <span className="text-xs text-[#ffcc00]">{currency}{s.cost.toLocaleString()}/aula</span>
                            {isSelected && <span className="text-[#00ff88] text-xs">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Capacity Summary */}
              <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-5">
                <h2 className="text-sm text-[#aaaaaa] mb-3 font-bold uppercase tracking-wider">
                  👥 3. Capacidad maxima
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  {capacitySummary.map((item) => (
                    <div key={item.level} className="bg-[#111111] border border-[#222222] rounded-lg p-3 text-center">
                      <div className="text-2xl mb-1">{item.emoji}</div>
                      <div className="text-xs text-[#aaaaaa]">{item.level}</div>
                      <div className="text-sm font-bold text-white">{item.count} aulas</div>
                      <div className="text-xs text-[#00ff88]">{item.totalCapacity} alumnos</div>
                    </div>
                  ))}
                  {capacitySummary.length === 0 && (
                    <div className="col-span-3 text-center text-[#555555] text-sm py-4">
                      No hay aulas configuradas
                    </div>
                  )}
                </div>
              </div>

              {/* 4. Recording Method */}
              <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-5">
                <h2 className="text-sm text-[#aaaaaa] mb-3 font-bold uppercase tracking-wider">
                  📝 4. Metodo de registro
                </h2>
                <div className="space-y-2">
                  {RECORDING_OPTIONS.map((opt) => {
                    const isSelected = localRecording === opt.key;
                    return (
                      <button
                        key={opt.key}
                        onClick={() => { sounds.click(); setLocalRecording(opt.key); }}
                        className={`w-full flex items-center justify-between p-4 rounded-lg border text-left transition-all ${
                          isSelected
                            ? 'border-[#00ff88] bg-[#0a1a10]'
                            : 'border-[#333333] bg-[#111111] hover:border-[#555555]'
                        }`}
                      >
                        <div>
                          <div className="text-sm font-bold text-white">{opt.emoji} {opt.label}</div>
                          <div className="text-[10px] text-[#aaaaaa] mt-0.5">{opt.desc}</div>
                        </div>
                        <div className="text-sm font-bold text-[#ffcc00]">
                          {opt.setupCost > 0 ? `${currency}${opt.setupCost.toLocaleString()}` : 'Gratis'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="bg-[#0d0d0d] border border-[#00ff88] rounded-lg p-5">
                <h2 className="text-sm text-[#aaaaaa] mb-3 font-bold uppercase tracking-wider">
                  💰 Desglose de costos
                </h2>
                <div className="space-y-2">
                  {costBreakdown.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-[#aaaaaa]">{item.label}</span>
                      <span className="text-white">{currency}{item.cost.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="border-t border-[#333333] pt-2 mt-2 flex justify-between">
                    <span className="text-[#aaaaaa] font-bold">TOTAL</span>
                    <span className={`font-bold text-lg ${canAfford ? 'text-[#00ff88]' : 'text-[#ff4444]'}`}>
                      {currency}{totalCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#aaaaaa]">Saldo despues:</span>
                    <span className={`font-bold ${canAfford ? 'text-[#00ff88]' : 'text-[#ff4444]'}`}>
                      {currency}{(money - totalCost).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => {
                sounds.click();
                prevScreen();
              }}
              className="flex-1 border border-[#333333] text-[#aaaaaa] hover:text-white hover:border-[#555555] h-12"
            >
              ← Anterior
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!canAfford || totalClassrooms === 0}
              className="flex-[2] bg-[#00ff88] text-black font-bold hover:bg-[#00cc6e] h-12 disabled:opacity-40 disabled:cursor-not-allowed px-8"
            >
              ✅ Confirmar Equipamiento
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
