'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/lib/game-store';
import { sounds } from '@/lib/sounds';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SCREEN_ORDER } from '@/lib/game-types';
import type { UniformPolicy, CellphonePolicy, HomeworkPolicy, GradeSystem } from '@/lib/game-types';

const UNIFORM_OPTIONS: { key: UniformPolicy; emoji: string; label: string; desc: string }[] = [
  { key: 'mandatory', emoji: '👔', label: 'Obligatorio', desc: 'Uniforme escolar obligatorio' },
  { key: 'limited', emoji: '👕', label: 'Ropa libre con limites', desc: 'Sin uniforme pero con reglas de vestimenta' },
  { key: 'free', emoji: '🎭', label: 'Ropa completamente libre', desc: 'Sin restricciones de vestimenta' },
];

const CELLPHONE_OPTIONS: { key: CellphonePolicy; emoji: string; label: string; desc: string }[] = [
  { key: 'prohibited', emoji: '🚫', label: 'Prohibido en clase', desc: 'Deben guardar celulares durante clases' },
  { key: 'recess', emoji: '📱', label: 'Permitido solo en recreo', desc: 'Solo pueden usarlo en horarios de recreo' },
  { key: 'always', emoji: '📲', label: 'Permitido siempre', desc: 'Uso libre de celular' },
  { key: 'confiscated', emoji: '🔒', label: 'Confiscado al entrar', desc: 'Se recoge al ingreso y se devuelve al salir' },
];

const HOMEWORK_OPTIONS: { key: HomeworkPolicy; emoji: string; label: string }[] = [
  { key: 'allowed', emoji: '✅', label: 'Diarias permitidas' },
  { key: 'limited', emoji: '📝', label: 'Limitadas' },
  { key: 'prohibited', emoji: '🚫', label: 'Prohibidas' },
];

const GRADE_SYSTEM_OPTIONS: { key: GradeSystem; emoji: string; label: string; desc: string }[] = [
  { key: 'digital', emoji: '💻', label: 'Digital', desc: 'Pagina web interna para ver notas' },
  { key: 'paper', emoji: '📄', label: 'Papel', desc: 'Boletas impresas tradicionales' },
  { key: 'mixed', emoji: '🔄', label: 'Mixto', desc: 'Ambos metodos disponibles' },
];

const SANCTION_OPTIONS: { key: 'warning' | 'suspension' | 'expulsion'; emoji: string; label: string }[] = [
  { key: 'warning', emoji: '⚠️', label: 'Advertencia' },
  { key: 'suspension', emoji: '🚫', label: 'Suspension' },
  { key: 'expulsion', emoji: '❌', label: 'Expulsion' },
];

