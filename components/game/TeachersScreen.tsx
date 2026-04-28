'use client';

import { useState, useMemo } from 'react';
import { useGameStore } from '@/lib/game-store';
import { sounds } from '@/lib/sounds';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SCREEN_ORDER, DEFAULT_SUBJECTS } from '@/lib/game-types';
import type { Subject, Teacher, StaffMember } from '@/lib/game-types';

const FIRST_NAMES = [
  'Maria', 'Jose', 'Ana', 'Carlos', 'Luis', 'Elena', 'Pedro', 'Carmen',
  'Miguel', 'Rosa', 'Antonio', 'Laura', 'Manuel', 'Isabel', 'Francisco',
  'Patricia', 'Jorge', 'Sofia', 'Fernando', 'Gabriela', 'Roberto', 'Daniela',
  'Alejandro', 'Lucia', 'Rafael', 'Valentina', 'Diego', 'Camila', 'Andres', 'Mariana',
];

const LAST_NAMES = [
  'Garcia', 'Rodriguez', 'Martinez', 'Lopez', 'Hernandez', 'Gonzalez', 'Perez',
  'Sanchez', 'Ramirez', 'Torres', 'Flores', 'Rivera', 'Gomez', 'Diaz', 'Cruz',
  'Morales', 'Reyes', 'Gutierrez', 'Ortiz', 'Ramos', 'Vargas', 'Castro',
  'Medina', 'Jimenez', 'Ruiz', 'Aguilar', 'Navarro', 'Delgado', 'Mendoza', 'Herrera',
];

const PERSONALITIES = [
  'Amigable y paciente', 'Estricto pero justo', 'Creativo y dinamico',
  'Calmado y reflexivo', 'Entusiasta y motivador', 'Organizado y detallista',
  'Carismatico y comunicativo', 'Tradicional y formal', 'Innovador y flexible',
  'Dedicado y apasionado',
];

const SPECIALTIES = [
  'Especialista en pedagogia infantil', 'Doctorado en educacion',
  'Master en curriculum y evaluacion', 'Experto en tecnologia educativa',
  'Especialista en atencion diferenciada', 'Certificado en primer auxilio',
  'Experto en psicologia educativa', 'Formacion en evaluacion formativa',
];

const RED_FLAGS = [
  'Llegadas tarde frecuentes', 'Cambio de trabajo reciente',
  'Poca experiencia con ninos', 'Referencias limitadas',
  'Problemas disciplinarios previos',
];

