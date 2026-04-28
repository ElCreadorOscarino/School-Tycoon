'use client';

import { useState, useMemo, useEffect } from 'react';
import { useGameStore } from '@/lib/game-store';
import { sounds } from '@/lib/sounds';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SCREEN_ORDER } from '@/lib/game-types';
import type { Quality } from '@/lib/game-types';

const LIBRARY_SIZE_OPTIONS: { key: Quality; label: string; emoji: string; desc: string; buildCost: number }[] = [
  { key: 'basic', label: 'Pequena', emoji: '📕', desc: 'Espacio reducido con estantes basicos', buildCost: 5000 },
  { key: 'standard', label: 'Mediana', emoji: '📚', desc: 'Espacio adecuado con mesas de lectura', buildCost: 15000 },
  { key: 'premium', label: 'Grande', emoji: '🏛️', desc: 'Amplia con zonas de estudio y multimedia', buildCost: 35000 },
];

const MEETING_SIZE_OPTIONS: { key: Quality; label: string; emoji: string; desc: string; buildCost: number }[] = [
  { key: 'basic', label: 'Pequena', emoji: '🪑', desc: 'Para 10 personas', buildCost: 3000 },
  { key: 'standard', label: 'Mediana', emoji: '🤝', desc: 'Para 25 personas', buildCost: 8000 },
  { key: 'premium', label: 'Grande', emoji: '🏛️', desc: 'Para 50+ personas', buildCost: 20000 },
];

const SPORTS_OPTIONS: { key: 'soccer' | 'basketball' | 'recreational'; label: string; emoji: string; desc: string; buildCost: number }[] = [
  { key: 'soccer', label: 'Futbol', emoji: '⚽', desc: 'Cancha de futbol con porterias', buildCost: 15000 },
  { key: 'basketball', label: 'Basquet', emoji: '🏀', desc: 'Cancha de basquetbol reglamentaria', buildCost: 12000 },
  { key: 'recreational', label: 'Recreativa general', emoji: '🎪', desc: 'Area abierta multiuso', buildCost: 8000 },
];

