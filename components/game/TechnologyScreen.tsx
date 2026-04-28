'use client';

import { useState, useMemo, useEffect } from 'react';
import { useGameStore } from '@/lib/game-store';
import { sounds } from '@/lib/sounds';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { SCREEN_ORDER } from '@/lib/game-types';
import type { InternetType, Tier } from '@/lib/game-types';

const INTERNET_OPTIONS: { key: InternetType; emoji: string; label: string; desc: string; monthlyCost: number; effect: string }[] = [
  { key: 'none', emoji: '📵', label: 'Sin internet', desc: 'Economico pero sin conectividad', monthlyCost: 0, effect: '-5 reputacion' },
  { key: 'open', emoji: '📶', label: 'Internet libre sin contrasena', desc: 'Comodo pero lento y poco seguro', monthlyCost: 50, effect: 'Velocidad baja' },
  { key: 'password', emoji: '🔒', label: 'Internet con contrasena', desc: 'Seguro, velocidad moderada', monthlyCost: 100, effect: 'Velocidad moderada' },
  { key: 'fiber', emoji: '⚡', label: 'Fibra optica de alta velocidad', desc: 'Caro pero muy eficiente', monthlyCost: 300, effect: '+3 reputacion, +2 satisfaccion' },
];

const TIER_OPTIONS: { key: Tier; label: string; costMultiplier: number }[] = [
  { key: 'basic', label: 'Basica', costMultiplier: 1 },
  { key: 'medium', label: 'Media', costMultiplier: 1.8 },
  { key: 'high', label: 'Alta', costMultiplier: 3 },
];

const CAMERA_LOCATIONS = [
  { id: 'entradas', label: 'Entradas', emoji: '🚪' },
  { id: 'pasillos', label: 'Pasillos', emoji: '🚶' },
  { id: 'cafeteria', label: 'Cafeteria', emoji: '🍽️' },
  { id: 'exterior', label: 'Exterior', emoji: '🌳' },
  { id: 'aulas', label: 'Aulas', emoji: '🏫' },
  { id: 'patios', label: 'Patios', emoji: '⚽' },
];

const LAB_COMPUTER_OPTIONS = [5, 10, 15, 20, 30];

const LAB_SOFTWARE_OPTIONS: { key: 'basic' | 'educational' | 'programming'; label: string; desc: string; costPerUnit: number }[] = [
  { key: 'basic', label: 'Basico', desc: 'Navegador y procesador de texto', costPerUnit: 50 },
  { key: 'educational', label: 'Educativo', desc: 'Herramientas de aprendizaje interactivo', costPerUnit: 120 },
  { key: 'programming', label: 'Programacion', desc: 'IDEs, compiladores, herramientas de desarrollo', costPerUnit: 200 },
];

