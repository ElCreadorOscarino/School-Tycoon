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
import { SCREEN_ORDER, BUILDING_CONFIGS } from '@/lib/game-types';
import type { BuildingSize, Classroom } from '@/lib/game-types';

const BUILDING_SIZES: { key: BuildingSize; emoji: string; label: string; desc: string; cost: number; floors: number; maxClassrooms: number }[] = [
  { key: 'small', emoji: '🏠', label: 'Pequeno', desc: '1-2 pisos, ~10 aulas', cost: 50000, floors: 2, maxClassrooms: 10 },
  { key: 'medium', emoji: '🏫', label: 'Mediano', desc: '2-3 pisos, ~20 aulas', cost: 120000, floors: 3, maxClassrooms: 20 },
  { key: 'large', emoji: '🏢', label: 'Grande', desc: '3-4 pisos, ~40 aulas', cost: 250000, floors: 4, maxClassrooms: 40 },
  { key: 'mega', emoji: '🏰', label: 'Mega', desc: '5+ pisos, 60+ aulas', cost: 500000, floors: 5, maxClassrooms: 60 },
];

const LEVEL_CONFIG = [
  { key: 'kinder' as const, emoji: '🧒', label: 'Kinder' },
  { key: 'primary' as const, emoji: '📖', label: 'Primaria' },
  { key: 'secondary' as const, emoji: '📚', label: 'Secundaria' },
];

const CAPACITY_OPTIONS = [25, 30, 35, 40];

function BuildingAsciiArt({ size }: { size: BuildingSize }) {
  const art: Record<BuildingSize, string> = {
    small: [
      '    ┌──────────┐',
      '   ╱  🏫      ╲',
      '  ╱ 📚📚      ╲',
      ' ╱──────────────╲',
      ' │  ░░░░  ░░░░  │',
      ' └──────┬───────┘',
      ' ╔══════╧══════╗',
      ' ║   🚪       ║',
      ' ╚════════════╝',
    ].join('\n'),
    medium: [
      '     ┌─────────────────┐',
      '    ╱  🏫  MEDIANO     ╲',
      '   ╱ 📚📚📚📚📚📚📚📚  ╲',
      '  ╱──────────────────────╲',
      '  │ ░░░░ │ ░░░░ │ ░░░░ │',
      '  │ ░░░░ │ ░░░░ │ ░░░░ │',
      '  └──┬────┴──────┴────┬──┘',
      ' ╔═══╧════════════════╧══╗',
      ' ║      🚪  🪟         ║',
      ' ╚═══════════════════════╝',
    ].join('\n'),
    large: [
      '      ┌────────────────────────┐',
      '     ╱  🏫  GRANDE             ╲',
      '    ╱ 📚📚📚📚📚📚📚📚📚📚📚📚  ╲',
      '   ╱─────────────────────────────╲',
      '   │ ░░░░ │ ░░░░ │ ░░░░ │ ░░░░ │',
      '   │ ░░░░ │ ░░░░ │ ░░░░ │ ░░░░ │',
      '   │ ░░░░ │ ░░░░ │ ░░░░ │ ░░░░ │',
      '   └───┬───┴───┬───┴───┬───┴───┬─┘',
      '  ╔════╧═══════╧═══════╧═══════╧══╗',
      '  ║    🚪     🪟        🪟       ║',
      '  ╚════════════════════════════════╝',
    ].join('\n'),
    mega: [
      '       ┌─────────────────────────────┐',
      '      ╱  🏫  MEGA  ★★★              ╲',
      '     ╱ 📚📚📚📚📚📚📚📚📚📚📚📚📚📚📚  ╲',
      '    ╱─────────────────────────────────╲',
      '    │ ░░░░ │ ░░░░ │ ░░░░ │ ░░░░ │ ░░░░ │',
      '    │ ░░░░ │ ░░░░ │ ░░░░ │ ░░░░ │ ░░░░ │',
      '    ├──────┤──────┤──────┤──────┤──────┤',
      '    │ ░░░░ │ ░░░░ │ ░░░░ │ ░░░░ │ ░░░░ │',
      '    │ ░░░░ │ ░░░░ │ ░░░░ │ ░░░░ │ ░░░░ │',
      '    └───┬──┴──┬───┴──┬───┴──┬───┴──┬───┘',
      '   ╔════╧════╧═════╧════╧═════╧════╧═══╗',
      '   ║   🚪   🪟        🪟    🪟        ║',
      '   ╚═════════════════════════════════════╝',
    ].join('\n'),
  };

  return (
    <pre className="text-[#00ff88] text-[10px] leading-[12px] overflow-hidden select-none font-mono whitespace-pre">
      {art[size]}
    </pre>
  );
}

