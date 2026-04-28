'use client';

import { useState, useMemo, useEffect } from 'react';
import { useGameStore } from '@/lib/game-store';
import { sounds } from '@/lib/sounds';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SCREEN_ORDER } from '@/lib/game-types';
import type { Quality, FoodPricing } from '@/lib/game-types';

const QUALITY_OPTIONS: { key: Quality; emoji: string; label: string }[] = [
  { key: 'basic', emoji: '⭐', label: 'Basica' },
  { key: 'standard', emoji: '⭐⭐', label: 'Estandar' },
  { key: 'premium', emoji: '⭐⭐⭐', label: 'Premium' },
];

const SIZE_OPTIONS: { key: Quality; label: string; emoji: string; buildCost: number; desc: string }[] = [
  { key: 'basic', label: 'Pequena', emoji: '🏠', buildCost: 10000, desc: 'Capacidad reducida' },
  { key: 'standard', label: 'Mediana', emoji: '🏢', buildCost: 25000, desc: 'Espacio adecuado' },
  { key: 'premium', label: 'Grande', emoji: '🏛️', buildCost: 50000, desc: 'Amplia y moderna' },
];

const CAFETERIA_STAFF = [
  { key: 'cooks', emoji: '👨‍🍳', label: 'Cocineros', min: 0, max: 5, monthlySalary: 700 },
  { key: 'cashiers', emoji: '🧾', label: 'Cajeros', min: 0, max: 5, monthlySalary: 500 },
  { key: 'waiters', emoji: '🍽️', label: 'Meseros', min: 0, max: 5, monthlySalary: 450 },
];