function generateRandomName() {
  const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${first} ${last}`;
}

function generateLocalCandidates(subject: string): Teacher[] {
  const candidates: Teacher[] = [];
  for (let i = 0; i < 3; i++) {
    const quality = Math.floor(Math.random() * 5) + 5; // 5-9
    const experience = Math.floor(Math.random() * 15) + 1;
    const salary = Math.round(800 + quality * 150 + experience * 30);
    const flags: string[] = [];
    if (Math.random() < 0.3) {
      flags.push(RED_FLAGS[Math.floor(Math.random() * RED_FLAGS.length)]);
    }
    candidates.push({
      id: `candidate-${Date.now()}-${i}`,
      name: generateRandomName(),
      subject,
      specialty: SPECIALTIES[Math.floor(Math.random() * SPECIALTIES.length)],
      experience,
      quality,
      salary,
      personality: PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)],
      redFlags: flags,
      hired: false,
    });
  }
  return candidates;
}

async function generateAICandidates(subject: string): Promise<Teacher[]> {
  try {
    const body: Record<string, unknown> = {
      messages: [
        {
          role: 'user',
          content: `Genera 3 candidatos para profesor de ${subject}. Responde SOLO en JSON: [{"name":"...","specialty":"...","experience":5,"quality":7,"salary":1500,"personality":"...","redFlags":["..."]}]`,
        },
      ],
      systemPrompt: 'Eres un generador de perfiles de profesores para un juego. Responde SOLO en JSON valido.',
    };

    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '[]';
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return generateLocalCandidates(subject);
    const parsed = JSON.parse(jsonMatch[0]);
    return (Array.isArray(parsed) ? parsed : []).slice(0, 3).map((c: Record<string, unknown>, i: number) => ({
      id: `ai-${Date.now()}-${i}`,
      name: String(c.name || 'Desconocido'),
      subject,
      specialty: String(c.specialty || 'General'),
      experience: Number(c.experience) || 3,
      quality: Math.min(10, Math.max(1, Number(c.quality) || 5)),
      salary: Number(c.salary) || 1500,
      personality: String(c.personality || 'Sin descripcion'),
      redFlags: Array.isArray(c.redFlags) ? c.redFlags.map(String) : [],
      hired: false,
    }));
  } catch {
    return generateLocalCandidates(subject);
  }
}

export default function TeachersScreen() {
  const {
    currency, subjects: storeSubjects, teachers: storeTeachers, staffMembers,
    setSubjects, addTeacher, addStaffMember, removeStaffMember,
    prevScreen, nextScreen,
  } = useGameStore();

  const [localSubjects, setLocalSubjects] = useState<Subject[]>(storeSubjects || DEFAULT_SUBJECTS);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [hiringSubject, setHiringSubject] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedCandidate, setExpandedCandidate] = useState<string | null>(null);

  // Staff counts
  const [janitorCount, setJanitorCount] = useState(
    staffMembers.filter(s => s.role === 'janitor').length
  );
  const [guardCount, setGuardCount] = useState(
    staffMembers.filter(s => s.role === 'security').length
  );

  const hiredTeachers = useMemo(() => storeTeachers.filter(t => t.hired), [storeTeachers]);

  const totalMonthlySalary = useMemo(() => {
    const teacherPay = hiredTeachers.reduce((s, t) => s + t.salary, 0);
    const staffPay = staffMembers.reduce((s, m) => s + m.salary, 0);
    return teacherPay + staffPay;
  }, [hiredTeachers, staffMembers]);

  const subjectsNeedingTeacher = useMemo(() => {
    return localSubjects.filter(s => {
      if (!s.mandatory) return false;
      return !hiredTeachers.some(t => t.subject === s.name && t.hired);
    });
  }, [localSubjects, hiredTeachers]);

  const toggleMandatory = (id: string) => {
    sounds.click();
    setLocalSubjects(prev =>
      prev.map(s => s.id === id ? { ...s, mandatory: !s.mandatory } : s)
    );
  };

  const addNewSubject = () => {
    const trimmed = newSubjectName.trim();
    if (trimmed) {
      const id = `custom-${Date.now()}`;
      setLocalSubjects(prev => [...prev, {
        id,
        name: trimmed,
        emoji: '📖',
        mandatory: false,
      }]);
      setNewSubjectName('');
      sounds.click();
    }
  };

  const handleHireClick = async (subjectName: string) => {
    sounds.click();
    setHiringSubject(subjectName);
    setCandidates([]);
    setLoading(true);

    let result: Teacher[];
    result = await generateAICandidates(subjectName);

    setCandidates(result);
    setLoading(false);
  };

  const handleHireCandidate = (candidate: Teacher) => {
    sounds.construction();
    addTeacher({ ...candidate, hired: true });
    setCandidates(prev => prev.filter(c => c.id !== candidate.id));
    setHiringSubject(null);
  };

  const handleInvestigate = (candidate: Teacher) => {
    sounds.click();
    setExpandedCandidate(expandedCandidate === candidate.id ? null : candidate.id);
  };

  const hireStaff = (role: string, emoji: string, salary: number) => {
    sounds.construction();
    const staff = {
      id: `staff-${role}-${Date.now()}`,
      name: role === 'conserje' ? 'Conserje' : 'Guardia',
      role: (role === 'conserje' ? 'janitor' : 'security') as StaffMember['role'],
      salary,
      hired: true,
      morale: 70,
    };
    addStaffMember(staff);
  };

  const removeLastStaff = (role: string) => {
    const roleMembers = staffMembers.filter(s => s.role === role);
    if (roleMembers.length > 0) {
      const last = roleMembers[roleMembers.length - 1];
      removeStaffMember(last.id);
      sounds.click();
    }
  };

  const handleSubmit = () => {
    setSubjects(localSubjects);
    sounds.success();
    setTimeout(() => nextScreen(), 500);
  };

  const stepIndex = SCREEN_ORDER.indexOf('teachers');
  const totalSteps = 14;

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
            <div className="text-5xl mb-3">👨‍🏫</div>
            <h1 className="text-2xl font-bold text-[#00ff88] mb-1">Contratacion de Profesores</h1>
            <p className="text-[#aaaaaa] text-sm">
              Contrata personal para tu escuela
            </p>
          </div>

          {/* 1. Subjects */}
          <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-5">
            <h2 className="text-sm text-[#aaaaaa] mb-3 font-bold uppercase tracking-wider">
              📚 1. Materias ({localSubjects.length})
            </h2>
            <div className="space-y-1.5 max-h-72 overflow-y-auto mb-4">
              {localSubjects.map((subject) => {
                const hasTeacher = hiredTeachers.some(t => t.subject === subject.name && t.hired);
                return (
                  <div
                    key={subject.id}
                    className="flex items-center justify-between bg-[#111111] border border-[#222222] rounded-lg p-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{subject.emoji}</span>
                      <span className="text-sm text-white font-bold">{subject.name}</span>
                      {hasTeacher && <span className="text-[10px] text-[#00ff88]">✅</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleMandatory(subject.id)}
                        className={`text-[10px] px-2 py-0.5 rounded transition-all ${
                          subject.mandatory
                            ? 'bg-[#00ff8820] text-[#00ff88] border border-[#00ff8840]'
                            : 'bg-[#222222] text-[#aaaaaa] border border-[#333333]'
                        }`}
                      >
                        {subject.mandatory ? 'Obligatoria' : 'Opcional'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2">
              <Input
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addNewSubject(); }}
                className="flex-1 bg-[#111111] border-[#333333] text-white font-mono h-9 text-sm"
                placeholder="Nueva materia..."
                maxLength={50}
              />
              <Button
                onClick={addNewSubject}
                disabled={!newSubjectName.trim()}
                className="bg-[#00ff88] text-black font-bold hover:bg-[#00cc6e] h-9 px-4 disabled:opacity-40"
              >
                Agregar
              </Button>
            </div>
          </div>

          {/* 2. Teacher Hiring */}
          <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-5">
            <h2 className="text-sm text-[#aaaaaa] mb-3 font-bold uppercase tracking-wider">
              👨‍🏫 2. Contratacion de profesores
            </h2>
            <p className="text-[10px] text-[#00ff88] mb-3">
              ⚡ IA integrada: Los candidatos son generados por IA automaticamente
            </p>

            <div className="space-y-2 mb-4">
              {localSubjects.map((subject) => {
                if (!subject.mandatory) return null;
                const hasTeacher = hiredTeachers.some(t => t.subject === subject.name && t.hired);
                return (
                  <div
                    key={subject.id}
                    className="flex items-center justify-between bg-[#111111] border border-[#222222] rounded-lg p-3"
                  >
                    <div className="flex items-center gap-2">
                      <span>{subject.emoji}</span>
                      <span className="text-sm text-white">{subject.name}</span>
                    </div>
                    {hasTeacher ? (
                      <div className="text-xs text-[#00ff88]">
                        ✅ {hiredTeachers.find(t => t.subject === subject.name && t.hired)?.name}
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleHireClick(subject.name)}
                        disabled={loading}
                        className="bg-[#00ff88] text-black text-xs font-bold hover:bg-[#00cc6e] h-8 px-3 disabled:opacity-40"
                      >
                        {loading && hiringSubject === subject.name ? '⏳' : '🔍'} Contratar
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Candidates */}
            {hiringSubject && candidates.length > 0 && (
              <div className="space-y-3 border-t border-[#222222] pt-4">
                <h3 className="text-xs text-[#aaaaaa] font-bold">Candidatos para {hiringSubject}:</h3>
                {candidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="bg-[#111111] border border-[#333333] rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="text-sm font-bold text-white">{candidate.name}</div>
                        <div className="text-[10px] text-[#aaaaaa]">{candidate.specialty}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-[#ffcc00] font-bold">{currency}{candidate.salary}/mes</div>
                        <div className="text-[10px] text-[#aaaaaa]">{candidate.experience} anos exp.</div>
                      </div>
                    </div>

                    {/* Quality stars */}
                    <div className="flex items-center gap-1 mb-2">
                      <span className="text-[10px] text-[#aaaaaa] mr-1">Calidad:</span>
                      {Array.from({ length: 10 }).map((_, i) => (
                        <span key={i} className="text-xs">{i < candidate.quality ? '⭐' : '☆'}</span>
                      ))}
                      <span className="text-xs text-[#aaaaaa] ml-1">({candidate.quality}/10)</span>
                    </div>

                    {/* Personality */}
                    <div className="text-[10px] text-[#aaaaaa] mb-2">
                      🎭 {candidate.personality}
                    </div>

                    {/* Red flags */}
                    {candidate.redFlags.length > 0 && (
                      <div className="mb-2">
                        {candidate.redFlags.map((flag, i) => (
                          <div key={i} className="text-[10px] text-[#ff4444]">🚩 {flag}</div>
                        ))}
                      </div>
                    )}

                    {/* Expanded details */}
                    {expandedCandidate === candidate.id && (
                      <div className="bg-[#0d0d0d] border border-[#222222] rounded p-2 mb-2 text-[10px] text-[#aaaaaa]">
                        <div>📚 Materia: {candidate.subject}</div>
                        <div>🎓 Especialidad: {candidate.specialty}</div>
                        <div>📊 Experiencia: {candidate.experience} anos</div>
                        <div>💰 Salario: {currency}{candidate.salary}/mes</div>
                        <div>⭐ Calidad: {candidate.quality}/10</div>
                        <div>🎭 Personalidad: {candidate.personality}</div>
                        {candidate.redFlags.length > 0 && (
                          <div>🚩 Banderas rojas: {candidate.redFlags.join(', ')}</div>
                        )}
                        {candidate.redFlags.length === 0 && (
                          <div className="text-[#00ff88]">✅ Sin banderas rojas detectadas</div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleHireCandidate(candidate)}
                        className="bg-[#00ff88] text-black text-xs font-bold hover:bg-[#00cc6e] h-7 px-3 flex-1"
                      >
                        ✅ Contratar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleInvestigate(candidate)}
                        className="border-[#4488ff] text-[#4488ff] text-xs hover:bg-[#4488ff20] h-7 px-3"
                      >
                        🔍 Investigar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { sounds.click(); setCandidates(prev => prev.filter(c => c.id !== candidate.id)); }}
                        className="border-[#ff4444] text-[#ff4444] text-xs hover:bg-[#ff444420] h-7 px-3"
                      >
                        ❌
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  onClick={() => { sounds.click(); setHiringSubject(null); setCandidates([]); }}
                  className="w-full border border-[#333333] text-[#aaaaaa] hover:text-white text-xs h-8"
                >
                  Cerrar candidatos
                </Button>
              </div>
            )}

            {loading && (
              <div className="text-center py-4">
                <div className="text-2xl animate-pulse">🔍</div>
                <div className="text-xs text-[#aaaaaa] mt-2">Buscando candidatos...</div>
              </div>
            )}
          </div>

          {/* 3. Additional Staff */}
          <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-5">
            <h2 className="text-sm text-[#aaaaaa] mb-3 font-bold uppercase tracking-wider">
              👷 3. Personal adicional
            </h2>
            <div className="space-y-3">
              {/* Janitors */}
              <div className="flex items-center justify-between bg-[#111111] border border-[#222222] rounded-lg p-3">
                <div>
                  <div className="text-sm text-white">🧹 Conserjes</div>
                  <div className="text-[10px] text-[#aaaaaa]">Salario: {currency}500/mes c/u</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => removeLastStaff('janitor')}
                    className="w-7 h-7 rounded bg-[#222222] hover:bg-[#333333] text-white flex items-center justify-center text-sm transition-colors"
                  >
                    -
                  </button>
                  <span className="text-base font-bold text-white min-w-[1.5rem] text-center">
                    {staffMembers.filter(s => s.role === 'janitor').length}
                  </span>
                  <button
                    onClick={() => hireStaff('janitor', '🧹', 500)}
                    className="w-7 h-7 rounded bg-[#222222] hover:bg-[#333333] text-white flex items-center justify-center text-sm transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Guards */}
              <div className="flex items-center justify-between bg-[#111111] border border-[#222222] rounded-lg p-3">
                <div>
                  <div className="text-sm text-white">🛡️ Guardias</div>
                  <div className="text-[10px] text-[#aaaaaa]">Salario: {currency}700/mes c/u</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => removeLastStaff('security')}
                    className="w-7 h-7 rounded bg-[#222222] hover:bg-[#333333] text-white flex items-center justify-center text-sm transition-colors"
                  >
                    -
                  </button>
                  <span className="text-base font-bold text-white min-w-[1.5rem] text-center">
                    {staffMembers.filter(s => s.role === 'security').length}
                  </span>
                  <button
                    onClick={() => hireStaff('security', '🛡️', 700)}
                    className="w-7 h-7 rounded bg-[#222222] hover:bg-[#333333] text-white flex items-center justify-center text-sm transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="bg-[#111111] border border-[#222222] rounded-lg p-2 text-center">
                <span className="text-xs text-[#aaaaaa]">
                  Personal total: {currency}{staffMembers.reduce((s, m) => s + m.salary, 0).toLocaleString()}/mes
                </span>
              </div>
            </div>
          </div>

          {/* 4. Summary */}
          <div className="bg-[#0d0d0d] border border-[#00ff88] rounded-lg p-5">
            <h2 className="text-sm text-[#aaaaaa] mb-3 font-bold uppercase tracking-wider">
              📊 4. Resumen de personal
            </h2>
            {hiredTeachers.length > 0 ? (
              <div className="space-y-1.5 max-h-48 overflow-y-auto mb-3">
                {hiredTeachers.map((teacher) => (
                  <div key={teacher.id} className="flex items-center justify-between bg-[#111111] border border-[#222222] rounded p-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">👨‍🏫</span>
                      <div>
                        <div className="text-xs text-white font-bold">{teacher.name}</div>
                        <div className="text-[10px] text-[#aaaaaa]">{teacher.subject} • ⭐{teacher.quality}</div>
                      </div>
                    </div>
                    <span className="text-xs text-[#ffcc00]">{currency}{teacher.salary}/mes</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#555555] text-xs text-center py-2 mb-3">No has contratado profesores</p>
            )}
            <div className="border-t border-[#333333] pt-2 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-[#aaaaaa]">Profesores contratados:</span>
                <span className="text-white font-bold">{hiredTeachers.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#aaaaaa]">Personal adicional:</span>
                <span className="text-white font-bold">{staffMembers.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#aaaaaa] font-bold">Salario total mensual:</span>
                <span className="text-[#ffcc00] font-bold">{currency}{totalMonthlySalary.toLocaleString()}/mes</span>
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
              className="flex-2 bg-[#00ff88] text-black font-bold hover:bg-[#00cc6e] h-12 px-8"
            >
              💾 Guardar y Continuar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
