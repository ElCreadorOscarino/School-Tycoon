'use client';

import { useState, useMemo, useEffect } from 'react';
import { useGameStore } from '@/lib/game-store';
import { sounds } from '@/lib/sounds';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SCREEN_ORDER } from '@/lib/game-types';
import type { Student } from '@/lib/game-types';

const DATA_TO_COLLECT = [
  { label: 'Nombre completo', emoji: '📝' },
  { label: 'Fecha de nacimiento', emoji: '📅' },
  { label: 'Direccion', emoji: '🏠' },
  { label: 'Datos de padres/tutores', emoji: '👨‍👩‍👧' },
  { label: 'Telefono', emoji: '📱' },
  { label: 'Correo electronico', emoji: '📧' },
  { label: 'Antecedentes penales', emoji: '🔍' },
  { label: 'Historial academico', emoji: '📊' },
  { label: 'Necesidades especiales', emoji: '♿' },
];

const FIRST_NAMES = [
  'Santiago', 'Valentina', 'Mateo', 'Sofia', 'Sebastian', 'Isabella',
  'Diego', 'Camila', 'Nicolas', 'Luciana', 'Daniel', 'Mariana',
  'Samuel', 'Victoria', 'David', 'Martina', 'Alejandro', 'Paula',
  'Emiliano', 'Gabriela', 'Andres', 'Laura', 'Carlos', 'Elena',
  'Miguel', 'Rosa', 'Pedro', 'Carmen', 'Luis', 'Ana',
  'Jorge', 'Valeria', 'Fernando', 'Daniela', 'Roberto', 'Lucia',
  'Rafael', 'Antonia', 'Eduardo', 'Isabel', 'Pablo', ' Natalia',
  'Thiago', 'Emma', 'Matias', 'Olivia', 'Leonardo', 'Zoe',
  'Maximiliano', 'Amanda',
];

const LAST_NAMES = [
  'Garcia', 'Rodriguez', 'Martinez', 'Lopez', 'Hernandez', 'Gonzalez', 'Perez',
  'Sanchez', 'Ramirez', 'Torres', 'Flores', 'Rivera', 'Gomez', 'Diaz', 'Cruz',
  'Morales', 'Reyes', 'Gutierrez', 'Ortiz', 'Ramos', 'Vargas', 'Castro',
  'Medina', 'Jimenez', 'Ruiz', 'Aguilar', 'Navarro', 'Delgado', 'Mendoza',
];

const PERSONALITIES = [
  'Tranquilo', 'Inquieto', 'Sociable', 'Timido', 'Creativo',
  'Competitivo', 'Colaborativo', 'Curioso', 'Aplicado', 'Jugueton',
];

const GRADE_MAP: Record<string, { grades: string[] }> = {
  kinder: { grades: ['Pre-K', 'K1', 'K2', 'K3'] },
  primary: { grades: ['1ro', '2do', '3ro', '4to', '5to', '6to'] },
  secondary: { grades: ['7mo', '8vo', '9no', '10mo', '11vo'] },
};