export default function BathroomsCafeteriaScreen() {
  const {
    money, currency, classrooms,
    bathroomCount, bathroomQuality, bathroomCleaners, inclusiveBathroom,
    cafeteriaBuilt, cafeteriaSize, cafeteriaFoodQuality, cafeteriaPricing, cafeteriaMealPrice, cafeteriaStaff,
    setBathroomCount, setBathroomQuality, setBathroomCleaners, setInclusiveBathroom,
    setCafeteriaBuilt, setCafeteriaSize, setCafeteriaFoodQuality, setCafeteriaPricing, setCafeteriaMealPrice, setCafeteriaStaff,
    adjustMoney, prevScreen, nextScreen,
  } = useGameStore();

  const [localBathCount, setLocalBathCount] = useState(bathroomCount || 2);
  const [localBathQuality, setLocalBathQuality] = useState<Quality>(bathroomQuality || 'standard');
  const [localBathCleaners, setLocalBathCleaners] = useState(bathroomCleaners || 1);
  const [localInclusive, setLocalInclusive] = useState(inclusiveBathroom || false);

  const [localCafBuilt, setLocalCafBuilt] = useState(cafeteriaBuilt ?? true);
  const [localCafSize, setLocalCafSize] = useState<Quality>(cafeteriaSize || 'standard');
  const [localCafQuality, setLocalCafQuality] = useState<Quality>(cafeteriaFoodQuality || 'standard');
  const [localCafPricing, setLocalCafPricing] = useState<FoodPricing>(cafeteriaPricing || 'paid');
  const [localCafPrice, setLocalCafPrice] = useState(cafeteriaMealPrice || 5);
  const [localCafStaff, setLocalCafStaff] = useState({ ...cafeteriaStaff });

  const maxStudents = useMemo(() => classrooms.reduce((sum, c) => sum + c.capacity, 0), [classrooms]);
  const minBathrooms = useMemo(() => Math.max(2, Math.ceil(maxStudents / 40)), [maxStudents]);

  const bathroomCosts = useMemo(() => {
    const qualityCosts: Record<Quality, number> = { basic: 2000, standard: 5000, premium: 10000 };
    const buildCost = localBathCount * qualityCosts[localBathQuality];
    const extraForInclusive = localInclusive ? 3000 : 0;
    return { buildCost, extraForInclusive, total: buildCost + extraForInclusive };
  }, [localBathCount, localBathQuality, localInclusive]);

  const cafeteriaCosts = useMemo(() => {
    if (!localCafBuilt) return { buildCost: 0, staffMonthly: 0, total: 0 };
    const sizeConfig = SIZE_OPTIONS.find((s) => s.key === localCafSize);
    const buildCost = sizeConfig?.buildCost || 25000;
    const staffMonthly =
      localCafStaff.cooks * 700 +
      localCafStaff.cashiers * 500 +
      localCafStaff.waiters * 450;
    return { buildCost, staffMonthly, total: buildCost };
  }, [localCafBuilt, localCafSize, localCafStaff]);

  const totalOneTimeCost = bathroomCosts.total + cafeteriaCosts.total;
  const totalMonthlyCost = localBathCleaners * 500 + cafeteriaCosts.staffMonthly;
  const canAfford = money >= totalOneTimeCost;
  const isBelowMin = localBathCount < minBathrooms;

  const handleCafStaffAdjust = (key: string, delta: number, min: number, max: number) => {
    sounds.click();
    const current = localCafStaff[key as keyof typeof localCafStaff] || 0;
    const newVal = Math.max(min, Math.min(max, current + delta));
    setLocalCafStaff((prev) => ({ ...prev, [key]: newVal }));
  };

  const handleSubmit = () => {
    if (!canAfford) {
      sounds.error();
      return;
    }

    adjustMoney(-totalOneTimeCost);
    setBathroomCount(localBathCount);
    setBathroomQuality(localBathQuality);
    setBathroomCleaners(localBathCleaners);
    setInclusiveBathroom(localInclusive);
    setCafeteriaBuilt(localCafBuilt);
    setCafeteriaSize(localCafSize);
    setCafeteriaFoodQuality(localCafQuality);
    setCafeteriaPricing(localCafPricing);
    setCafeteriaMealPrice(localCafPrice);
    setCafeteriaStaff(localCafStaff);
    sounds.success();
    setTimeout(() => nextScreen(), 500);
  };

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, []);

  const stepIndex = SCREEN_ORDER.indexOf('bathrooms-cafeteria');
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
            <div className="text-5xl mb-3">🚽🍽️</div>
            <h1 className="text-2xl font-bold text-[#00ff88] mb-1">Banos y Cafeteria</h1>
            <p className="text-[#aaaaaa] text-sm">
              💰 Presupuesto: <span className="text-[#ffcc00] font-bold">{currency}{money.toLocaleString()}</span>
            </p>
          </div>

          {/* Section 1: Bathrooms */}
          <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-5">
            <h2 className="text-sm text-[#aaaaaa] mb-3 font-bold uppercase tracking-wider">
              🚽 Seccion 1: Banos
            </h2>

            {/* Min required warning */}
            <div className="bg-[#111111] border border-[#222222] rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm">👥 Max. estudiantes: <span className="text-white font-bold">{maxStudents}</span></span>
              </div>
              <div className="text-xs mt-1">
                Minimo requerido: <span className={`font-bold ${isBelowMin ? 'text-[#ff4444]' : 'text-[#00ff88]'}`}>{minBathrooms} banos</span>
                (1 bano por cada 40 estudiantes)
              </div>
            </div>

            {isBelowMin && (
              <div className="bg-[#1a0a0a] border border-[#ff4444] rounded-lg p-2 mb-4 text-[10px] text-[#ff4444]">
                ⚠️ Tienes menos banos de los requeridos. Esto afectara la satisfaccion de los estudiantes.
              </div>
            )}

            {/* Bathroom count */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-white">Cantidad de banos:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { sounds.click(); setLocalBathCount(Math.max(1, localBathCount - 1)); }}
                  className="w-8 h-8 rounded bg-[#222222] hover:bg-[#333333] text-white flex items-center justify-center text-lg transition-colors"
                >
                  -
                </button>
                <span className="text-xl font-bold text-white min-w-[2rem] text-center">{localBathCount}</span>
                <button
                  onClick={() => { sounds.click(); setLocalBathCount(localBathCount + 1); }}
                  className="w-8 h-8 rounded bg-[#222222] hover:bg-[#333333] text-white flex items-center justify-center text-lg transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Quality */}
            <div className="mb-4">
              <label className="block text-xs text-[#aaaaaa] mb-2">Calidad:</label>
              <div className="flex gap-2">
                {QUALITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => { sounds.click(); setLocalBathQuality(opt.key); }}
                    className={`flex-1 p-3 rounded-lg border text-center transition-all ${
                      localBathQuality === opt.key
                        ? 'border-[#00ff88] bg-[#0a1a10]'
                        : 'border-[#333333] bg-[#111111] hover:border-[#555555]'
                    }`}
                  >
                    <div className="text-sm">{opt.emoji}</div>
                    <div className="text-xs font-bold text-white mt-1">{opt.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Cleaners */}
            <div className="mb-4">
              <label className="block text-xs text-[#aaaaaa] mb-2">🧹 Personal de limpieza dedicado:</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { sounds.click(); setLocalBathCleaners(Math.max(0, localBathCleaners - 1)); }}
                  className="w-8 h-8 rounded bg-[#222222] hover:bg-[#333333] text-white flex items-center justify-center text-lg transition-colors"
                >
                  -
                </button>
                <span className="text-xl font-bold text-white min-w-[2rem] text-center">{localBathCleaners}</span>
                <button
                  onClick={() => { sounds.click(); setLocalBathCleaners(Math.min(5, localBathCleaners + 1)); }}
                  className="w-8 h-8 rounded bg-[#222222] hover:bg-[#333333] text-white flex items-center justify-center text-lg transition-colors"
                >
                  +
                </button>
                <span className="text-xs text-[#aaaaaa] ml-2">({currency}500/mes c/u)</span>
              </div>
            </div>

            {/* Inclusive toggle */}
            <div className="flex items-center justify-between bg-[#111111] border border-[#222222] rounded-lg p-3 mb-4">
              <div>
                <div className="text-sm text-white">⚧ Bano inclusivo</div>
                <div className="text-[10px] text-[#aaaaaa]">Bano accesible e inclusivo (+{currency}3,000)</div>
              </div>
              <button
                onClick={() => { sounds.click(); setLocalInclusive(!localInclusive); }}
                className={`w-12 h-6 rounded-full transition-all relative ${
                  localInclusive ? 'bg-[#00ff88]' : 'bg-[#333333]'
                }`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                  localInclusive ? 'left-6' : 'left-0.5'
                }`} />
              </button>
            </div>

            {/* Bathroom cost breakdown */}
            <div className="bg-[#111111] border border-[#222222] rounded-lg p-3 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-[#aaaaaa]">Construccion banos ({localBathCount}):</span>
                <span className="text-white">{currency}{bathroomCosts.buildCost.toLocaleString()}</span>
              </div>
              {localInclusive && (
                <div className="flex justify-between text-xs">
                  <span className="text-[#aaaaaa]">Bano inclusivo:</span>
                  <span className="text-white">{currency}3,000</span>
                </div>
              )}
              <div className="flex justify-between text-xs">
                <span className="text-[#aaaaaa]">Limpieza mensual:</span>
                <span className="text-white">{currency}{(localBathCleaners * 500).toLocaleString()}/mes</span>
              </div>
              <div className="border-t border-[#222222] pt-1 flex justify-between text-xs font-bold">
                <span className="text-[#aaaaaa]">Subtotal banos:</span>
                <span className="text-[#ffcc00]">{currency}{bathroomCosts.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Cafeteria */}
          <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-5">
            <h2 className="text-sm text-[#aaaaaa] mb-3 font-bold uppercase tracking-wider">
              🍽️ Seccion 2: Cafeteria
            </h2>

            {/* Built toggle */}
            <div className="flex items-center justify-between bg-[#111111] border border-[#222222] rounded-lg p-3 mb-4">
              <div>
                <div className="text-sm text-white">🍽️ Construir cafeteria</div>
                <div className="text-[10px] text-[#aaaaaa]">
                  {localCafBuilt ? 'La cafeteria estara disponible' : 'Sin cafeteria en la escuela'}
                </div>
              </div>
              <button
                onClick={() => { sounds.click(); setLocalCafBuilt(!localCafBuilt); }}
                className={`w-12 h-6 rounded-full transition-all relative ${
                  localCafBuilt ? 'bg-[#00ff88]' : 'bg-[#333333]'
                }`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                  localCafBuilt ? 'left-6' : 'left-0.5'
                }`} />
              </button>
            </div>

            {!localCafBuilt && (
              <div className="bg-[#1a1a0a] border border-[#ffcc00] rounded-lg p-3 mb-4 text-[10px] text-[#ffcc00]">
                ⚠️ Sin cafeteria, la satisfaccion de los estudiantes disminuira significativamente.
              </div>
            )}

            {localCafBuilt && (
              <div className="space-y-4">
                {/* Size */}
                <div>
                  <label className="block text-xs text-[#aaaaaa] mb-2">📐 Tamano:</label>
                  <div className="flex gap-2">
                    {SIZE_OPTIONS.map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => { sounds.click(); setLocalCafSize(opt.key); }}
                        className={`flex-1 p-3 rounded-lg border text-center transition-all ${
                          localCafSize === opt.key
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

                {/* Food quality */}
                <div>
                  <label className="block text-xs text-[#aaaaaa] mb-2">🍳 Calidad de comida:</label>
                  <div className="flex gap-2">
                    {QUALITY_OPTIONS.map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => { sounds.click(); setLocalCafQuality(opt.key); }}
                        className={`flex-1 p-3 rounded-lg border text-center transition-all ${
                          localCafQuality === opt.key
                            ? 'border-[#00ff88] bg-[#0a1a10]'
                            : 'border-[#333333] bg-[#111111] hover:border-[#555555]'
                        }`}
                      >
                        <div className="text-sm">{opt.emoji}</div>
                        <div className="text-xs font-bold text-white mt-1">{opt.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pricing */}
                <div>
                  <label className="block text-xs text-[#aaaaaa] mb-2">💰 Tipo de servicio:</label>
                  <div className="space-y-2">
                    {([
                      { key: 'free' as FoodPricing, emoji: '🎁', label: 'Gratuita', desc: 'Comida incluida en la mensualidad' },
                      { key: 'paid' as FoodPricing, emoji: '💵', label: 'De pago', desc: 'Los estudiantes pagan por su comida' },
                      { key: 'mixed' as FoodPricing, emoji: '🔄', label: 'Mixta', desc: 'Algunos alimentos gratuitos, otros de pago' },
                    ]).map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => { sounds.click(); setLocalCafPricing(opt.key); }}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                          localCafPricing === opt.key
                            ? 'border-[#00ff88] bg-[#0a1a10]'
                            : 'border-[#333333] bg-[#111111] hover:border-[#555555]'
                        }`}
                      >
                        <div>
                          <span className="text-sm font-bold text-white">{opt.emoji} {opt.label}</span>
                          <div className="text-[10px] text-[#aaaaaa]">{opt.desc}</div>
                        </div>
                        {localCafPricing === opt.key && <span className="text-[#00ff88]">✓</span>}
                      </button>
                    ))}
                  </div>
                  {localCafPricing !== 'free' && (
                    <div className="mt-2 flex items-center gap-2">
                      <label className="text-xs text-[#aaaaaa]">Precio por comida:</label>
                      <Input
                        type="number"
                        value={localCafPrice}
                        onChange={(e) => setLocalCafPrice(Number(e.target.value))}
                        className="w-24 bg-[#111111] border-[#333333] text-white font-mono h-8 text-sm"
                        min={1}
                        max={100}
                      />
                      <span className="text-xs text-[#aaaaaa]">{currency}</span>
                    </div>
                  )}
                </div>

                {/* Cafeteria Staff */}
                <div>
                  <label className="block text-xs text-[#aaaaaa] mb-2">👥 Personal de cafeteria:</label>
                  <div className="space-y-2">
                    {CAFETERIA_STAFF.map((role) => {
                      const count = localCafStaff[role.key as keyof typeof localCafStaff] || 0;
                      return (
                        <div key={role.key} className="flex items-center justify-between bg-[#111111] border border-[#222222] rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{role.emoji}</span>
                            <div>
                              <div className="text-sm font-bold text-white">{role.label}</div>
                              <div className="text-[10px] text-[#aaaaaa]">{currency}{role.monthlySalary}/mes</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleCafStaffAdjust(role.key, -1, role.min, role.max)}
                              className="w-7 h-7 rounded bg-[#222222] hover:bg-[#333333] text-white flex items-center justify-center text-sm transition-colors"
                            >
                              -
                            </button>
                            <span className="text-base font-bold text-white min-w-[1.5rem] text-center">{count}</span>
                            <button
                              onClick={() => handleCafStaffAdjust(role.key, 1, role.min, role.max)}
                              className="w-7 h-7 rounded bg-[#222222] hover:bg-[#333333] text-white flex items-center justify-center text-sm transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Cafeteria cost breakdown */}
                <div className="bg-[#111111] border border-[#222222] rounded-lg p-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#aaaaaa]">Construccion cafeteria:</span>
                    <span className="text-white">{currency}{cafeteriaCosts.buildCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#aaaaaa]">Personal mensual:</span>
                    <span className="text-white">{currency}{cafeteriaCosts.staffMonthly.toLocaleString()}/mes</span>
                  </div>
                  <div className="border-t border-[#222222] pt-1 flex justify-between text-xs font-bold">
                    <span className="text-[#aaaaaa]">Subtotal cafeteria:</span>
                    <span className="text-[#ffcc00]">{currency}{cafeteriaCosts.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Total Cost */}
          <div className="bg-[#0d0d0d] border border-[#00ff88] rounded-lg p-5">
            <h2 className="text-sm text-[#aaaaaa] mb-3 font-bold uppercase tracking-wider">
              💰 Resumen total
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#aaaaaa]">Banos (inversion):</span>
                <span className="text-white">{currency}{bathroomCosts.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#aaaaaa]">Cafeteria (inversion):</span>
                <span className="text-white">{currency}{cafeteriaCosts.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#aaaaaa]">Costos mensuales:</span>
                <span className="text-[#4488ff]">{currency}{totalMonthlyCost.toLocaleString()}/mes</span>
              </div>
              <div className="border-t border-[#333333] pt-2 flex justify-between">
                <span className="text-[#aaaaaa] font-bold">Inversion total:</span>
                <span className={`font-bold text-lg ${canAfford ? 'text-[#00ff88]' : 'text-[#ff4444]'}`}>
                  {currency}{totalOneTimeCost.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#aaaaaa]">Saldo despues:</span>
                <span className={`font-bold ${canAfford ? 'text-[#00ff88]' : 'text-[#ff4444]'}`}>
                  {currency}{(money - totalOneTimeCost).toLocaleString()}
                </span>
              </div>
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
