'use client';

import { useState, useEffect, useMemo } from 'react';
import { useGameStore } from '@/lib/game-store';
import { sounds } from '@/lib/sounds';
import { Button } from '@/components/ui/button';
import { SCREEN_ORDER, BUILDING_CONFIGS } from '@/lib/game-types';
import type { BuildingSize } from '@/lib/game-types';

const CONFETTI_EMOJIS = ['🎉', '🎊', '✨', '🎈', '⭐', '🌟', '🎆', '🎇', '🎊', '✨'];

function CampusAsciiMap({ schoolName, buildingSize, classrooms, cafeteriaBuilt, libraryEnabled, sportsAreaEnabled, computerLabEnabled, meetingRoomEnabled }: {
  schoolName: string;
  buildingSize: BuildingSize;
  classrooms: { floor: number; level: string; name: string }[];
  cafeteriaBuilt: boolean;
  libraryEnabled: boolean;
  sportsAreaEnabled: boolean;
  computerLabEnabled: boolean;
  meetingRoomEnabled: boolean;
}) {
  const sizeLabel = buildingSize === 'small' ? 'PEQUENO' : buildingSize === 'medium' ? 'MEDIANO' : buildingSize === 'large' ? 'GRANDE' : 'MEGA';

  const kinderCount = classrooms.filter(c => c.level === 'kinder').length;
  const primaryCount = classrooms.filter(c => c.level === 'primary').length;
  const secondaryCount = classrooms.filter(c => c.level === 'secondary').length;

  const buildingWidth = buildingSize === 'small' ? 14 : buildingSize === 'medium' ? 20 : buildingSize === 'large' ? 26 : 34;
  const topBar = '┌' + '─'.repeat(buildingWidth) + '┐';
  const midBar = '├' + '─'.repeat(buildingWidth) + '┤';
  const botBar = '└' + '─'.repeat(buildingWidth) + '┘';
  const dblTop = '╔' + '═'.repeat(buildingWidth) + '╗';
  const dblBot = '╚' + '═'.repeat(buildingWidth) + '╝';

  const roomBar = (total: number, emoji: string) => {
    const slots = Math.min(total, 10);
    return emoji.repeat(slots) + (slots < total ? '…' : '');
  };

  const roofLine = '│  ' + '🏫 ' + sizeLabel + ' '.repeat(Math.max(0, buildingWidth - sizeLabel.length - 4)) + '│';
  const floorRoomLine = '│ ' + roomBar(kinderCount, '🧒') + roomBar(primaryCount, '📖') + roomBar(secondaryCount, '📚') + ' '.repeat(Math.max(0, buildingWidth - (roomBar(kinderCount, '🧒') + roomBar(primaryCount, '📖') + roomBar(secondaryCount, '📚')).length - 2)) + '│';

  const sideW = Math.floor(buildingWidth / 2) - 2;

  const topSection = libraryEnabled
    ? '│ 📚 Biblioteca  │' + ' '.repeat(Math.max(0, sideW - 16)) + '│'
    : '';

  const topRight = cafeteriaBuilt
    ? '│      🍽️      │'
    : '';

  return (
    <pre className="text-[#00ff88] text-[11px] leading-[14px] overflow-x-auto select-none font-mono whitespace-pre">
{`     ╭───────────────────────────────────╮
     │        ${'🏫 ' + schoolName.slice(0, 18).padEnd(18)}│
     ╰──────────────┬──────────────────────╯
${topBar}
${roofLine}
${midBar}
${floorRoomLine}
${midBar}
${topSection ? topSection + '\n' + midBar : ''}${topRight ? topRight + '\n' + midBar : ''}
${computerLabEnabled ? '│ 💻 Lab. Informatica' + ' '.repeat(Math.max(0, buildingWidth - 22)) + '│\n' + midBar : ''}${meetingRoomEnabled ? '│ 🤝 Sala de Reuniones' + ' '.repeat(Math.max(0, buildingWidth - 22)) + '│\n' + midBar : ''}${sportsAreaEnabled ? '│ ⚽ Cancha Deportiva  ' + ' '.repeat(Math.max(0, buildingWidth - 22)) + '│\n' + midBar : ''}
${botBar}
${dblTop}
║   🚪  ENTRADA PRINCIPAL              ║
${dblBot}
  🧒 Kinder:${String(kinderCount).padStart(3)} 📖 Prim:${String(primaryCount).padStart(3)} 📚 Sec:${String(secondaryCount).padStart(3)}
  ${libraryEnabled ? '📚 Bib' : '❌ Bib'}  ${cafeteriaBuilt ? '🍽️ Caf' : '❌ Caf'}  ${computerLabEnabled ? '💻 Lab' : '❌ Lab'}  ${sportsAreaEnabled ? '⚽ Dep' : '❌ Dep'}  ${meetingRoomEnabled ? '🤝 Sal' : '❌ Sal'}
`}
    </pre>
  );
}