function generateRandomName() {
  const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${first} ${last}`;
}

function generateLocalStudents(count: number): Student[] {
  const levels: Array<'kinder' | 'primary' | 'secondary'> = ['kinder', 'primary', 'secondary'];
  const students: Student[] = [];

  for (let i = 0; i < count; i++) {
    const level = levels[Math.floor(Math.random() * levels.length)];
    const grades = GRADE_MAP[level].grades;
    const grade = grades[Math.floor(Math.random() * grades.length)];

    let age = 4;
    if (level === 'kinder') age = Math.floor(Math.random() * 3) + 4;
    else if (level === 'primary') age = Math.floor(Math.random() * 6) + 6;
    else age = Math.floor(Math.random() * 5) + 12;

    students.push({
      id: `student-${Date.now()}-${i}`,
      name: generateRandomName(),
      age,
      level,
      grade,
      personality: PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)],
      academicLevel: Math.floor(Math.random() * 6) + 5, // 5-10
      attendance: Math.floor(Math.random() * 20) + 80, // 80-100%
      satisfaction: Math.floor(Math.random() * 30) + 60, // 60-90%
    });
  }
  return students;
}

async function generateAIStudents(count: number): Promise<Student[]> {
  try {
    const body: Record<string, unknown> = {
      messages: [
        {
          role: 'user',
          content: `Genera ${count} perfiles de estudiantes para una escuela. Niveles: kinder, primaria, secundaria. Responde SOLO en JSON array: [{"name":"...","age":8,"level":"primary","grade":"3ro","personality":"...","academicLevel":7}]`,
        },
      ],
      systemPrompt: 'Eres un generador de perfiles de estudiantes para un juego escolar. Responde SOLO en JSON valido.',
    };

    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '[]';
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return generateLocalStudents(count);
    const parsed = JSON.parse(jsonMatch[0]);
    return (Array.isArray(parsed) ? parsed : []).slice(0, count).map((s: Record<string, unknown>, i: number) => ({
      id: `ai-student-${Date.now()}-${i}`,
      name: String(s.name || 'Estudiante'),
      age: Number(s.age) || 8,
      level: (['kinder', 'primary', 'secondary'].includes(String(s.level)) ? String(s.level) : 'primary') as Student['level'],
      grade: String(s.grade || '3ro'),
      personality: String(s.personality || 'Normal'),
      academicLevel: Math.min(10, Math.max(1, Number(s.academicLevel) || 5)),
      attendance: Math.floor(Math.random() * 20) + 80,
      satisfaction: Math.floor(Math.random() * 30) + 60,
    }));
  } catch {
    return generateLocalStudents(count);
  }
}

export default function StudentsScreen() {
  const {
    currency, classrooms, students: storeStudents, tuition, monthlyFee,
    setStudents, addStudent, setTuition, setMonthlyFee,
    getMaxStudents, prevScreen, nextScreen,
  } = useGameStore();

  const maxCapacity = getMaxStudents();
  const enrolledCount = storeStudents.length;
  const remainingCapacity = maxCapacity - enrolledCount;

  const [localTuition, setLocalTuition] = useState(tuition || 500);
  const [localMonthlyFee, setLocalMonthlyFee] = useState(monthlyFee || 150);
  const [genCount, setGenCount] = useState(Math.min(10, remainingCapacity));
  const [generatedStudents, setGeneratedStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  const estimatedMonthlyIncome = useMemo(() => {
    return enrolledCount * localMonthlyFee;
  }, [enrolledCount, localMonthlyFee]);

  const estimatedTuitionIncome = useMemo(() => {
    return enrolledCount * localTuition;
  }, [enrolledCount, localTuition]);

  const handleGenerate = async () => {
    const count = Math.min(genCount, remainingCapacity);
    if (count <= 0) {
      sounds.error();
      return;
    }
    setLoading(true);
    sounds.click();

    let result: Student[];
    result = await generateAIStudents(count);

    setGeneratedStudents(result);
    setLoading(false);
  };

  const handleEnrollAll = () => {
    if (generatedStudents.length === 0) return;
    sounds.construction();
    generatedStudents.forEach(student => {
      addStudent(student);
    });
    setGeneratedStudents([]);
    sounds.success();
  };

  const handleEnrollSingle = (student: Student) => {
    sounds.click();
    addStudent(student);
    setGeneratedStudents(prev => prev.filter(s => s.id !== student.id));
  };

  const handleSubmit = () => {
    setTuition(localTuition);
    setMonthlyFee(localMonthlyFee);
    sounds.success();
    setTimeout(() => nextScreen(), 500);
  };

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, []);

  const stepIndex = SCREEN_ORDER.indexOf('students');
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
            <div className="text-5xl mb-3">👩‍🎓</div>
            <h1 className="text-2xl font-bold text-[#00ff88] mb-1">Inscripcion de Estudiantes</h1>
            <p className="text-[#aaaaaa] text-sm">Matricula y registro de alumnos</p>
          </div>

          {/* 1. Data to collect */}
          <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-5">
            <h2 className="text-sm text-[#aaaaaa] mb-3 font-bold uppercase tracking-wider">
              📋 1. Datos a recolectar
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DATA_TO_COLLECT.map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-[#111111] border border-[#222222] rounded p-2 text-xs">
                  <span>{item.emoji}</span>
                  <span className="text-white">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Capacity */}
          <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-5">
            <h2 className="text-sm text-[#aaaaaa] mb-3 font-bold uppercase tracking-wider">
              🏫 2. Capacidad
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#111111] border border-[#222222] rounded-lg p-3 text-center">
                <div className="text-2xl">👥</div>
                <div className="text-[10px] text-[#aaaaaa] mt-1">Max. capacidad</div>
                <div className="text-lg font-bold text-white">{maxCapacity}</div>
              </div>
              <div className="bg-[#111111] border border-[#222222] rounded-lg p-3 text-center">
                <div className="text-2xl">✅</div>
                <div className="text-[10px] text-[#aaaaaa] mt-1">Inscritos</div>
                <div className="text-lg font-bold text-[#00ff88]">{enrolledCount}</div>
              </div>
              <div className="bg-[#111111] border border-[#222222] rounded-lg p-3 text-center">
                <div className="text-2xl">📤</div>
                <div className="text-[10px] text-[#aaaaaa] mt-1">Disponibles</div>
                <div className={`text-lg font-bold ${remainingCapacity > 0 ? 'text-[#4488ff]' : 'text-[#ff4444]'}`}>
                  {remainingCapacity}
                </div>
              </div>
            </div>
            {remainingCapacity <= 0 && enrolledCount > 0 && (
              <div className="bg-[#1a1a0a] border border-[#ffcc00] rounded p-2 text-[10px] text-[#ffcc00] mt-3">
                ⚠️ Capacidad maxima alcanzada. No se pueden inscribir mas estudiantes.
              </div>
            )}
          </div>

          {/* 3. Prices */}
          <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-5">
            <h2 className="text-sm text-[#aaaaaa] mb-3 font-bold uppercase tracking-wider">
              💰 3. Precios
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm text-white">💵 Matricula (pago unico):</Label>
                  <div className="text-[10px] text-[#aaaaaa]">Se cobra al inscribir al estudiante</div>
                </div>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={localTuition}
                    onChange={(e) => setLocalTuition(Math.max(0, Number(e.target.value)))}
                    className="w-28 bg-[#111111] border-[#333333] text-white font-mono h-9 text-sm text-right"
                    min={0}
                  />
                  <span className="text-xs text-[#aaaaaa]">{currency}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm text-white">📅 Mensualidad:</Label>
                  <div className="text-[10px] text-[#aaaaaa]">Pago mensual recurrente</div>
                </div>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={localMonthlyFee}
                    onChange={(e) => setLocalMonthlyFee(Math.max(0, Number(e.target.value)))}
                    className="w-28 bg-[#111111] border-[#333333] text-white font-mono h-9 text-sm text-right"
                    min={0}
                  />
                  <span className="text-xs text-[#aaaaaa]">{currency}</span>
                </div>
              </div>
              <div className="bg-[#111111] border border-[#222222] rounded-lg p-3 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#aaaaaa]">Ingreso estimado por matricula ({enrolledCount}):</span>
                  <span className="text-[#ffcc00]">{currency}{estimatedTuitionIncome.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#aaaaaa]">Ingreso mensual estimado:</span>
                  <span className="text-[#00ff88] font-bold">{currency}{estimatedMonthlyIncome.toLocaleString()}/mes</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Enroll Students */}
          <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-5">
            <h2 className="text-sm text-[#aaaaaa] mb-3 font-bold uppercase tracking-wider">
              🎓 4. Inscribir estudiantes
            </h2>
            <p className="text-[10px] text-[#555555] mb-3">
              {'⚡ IA de Z.ai generando perfiles'}
            </p>

            <div className="flex gap-2 mb-4">
              <div className="flex-1 flex items-center gap-2">
                <Input
                  type="number"
                  value={genCount}
                  onChange={(e) => setGenCount(Math.min(remainingCapacity, Math.max(1, Number(e.target.value))))}
                  className="w-20 bg-[#111111] border-[#333333] text-white font-mono h-9 text-sm"
                  min={1}
                  max={remainingCapacity}
                />
                <span className="text-xs text-[#aaaaaa]">estudiantes</span>
              </div>
              <Button
                onClick={handleGenerate}
                disabled={loading || remainingCapacity <= 0}
                className="bg-[#00ff88] text-black font-bold hover:bg-[#00cc6e] h-9 px-4 disabled:opacity-40"
              >
                {loading ? '⏳ Generando...' : '🎓 Generar grupo'}
              </Button>
            </div>

            {loading && (
              <div className="text-center py-4">
                <div className="text-2xl animate-pulse">🎓</div>
                <div className="text-xs text-[#aaaaaa] mt-2">Generando perfiles de estudiantes...</div>
              </div>
            )}

            {generatedStudents.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#aaaaaa]">{generatedStudents.length} estudiantes generados:</span>
                  <Button
                    size="sm"
                    onClick={handleEnrollAll}
                    className="bg-[#00ff88] text-black text-xs font-bold hover:bg-[#00cc6e] h-7 px-3"
                  >
                    ✅ Inscribir todos
                  </Button>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-1.5">
                  {generatedStudents.map((student) => (
                    <div key={student.id} className="bg-[#111111] border border-[#333333] rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {student.level === 'kinder' ? '🧒' : student.level === 'primary' ? '📖' : '📚'}
                          </span>
                          <div>
                            <div className="text-xs font-bold text-white">{student.name}</div>
                            <div className="text-[10px] text-[#aaaaaa]">
                              {student.age} anos • {student.level} • {student.grade}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right mr-2">
                            <div className="text-[10px] text-[#aaaaaa]">{student.personality}</div>
                            <div className="text-[10px]">
                              {'⭐'.repeat(Math.min(5, Math.round(student.academicLevel / 2)))} ({student.academicLevel}/10)
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleEnrollSingle(student)}
                            className="bg-[#00ff88] text-black text-[10px] font-bold hover:bg-[#00cc6e] h-6 px-2"
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 5. Summary */}
          <div className="bg-[#0d0d0d] border border-[#00ff88] rounded-lg p-5">
            <h2 className="text-sm text-[#aaaaaa] mb-3 font-bold uppercase tracking-wider">
              📊 5. Resumen
            </h2>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-[#111111] border border-[#222222] rounded-lg p-3 text-center">
                <div className="text-[10px] text-[#aaaaaa]">Total inscritos</div>
                <div className="text-xl font-bold text-[#00ff88]">{enrolledCount}</div>
              </div>
              <div className="bg-[#111111] border border-[#222222] rounded-lg p-3 text-center">
                <div className="text-[10px] text-[#aaaaaa]">Capacidad restante</div>
                <div className={`text-xl font-bold ${remainingCapacity > 0 ? 'text-[#4488ff]' : 'text-[#ff4444]'}`}>
                  {remainingCapacity}
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-[#aaaaaa]">Ingreso por matricula:</span>
                <span className="text-[#ffcc00]">{currency}{estimatedTuitionIncome.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#aaaaaa]">Ingreso mensual:</span>
                <span className="text-[#00ff88] font-bold">{currency}{estimatedMonthlyIncome.toLocaleString()}/mes</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#aaaaaa]">Matricula por estudiante:</span>
                <span className="text-white">{currency}{localTuition}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#aaaaaa]">Mensualidad por estudiante:</span>
                <span className="text-white">{currency}{localMonthlyFee}</span>
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