export default function ServicesScreen() {
  const {
    money, currency, classrooms, cafeteriaBuilt,
    libraryEnabled, librarySize, libraryBookCount, libraryHasLibrarian,
    meetingRoomEnabled, meetingRoomSize,
    sportsAreaEnabled, sportsAreaType,
    setLibraryEnabled, setLibrarySize, setLibraryBookCount, setLibraryHasLibrarian,
    setMeetingRoomEnabled, setMeetingRoomSize,
    setSportsAreaEnabled, setSportsAreaType,
    adjustMoney, prevScreen, nextScreen,
  } = useGameStore();

  const [localLibEnabled, setLocalLibEnabled] = useState(libraryEnabled ?? true);
  const [localLibSize, setLocalLibSize] = useState<Quality>(librarySize || 'standard');
  const [localLibBooks, setLocalLibBooks] = useState(libraryBookCount || 500);
  const [localLibrarian, setLocalLibrarian] = useState(libraryHasLibrarian ?? true);

  const [localMeetingEnabled, setLocalMeetingEnabled] = useState(meetingRoomEnabled ?? true);
  const [localMeetingSize, setLocalMeetingSize] = useState<Quality>(meetingRoomSize || 'standard');

  const [localSportsEnabled, setLocalSportsEnabled] = useState(sportsAreaEnabled ?? false);
  const [localSportsType, setLocalSportsType] = useState<'soccer' | 'basketball' | 'recreational'>(sportsAreaType || 'soccer');

  const costs = useMemo(() => {
    let buildCost = 0;
    let monthlyCost = 0;

    if (localLibEnabled) {
      const libConfig = LIBRARY_SIZE_OPTIONS.find(l => l.key === localLibSize);
      buildCost += libConfig?.buildCost || 15000;
      // Books cost
      buildCost += Math.round(localLibBooks * 5);
      if (localLibrarian) monthlyCost += 800;
    }

    if (localMeetingEnabled) {
      const meetConfig = MEETING_SIZE_OPTIONS.find(m => m.key === localMeetingSize);
      buildCost += meetConfig?.buildCost || 8000;
    }

    if (localSportsEnabled) {
      const sportConfig = SPORTS_OPTIONS.find(s => s.key === localSportsType);
      buildCost += sportConfig?.buildCost || 8000;
    }

    return { buildCost, monthlyCost };
  }, [localLibEnabled, localLibSize, localLibBooks, localLibrarian, localMeetingEnabled, localMeetingSize, localSportsEnabled, localSportsType]);

  const canAfford = money >= costs.buildCost;

  // Map data for visual
  const mapData = useMemo(() => {
    const spaces: { name: string; emoji: string; active: boolean }[] = [];
    classrooms.forEach((c, i) => {
      spaces.push({
        name: `Aula ${c.floor}-${i + 1} (${c.level === 'kinder' ? 'K' : c.level === 'primary' ? 'P' : 'S'})`,
        emoji: c.level === 'kinder' ? '🧒' : c.level === 'primary' ? '📖' : '📚',
        active: true,
      });
    });
    if (cafeteriaBuilt) spaces.push({ name: 'Cafeteria', emoji: '🍽️', active: true });
    if (localLibEnabled) spaces.push({ name: 'Biblioteca', emoji: '📚', active: true });
    if (localMeetingEnabled) spaces.push({ name: 'Sala reuniones', emoji: '🤝', active: true });
    if (localSportsEnabled) spaces.push({ name: 'Area deportiva', emoji: '⚽', active: true });
    return spaces;
  }, [classrooms, cafeteriaBuilt, localLibEnabled, localMeetingEnabled, localSportsEnabled]);

  const handleSubmit = () => {
    if (!canAfford) {
      sounds.error();
      return;
    }
    adjustMoney(-costs.buildCost);
    setLibraryEnabled(localLibEnabled);
    setLibrarySize(localLibSize);
    setLibraryBookCount(localLibBooks);
    setLibraryHasLibrarian(localLibrarian);
    setMeetingRoomEnabled(localMeetingEnabled);
    setMeetingRoomSize(localMeetingSize);
    setSportsAreaEnabled(localSportsEnabled);
    setSportsAreaType(localSportsType);
    sounds.success();
    setTimeout(() => nextScreen(), 500);
  };

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, []);

  const stepIndex = SCREEN_ORDER.indexOf('services');
  const totalSteps = SCREEN_ORDER.length;

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
            <div className="text-5xl mb-3">📚</div>
            <h1 className="text-2xl font-bold text-[#00ff88] mb-1">Servicios Adicionales</h1>
            <p className="text-[#aaaaaa] text-sm">
              💰 Presupuesto: <span className="text-[#ffcc00] font-bold">{currency}{money.toLocaleString()}</span>
            </p>
          </div>

          {/* 1. Library */}
          <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-5">
            <h2 className="text-sm text-[#aaaaaa] mb-3 font-bold uppercase tracking-wider">
              📚 1. Biblioteca
            </h2>
            <div className="flex items-center justify-between bg-[#111111] border border-[#222222] rounded-lg p-3 mb-4">
              <div>
                <div className="text-sm text-white">📚 Construir biblioteca</div>
                <div className="text-[10px] text-[#00ff88]">Aumenta mucho la reputacion academica</div>
              </div>
              <button
                onClick={() => { sounds.click(); setLocalLibEnabled(!localLibEnabled); }}
                className={`w-12 h-6 rounded-full transition-all relative ${
                  localLibEnabled ? 'bg-[#00ff88]' : 'bg-[#333333]'
                }`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                  localLibEnabled ? 'left-6' : 'left-0.5'
                }`} />
              </button>
            </div>

            {localLibEnabled && (
              <div className="space-y-4">
                <div>
                  <Label className="block text-xs text-[#aaaaaa] mb-2">Tamano:</Label>
                  <div className="space-y-2">
                    {LIBRARY_SIZE_OPTIONS.map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => { sounds.click(); setLocalLibSize(opt.key); }}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                          localLibSize === opt.key
                            ? 'border-[#00ff88] bg-[#0a1a10]'
                            : 'border-[#333333] bg-[#111111] hover:border-[#555555]'
                        }`}
                      >
                        <div>
                          <span className="text-sm font-bold text-white">{opt.emoji} {opt.label}</span>
                          <div className="text-[10px] text-[#aaaaaa]">{opt.desc}</div>
                        </div>
                        <span className="text-xs text-[#ffcc00]">{currency}{opt.buildCost.toLocaleString()}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Label className="text-xs text-[#aaaaaa]">Cantidad de libros:</Label>
                  <Input
                    type="number"
                    value={localLibBooks}
                    onChange={(e) => setLocalLibBooks(Math.min(5000, Math.max(100, Number(e.target.value))))}
                    className="w-24 bg-[#111111] border-[#333333] text-white font-mono h-8 text-sm"
                    min={100}
                    max={5000}
                  />
                  <span className="text-[10px] text-[#aaaaaa]">(100-5000)</span>
                </div>

                <div className="flex items-center justify-between bg-[#111111] border border-[#222222] rounded-lg p-3">
                  <div>
                    <div className="text-sm text-white">🧑‍💼 Bibliotecario</div>
                    <div className="text-[10px] text-[#aaaaaa]">Salario mensual: {currency}800</div>
                  </div>
                  <button
                    onClick={() => { sounds.click(); setLocalLibrarian(!localLibrarian); }}
                    className={`w-12 h-6 rounded-full transition-all relative ${
                      localLibrarian ? 'bg-[#00ff88]' : 'bg-[#333333]'
                    }`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                      localLibrarian ? 'left-6' : 'left-0.5'
                    }`} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. Meeting Room */}
          <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-5">
            <h2 className="text-sm text-[#aaaaaa] mb-3 font-bold uppercase tracking-wider">
              🤝 2. Sala de reuniones
            </h2>
            <div className="flex items-center justify-between bg-[#111111] border border-[#222222] rounded-lg p-3 mb-4">
              <div>
                <div className="text-sm text-white">🤝 Construir sala de reuniones</div>
                <div className="text-[10px] text-[#aaaaaa]">Para reuniones de padres, profesores, directivos</div>
              </div>
              <button
                onClick={() => { sounds.click(); setLocalMeetingEnabled(!localMeetingEnabled); }}
                className={`w-12 h-6 rounded-full transition-all relative ${
                  localMeetingEnabled ? 'bg-[#00ff88]' : 'bg-[#333333]'
                }`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                  localMeetingEnabled ? 'left-6' : 'left-0.5'
                }`} />
              </button>
            </div>

            {localMeetingEnabled && (
              <div>
                <Label className="block text-xs text-[#aaaaaa] mb-2">Tamano:</Label>
                <div className="flex gap-2">
                  {MEETING_SIZE_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => { sounds.click(); setLocalMeetingSize(opt.key); }}
                      className={`flex-1 p-3 rounded-lg border text-center transition-all ${
                        localMeetingSize === opt.key
                          ? 'border-[#00ff88] bg-[#0a1a10]'
                          : 'border-[#333333] bg-[#111111] hover:border-[#555555]'
                      }`}
                    >
                      <div className="text-lg">{opt.emoji}</div>
                      <div className="text-xs font-bold text-white mt-1">{opt.label}</div>
                      <div className="text-[10px] text-[#aaaaaa]">{opt.desc}</div>
                      <div className="text-[10px] text-[#ffcc00] mt-1">{currency}{opt.buildCost.toLocaleString()}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. Sports Area */}
          <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-5">
            <h2 className="text-sm text-[#aaaaaa] mb-3 font-bold uppercase tracking-wider">
              ⚽ 3. Cancha / Area deportiva
            </h2>
            <div className="flex items-center justify-between bg-[#111111] border border-[#222222] rounded-lg p-3 mb-4">
              <div>
                <div className="text-sm text-white">⚽ Construir area deportiva</div>
                <div className="text-[10px] text-[#00ff88]">Aumenta la satisfaccion de los estudiantes</div>
              </div>
              <button
                onClick={() => { sounds.click(); setLocalSportsEnabled(!localSportsEnabled); }}
                className={`w-12 h-6 rounded-full transition-all relative ${
                  localSportsEnabled ? 'bg-[#00ff88]' : 'bg-[#333333]'
                }`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                  localSportsEnabled ? 'left-6' : 'left-0.5'
                }`} />
              </button>
            </div>

            {localSportsEnabled && (
              <div>
                <Label className="block text-xs text-[#aaaaaa] mb-2">Tipo:</Label>
                <div className="space-y-2">
                  {SPORTS_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => { sounds.click(); setLocalSportsType(opt.key); }}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                        localSportsType === opt.key
                          ? 'border-[#00ff88] bg-[#0a1a10]'
                          : 'border-[#333333] bg-[#111111] hover:border-[#555555]'
                      }`}
                    >
                      <div>
                        <span className="text-sm font-bold text-white">{opt.emoji} {opt.label}</span>
                        <div className="text-[10px] text-[#aaaaaa]">{opt.desc}</div>
                      </div>
                      <span className="text-xs text-[#ffcc00]">{currency}{opt.buildCost.toLocaleString()}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 4. School Map */}
          <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-5">
            <h2 className="text-sm text-[#aaaaaa] mb-3 font-bold uppercase tracking-wider">
              🗺️ 4. Mapa interno de la escuela
            </h2>
            <p className="text-[10px] text-[#555555] mb-3">Vista previa de los espacios construidos</p>

            {mapData.length === 0 ? (
              <div className="text-center text-[#555555] text-sm py-4">No hay espacios construidos</div>
            ) : (
              <div className="bg-[#111111] border border-[#222222] rounded-lg p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                  {mapData.map((space, i) => (
                    <div
                      key={i}
                      className="bg-[#0d0d0d] border border-[#333333] rounded-lg p-2 text-center"
                    >
                      <div className="text-xl">{space.emoji}</div>
                      <div className="text-[10px] text-[#aaaaaa] mt-1 leading-tight">{space.name}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-center text-xs text-[#555555]">
                  {mapData.length} espacios en total
                </div>
              </div>
            )}
          </div>

          {/* Total Cost */}
          <div className="bg-[#0d0d0d] border border-[#00ff88] rounded-lg p-5">
            <h2 className="text-sm text-[#aaaaaa] mb-3 font-bold uppercase tracking-wider">
              💰 Resumen de servicios
            </h2>
            <div className="space-y-2">
              {localLibEnabled && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#aaaaaa]">Biblioteca ({localLibSize}):</span>
                    <span className="text-white">{currency}{(LIBRARY_SIZE_OPTIONS.find(l => l.key === localLibSize)?.buildCost || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#aaaaaa]">Libros ({localLibBooks}):</span>
                    <span className="text-white">{currency}{(localLibBooks * 5).toLocaleString()}</span>
                  </div>
                  {localLibrarian && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#aaaaaa]">Bibliotecario:</span>
                      <span className="text-[#4488ff]">{currency}800/mes</span>
                    </div>
                  )}
                </>
              )}
              {localMeetingEnabled && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#aaaaaa]">Sala reuniones ({localMeetingSize}):</span>
                  <span className="text-white">{currency}{(MEETING_SIZE_OPTIONS.find(m => m.key === localMeetingSize)?.buildCost || 0).toLocaleString()}</span>
                </div>
              )}
              {localSportsEnabled && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#aaaaaa]">Area deportiva ({localSportsType}):</span>
                  <span className="text-white">{currency}{(SPORTS_OPTIONS.find(s => s.key === localSportsType)?.buildCost || 0).toLocaleString()}</span>
                </div>
              )}
              <div className="border-t border-[#333333] pt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-[#aaaaaa] font-bold">Inversion total:</span>
                  <span className={`font-bold ${canAfford ? 'text-[#00ff88]' : 'text-[#ff4444]'}`}>
                    {currency}{costs.buildCost.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#aaaaaa] font-bold">Costos mensuales:</span>
                  <span className="font-bold text-[#4488ff]">{currency}{costs.monthlyCost}/mes</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#aaaaaa]">Saldo despues:</span>
                  <span className={`font-bold ${canAfford ? 'text-[#00ff88]' : 'text-[#ff4444]'}`}>
                    {currency}{(money - costs.buildCost).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => { sounds.click(); prevScreen(); }}
              className="flex-1 border border-[#333333] text-[#aaaaaa] hover:text-white hover:border-[#555555] h-12"
            >
              ← Anterior
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!canAfford}
              className="flex-[2] bg-[#00ff88] text-black font-bold hover:bg-[#00cc6e] h-12 disabled:opacity-40 disabled:cursor-not-allowed px-8"
            >
              💾 Guardar y Continuar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