function FloatingEmoji({ emoji, delay, duration, left }: { emoji: string; delay: number; duration: number; left: number }) {
  return (
    <span
      className="absolute text-2xl pointer-events-none"
      style={{
        left: `${left}%`,
        top: '-10%',
        animation: `floatUp ${duration}s ease-in ${delay}s forwards`,
        opacity: 0,
      }}
    >
      {emoji}
    </span>
  );
}

const REPUTATION_FACTORS = [
  { check: (s: ReturnType<typeof useGameStore.getState>) => s.chairType === 'padded', pts: 5 },
  { check: (s: ReturnType<typeof useGameStore.getState>) => s.presentationSystem === 'digital', pts: 5 },
  { check: (s: ReturnType<typeof useGameStore.getState>) => s.bathroomQuality === 'premium', pts: 4 },
  { check: (s: ReturnType<typeof useGameStore.getState>) => s.internetType === 'fiber', pts: 5 },
  { check: (s: ReturnType<typeof useGameStore.getState>) => s.libraryEnabled, pts: 6 },
  { check: (s: ReturnType<typeof useGameStore.getState>) => s.sportsAreaEnabled, pts: 4 },
  { check: (s: ReturnType<typeof useGameStore.getState>) => s.cafeteriaBuilt && s.cafeteriaFoodQuality === 'premium', pts: 5 },
  { check: (s: ReturnType<typeof useGameStore.getState>) => s.cameraCount >= 6, pts: 3 },
  { check: (s: ReturnType<typeof useGameStore.getState>) => s.inclusiveBathroom, pts: 2 },
  { check: (s: ReturnType<typeof useGameStore.getState>) => s.computerLabEnabled, pts: 5 },
  { check: (s: ReturnType<typeof useGameStore.getState>) => s.teachers.filter(t => t.hired && t.quality >= 7).length >= 2, pts: 6 },
  { check: (s: ReturnType<typeof useGameStore.getState>) => s.meetingRoomEnabled, pts: 2 },
  { check: (s: ReturnType<typeof useGameStore.getState>) => s.breakTimeMinutes >= 20, pts: 3 },
  { check: (s: ReturnType<typeof useGameStore.getState>) => s.noHomeworkVacations, pts: 2 },
  { check: (s: ReturnType<typeof useGameStore.getState>) => s.gradeSystem === 'digital', pts: 3 },
];