export default function BuildingScreen() {
  const {
    money, currency, buildingSize, classrooms,
    setBuildingSize, setClassrooms, adjustMoney,
    prevScreen, nextScreen,
  } = useGameStore();

  const [selectedSize, setSelectedSize] = useState<BuildingSize>(buildingSize || 'small');
  const [distribution, setDistribution] = useState({
    kinder: 0,
    primary: 0,
    secondary: 0,
  });
  const [capacities, setCapacities] = useState({
    kinder: 25,
    primary: 30,
    secondary: 35,
  });

  const config = BUILDING_CONFIGS[selectedSize];

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' as ScrollBehavior });
  }, []);

  const totalClassrooms = distribution.kinder + distribution.primary + distribution.secondary;
  const canAfford = money >= config.cost;
  const isOverMax = totalClassrooms > config.maxClassrooms;

  const handleSizeSelect = (size: BuildingSize) => {
    sounds.click();
    setSelectedSize(size);
    setDistribution({ kinder: 0, primary: 0, secondary: 0 });
  };

  const adjustClassrooms = (level: keyof typeof distribution, delta: number) => {
    sounds.click();
    const newVal = distribution[level] + delta;
    if (newVal < 0) return;
    const newTotal = totalClassrooms - distribution[level] + newVal;
    if (newTotal > config.maxClassrooms) return;
    setDistribution((prev) => ({ ...prev, [level]: newVal }));
  };

  const generateFloorMap = () => {
    const lines: string[] = [];
    let roomIndex = 0;
    const levelNames = ['K', 'P', 'S'];
    const allRooms: { level: string; index: number }[] = [];

    for (const [level, count] of Object.entries(distribution)) {
      for (let i = 0; i < count; i++) {
        const label = level === 'kinder' ? 'K' : level === 'primary' ? 'P' : 'S';
        allRooms.push({ level: label, index: roomIndex++ });
      }
    }

    const roomsPerFloor = Math.ceil(config.maxClassrooms / config.floors);
    for (let f = 0; f < config.floors; f++) {
      const floorRooms = allRooms.slice(f * roomsPerFloor, (f + 1) * roomsPerFloor);
      if (floorRooms.length > 0) {
        const roomStr = floorRooms.map((r) =>
          r.level === 'K' ? '🧒' : r.level === 'P' ? '📖' : '📚'
        ).join(' ');
        lines.push(`Piso ${f + 1}: ${roomStr}`);
      } else {
        lines.push(`Piso ${f + 1}: (vacio)`);
      }
    }
    return lines;
  };

  const handleSubmit = () => {
    if (!canAfford) {
      sounds.error();
      return;
    }
    if (totalClassrooms === 0) {
      sounds.warning();
      return;
    }

    const newClassrooms: Classroom[] = [];
    let id = 0;
    const entries = Object.entries(distribution) as [keyof typeof distribution, number][];

    for (const [level, count] of entries) {
      for (let i = 0; i < count; i++) {
        const floorNum = Math.floor(id / Math.ceil(config.maxClassrooms / config.floors)) + 1;
        const clampedFloor = Math.min(floorNum, config.floors);
        newClassrooms.push({
          id: `classroom-${id}`,
          floor: clampedFloor,
          name: `Aula ${id + 1}`,
          level: level as 'kinder' | 'primary' | 'secondary',
          capacity: capacities[level],
          students: 0,
        });
        id++;
      }
    }

    adjustMoney(-config.cost);
    setBuildingSize(selectedSize);
    setClassrooms(newClassrooms);
    sounds.construction();
    setTimeout(() => nextScreen(), 800);
  };

  const stepIndex = SCREEN_ORDER.indexOf('building');
  const totalSteps = 14;

  const floorMapLines = generateFloorMap();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-mono flex flex-col">
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
            <div className="text-5xl mb-3">🏗️</div>
            <h1 className="text-2xl font-bold text-[#00ff88] mb-1">Construccion del Edificio</h1>
            <p className="text-[#aaaaaa] text-sm">
              💰 Presupuesto: <span className="text-[#ffcc00] font-bold">{currency}{money.toLocaleString()}</span>
            </p>
          </div>

          {/* Section 2.1: Building Size */}
          <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-5">
            <h2 className="text-sm text-[#aaaaaa] mb-3 font-bold uppercase tracking-wider">
              📐 2.1 Tamano del edificio
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {BUILDING_SIZES.map((opt) => {
                const affordable = money >= opt.cost;
                const selected = selectedSize === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => handleSizeSelect(opt.key)}
                    disabled={!affordable}
                    className={`relative p-3 rounded-lg border text-left transition-all ${
                      selected
                        ? 'border-[#00ff88] bg-[#0a1a10] shadow-[0_0_15px_rgba(0,255,136,0.1)]'
                        : affordable
                        ? 'border-[#333333] bg-[#111111] hover:border-[#555555]'
                        : 'border-[#222222] bg-[#0a0a0a] opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <div className="text-center">
                      <BuildingAsciiArt size={opt.key} />
                      <div className="text-lg font-bold mt-1">{opt.label}</div>
                      <div className="text-[10px] text-[#aaaaaa]">{opt.desc}</div>
                      <div className={`text-xs font-bold mt-1 ${affordable ? 'text-[#00ff88]' : 'text-[#ff4444]'}`}>
                        {currency}{opt.cost.toLocaleString()}
                      </div>
                      {!affordable && (
                        <div className="text-[9px] text-[#ff4444]">Sin fondos</div>
                      )}
                    </div>
                    {selected && (
                      <div className="absolute top-1.5 right-1.5 text-[#00ff88] text-xs">✓</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2.2: Classroom Distribution */}
          <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-5">
            <h2 className="text-sm text-[#aaaaaa] mb-3 font-bold uppercase tracking-wider">
              🏫 2.2 Distribucion de aulas
            </h2>
            <div className="text-xs text-[#aaaaaa] mb-3">
              Total: {totalClassrooms} / {config.maxClassrooms} aulas
              {isOverMax && <span className="text-[#ff4444] ml-2">⚠️ Excede el maximo</span>}
            </div>

            {/* Progress bar for classrooms */}
            <div className="w-full h-2 bg-[#111111] rounded-full overflow-hidden border border-[#222222] mb-4">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  isOverMax ? 'bg-[#ff4444]' : totalClassrooms > config.maxClassrooms * 0.8 ? 'bg-[#ffcc00]' : 'bg-[#00ff88]'
                }`}
                style={{ width: `${Math.min(100, (totalClassrooms / config.maxClassrooms) * 100)}%` }}
              />
            </div>

            <div className="space-y-4">
              {LEVEL_CONFIG.map((level) => (
                <div key={level.key} className="bg-[#111111] border border-[#222222] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg">{level.emoji} {level.label}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => adjustClassrooms(level.key, -1)}
                        className="w-8 h-8 rounded bg-[#222222] hover:bg-[#333333] text-white flex items-center justify-center text-lg transition-colors"
                      >
                        -
                      </button>
                      <span className="text-xl font-bold text-white min-w-[2rem] text-center">
                        {distribution[level.key]}
                      </span>
                      <button
                        onClick={() => adjustClassrooms(level.key, 1)}
                        disabled={totalClassrooms >= config.maxClassrooms}
                        className="w-8 h-8 rounded bg-[#222222] hover:bg-[#333333] text-white flex items-center justify-center text-lg transition-colors disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Capacity selector */}
                  {distribution[level.key] > 0 && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-[#aaaaaa]">Capacidad:</span>
                      <Select
                        value={String(capacities[level.key])}
                        onValueChange={(v) => {
                          sounds.click();
                          setCapacities((prev) => ({ ...prev, [level.key]: Number(v) }));
                        }}
                      >
                        <SelectTrigger className="w-24 bg-[#0d0d0d] border-[#333333] text-white font-mono h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#111111] border-[#333333]">
                          {CAPACITY_OPTIONS.map((cap) => (
                            <SelectItem key={cap} value={String(cap)} className="text-white font-mono text-xs">
                              {cap} alumnos
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="text-[#aaaaaa]">alumnos/aula</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Floor Map */}
          {totalClassrooms > 0 && (
            <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-5">
              <h2 className="text-sm text-[#aaaaaa] mb-3 font-bold uppercase tracking-wider">
                🗺️ Mapa del edificio
              </h2>
              <div className="bg-[#111111] border border-[#222222] rounded-lg p-3 font-mono text-xs">
                {floorMapLines.map((line, i) => (
                  <div key={i} className="text-[#00ff88] leading-relaxed">{line}</div>
                ))}
              </div>
              <div className="flex gap-4 mt-2 text-[10px] text-[#aaaaaa]">
                <span>🧒 = Kinder</span>
                <span>📖 = Primaria</span>
                <span>📚 = Secundaria</span>
              </div>
            </div>
          )}

          {/* Cost Summary */}
          <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#aaaaaa]">Costo del edificio:</span>
              <span className="text-[#ffcc00] font-bold text-lg">{currency}{config.cost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm mt-1">
              <span className="text-[#aaaaaa]">Saldo despues:</span>
              <span className={`font-bold ${canAfford ? 'text-[#00ff88]' : 'text-[#ff4444]'}`}>
                {currency}{(money - config.cost).toLocaleString()}
              </span>
            </div>
          </div>

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
              onClick={handleSubmit}
              disabled={!canAfford || totalClassrooms === 0}
              className="flex-2 bg-[#00ff88] text-black font-bold hover:bg-[#00cc6e] h-12 disabled:opacity-40 disabled:cursor-not-allowed px-8"
            >
              🏗️ Construir y Continuar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
