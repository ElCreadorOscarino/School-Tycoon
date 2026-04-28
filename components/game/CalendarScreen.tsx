'use client';

import { useState, useMemo, useEffect } from 'react';
import { useGameStore } from '@/lib/game-store';
import { sounds } from '@/lib/sounds';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SCREEN_ORDER } from '@/lib/game-types';
import type { Holiday, VacationPeriod, Shift } from '@/lib/game-types';

const COUNTRIES = [
  'Republica Dominicana', 'Mexico', 'Colombia', 'Argentina', 'Chile',
  'Peru', 'Espana', 'Venezuela', 'Ecuador', 'Uruguay',
  'Costa Rica', 'Panama', 'Guatemala', 'Cuba', 'Puerto Rico',
];

const RELIGION_OPTIONS: { key: 'catholic' | 'other' | 'none'; emoji: string; label: string; desc: string }[] = [
  { key: 'catholic', emoji: '✝️', label: 'Catolica', desc: 'Incluye Semana Santa, Navidad, Reyes Magos' },
  { key: 'other', emoji: '🕌', label: 'Otra', desc: 'Especifica la religion' },
  { key: 'none', emoji: '🚫', label: 'Prefiero no especificar', desc: 'Sin dias religiosos adicionales' },
];

const SHIFT_OPTIONS: { key: Shift; emoji: string; label: string }[] = [
  { key: 'morning', emoji: '🌅', label: 'Matutino' },
  { key: 'afternoon', emoji: '🌆', label: 'Vespertino' },
  { key: 'night', emoji: '🌙', label: 'Nocturno' },
  { key: 'combined', emoji: '🔄', label: 'Combinado' },
];

const CLASS_DURATION_OPTIONS: { value: 45 | 60; label: string }[] = [
  { value: 45, label: '45 minutos' },
  { value: 60, label: '60 minutos' },
];

const HOLIDAY_EMOJIS: Record<string, string> = {
  'ano nuevo': '🎆', 'reyes magos': '🎁', 'trabajador': '👷', 'independencia': '🏳️',
  'constitucion': '📜', 'batalla': '⚔️', 'revolucion': '🔥', 'navidad': '🎄',
  'dia de la madre': '👩', 'dia del padre': '👨', 'dia del nino': '🧒',
  'virgen': '👑', 'santiago': '⚔️', 'asuncion': '👼', 'todos los santos': '🕯️',
  'inmaculada': '✨', 'semana santa': '✝️', 'jueves santo': '📜', 'viernes santo': '⛪',
  'carnaval': '🎭', 'afrodescendiente': '🌍', 'juventud': '💪', 'bandera': '🏳️',
};

function getHolidayEmoji(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, emoji] of Object.entries(HOLIDAY_EMOJIS)) {
    if (lower.includes(key)) return emoji;
  }
  return '📅';
}