export default function RulesScreen() {
  const {
    uniformPolicy, uniformDescription, cellphonePolicy, disciplineRules,
    sanctionSystem, maxAbsences, homeworkPolicy, noHomeworkVacations,
    gradeSystem, customRules,
    setUniformPolicy, setUniformDescription, setCellphonePolicy, setDisciplineRules,
    setSanctionSystem, setMaxAbsences, setHomeworkPolicy, setNoHomeworkVacations,
    setGradeSystem, addCustomRule, removeCustomRule,
    prevScreen, nextScreen,
  } = useGameStore();

  const [localUniform, setLocalUniform] = useState<UniformPolicy>(uniformPolicy || 'mandatory');
  const [localUniformDesc, setLocalUniformDesc] = useState(uniformDescription || 'Camisa blanca, pantalon azul oscuro');
  const [localCellphone, setLocalCellphone] = useState<CellphonePolicy>(cellphonePolicy || 'recess');
  const [localDiscipline, setLocalDiscipline] = useState(disciplineRules || 'Respeto entre todos los miembros de la comunidad educativa');
  const [localSanction, setLocalSanction] = useState<'warning' | 'suspension' | 'expulsion'>(sanctionSystem || 'warning');
  const [localMaxAbsences, setLocalMaxAbsences] = useState(maxAbsences || 5);
  const [localHomework, setLocalHomework] = useState<HomeworkPolicy>(homeworkPolicy || 'allowed');
  const [localNoHomeworkVac, setLocalNoHomeworkVac] = useState(noHomeworkVacations || false);
  const [localGradeSystem, setLocalGradeSystem] = useState<GradeSystem>(gradeSystem || 'digital');
  const [localCustomRules, setLocalCustomRules] = useState<string[]>(customRules || []);
  const [newRule, setNewRule] = useState('');

  const handleAddRule = () => {
    const trimmed = newRule.trim();
    if (trimmed && !localCustomRules.includes(trimmed)) {
      setLocalCustomRules([...localCustomRules, trimmed]);
      setNewRule('');
      sounds.click();
    }
  };

  const handleRemoveRule = (index: number) => {
    setLocalCustomRules(localCustomRules.filter((_, i) => i !== index));
    sounds.click();
  };

  const handleSubmit = () => {
    setUniformPolicy(localUniform);
    setUniformDescription(localUniformDesc);
    setCellphonePolicy(localCellphone);
    setDisciplineRules(localDiscipline);
    setSanctionSystem(localSanction);
    setMaxAbsences(localMaxAbsences);
    setHomeworkPolicy(localHomework);
    setNoHomeworkVacations(localNoHomeworkVac);
    setGradeSystem(localGradeSystem);
    // Sync custom rules to store
    useGameStore.getState().setCustomRules(localCustomRules);
    sounds.success();
    setTimeout(() => nextScreen(), 500);
  };

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, []);

  const stepIndex = SCREEN_ORDER.indexOf('rules');
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
            <div className="text-5xl mb-3">📜</div>
            <h1 className="text-2xl font-bold text-[#00ff88] mb-1">Reglas de la Escuela</h1>
            <p className="text-[#aaaaaa] text-sm">Establece las normas y politicas de tu escuela</p>
          </div>

          {/* 1. Uniform */}
          <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-5">
            <h2 className="text-sm text-[#aaaaaa] mb-3 font-bold uppercase tracking-wider">
              👔 1. Uniforme
            </h2>
            <div className="space-y-2 mb-4">
              {UNIFORM_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => { sounds.click(); setLocalUniform(opt.key); }}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                    localUniform === opt.key
                      ? 'border-[#00ff88] bg-[#0a1a10]'
                      : 'border-[#333333] bg-[#111111] hover:border-[#555555]'
                  }`}
                >
                  <div>
                    <span className="text-sm font-bold text-white">{opt.emoji} {opt.label}</span>
                    <div className="text-[10px] text-[#aaaaaa]">{opt.desc}</div>
                  </div>
                  {localUniform === opt.key && <span className="text-[#00ff88]">✓</span>}
                </button>
              ))}
            </div>
            {localUniform === 'mandatory' && (
              <div>
                <Label className="block text-xs text-[#aaaaaa] mb-2">Descripcion del uniforme:</Label>
                <Input
                  value={localUniformDesc}
                  onChange={(e) => setLocalUniformDesc(e.target.value)}
                  className="w-full bg-[#111111] border-[#333333] text-white font-mono h-9 text-sm"
                  placeholder="Ej: Camisa blanca, pantalon azul oscuro..."
                />
              </div>
            )}
          </div>

          {/* 2. Cellphone Policy */}
          <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-5">
            <h2 className="text-sm text-[#aaaaaa] mb-3 font-bold uppercase tracking-wider">
              📱 2. Uso de celulares
            </h2>
            <div className="space-y-2">
              {CELLPHONE_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => { sounds.click(); setLocalCellphone(opt.key); }}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                    localCellphone === opt.key
                      ? 'border-[#00ff88] bg-[#0a1a10]'
                      : 'border-[#333333] bg-[#111111] hover:border-[#555555]'
                  }`}
                >
                  <div>
                    <span className="text-sm font-bold text-white">{opt.emoji} {opt.label}</span>
                    <div className="text-[10px] text-[#aaaaaa]">{opt.desc}</div>
                  </div>
                  {localCellphone === opt.key && <span className="text-[#00ff88]">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Behavior */}
          <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-5">
            <h2 className="text-sm text-[#aaaaaa] mb-3 font-bold uppercase tracking-wider">
              📋 3. Comportamiento
            </h2>
            <div className="mb-4">
              <Label className="block text-xs text-[#aaaaaa] mb-2">Reglas de disciplina:</Label>
              <Textarea
                value={localDiscipline}
                onChange={(e) => setLocalDiscipline(e.target.value)}
                className="w-full bg-[#111111] border-[#333333] text-white font-mono text-sm min-h-[80px] resize-none"
                placeholder="Describe las reglas de conducta..."
              />
            </div>
            <div className="mb-4">
              <Label className="block text-xs text-[#aaaaaa] mb-2">Sistema de sanciones:</Label>
              <div className="flex gap-2">
                {SANCTION_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => { sounds.click(); setLocalSanction(opt.key); }}
                    className={`flex-1 p-3 rounded-lg border text-center transition-all ${
                      localSanction === opt.key
                        ? 'border-[#00ff88] bg-[#0a1a10]'
                        : 'border-[#333333] bg-[#111111] hover:border-[#555555]'
                    }`}
                  >
                    <div className="text-lg">{opt.emoji}</div>
                    <div className="text-xs font-bold text-white mt-1">{opt.label}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Label className="text-xs text-[#aaaaaa] whitespace-nowrap">Max inasistencias antes de sancion:</Label>
              <Input
                type="number"
                value={localMaxAbsences}
                onChange={(e) => setLocalMaxAbsences(Math.max(1, Math.min(30, Number(e.target.value))))}
                className="w-20 bg-[#111111] border-[#333333] text-white font-mono h-8 text-sm text-center"
                min={1}
                max={30}
              />
            </div>
          </div>

          {/* 4. Homework */}
          <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-5">
            <h2 className="text-sm text-[#aaaaaa] mb-3 font-bold uppercase tracking-wider">
              📝 4. Tareas
            </h2>
            <div className="space-y-2 mb-4">
              {HOMEWORK_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => { sounds.click(); setLocalHomework(opt.key); }}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                    localHomework === opt.key
                      ? 'border-[#00ff88] bg-[#0a1a10]'
                      : 'border-[#333333] bg-[#111111] hover:border-[#555555]'
                  }`}
                >
                  <span className="text-sm font-bold text-white">{opt.emoji} {opt.label}</span>
                  {localHomework === opt.key && <span className="text-[#00ff88]">✓</span>}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between bg-[#111111] border border-[#222222] rounded-lg p-3">
              <div>
                <div className="text-sm text-white">🏖️ Sin tareas en vacaciones</div>
                <div className="text-[10px] text-[#aaaaaa]">Notifica a los profesores automaticamente</div>
              </div>
              <button
                onClick={() => { sounds.click(); setLocalNoHomeworkVac(!localNoHomeworkVac); }}
                className={`w-12 h-6 rounded-full transition-all relative ${
                  localNoHomeworkVac ? 'bg-[#00ff88]' : 'bg-[#333333]'
                }`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                  localNoHomeworkVac ? 'left-6' : 'left-0.5'
                }`} />
              </button>
            </div>
          </div>

          {/* 5. Grade System */}
          <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-5">
            <h2 className="text-sm text-[#aaaaaa] mb-3 font-bold uppercase tracking-wider">
              📊 5. Registro de notas
            </h2>
            <div className="space-y-2">
              {GRADE_SYSTEM_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => { sounds.click(); setLocalGradeSystem(opt.key); }}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                    localGradeSystem === opt.key
                      ? 'border-[#00ff88] bg-[#0a1a10]'
                      : 'border-[#333333] bg-[#111111] hover:border-[#555555]'
                  }`}
                >
                  <div>
                    <span className="text-sm font-bold text-white">{opt.emoji} {opt.label}</span>
                    <div className="text-[10px] text-[#aaaaaa]">{opt.desc}</div>
                  </div>
                  {localGradeSystem === opt.key && <span className="text-[#00ff88]">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* 6. Custom Rules */}
          <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-5">
            <h2 className="text-sm text-[#aaaaaa] mb-3 font-bold uppercase tracking-wider">
              ✏️ 6. Reglas personalizadas
            </h2>
            <div className="flex gap-2 mb-4">
              <Input
                value={newRule}
                onChange={(e) => setNewRule(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddRule(); }}
                className="flex-1 bg-[#111111] border-[#333333] text-white font-mono h-9 text-sm"
                placeholder="Escribe una nueva regla..."
                maxLength={100}
              />
              <Button
                onClick={handleAddRule}
                disabled={!newRule.trim()}
                className="bg-[#00ff88] text-black font-bold hover:bg-[#00cc6e] h-9 px-4 disabled:opacity-40"
              >
                Agregar
              </Button>
            </div>
            {localCustomRules.length > 0 && (
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                {localCustomRules.map((rule, i) => (
                  <div
                    key={i}
                    className="inline-flex items-center gap-1 bg-[#111111] border border-[#333333] rounded-full px-3 py-1.5 text-xs"
                  >
                    <span className="text-white">{rule}</span>
                    <button
                      onClick={() => handleRemoveRule(i)}
                      className="text-[#ff4444] hover:text-[#ff6666] font-bold ml-1 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            {localCustomRules.length === 0 && (
              <p className="text-[#555555] text-xs text-center py-2">No hay reglas personalizadas</p>
            )}
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
              className="flex-[2] bg-[#00ff88] text-black font-bold hover:bg-[#00cc6e] h-12 px-8"
            >
              💾 Guardar y Continuar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