export default function OpeningScreen() {
  const schoolName = useGameStore((s) => s.schoolName);
  const directorName = useGameStore((s) => s.directorName);
  const currency = useGameStore((s) => s.currency);
  const buildingSize = useGameStore((s) => s.buildingSize);
  const classrooms = useGameStore((s) => s.classrooms);
  const teachers = useGameStore((s) => s.teachers);
  const students = useGameStore((s) => s.students);
  const cafeteriaBuilt = useGameStore((s) => s.cafeteriaBuilt);
  const libraryEnabled = useGameStore((s) => s.libraryEnabled);
  const internetType = useGameStore((s) => s.internetType);
  const sportsAreaEnabled = useGameStore((s) => s.sportsAreaEnabled);
  const cameraCount = useGameStore((s) => s.cameraCount);
  const computerLabEnabled = useGameStore((s) => s.computerLabEnabled);
  const meetingRoomEnabled = useGameStore((s) => s.meetingRoomEnabled);
  const chairType = useGameStore((s) => s.chairType);
  const presentationSystem = useGameStore((s) => s.presentationSystem);
  const bathroomQuality = useGameStore((s) => s.bathroomQuality);
  const breakTimeMinutes = useGameStore((s) => s.breakTimeMinutes);
  const monthlyFee = useGameStore((s) => s.monthlyFee);
  const tuition = useGameStore((s) => s.tuition);
  const prevScreen = useGameStore((s) => s.prevScreen);
  const setSetupComplete = useGameStore((s) => s.setSetupComplete);
  const setGameStarted = useGameStore((s) => s.setGameStarted);
  const setScreen = useGameStore((s) => s.setScreen);
  const getMaxStudents = useGameStore((s) => s.getMaxStudents);
  const getTotalMonthlyExpenses = useGameStore((s) => s.getTotalMonthlyExpenses);
  const getWeeklyIncome = useGameStore((s) => s.getWeeklyIncome);
  const getTotalWeeklyExpenses = useGameStore((s) => s.getTotalWeeklyExpenses);

  const [phase, setPhase] = useState<'ceremony' | 'summary' | 'ready'>('ceremony');
  const [confettiVisible, setConfettiVisible] = useState(true);
  const [showSummary, setShowSummary] = useState(false);
  const [ministryLoading, setMinistryLoading] = useState(false);
  const [ministryResponse, setMinistryResponse] = useState('');
  const [ministryError, setMinistryError] = useState('');

  // Play fanfare and start animation on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    sounds.victory();
    const timer1 = setTimeout(() => setShowSummary(true), 2000);
    const timer2 = setTimeout(() => setPhase('summary'), 2500);
    const timer3 = setTimeout(() => setPhase('ready'), 3000);
    const timer4 = setTimeout(() => setConfettiVisible(false), 5000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  const confettiItems = useMemo(() => {
    return CONFETTI_EMOJIS.map((emoji, i) => ({
      emoji,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 3,
      left: Math.random() * 100,
      key: i,
    }));
  }, []);

  // Compute stats
  const maxStudents = getMaxStudents();
  const hiredTeachers = teachers.filter(t => t.hired);
  const monthlyExpenses = getTotalMonthlyExpenses();
  const weeklyIncome = getWeeklyIncome();
  const weeklyExpenses = getTotalWeeklyExpenses();
  const monthlyIncome = weeklyIncome * 4;

  // Estimate initial reputation
  const estimatedReputation = useMemo(() => {
    const state = useGameStore.getState();
    let rep = 40; // base
    REPUTATION_FACTORS.forEach(f => {
      if (f.check(state)) rep += f.pts;
    });
    // Negative factors
    if (!cafeteriaBuilt) rep -= 10;
    if (internetType === 'none') rep -= 8;
    if (chairType === 'common') rep -= 5;
    if (!libraryEnabled) rep -= 7;
    if (hiredTeachers.length === 0) rep -= 15;
    return Math.max(0, Math.min(100, rep));
  }, [cafeteriaBuilt, internetType, chairType, libraryEnabled, hiredTeachers.length]);

  const buildingConfig = BUILDING_CONFIGS[buildingSize];

  const handleOpenSchool = () => {
    sounds.success();
    setSetupComplete(true);
    setGameStarted(true);
    setScreen('dashboard');
  };

  const requestMinistryApproval = async () => {
    setMinistryLoading(true);
    setMinistryError('');
    setMinistryResponse('');

    try {
      const body: Record<string, unknown> = {
        messages: [
          {
            role: 'user',
            content: `Aprueba la apertura de la escuela "${schoolName}" dirigida por ${directorName}. La escuela tiene ${classrooms.length} aulas, capacidad para ${maxStudents} estudiantes, ${hiredTeachers.length} profesores, ${cafeteriaBuilt ? 'cafeteria' : 'sin cafeteria'}, ${libraryEnabled ? 'biblioteca' : 'sin biblioteca'}, y un presupuesto mensual de ${currency}${monthlyExpenses.toLocaleString()}. Genera la carta de aprobacion oficial con fecha de apertura.`
          }
        ],
        systemPrompt: 'Eres el Ministerio de Educacion. Genera una respuesta oficial (en espanol) aprobando la apertura de una escuela privada. Incluye una fecha de apertura oficial. La respuesta debe ser formal, breve (3-4 parrafos maximo), y estar firmada por un funcionario del ministerio. NO uses formato JSON, responde en texto plano.',
      };

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.error) {
        setMinistryError(data.error);
        sounds.error();
        return;
      }

      const content = data.choices?.[0]?.message?.content;
      if (content) {
        setMinistryResponse(content);
        sounds.success();
      } else {
        setMinistryError('No se recibio respuesta del Ministerio');
      }
    } catch {
      setMinistryError('Error de conexion');
      sounds.error();
    } finally {
      setMinistryLoading(false);
    }
  };

  const stepIndex = SCREEN_ORDER.indexOf('opening');
  const totalSteps = SCREEN_ORDER.length;

  return (
    <div className="screen-enter min-h-screen bg-black text-white font-mono flex flex-col relative overflow-hidden">
      {/* Confetti Animation */}
      {confettiVisible && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {confettiItems.map(item => (
            <FloatingEmoji key={item.key} emoji={item.emoji} delay={item.delay} duration={item.duration} left={item.left} />
          ))}
        </div>
      )}

      {/* CSS Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes floatUp {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse-glow {
          0%, 100% { text-shadow: 0 0 20px rgba(0, 255, 136, 0.3); }
          50% { text-shadow: 0 0 40px rgba(0, 255, 136, 0.6), 0 0 60px rgba(0, 255, 136, 0.3); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        .animate-scaleIn {
          animation: scaleIn 0.6s ease-out forwards;
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      ` }} />

      {/* Progress Bar */}
      <div className="w-full px-4 pt-4 relative z-10">
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
      <div className="flex-1 overflow-y-auto p-4 pb-8 relative z-10">
        <div className="w-full max-w-2xl mx-auto space-y-6">
          {/* Opening Ceremony */}
          <div className="text-center py-6">
            <div
              className="text-6xl mb-4 animate-scaleIn"
              style={{ animationDelay: '0.3s', opacity: 0 }}
            >
              🎉
            </div>
            <h1
              className="text-3xl font-bold text-[#00ff88] mb-3 animate-fadeInUp animate-pulse-glow"
              style={{ animationDelay: '0.5s', opacity: 0 }}
            >
              Apertura de la Escuela
            </h1>
            <p
              className="text-xl text-white animate-fadeInUp"
              style={{ animationDelay: '1s', opacity: 0 }}
            >
              Bienvenido, Director {directorName}!
            </p>
            <p
              className="text-lg text-[#ffcc00] mt-2 animate-fadeInUp"
              style={{ animationDelay: '1.5s', opacity: 0 }}
            >
              Tu escuela &ldquo;{schoolName}&rdquo; abre sus puertas!
            </p>
          </div>

          {/* School Summary */}
          {showSummary && (
            <div
              className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-5 animate-fadeInUp"
              style={{ animationDelay: '2s', opacity: 0 }}
            >
              <h2 className="text-sm text-[#aaaaaa] mb-4 font-bold uppercase tracking-wider">
                📊 Resumen completo de la escuela
              </h2>

              <div className="space-y-3 text-sm">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#111111] border border-[#222222] rounded p-3">
                    <div className="text-xs text-[#aaaaaa]">🏫 Nombre</div>
                    <div className="text-white font-bold">{schoolName}</div>
                  </div>
                  <div className="bg-[#111111] border border-[#222222] rounded p-3">
                    <div className="text-xs text-[#aaaaaa]">👤 Director</div>
                    <div className="text-white font-bold">{directorName}</div>
                  </div>
                </div>

                {/* Building */}
                <div className="bg-[#111111] border border-[#222222] rounded p-3">
                  <div className="text-xs text-[#aaaaaa] mb-2">🏗️ Edificio</div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-[#ffcc00] font-bold">{buildingSize === 'small' ? 'Pequeno' : buildingSize === 'medium' ? 'Mediano' : buildingSize === 'large' ? 'Grande' : 'Mega'}</div>
                      <div className="text-[10px] text-[#aaaaaa]">Tamano</div>
                    </div>
                    <div>
                      <div className="text-[#ffcc00] font-bold">{classrooms.length}</div>
                      <div className="text-[10px] text-[#aaaaaa]">Aulas</div>
                    </div>
                    <div>
                      <div className="text-[#ffcc00] font-bold">{maxStudents}</div>
                      <div className="text-[10px] text-[#aaaaaa]">Cap. max</div>
                    </div>
                  </div>
                </div>

                {/* People */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#111111] border border-[#222222] rounded p-3">
                    <div className="text-xs text-[#aaaaaa]">👨‍🏫 Profesores</div>
                    <div className="text-[#00ff88] font-bold text-lg">{hiredTeachers.length}</div>
                    <div className="text-[10px] text-[#aaaaaa]">contratados</div>
                  </div>
                  <div className="bg-[#111111] border border-[#222222] rounded p-3">
                    <div className="text-xs text-[#aaaaaa]">👩‍🎓 Estudiantes</div>
                    <div className="text-[#00ff88] font-bold text-lg">{students.length}</div>
                    <div className="text-[10px] text-[#aaaaaa]">inscritos</div>
                  </div>
                </div>

                {/* Services */}
                <div className="bg-[#111111] border border-[#222222] rounded p-3">
                  <div className="text-xs text-[#aaaaaa] mb-2">🏢 Servicios</div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${cafeteriaBuilt ? 'bg-[#0a1a10] text-[#00ff88] border border-[#00ff88]/30' : 'bg-[#1a0a0a] text-[#ff4444] border border-[#ff4444]/30'}`}>
                      {cafeteriaBuilt ? '🍽️ Cafeteria' : '❌ Sin cafeteria'}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${libraryEnabled ? 'bg-[#0a1a10] text-[#00ff88] border border-[#00ff88]/30' : 'bg-[#1a0a0a] text-[#ff4444] border border-[#ff4444]/30'}`}>
                      {libraryEnabled ? '📚 Biblioteca' : '❌ Sin biblioteca'}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${sportsAreaEnabled ? 'bg-[#0a1a10] text-[#00ff88] border border-[#00ff88]/30' : 'bg-[#111111] text-[#aaaaaa] border border-[#333333]'}`}>
                      {sportsAreaEnabled ? '⚽ Deportes' : '🚫 Sin deportes'}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${computerLabEnabled ? 'bg-[#0a1a10] text-[#00ff88] border border-[#00ff88]/30' : 'bg-[#111111] text-[#aaaaaa] border border-[#333333]'}`}>
                      {computerLabEnabled ? '💻 Lab. Info' : '🚫 Sin lab'}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${meetingRoomEnabled ? 'bg-[#0a1a10] text-[#00ff88] border border-[#00ff88]/30' : 'bg-[#111111] text-[#aaaaaa] border border-[#333333]'}`}>
                      {meetingRoomEnabled ? '🤝 Sala reuniones' : '🚫 Sin sala'}
                    </span>
                  </div>
                </div>

                {/* Technology */}
                <div className="bg-[#111111] border border-[#222222] rounded p-3">
                  <div className="text-xs text-[#aaaaaa] mb-2">💻 Tecnologia</div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className={`font-bold ${internetType === 'fiber' ? 'text-[#00ff88]' : internetType === 'none' ? 'text-[#ff4444]' : 'text-[#ffcc00]'}`}>
                        {internetType === 'fiber' ? 'Fibra' : internetType === 'none' ? 'Sin internet' : internetType === 'open' ? 'Abierto' : 'Con clave'}
                      </div>
                      <div className="text-[10px] text-[#aaaaaa]">Internet</div>
                    </div>
                    <div>
                      <div className={`font-bold ${cameraCount >= 4 ? 'text-[#00ff88]' : 'text-[#ffcc00]'}`}>
                        {cameraCount} camaras
                      </div>
                      <div className="text-[10px] text-[#aaaaaa]">Seguridad</div>
                    </div>
                    <div>
                      <div className={`font-bold ${presentationSystem === 'digital' ? 'text-[#00ff88]' : 'text-[#aaaaaa]'}`}>
                        {presentationSystem === 'digital' ? 'Digital' : 'Pizarra'}
                      </div>
                      <div className="text-[10px] text-[#aaaaaa]">Presentacion</div>
                    </div>
                  </div>
                </div>

                {/* Estimates */}
                <div className="bg-[#111111] border border-[#222222] rounded p-3">
                  <div className="text-xs text-[#aaaaaa] mb-2">📈 Estimaciones iniciales</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-[#aaaaaa]">Reputacion estimada</div>
                      <div className={`font-bold text-lg ${estimatedReputation >= 70 ? 'text-[#00ff88]' : estimatedReputation >= 50 ? 'text-[#ffcc00]' : 'text-[#ff4444]'}`}>
                        {estimatedReputation}/100
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[#aaaaaa]">Gastos mensuales</div>
                      <div className="text-[#ff4444] font-bold text-lg">-{currency}{monthlyExpenses.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[#aaaaaa]">Ingresos mensuales</div>
                      <div className="text-[#00ff88] font-bold text-lg">+{currency}{monthlyIncome.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[#aaaaaa]">Balance mensual</div>
                      <div className={`font-bold text-lg ${monthlyIncome - monthlyExpenses >= 0 ? 'text-[#00ff88]' : 'text-[#ff4444]'}`}>
                        {monthlyIncome - monthlyExpenses >= 0 ? '+' : ''}{currency}{(monthlyIncome - monthlyExpenses).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pseudo-3D Campus Map */}
          {showSummary && (
            <div
              className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-4 animate-fadeInUp"
              style={{ animationDelay: '2.5s', opacity: 0 }}
            >
              <h2 className="text-sm text-[#aaaaaa] mb-3 font-bold uppercase tracking-wider">
                🗺️ Plano del campus
              </h2>
              <div className="bg-[#111111] border border-[#222222] rounded-lg p-4 overflow-x-auto">
                <CampusAsciiMap
                  schoolName={schoolName}
                  buildingSize={buildingSize}
                  classrooms={classrooms}
                  cafeteriaBuilt={cafeteriaBuilt}
                  libraryEnabled={libraryEnabled}
                  sportsAreaEnabled={sportsAreaEnabled}
                  computerLabEnabled={computerLabEnabled}
                  meetingRoomEnabled={meetingRoomEnabled}
                />
              </div>
            </div>
          )}

          {/* Ministry Response */}
          {ministryResponse && (
            <div className="bg-[#0d0d0d] border border-[#ffcc00] rounded-lg p-5 animate-fadeInUp">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🏛️</span>
                <span className="text-[#ffcc00] font-bold text-sm">Respuesta del Ministerio de Educacion</span>
              </div>
              <div className="bg-[#111111] border border-[#333333] rounded p-4 text-sm text-[#cccccc] whitespace-pre-line max-h-64 overflow-y-auto">
                {ministryResponse}
              </div>
            </div>
          )}

          {ministryError && (
            <div className="bg-[#1a0a0a] border border-[#ff4444] rounded-lg p-4 text-sm text-[#ff4444]">
              ❌ {ministryError}
            </div>
          )}

          {/* Opening Options */}
          {phase === 'ready' && (
            <div className="space-y-3 animate-fadeInUp" style={{ animationDelay: '3s', opacity: 0 }}>
              <Button
                onClick={handleOpenSchool}
                className="w-full bg-[#00ff88] text-black font-bold hover:bg-[#00cc6e] h-14 text-lg"
              >
                🎓 Abrir escuela ahora
              </Button>

              <Button
                onClick={requestMinistryApproval}
                disabled={ministryLoading}
                variant="outline"
                className="w-full border-[#ffcc00] text-[#ffcc00] hover:bg-[#1a1a0a] hover:text-[#ffcc00] h-12 disabled:opacity-50"
              >
                {ministryLoading ? '⏳ Solicitando al Ministerio...' : '🏛️ Solicitar fecha al Ministerio'}
              </Button>
            </div>
          )}

          {/* Back Button */}
          <div className="pt-2">
            <Button
              variant="ghost"
              onClick={() => {
                sounds.click();
                prevScreen();
              }}
              className="w-full border border-[#333333] text-[#aaaaaa] hover:text-white hover:border-[#555555] h-12"
            >
              ← Anterior
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