export default function CalendarScreen() {
  const {
    country, religion, holidays, shift, classDuration, breakTimeMinutes, vacationPeriods,
    setCountry, setReligion, setHolidays, setShift, setClassDuration, setBreakTimeMinutes, setVacationPeriods,
    prevScreen, nextScreen,
  } = useGameStore();

  const [localCountry, setLocalCountry] = useState(country || 'Republica Dominicana');
  const [localCustomCountry, setLocalCustomCountry] = useState('');
  const [localReligion, setLocalReligion] = useState<'catholic' | 'other' | 'none'>(religion || 'catholic');
  const [localReligionOther, setLocalReligionOther] = useState('');
  const [localHolidays, setLocalHolidays] = useState<Holiday[]>(holidays || []);
  const [localShift, setLocalShift] = useState<Shift>(shift || 'morning');
  const [localClassDuration, setLocalClassDuration] = useState<45 | 60>(classDuration || 45);
  const [localBreakTime, setLocalBreakTime] = useState(breakTimeMinutes || 15);
  const [localVacations, setLocalVacations] = useState<VacationPeriod[]>(vacationPeriods || []);
  const [loadingHolidays, setLoadingHolidays] = useState(false);

  // New vacation period form
  const [newVacName, setNewVacName] = useState('');
  const [newVacStart, setNewVacStart] = useState('');
  const [newVacEnd, setNewVacEnd] = useState('');

  // Mandatory vacations
  const mandatoryVacations = localVacations.filter(v => v.mandatory);
  const optionalVacations = localVacations.filter(v => !v.mandatory);

  // Minimum break time calculation
  const minBreakTime = useMemo(() => {
    // 3 min per hour of class
    const totalClassHours = localClassDuration / 60;
    return Math.ceil(totalClassHours * 3);
  }, [localClassDuration]);

  const isBelowMinBreak = localBreakTime < minBreakTime;

  const handleGenerateHolidays = async () => {
    setLoadingHolidays(true);
    sounds.click();

    try {
      const body: Record<string, unknown> = {
        messages: [
          {
            role: 'user',
            content: `Genera una lista de los feriados nacionales de ${localCountry}. Responde SOLO en formato JSON array: [{"name":"Nombre del feriado","date":"MM-DD","type":"national"}]. Incluye los principales feriados del pais.`,
          },
        ],
        systemPrompt: 'Eres un asistente que genera listas de feriados nacionales. Responde SOLO en JSON valido.',
      };

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || '[]';
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed)) {
          const newHolidays: Holiday[] = parsed.map((h: Record<string, unknown>) => ({
            name: String(h.name || 'Feriado'),
            date: String(h.date || '01-01'),
            type: ((['national', 'religious', 'vacation'].includes(String(h.type)) ? String(h.type) : 'national')) as Holiday['type'],
          }));
          // Keep religious holidays
          const religious = localHolidays.filter(h => h.type === 'religious');
          setLocalHolidays([...religious, ...newHolidays]);
        }
      }
    } catch {
      sounds.error();
    }

    setLoadingHolidays(false);
  };

  const handleAddVacation = () => {
    const name = newVacName.trim();
    const start = newVacStart.trim();
    const end = newVacEnd.trim();
    if (name && start && end) {
      setLocalVacations(prev => [...prev, {
        id: `vac-${Date.now()}`,
        name,
        startDate: start,
        endDate: end,
        mandatory: false,
      }]);
      setNewVacName('');
      setNewVacStart('');
      setNewVacEnd('');
      sounds.click();
    }
  };

  const handleRemoveVacation = (id: string) => {
    sounds.warning();
    // Optional vacations can be removed with warning
    setLocalVacations(prev => prev.filter(v => v.id !== id));
  };

  const handleSubmit = () => {
    const effectiveCountry = localCountry === 'Otro' ? localCustomCountry : localCountry;
    setCountry(effectiveCountry);
    setReligion(localReligion);
    setHolidays(localHolidays);
    setShift(localShift);
    setClassDuration(localClassDuration);
    setBreakTimeMinutes(localBreakTime);
    setVacationPeriods(localVacations);
    sounds.success();
    setTimeout(() => nextScreen(), 500);
  };

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, []);

  const stepIndex = SCREEN_ORDER.indexOf('calendar');
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
            <div className="text-5xl mb-3">🗓️</div>
            <h1 className="text-2xl font-bold text-[#00ff88] mb-1">Calendario y Vacaciones</h1>
            <p className="text-[#aaaaaa] text-sm">Configura el calendario academico</p>
          </div>

          {/* 1. Country */}
          <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-5">
            <h2 className="text-sm text-[#aaaaaa] mb-3 font-bold uppercase tracking-wider">
              🌍 1. Pais / Region
            </h2>
            <div className="space-y-3">
              <Select value={localCountry} onValueChange={(v) => { sounds.click(); setLocalCountry(v); }}>
                <SelectTrigger className="bg-[#111111] border-[#333333] text-white font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#111111] border-[#333333]">
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c} className="text-white font-mono focus:bg-[#222222]">{c}</SelectItem>
                  ))}
                  <SelectItem value="Otro" className="text-white font-mono focus:bg-[#222222]">Otro</SelectItem>
                </SelectContent>
              </Select>
              {localCountry === 'Otro' && (
                <Input
                  value={localCustomCountry}
                  onChange={(e) => setLocalCustomCountry(e.target.value)}
                  className="w-full bg-[#111111] border-[#333333] text-white font-mono h-9 text-sm"
                  placeholder="Escribe tu pais..."
                />
              )}
              <Button
                onClick={handleGenerateHolidays}
                disabled={loadingHolidays}
                className="w-full bg-[#4488ff] text-white font-bold hover:bg-[#3377ee] h-9 disabled:opacity-40"
              >
                {loadingHolidays ? '⏳ Generando feriados...' : '⚡ Generar feriados con IA'}
              </Button>
            </div>

            {/* Holidays list */}
            {localHolidays.length > 0 && (
              <div className="mt-4 max-h-40 overflow-y-auto">
                <div className="space-y-1">
                  {localHolidays.map((holiday, i) => (
                    <div key={i} className="flex items-center justify-between bg-[#111111] border border-[#222222] rounded p-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span>{getHolidayEmoji(holiday.name)}</span>
                        <span className="text-white">{holiday.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#aaaaaa]">{holiday.date}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                          holiday.type === 'national' ? 'bg-[#4488ff20] text-[#4488ff]' :
                          holiday.type === 'religious' ? 'bg-[#ffcc0020] text-[#ffcc00]' :
                          'bg-[#00ff8820] text-[#00ff88]'
                        }`}>
                          {holiday.type === 'national' ? 'Nacional' : holiday.type === 'religious' ? 'Religioso' : 'Vacaciones'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. Religion */}
          <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-5">
            <h2 className="text-sm text-[#aaaaaa] mb-3 font-bold uppercase tracking-wider">
              ⛪ 2. Religion
            </h2>
            <div className="space-y-2 mb-3">
              {RELIGION_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => { sounds.click(); setLocalReligion(opt.key); }}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                    localReligion === opt.key
                      ? 'border-[#00ff88] bg-[#0a1a10]'
                      : 'border-[#333333] bg-[#111111] hover:border-[#555555]'
                  }`}
                >
                  <div>
                    <span className="text-sm font-bold text-white">{opt.emoji} {opt.label}</span>
                    <div className="text-[10px] text-[#aaaaaa]">{opt.desc}</div>
                  </div>
                  {localReligion === opt.key && <span className="text-[#00ff88]">✓</span>}
                </button>
              ))}
            </div>
            {localReligion === 'other' && (
              <Input
                value={localReligionOther}
                onChange={(e) => setLocalReligionOther(e.target.value)}
                className="w-full bg-[#111111] border-[#333333] text-white font-mono h-9 text-sm"
                placeholder="Escribe la religion..."
              />
            )}
          </div>

          {/* 3. Mandatory Vacations */}
          <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-5">
            <h2 className="text-sm text-[#aaaaaa] mb-3 font-bold uppercase tracking-wider">
              🏖️ 3. Vacaciones obligatorias
            </h2>
            <p className="text-[10px] text-[#555555] mb-3">No se pueden eliminar</p>
            <div className="space-y-2">
              {mandatoryVacations.map((vac, i) => (
                <div key={vac.id || i} className="flex items-center justify-between bg-[#111111] border border-[#ffcc0030] rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {vac.name.toLowerCase().includes('navidad') ? '🎄' :
                       vac.name.toLowerCase().includes('semana') ? '✝️' : '☀️'}
                    </span>
                    <div>
                      <div className="text-sm text-white font-bold">{vac.name}</div>
                      <div className="text-[10px] text-[#aaaaaa]">{vac.startDate} - {vac.endDate}</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#ffcc00] bg-[#ffcc0015] px-2 py-0.5 rounded">Obligatoria</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Optional Vacations */}
          <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-5">
            <h2 className="text-sm text-[#aaaaaa] mb-3 font-bold uppercase tracking-wider">
              📅 4. Vacaciones opcionales
            </h2>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <Input
                value={newVacName}
                onChange={(e) => setNewVacName(e.target.value)}
                className="bg-[#111111] border-[#333333] text-white font-mono h-8 text-xs col-span-3"
                placeholder="Nombre del periodo..."
              />
              <Input
                value={newVacStart}
                onChange={(e) => setNewVacStart(e.target.value)}
                className="bg-[#111111] border-[#333333] text-white font-mono h-8 text-xs"
                placeholder="Inicio MM-DD"
              />
              <Input
                value={newVacEnd}
                onChange={(e) => setNewVacEnd(e.target.value)}
                className="bg-[#111111] border-[#333333] text-white font-mono h-8 text-xs"
                placeholder="Fin MM-DD"
              />
              <Button
                onClick={handleAddVacation}
                disabled={!newVacName.trim() || !newVacStart.trim() || !newVacEnd.trim()}
                className="bg-[#00ff88] text-black text-xs font-bold hover:bg-[#00cc6e] h-8 disabled:opacity-40"
              >
                Agregar
              </Button>
            </div>

            {optionalVacations.length > 0 && (
              <div className="space-y-2">
                {optionalVacations.map((vac, i) => (
                  <div key={vac.id || i} className="flex items-center justify-between bg-[#111111] border border-[#222222] rounded-lg p-3">
                    <div>
                      <div className="text-sm text-white font-bold">{vac.name}</div>
                      <div className="text-[10px] text-[#aaaaaa]">{vac.startDate} - {vac.endDate}</div>
                    </div>
                    <button
                      onClick={() => handleRemoveVacation(vac.id || `opt-${i}`)}
                      className="text-[#ff4444] hover:text-[#ff6666] text-xs transition-colors px-2"
                      title="Baja moral, quejas, problemas legales"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <div className="text-[10px] text-[#ff4444] bg-[#1a0a0a] border border-[#ff444440] rounded p-2">
                  ⚠️ Eliminar vacaciones opcionales puede causar: baja moral, quejas, problemas legales
                </div>
              </div>
            )}

            {optionalVacations.length === 0 && (
              <p className="text-[#555555] text-xs text-center py-2">No hay vacaciones opcionales</p>
            )}
          </div>

          {/* 5. No homework notice */}
          <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-5">
            <h2 className="text-sm text-[#aaaaaa] mb-3 font-bold uppercase tracking-wider">
              📢 5. Aviso de sin tareas
            </h2>
            <p className="text-[10px] text-[#aaaaaa] mb-2">Configurado en la pantalla de Reglas</p>
          </div>

          {/* 6. School Shift */}
          <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-5">
            <h2 className="text-sm text-[#aaaaaa] mb-3 font-bold uppercase tracking-wider">
              🕐 6. Turno escolar
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SHIFT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => { sounds.click(); setLocalShift(opt.key); }}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    localShift === opt.key
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

          {/* 7. Class Duration */}
          <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-5">
            <h2 className="text-sm text-[#aaaaaa] mb-3 font-bold uppercase tracking-wider">
              ⏱️ 7. Duracion de clases
            </h2>
            <div className="flex gap-2">
              {CLASS_DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { sounds.click(); setLocalClassDuration(opt.value); }}
                  className={`flex-1 p-3 rounded-lg border text-center transition-all ${
                    localClassDuration === opt.value
                      ? 'border-[#00ff88] bg-[#0a1a10]'
                      : 'border-[#333333] bg-[#111111] hover:border-[#555555]'
                  }`}
                >
                  <div className="text-sm font-bold text-white">{opt.value} min</div>
                </button>
              ))}
            </div>
          </div>

          {/* 8. Break Time */}
          <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-5">
            <h2 className="text-sm text-[#aaaaaa] mb-3 font-bold uppercase tracking-wider">
              ☕ 8. Recreo
            </h2>
            <div className="bg-[#111111] border border-[#222222] rounded-lg p-3 mb-3">
              <div className="flex justify-between text-xs text-[#aaaaaa]">
                <span>Minimo requerido:</span>
                <span className="text-[#ffcc00] font-bold">{minBreakTime} minutos</span>
              </div>
              <div className="text-[10px] text-[#555555] mt-1">
                (3 minutos por cada hora de clase: {localClassDuration}min = {minBreakTime}min minimo)
              </div>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <Label className="text-sm text-white">Duracion del recreo:</Label>
              <Input
                type="number"
                value={localBreakTime}
                onChange={(e) => setLocalBreakTime(Math.max(0, Math.min(60, Number(e.target.value))))}
                className="w-24 bg-[#111111] border-[#333333] text-white font-mono h-9 text-sm text-center"
                min={0}
                max={60}
              />
              <span className="text-xs text-[#aaaaaa]">minutos</span>
            </div>
            {isBelowMinBreak && (
              <div className="bg-[#1a0a0a] border border-[#ff444440] rounded p-2 text-[10px] text-[#ff4444] mb-2">
                ⚠️ El recreo esta por debajo del minimo. Los estudiantes estaran insatisfechos.
              </div>
            )}
            <div className="bg-[#0a1a10] border border-[#00ff8840] rounded p-2 text-[10px] text-[#00ff88]">
              💡 Mas recreo = mas felicidad
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