export default function TechnologyScreen() {
  const {
    money, currency,
    internetType, teacherLaptops, studentDevices, cameraCount, cameraType, cameraLocations,
    computerLabEnabled, computerLabCount, computerLabTier, computerLabSoftware,
    setInternetType, setTeacherLaptops, setStudentDevices, setCameraCount, setCameraType, setCameraLocations,
    setComputerLabEnabled, setComputerLabCount, setComputerLabTier, setComputerLabSoftware,
    adjustMoney, prevScreen, nextScreen,
  } = useGameStore();

  const [localInternet, setLocalInternet] = useState<InternetType>(internetType || 'password');
  const [localTeacherLaptops, setLocalTeacherLaptops] = useState(teacherLaptops || { enabled: true, tier: 'medium' as Tier });
  const [localStudentDevices, setLocalStudentDevices] = useState(studentDevices || { enabled: false, type: 'tablet' as 'laptop' | 'tablet', tier: 'basic' as Tier });
  const [localCameraCount, setLocalCameraCount] = useState(cameraCount || 4);
  const [localCameraType, setLocalCameraType] = useState<'basic' | '360'>(cameraType || 'basic');
  const [localCameraLocations, setLocalCameraLocations] = useState<string[]>(cameraLocations || ['entradas', 'pasillos']);
  const [localLabEnabled, setLocalLabEnabled] = useState(computerLabEnabled || false);
  const [localLabCount, setLocalLabCount] = useState(computerLabCount || 10);
  const [localLabTier, setLocalLabTier] = useState<Tier>(computerLabTier || 'basic');
  const [localLabSoftware, setLocalLabSoftware] = useState<'basic' | 'educational' | 'programming'>(computerLabSoftware || 'basic');

  const costs = useMemo(() => {
    const internet = INTERNET_OPTIONS.find(i => i.key === localInternet)?.monthlyCost || 0;

    // Teacher laptops
    let teacherLaptopMonthly = 0;
    if (localTeacherLaptops.enabled) {
      const tierMult = TIER_OPTIONS.find(t => t.key === localTeacherLaptops.tier)?.costMultiplier || 1;
      teacherLaptopMonthly = Math.round(800 * tierMult); // lease cost per month
    }

    // Student devices
    const studentDeviceCost = localStudentDevices.enabled
      ? TIER_OPTIONS.find(t => t.key === localStudentDevices.tier)?.costMultiplier || 1
      : 0;

    // Cameras
    const cameraUnitCost = localCameraType === '360' ? 800 : 400;
    const cameraBuildCost = localCameraCount * cameraUnitCost;

    // Computer lab
    let labBuildCost = 0;
    let labMonthly = 0;
    if (localLabEnabled) {
      const tierMult = TIER_OPTIONS.find(t => t.key === localLabTier)?.costMultiplier || 1;
      const softwareCost = LAB_SOFTWARE_OPTIONS.find(s => s.key === localLabSoftware)?.costPerUnit || 50;
      labBuildCost = Math.round(localLabCount * 800 * tierMult) + (localLabCount * softwareCost);
      labMonthly = Math.round(localLabCount * 30 * tierMult); // maintenance
    }

    const totalBuild = cameraBuildCost + labBuildCost;
    const totalMonthly = internet + teacherLaptopMonthly + labMonthly;

    return { internet, teacherLaptopMonthly, cameraBuildCost, labBuildCost, labMonthly, totalBuild, totalMonthly, studentDeviceCost };
  }, [localInternet, localTeacherLaptops, localStudentDevices, localCameraCount, localCameraType, localLabEnabled, localLabCount, localLabTier, localLabSoftware]);

  const canAfford = money >= costs.totalBuild;

  const toggleCameraLocation = (locId: string) => {
    sounds.click();
    setLocalCameraLocations(prev =>
      prev.includes(locId) ? prev.filter(l => l !== locId) : [...prev, locId]
    );
  };

  const handleSubmit = () => {
    if (!canAfford) {
      sounds.error();
      return;
    }
    adjustMoney(-costs.totalBuild);
    setInternetType(localInternet);
    setTeacherLaptops(localTeacherLaptops);
    setStudentDevices(localStudentDevices);
    setCameraCount(localCameraCount);
    setCameraType(localCameraType);
    setCameraLocations(localCameraLocations);
    setComputerLabEnabled(localLabEnabled);
    setComputerLabCount(localLabCount);
    setComputerLabTier(localLabTier);
    setComputerLabSoftware(localLabSoftware);
    sounds.success();
    setTimeout(() => nextScreen(), 500);
  };

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, []);

  const stepIndex = SCREEN_ORDER.indexOf('technology');
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
            <div className="text-5xl mb-3">💻</div>
            <h1 className="text-2xl font-bold text-[#00ff88] mb-1">Tecnologia e Infraestructura</h1>
            <p className="text-[#aaaaaa] text-sm">
              💰 Presupuesto: <span className="text-[#ffcc00] font-bold">{currency}{money.toLocaleString()}</span>
            </p>
          </div>

          {/* 1. Internet */}
          <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-5">
            <h2 className="text-sm text-[#aaaaaa] mb-3 font-bold uppercase tracking-wider">
              🌐 1. Internet
            </h2>
            <div className="space-y-2">
              {INTERNET_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => { sounds.click(); setLocalInternet(opt.key); }}
                  className={`w-full flex items-center justify-between p-4 rounded-lg border text-left transition-all ${
                    localInternet === opt.key
                      ? 'border-[#00ff88] bg-[#0a1a10]'
                      : 'border-[#333333] bg-[#111111] hover:border-[#555555]'
                  }`}
                >
                  <div>
                    <div className="text-sm font-bold text-white">{opt.emoji} {opt.label}</div>
                    <div className="text-[10px] text-[#aaaaaa] mt-0.5">{opt.desc}</div>
                    <div className="text-[10px] mt-0.5" style={{ color: opt.key === 'none' ? '#ff4444' : '#00ff88' }}>{opt.effect}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-[#4488ff]">
                      {opt.monthlyCost > 0 ? `${currency}${opt.monthlyCost}/mes` : 'Gratis'}
                    </div>
                    {localInternet === opt.key && <div className="text-[#00ff88] text-xs">✓</div>}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Teacher Laptops */}
          <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-5">
            <h2 className="text-sm text-[#aaaaaa] mb-3 font-bold uppercase tracking-wider">
              💻 2. Laptops para profesores
            </h2>
            <div className="flex items-center justify-between bg-[#111111] border border-[#222222] rounded-lg p-3 mb-4">
              <div>
                <div className="text-sm text-white">💻 Proporcionar laptops</div>
                <div className="text-[10px] text-[#aaaaaa]">Permite a profesores planear clases digitalmente</div>
              </div>
              <button
                onClick={() => { sounds.click(); setLocalTeacherLaptops(prev => ({ ...prev, enabled: !prev.enabled })); }}
                className={`w-12 h-6 rounded-full transition-all relative ${
                  localTeacherLaptops.enabled ? 'bg-[#00ff88]' : 'bg-[#333333]'
                }`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                  localTeacherLaptops.enabled ? 'left-6' : 'left-0.5'
                }`} />
              </button>
            </div>

            {localTeacherLaptops.enabled && (
              <div>
                <Label className="block text-xs text-[#aaaaaa] mb-2">Nivel:</Label>
                <div className="flex gap-2">
                  {TIER_OPTIONS.map((tier) => (
                    <button
                      key={tier.key}
                      onClick={() => { sounds.click(); setLocalTeacherLaptops(prev => ({ ...prev, tier: tier.key })); }}
                      className={`flex-1 p-3 rounded-lg border text-center transition-all ${
                        localTeacherLaptops.tier === tier.key
                          ? 'border-[#00ff88] bg-[#0a1a10]'
                          : 'border-[#333333] bg-[#111111] hover:border-[#555555]'
                      }`}
                    >
                      <div className="text-xs font-bold text-white">{tier.label}</div>
                      <div className="text-[10px] text-[#4488ff] mt-1">{currency}{Math.round(800 * tier.costMultiplier)}/mes</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. Student Devices */}
          <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-5">
            <h2 className="text-sm text-[#aaaaaa] mb-3 font-bold uppercase tracking-wider">
              💻📱 3. Laptops/Tablets para estudiantes
            </h2>
            <div className="flex items-center justify-between bg-[#111111] border border-[#222222] rounded-lg p-3 mb-4">
              <div>
                <div className="text-sm text-white">💻📱 Proporcionar dispositivos</div>
                <div className="text-[10px] text-[#aaaaaa]">Un dispositivo por estudiante</div>
              </div>
              <button
                onClick={() => { sounds.click(); setLocalStudentDevices(prev => ({ ...prev, enabled: !prev.enabled })); }}
                className={`w-12 h-6 rounded-full transition-all relative ${
                  localStudentDevices.enabled ? 'bg-[#00ff88]' : 'bg-[#333333]'
                }`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                  localStudentDevices.enabled ? 'left-6' : 'left-0.5'
                }`} />
              </button>
            </div>

            {localStudentDevices.enabled && (
              <div className="space-y-3">
                <div>
                  <Label className="block text-xs text-[#aaaaaa] mb-2">Tipo de dispositivo:</Label>
                  <div className="flex gap-2">
                    {(['laptop', 'tablet'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => { sounds.click(); setLocalStudentDevices(prev => ({ ...prev, type })); }}
                        className={`flex-1 p-3 rounded-lg border text-center transition-all ${
                          localStudentDevices.type === type
                            ? 'border-[#00ff88] bg-[#0a1a10]'
                            : 'border-[#333333] bg-[#111111] hover:border-[#555555]'
                        }`}
                      >
                        <div className="text-lg">{type === 'laptop' ? '💻' : '📱'}</div>
                        <div className="text-xs font-bold text-white mt-1">{type === 'laptop' ? 'Laptop' : 'Tablet'}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="block text-xs text-[#aaaaaa] mb-2">Nivel:</Label>
                  <div className="flex gap-2">
                    {TIER_OPTIONS.map((tier) => (
                      <button
                        key={tier.key}
                        onClick={() => { sounds.click(); setLocalStudentDevices(prev => ({ ...prev, tier: tier.key })); }}
                        className={`flex-1 p-3 rounded-lg border text-center transition-all ${
                          localStudentDevices.tier === tier.key
                            ? 'border-[#00ff88] bg-[#0a1a10]'
                            : 'border-[#333333] bg-[#111111] hover:border-[#555555]'
                        }`}
                      >
                        <div className="text-xs font-bold text-white">{tier.label}</div>
                        <div className="text-[10px] text-[#ffcc00] mt-1">{currency}{Math.round(1500 * tier.costMultiplier)}/est.</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 4. Security Cameras */}
          <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-5">
            <h2 className="text-sm text-[#aaaaaa] mb-3 font-bold uppercase tracking-wider">
              📷 4. Camaras de seguridad
            </h2>

            <div className="mb-4">
              <Label className="block text-xs text-[#aaaaaa] mb-2">Tipo de camara:</Label>
              <div className="flex gap-2">
                {([
                  { key: 'basic' as const, label: 'Basicas', emoji: '📷', cost: 400 },
                  { key: '360' as const, label: '360 grados', emoji: '🎥', cost: 800 },
                ]).map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => { sounds.click(); setLocalCameraType(opt.key); }}
                    className={`flex-1 p-3 rounded-lg border text-center transition-all ${
                      localCameraType === opt.key
                        ? 'border-[#00ff88] bg-[#0a1a10]'
                        : 'border-[#333333] bg-[#111111] hover:border-[#555555]'
                    }`}
                  >
                    <div className="text-lg">{opt.emoji}</div>
                    <div className="text-xs font-bold text-white mt-1">{opt.label}</div>
                    <div className="text-[10px] text-[#ffcc00]">{currency}{opt.cost}/u</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <Label className="text-sm text-white">Cantidad de camaras:</Label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { sounds.click(); setLocalCameraCount(Math.max(0, localCameraCount - 1)); }}
                  className="w-8 h-8 rounded bg-[#222222] hover:bg-[#333333] text-white flex items-center justify-center text-lg transition-colors"
                >
                  -
                </button>
                <Input
                  type="number"
                  value={localCameraCount}
                  onChange={(e) => {
                    const val = Math.min(20, Math.max(0, Number(e.target.value)));
                    setLocalCameraCount(val);
                  }}
                  className="w-16 bg-[#111111] border-[#333333] text-white font-mono h-8 text-sm text-center"
                  min={0}
                  max={20}
                />
                <button
                  onClick={() => { sounds.click(); setLocalCameraCount(Math.min(20, localCameraCount + 1)); }}
                  className="w-8 h-8 rounded bg-[#222222] hover:bg-[#333333] text-white flex items-center justify-center text-lg transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <div className="mb-4">
              <Label className="block text-xs text-[#aaaaaa] mb-2">Ubicaciones:</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CAMERA_LOCATIONS.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => toggleCameraLocation(loc.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all text-xs ${
                      localCameraLocations.includes(loc.id)
                        ? 'border-[#00ff88] bg-[#0a1a10] text-white'
                        : 'border-[#333333] bg-[#111111] text-[#aaaaaa] hover:border-[#555555]'
                    }`}
                  >
                    <span>{localCameraLocations.includes(loc.id) ? '✅' : '⬜'}</span>
                    <span>{loc.emoji} {loc.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#111111] border border-[#222222] rounded-lg p-3">
              <div className="flex justify-between text-xs">
                <span className="text-[#aaaaaa]">Total camaras ({localCameraCount} x {currency}{localCameraType === '360' ? 800 : 400}):</span>
                <span className="text-[#ffcc00] font-bold">{currency}{(localCameraCount * (localCameraType === '360' ? 800 : 400)).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* 5. Computer Lab */}
          <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-5">
            <h2 className="text-sm text-[#aaaaaa] mb-3 font-bold uppercase tracking-wider">
              🖥️ 5. Sala de Informatica
            </h2>
            <div className="flex items-center justify-between bg-[#111111] border border-[#222222] rounded-lg p-3 mb-4">
              <div>
                <div className="text-sm text-white">🖥️ Habilitar sala de informatica</div>
                <div className="text-[10px] text-[#aaaaaa]">Espacio dedicado con computadoras</div>
              </div>
              <button
                onClick={() => { sounds.click(); setLocalLabEnabled(!localLabEnabled); }}
                className={`w-12 h-6 rounded-full transition-all relative ${
                  localLabEnabled ? 'bg-[#00ff88]' : 'bg-[#333333]'
                }`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                  localLabEnabled ? 'left-6' : 'left-0.5'
                }`} />
              </button>
            </div>

            {localLabEnabled && (
              <div className="space-y-4">
                {/* Computer count */}
                <div>
                  <Label className="block text-xs text-[#aaaaaa] mb-2">Cantidad de computadoras:</Label>
                  <div className="flex flex-wrap gap-2">
                    {LAB_COMPUTER_OPTIONS.map((count) => (
                      <button
                        key={count}
                        onClick={() => { sounds.click(); setLocalLabCount(count); }}
                        className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                          localLabCount === count
                            ? 'border-[#00ff88] bg-[#0a1a10] text-white font-bold'
                            : 'border-[#333333] bg-[#111111] text-[#aaaaaa] hover:border-[#555555]'
                        }`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tier */}
                <div>
                  <Label className="block text-xs text-[#aaaaaa] mb-2">Nivel:</Label>
                  <div className="flex gap-2">
                    {TIER_OPTIONS.map((tier) => (
                      <button
                        key={tier.key}
                        onClick={() => { sounds.click(); setLocalLabTier(tier.key); }}
                        className={`flex-1 p-3 rounded-lg border text-center transition-all ${
                          localLabTier === tier.key
                            ? 'border-[#00ff88] bg-[#0a1a10]'
                            : 'border-[#333333] bg-[#111111] hover:border-[#555555]'
                        }`}
                      >
                        <div className="text-xs font-bold text-white">{tier.label}</div>
                        <div className="text-[10px] text-[#aaaaaa] mt-1">{currency}{Math.round(800 * tier.costMultiplier)}/PC</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Software */}
                <div>
                  <Label className="block text-xs text-[#aaaaaa] mb-2">Software:</Label>
                  <div className="space-y-2">
                    {LAB_SOFTWARE_OPTIONS.map((sw) => (
                      <button
                        key={sw.key}
                        onClick={() => { sounds.click(); setLocalLabSoftware(sw.key); }}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                          localLabSoftware === sw.key
                            ? 'border-[#00ff88] bg-[#0a1a10]'
                            : 'border-[#333333] bg-[#111111] hover:border-[#555555]'
                        }`}
                      >
                        <div>
                          <div className="text-sm font-bold text-white">{sw.label}</div>
                          <div className="text-[10px] text-[#aaaaaa]">{sw.desc}</div>
                        </div>
                        <div className="text-xs text-[#ffcc00]">{currency}{sw.costPerUnit}/PC</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-[#111111] border border-[#222222] rounded-lg p-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#aaaaaa]">Costo construccion sala:</span>
                    <span className="text-[#ffcc00] font-bold">{currency}{costs.labBuildCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-[#aaaaaa]">Mantenimiento mensual:</span>
                    <span className="text-[#4488ff] font-bold">{currency}{costs.labMonthly.toLocaleString()}/mes</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Total Cost Summary */}
          <div className="bg-[#0d0d0d] border border-[#00ff88] rounded-lg p-5">
            <h2 className="text-sm text-[#aaaaaa] mb-3 font-bold uppercase tracking-wider">
              💰 Resumen de tecnologia
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#aaaaaa]">Internet mensual:</span>
                <span className="text-[#4488ff]">{currency}{costs.internet}/mes</span>
              </div>
              {localTeacherLaptops.enabled && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#aaaaaa]">Laptops profesores:</span>
                  <span className="text-[#4488ff]">{currency}{costs.teacherLaptopMonthly}/mes</span>
                </div>
              )}
              {localCameraCount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#aaaaaa]">Camaras (instalacion):</span>
                  <span className="text-white">{currency}{costs.cameraBuildCost.toLocaleString()}</span>
                </div>
              )}
              {localLabEnabled && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#aaaaaa]">Sala informatica (instalacion):</span>
                    <span className="text-white">{currency}{costs.labBuildCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#aaaaaa]">Mantenimiento lab:</span>
                    <span className="text-[#4488ff]">{currency}{costs.labMonthly}/mes</span>
                  </div>
                </>
              )}
              <div className="border-t border-[#333333] pt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-[#aaaaaa] font-bold">Inversion total:</span>
                  <span className={`font-bold ${canAfford ? 'text-[#00ff88]' : 'text-[#ff4444]'}`}>
                    {currency}{costs.totalBuild.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#aaaaaa] font-bold">Costos mensuales:</span>
                  <span className="font-bold text-[#4488ff]">{currency}{costs.totalMonthly}/mes</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#aaaaaa]">Saldo despues:</span>
                  <span className={`font-bold ${canAfford ? 'text-[#00ff88]' : 'text-[#ff4444]'}`}>
                    {currency}{(money - costs.totalBuild).toLocaleString()}
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
