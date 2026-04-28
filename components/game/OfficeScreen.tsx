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
import type { Quality, Tier } from '@/lib/game-types';

const OFFICE_SIZES: { key: Quality; emoji: string; label: string; cost: number; desc: string }[] = [
  { key: 'basic', emoji: '📦', label: 'Pequena', cost: 5000, desc: 'Espacio minimo para direccion' },
  { key: 'standard', emoji: '🏢', label: 'Mediana', cost: 15000, desc: 'Espacio comodo y funcional' },
  { key: 'premium', emoji: '🏛️', label: 'Grande', cost: 35000, desc: 'Oficina amplia y elegante' },
];

const EXECUTIVE_SIZE: { key: 'executive'; emoji: string; label: string; cost: number; desc: string } = {
  key: 'executive', emoji: '👑', label: 'Ejecutiva', cost: 60000, desc: 'Lujo total para el director',
};

const COMPUTER_TIERS: { key: Tier; emoji: string; label: string; pricePerUnit: number }[] = [
  { key: 'basic', emoji: '💻', label: 'Basica', pricePerUnit: 500 },
  { key: 'medium', emoji: '💻💻', label: 'Media', pricePerUnit: 1200 },
  { key: 'high', emoji: '💻💻💻', label: 'Alta', pricePerUnit: 2500 },
];

const COMPUTER_COUNTS = [2, 5, 10, 15];

const PHONE_OPTIONS: { key: 'none' | 'basic' | 'multi'; emoji: string; label: string; cost: number; warning?: string }[] = [
  { key: 'none', emoji: '📵', label: 'Sin telefono', cost: 0, warning: 'Sin telefono no podras comunicarte con padres' },
  { key: 'basic', emoji: '📞', label: 'Basico', cost: 500 },
  { key: 'multi', emoji: '📞📞📞', label: 'Sistema multiple', cost: 3000 },
];

const STAFF_ROLES: { key: string; emoji: string; label: string; min: number; max: number; monthlySalary: number }[] = [
  { key: 'subdirectors', emoji: '👔', label: 'Subdirectores', min: 0, max: 3, monthlySalary: 1500 },
  { key: 'secretaries', emoji: '📋', label: 'Secretarios/as', min: 0, max: 5, monthlySalary: 800 },
  { key: 'receptionists', emoji: '🧑‍💼', label: 'Recepcionistas', min: 0, max: 3, monthlySalary: 600 },
  { key: 'security', emoji: '🔒', label: 'Seguridad', min: 0, max: 5, monthlySalary: 700 },
];

const FURNITURE_OPTIONS: { key: Quality; emoji: string; label: string; cost: number }[] = [
  { key: 'basic', emoji: '🪑', label: 'Basico', cost: 2000 },
  { key: 'standard', emoji: '🪑🗄️', label: 'Estandar', cost: 8000 },
  { key: 'premium', emoji: '🪑🗄️🖼️', label: 'Premium', cost: 20000 },
];

function OfficePreview({ size }: { size: string }) {
  const sizeConfig: Record<string, { w: number; h: number }> = {
    basic: { w: 14, h: 5 },
    standard: { w: 22, h: 6 },
    premium: { w: 30, h: 7 },
    executive: { w: 38, h: 8 },
  };
  const { w, h } = sizeConfig[size] || sizeConfig.standard;

  return (
    <pre className="text-[#00ff88] text-[7px] leading-[8px] overflow-hidden select-none font-mono">
      {' '.repeat(Math.max(0, Math.floor((40 - w) / 2)))}┌{'─'.repeat(w)}┐{'\n'}
      {Array.from({ length: h - 2 }, (_, i) =>
        ' '.repeat(Math.max(0, Math.floor((40 - w) / 2))) +
        '│' +
        (i === 0 ? '🖥️' + ' '.repeat(w - 2) + '│' :
         i === Math.floor(h / 2) ? '  🪑  ' + ' '.repeat(w - 8) + '│' :
         ' '.repeat(w) + '│')
      ).join('\n')}
      {'\n' + ' '.repeat(Math.max(0, Math.floor((40 - w) / 2)))}└{'─'.repeat(w)}┘
      {size === 'executive' && '\n' + ' '.repeat(Math.max(0, Math.floor((40 - w) / 2) + Math.floor(w / 2) - 3)) + '👑 🛋️ 🌿'}
    </pre>
  );
}

export default function OfficeScreen() {
  const {
    money, currency,
    officeSize, officeComputers, officePhone, officeStaff, officeFurniture,
    setOfficeSize, setOfficeComputers, setOfficePhone, setOfficeStaff, setOfficeFurniture,
    adjustMoney, prevScreen, nextScreen,
  } = useGameStore();

  const [localSize, setLocalSize] = useState<Quality | 'executive'>(officeSize || 'standard');
  const [compTier, setCompTier] = useState<Tier>(officeComputers?.tier || 'basic');
  const [compCount, setCompCount] = useState(officeComputers?.count || 2);
  const [phone, setPhone] = useState<'none' | 'basic' | 'multi'>(officePhone || 'basic');
  const [staff, setStaff] = useState({ ...officeStaff });
  const [furniture, setFurniture] = useState<Quality>(officeFurniture || 'standard');

  const officeCost = useMemo(() => {
    let total = 0;

    // Office size cost
    const sizeConfig = [...OFFICE_SIZES, EXECUTIVE_SIZE].find((s) => s.key === localSize);
    if (sizeConfig) total += sizeConfig.cost;

    // Computer cost
    const tierConfig = COMPUTER_TIERS.find((t) => t.key === compTier);
    if (tierConfig) total += tierConfig.pricePerUnit * compCount;

    // Phone cost
    const phoneConfig = PHONE_OPTIONS.find((p) => p.key === phone);
    if (phoneConfig) total += phoneConfig.cost;

    // Furniture cost
    const furnConfig = FURNITURE_OPTIONS.find((f) => f.key === furniture);
    if (furnConfig) total += furnConfig.cost;

    return total;
  }, [localSize, compTier, compCount, phone, furniture]);

  const monthlySalaryCost = useMemo(() => {
    return STAFF_ROLES.reduce((sum, role) => {
      return sum + (staff[role.key as keyof typeof staff] || 0) * role.monthlySalary;
    }, 0);
  }, [staff]);

  const canAfford = money >= officeCost;

  const handleStaffAdjust = (key: string, delta: number, min: number, max: number) => {
    sounds.click();
    const current = staff[key as keyof typeof staff] || 0;
    const newVal = Math.max(min, Math.min(max, current + delta));
    setStaff((prev) => ({ ...prev, [key]: newVal }));
  };

  const handleSubmit = () => {
    if (!canAfford) {
      sounds.error();
      return;
    }

    adjustMoney(-officeCost);
    setOfficeSize(localSize as Quality);
    setOfficeComputers({ count: compCount, tier: compTier });
    setOfficePhone(phone);
    setOfficeStaff(staff);
    setFurniture(furniture);
    sounds.success();
    setTimeout(() => nextScreen(), 500);
  };

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, []);

  const stepIndex = SCREEN_ORDER.indexOf('office');
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
            <div className="text-5xl mb-3">🎓</div>
            <h1 className="text-2xl font-bold text-[#00ff88] mb-1">La Direccion</h1>
            <p className="text-[#aaaaaa] text-sm">
              💰 Presupuesto: <span className="text-[#ffcc00] font-bold">{currency}{money.toLocaleString()}</span>
            </p>
          </div>

          {/* 1. Office Size */}
          <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-5">
            <h2 className="text-sm text-[#aaaaaa] mb-3 font-bold uppercase tracking-wider">
              🏛️ 1. Tamano de oficina
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[...OFFICE_SIZES, EXECUTIVE_SIZE].map((opt) => {
                const selected = localSize === opt.key;
                const affordable = money - officeCost + ([...OFFICE_SIZES, EXECUTIVE_SIZE].find((s) => s.key === localSize)?.cost || 0) >= opt.cost;
                return (
                  <button
                    key={opt.key}
                    onClick={() => {
                      sounds.click();
                      setLocalSize(opt.key);
                    }}
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
                      <OfficePreview size={opt.key} />
                      <div className="text-sm font-bold mt-1">{opt.emoji} {opt.label}</div>
                      <div className="text-[10px] text-[#aaaaaa]">{opt.desc}</div>
                      <div className="text-xs font-bold text-[#ffcc00] mt-1">{currency}{opt.cost.toLocaleString()}</div>
                    </div>
                    {selected && (
                      <div className="absolute top-1.5 right-1.5 text-[#00ff88] text-xs">✓</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Computers */}
          <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-5">
            <h2 className="text-sm text-[#aaaaaa] mb-3 font-bold uppercase tracking-wider">
              💻 2. Equipamiento de computadoras
            </h2>

            {/* Tier */}
            <div className="mb-3">
              <label className="block text-xs text-[#aaaaaa] mb-2">Gama:</label>
              <div className="flex flex-wrap gap-2">
                {COMPUTER_TIERS.map((tier) => (
                  <button
                    key={tier.key}
                    onClick={() => { sounds.click(); setCompTier(tier.key); }}
                    className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                      compTier === tier.key
                        ? 'border-[#00ff88] bg-[#0a1a10] text-[#00ff88]'
                        : 'border-[#333333] bg-[#111111] text-[#aaaaaa] hover:border-[#555555]'
                    }`}
                  >
                    {tier.emoji} {tier.label}
                    <span className="text-[10px] text-[#555555] ml-1">({currency}{tier.pricePerUnit}/u)</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Count */}
            <div>
              <label className="block text-xs text-[#aaaaaa] mb-2">Cantidad:</label>
              <div className="flex flex-wrap gap-2">
                {COMPUTER_COUNTS.map((count) => (
                  <button
                    key={count}
                    onClick={() => { sounds.click(); setCompCount(count); }}
                    className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                      compCount === count
                        ? 'border-[#00ff88] bg-[#0a1a10] text-[#00ff88]'
                        : 'border-[#333333] bg-[#111111] text-[#aaaaaa] hover:border-[#555555]'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3 text-sm">
              <span className="text-[#aaaaaa]">Costo computadoras:</span>{' '}
              <span className="text-[#ffcc00] font-bold">
                {currency}{((COMPUTER_TIERS.find((t) => t.key === compTier)?.pricePerUnit || 0) * compCount).toLocaleString()}
              </span>
            </div>
          </div>

          {/* 3. Phone */}
          <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-5">
            <h2 className="text-sm text-[#aaaaaa] mb-3 font-bold uppercase tracking-wider">
              📞 3. Telefono
            </h2>
            <div className="space-y-2">
              {PHONE_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => { sounds.click(); setPhone(opt.key); }}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                    phone === opt.key
                      ? 'border-[#00ff88] bg-[#0a1a10]'
                      : 'border-[#333333] bg-[#111111] hover:border-[#555555]'
                  }`}
                >
                  <div>
                    <span className="text-sm font-bold text-white">{opt.emoji} {opt.label}</span>
                    {opt.warning && phone === opt.key && (
                      <div className="text-[10px] text-[#ff4444] mt-0.5">⚠️ {opt.warning}</div>
                    )}
                  </div>
                  <span className="text-sm text-[#ffcc00]">{opt.cost > 0 ? `${currency}${opt.cost.toLocaleString()}` : 'Gratis'}</span>
                </button>
              ))}
            </div>
            {phone === 'none' && (
              <div className="mt-2 bg-[#1a1a0a] border border-[#ffcc00] rounded p-2 text-[10px] text-[#ffcc00]">
                ⚠️ Sin telefono no podras comunicarte con padres de familia
              </div>
            )}
          </div>

          {/* 4. Staff */}
          <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-5">
            <h2 className="text-sm text-[#aaaaaa] mb-3 font-bold uppercase tracking-wider">
              👥 4. Personal de direccion
            </h2>
            <div className="space-y-3">
              {STAFF_ROLES.map((role) => {
                const count = staff[role.key as keyof typeof staff] || 0;
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
                        onClick={() => handleStaffAdjust(role.key, -1, role.min, role.max)}
                        className="w-8 h-8 rounded bg-[#222222] hover:bg-[#333333] text-white flex items-center justify-center text-lg transition-colors"
                      >
                        -
                      </button>
                      <span className="text-lg font-bold text-white min-w-[2rem] text-center">{count}</span>
                      <button
                        onClick={() => handleStaffAdjust(role.key, 1, role.min, role.max)}
                        className="w-8 h-8 rounded bg-[#222222] hover:bg-[#333333] text-white flex items-center justify-center text-lg transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 text-sm text-right">
              <span className="text-[#aaaaaa]">Costo mensual personal:</span>{' '}
              <span className="text-[#ffcc00] font-bold">{currency}{monthlySalaryCost.toLocaleString()}/mes</span>
            </div>
          </div>

          {/* 5. Furniture */}
          <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-5">
            <h2 className="text-sm text-[#aaaaaa] mb-3 font-bold uppercase tracking-wider">
              🪑 5. Mobiliario
            </h2>
            <div className="flex flex-wrap gap-2">
              {FURNITURE_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => { sounds.click(); setFurniture(opt.key); }}
                  className={`flex-1 min-w-[140px] p-3 rounded-lg border text-left transition-all ${
                    furniture === opt.key
                      ? 'border-[#00ff88] bg-[#0a1a10]'
                      : 'border-[#333333] bg-[#111111] hover:border-[#555555]'
                  }`}
                >
                  <div className="text-sm font-bold text-white">{opt.emoji} {opt.label}</div>
                  <div className="text-xs text-[#ffcc00] mt-1">{currency}{opt.cost.toLocaleString()}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Total Cost */}
          <div className="bg-[#0d0d0d] border border-[#00ff88] rounded-lg p-5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[#aaaaaa] text-sm">Costo total de oficina:</span>
              <span className="text-[#00ff88] font-bold text-xl">{currency}{officeCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#aaaaaa] text-sm">Saldo despues:</span>
              <span className={`font-bold ${canAfford ? 'text-[#00ff88]' : 'text-[#ff4444]'}`}>
                {currency}{(money - officeCost).toLocaleString()}
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
