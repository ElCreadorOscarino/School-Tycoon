'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '@/lib/game-store';
import { sounds } from '@/lib/sounds';
import { Button } from '@/components/ui/button';
import { SCREEN_ORDER } from '@/lib/game-types';
import type { ReviewItem } from '@/lib/game-types';

const TYPE_CONFIG: Record<string, { label: string; emoji: string; borderColor: string; bgColor: string; textColor: string }> = {
  positive: { label: 'Positivos', emoji: '✅', borderColor: 'border-[#00ff88]', bgColor: 'bg-[#0a1a10]', textColor: 'text-[#00ff88]' },
  warning: { label: 'Advertencias', emoji: '⚠️', borderColor: 'border-[#ffcc00]', bgColor: 'bg-[#1a1a0a]', textColor: 'text-[#ffcc00]' },
  negative: { label: 'Negativos', emoji: '❌', borderColor: 'border-[#ff4444]', bgColor: 'bg-[#1a0a0a]', textColor: 'text-[#ff4444]' },
  suggestion: { label: 'Sugerencias', emoji: '💡', borderColor: 'border-[#4488ff]', bgColor: 'bg-[#0a0a1a]', textColor: 'text-[#4488ff]' },
};

export default function ReviewScreen() {
  const chairType = useGameStore(s => s.chairType);
  const presentationSystem = useGameStore(s => s.presentationSystem);
  const digitalScreenTier = useGameStore(s => s.digitalScreenTier);
  const bathroomQuality = useGameStore(s => s.bathroomQuality);
  const teachers = useGameStore(s => s.teachers);
  const libraryEnabled = useGameStore(s => s.libraryEnabled);
  const internetType = useGameStore(s => s.internetType);
  const cameraCount = useGameStore(s => s.cameraCount);
  const cafeteriaBuilt = useGameStore(s => s.cafeteriaBuilt);
  const cafeteriaSize = useGameStore(s => s.cafeteriaSize);
  const cafeteriaFoodQuality = useGameStore(s => s.cafeteriaFoodQuality);
  const sportsAreaEnabled = useGameStore(s => s.sportsAreaEnabled);
  const vacationPeriods = useGameStore(s => s.vacationPeriods);
  const cafeteriaStaff = useGameStore(s => s.cafeteriaStaff);
  const bathroomCount = useGameStore(s => s.bathroomCount);
  const breakTimeMinutes = useGameStore(s => s.breakTimeMinutes);
  const gradeSystem = useGameStore(s => s.gradeSystem);
  const inclusiveBathroom = useGameStore(s => s.inclusiveBathroom);
  const bathroomCleaners = useGameStore(s => s.bathroomCleaners);
  const studentsLength = useGameStore(s => s.students.length);
  const computerLabEnabled = useGameStore(s => s.computerLabEnabled);
  const shift = useGameStore(s => s.shift);
  const meetingRoomEnabled = useGameStore(s => s.meetingRoomEnabled);
  const setReviewItems = useGameStore(s => s.setReviewItems);
  const reviewItems = useGameStore(s => s.reviewItems);
  const getMaxStudents = useGameStore(s => s.getMaxStudents);
  const getMinBathrooms = useGameStore(s => s.getMinBathrooms);
  const prevScreen = useGameStore(s => s.prevScreen);
  const nextScreen = useGameStore(s => s.nextScreen);
  const schoolName = useGameStore(s => s.schoolName);
  const directorName = useGameStore(s => s.directorName);
  const buildingSize = useGameStore(s => s.buildingSize);
  const classroomsCount = useGameStore(s => s.classrooms.length);
  const uniformPolicy = useGameStore(s => s.uniformPolicy);
  const cellphonePolicy = useGameStore(s => s.cellphonePolicy);
  const noHomeworkVacations = useGameStore(s => s.noHomeworkVacations);
  const classDuration = useGameStore(s => s.classDuration);
  const librarySize = useGameStore(s => s.librarySize);
  const sportsAreaType = useGameStore(s => s.sportsAreaType);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [analyzed, setAnalyzed] = useState(false);

  const runAnalysis = useCallback(() => {
    const items: ReviewItem[] = [];
    const maxStudents = getMaxStudents();
    const minBathrooms = getMinBathrooms();

    // ✅ POSITIVES
    if (chairType === 'padded') {
      items.push({ emoji: '🪑', type: 'positive', text: 'Sillas acolchadas de alta calidad para mayor comodidad' });
    }
    if (presentationSystem === 'digital') {
      items.push({ emoji: '📺', type: 'positive', text: 'Pantallas digitales en las aulas para presentaciones modernas' });
    }
    if (bathroomQuality === 'premium') {
      items.push({ emoji: '🚽', type: 'positive', text: 'Banos de calidad premium, excelentes instalaciones' });
    }
    const highQualityTeachers = teachers.filter(t => t.hired && t.quality >= 7);
    if (highQualityTeachers.length > 0) {
      items.push({ emoji: '👨‍🏫', type: 'positive', text: `${highQualityTeachers.length} profesor(es) de alta calidad (calidad >= 7)` });
    }
    if (libraryEnabled) {
      items.push({ emoji: '📚', type: 'positive', text: 'Biblioteca habilitada para enriquecimiento academico' });
    }
    if (internetType === 'fiber') {
      items.push({ emoji: '🌐', type: 'positive', text: 'Conexion de internet por fibra optica de alta velocidad' });
    }
    if (cameraCount >= 6) {
      items.push({ emoji: '📹', type: 'positive', text: `${cameraCount} camaras de seguridad instaladas` });
    }
    if (cafeteriaBuilt && cafeteriaFoodQuality === 'premium') {
      items.push({ emoji: '🍽️', type: 'positive', text: 'Cafeteria premium con comida de alta calidad' });
    }
    if (sportsAreaEnabled) {
      items.push({ emoji: '⚽', type: 'positive', text: 'Area deportiva disponible para los estudiantes' });
    }
    if (vacationPeriods.length >= 3) {
      items.push({ emoji: '🏖️', type: 'positive', text: 'Calendario con periodos de vacaciones adecuados' });
    }
    if (digitalScreenTier === 'high') {
      items.push({ emoji: '🖥️', type: 'positive', text: 'Pantallas digitales de gama alta en las aulas' });
    }
    if (inclusiveBathroom) {
      items.push({ emoji: '🏳️‍🌈', type: 'positive', text: 'Bano inclusivo disponible para todos los estudiantes' });
    }

    // ⚠️ WARNINGS
    if (cafeteriaBuilt) {
      const capacityMap = { basic: 50, standard: 100, premium: 200 };
      const cafeCapacity = capacityMap[cafeteriaSize] || 100;
      if (maxStudents > cafeCapacity) {
        items.push({ emoji: '🍽️', type: 'warning', text: `La cafeteria es muy pequena para ${maxStudents} estudiantes (capacidad: ${cafeCapacity})` });
      }
    }
    if (bathroomCount < minBathrooms && bathroomCount >= minBathrooms - 1) {
      items.push({ emoji: '🚻', type: 'warning', text: `Pocos banos (${bathroomCount}) para la capacidad estudiantil (minimo: ${minBathrooms})` });
    }
    if (breakTimeMinutes < 15) {
      items.push({ emoji: '⏰', type: 'warning', text: `El tiempo de recreo es muy corto (${breakTimeMinutes} min)` });
    }
    if (gradeSystem === 'mixed') {
      items.push({ emoji: '📝', type: 'warning', text: 'Sistema de calificaciones mixto puede causar confusion' });
    }
    if (cafeteriaStaff.cooks < 2 && cafeteriaBuilt) {
      items.push({ emoji: '👨‍🍳', type: 'warning', text: 'Pocos cocineros en la cafeteria' });
    }
    if (bathroomCleaners < 1 && bathroomCount > 2) {
      items.push({ emoji: '🧹', type: 'warning', text: 'No hay suficientes limpiadores para mantener los banos' });
    }
    if (cameraCount > 0 && cameraCount < 4) {
      items.push({ emoji: '📹', type: 'warning', text: 'Considera anadir mas camaras de seguridad' });
    }

    // ❌ NEGATIVES
    const redFlagTeachers = teachers.filter(t => t.hired && t.redFlags.length > 0);
    if (redFlagTeachers.length > 0) {
      redFlagTeachers.forEach(t => {
        t.redFlags.forEach(flag => {
          items.push({ emoji: '🚩', type: 'negative', text: `Profesor ${t.name}: ${flag}` });
        });
      });
    }
    if (!cafeteriaBuilt) {
      items.push({ emoji: '❌', type: 'negative', text: 'No hay cafeteria - los estudiantes no tendran servicio de comida' });
    }
    if (chairType === 'common') {
      items.push({ emoji: '🪑', type: 'negative', text: 'Sillas comunes - los estudiantes se quejaran de incomodidad' });
    }
    if (internetType === 'none') {
      items.push({ emoji: '📵', type: 'negative', text: 'Sin conexion a internet - limitara el aprendizaje moderno' });
    }
    if (bathroomCount < minBathrooms - 1) {
      items.push({ emoji: '🚽', type: 'negative', text: `Banos insuficientes (${bathroomCount} de ${minBathrooms} minimos requeridos)` });
    }
    if (!libraryEnabled) {
      items.push({ emoji: '📚', type: 'negative', text: 'Sin biblioteca - afectara el rendimiento academico' });
    }
    if (teachers.filter(t => t.hired).length === 0) {
      items.push({ emoji: '👨‍🏫', type: 'negative', text: 'No hay profesores contratados - la escuela no puede operar' });
    }
    if (studentsLength === 0) {
      items.push({ emoji: '👩‍🎓', type: 'negative', text: 'No hay estudiantes inscritos - no habra ingresos' });
    }

    // 💡 SUGGESTIONS
    if (chairType !== 'padded') {
      items.push({ emoji: '💡', type: 'suggestion', text: 'Considera mejorar la calidad de las sillas a acolchadas' });
    }
    if (cameraCount < 6) {
      items.push({ emoji: '💡', type: 'suggestion', text: 'Anade mas camaras de seguridad para mayor proteccion' });
    }
    if (!libraryEnabled) {
      items.push({ emoji: '💡', type: 'suggestion', text: 'La biblioteca aumentara tu reputacion academica significativamente' });
    }
    if (!sportsAreaEnabled) {
      items.push({ emoji: '💡', type: 'suggestion', text: 'Un area deportiva mejorara la satisfaccion estudiantil' });
    }
    if (internetType !== 'fiber') {
      items.push({ emoji: '💡', type: 'suggestion', text: 'La fibra optica mejorara la velocidad de internet dramaticamente' });
    }
    if (!computerLabEnabled) {
      items.push({ emoji: '💡', type: 'suggestion', text: 'Un laboratorio de computacion es esencial para la educacion moderna' });
    }
    if (cafeteriaBuilt && cafeteriaFoodQuality !== 'premium') {
      items.push({ emoji: '💡', type: 'suggestion', text: 'Mejorar la calidad de la comida de la cafeteria' });
    }
    if (breakTimeMinutes < 20) {
      items.push({ emoji: '💡', type: 'suggestion', text: 'Aumentar el tiempo de recreo a 20 minutos mejorara el bienestar' });
    }
    if (shift === 'morning') {
      items.push({ emoji: '💡', type: 'suggestion', text: 'Considera ofrecer turnos adicionales para maximizar la capacidad' });
    }
    if (!meetingRoomEnabled) {
      items.push({ emoji: '💡', type: 'suggestion', text: 'Una sala de reuniones mejorara la comunicacion con los padres' });
    }

    setReviewItems(items);
    setAnalyzed(true);
  }, [chairType, presentationSystem, digitalScreenTier, bathroomQuality, teachers, libraryEnabled, internetType, cameraCount, cafeteriaBuilt, cafeteriaSize, cafeteriaFoodQuality, sportsAreaEnabled, vacationPeriods, cafeteriaStaff, bathroomCount, breakTimeMinutes, gradeSystem, inclusiveBathroom, bathroomCleaners, studentsLength, computerLabEnabled, shift, meetingRoomEnabled, setReviewItems, getMaxStudents, getMinBathrooms]);

  // Run analysis once on mount (not when dependencies change, to avoid infinite loops)
  const analysisRunRef = useRef(false);
  useEffect(() => {
    if (!analysisRunRef.current) {
      analysisRunRef.current = true;
      runAnalysis();
    }
  }, []);

  const requestAiReview = async () => {
    setAiLoading(true);
    setAiError('');

    try {
      const context = `
Escuela: ${schoolName}
Director: ${directorName}
Tamano: ${buildingSize}
Aulas: ${classroomsCount}
Estudiantes: ${studentsLength}
Profesores: ${teachers.filter(t => t.hired).length}
Cafeteria: ${cafeteriaBuilt ? cafeteriaSize : 'No'}
Biblioteca: ${libraryEnabled ? librarySize : 'No'}
Internet: ${internetType}
Camaras: ${cameraCount}
Sillas: ${chairType}
Banos: ${bathroomCount} (${bathroomQuality})
Area deportiva: ${sportsAreaEnabled ? sportsAreaType : 'No'}
Politica de uniforme: ${uniformPolicy}
Politica de telefonos: ${cellphonePolicy}
Sistema de calificaciones: ${gradeSystem}
Tarea en vacaciones: ${noHomeworkVacations ? 'Si' : 'No'}
Lab de computacion: ${computerLabEnabled ? 'Si' : 'No'}
Tiempo de recreo: ${breakTimeMinutes} min
Turno: ${shift}
Duracion de clase: ${classDuration} min
      `.trim();

      const body: Record<string, unknown> = {
        messages: [
          {
            role: 'user',
            content: `Analiza esta configuracion de escuela y genera criticas en formato JSON array: [{"emoji":"...","type":"positive"|"warning"|"negative"|"suggestion","text":"..."}]\n\n${context}`
          }
        ],
        systemPrompt: 'Eres un experto en educacion que analiza configuraciones de escuelas. Responde SOLO con un array JSON valido, sin texto adicional. Cada objeto debe tener: emoji (string), type (positive/warning/negative/suggestion), text (string en espanol). Genera entre 5-10 items relevantes y especificos.',
      };

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.error) {
        setAiError(data.error);
        sounds.error();
        return;
      }

      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        setAiError('No se recibio respuesta de la IA');
        return;
      }

      // Try to parse JSON from the response
      let aiItems: ReviewItem[] = [];
      try {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          aiItems = JSON.parse(jsonMatch[0]);
        }
      } catch {
        // If parsing fails, create a single suggestion item
        aiItems = [{ emoji: '🤖', type: 'suggestion' as const, text: 'La IA no pudo generar un analisis estructurado. Intenta de nuevo.' }];
      }

      // Validate and filter items
      const validTypes = ['positive', 'warning', 'negative', 'suggestion'];
      const filtered = aiItems.filter((item: any) =>
        item.emoji && validTypes.includes(item.type) && item.text
      ) as ReviewItem[];

      if (filtered.length > 0) {
        const allItems = [...reviewItems, ...filtered.map(item => ({ ...item, text: `🤖 ${item.text}` }))];
        setReviewItems(allItems);
        sounds.success();
      } else {
        setAiError('La IA no genero criticas validas');
      }
    } catch {
      setAiError('Error de conexion con la IA');
      sounds.error();
    } finally {
      setAiLoading(false);
    }
  };

  const grouped = {
    positive: reviewItems.filter(i => i.type === 'positive'),
    warning: reviewItems.filter(i => i.type === 'warning'),
    negative: reviewItems.filter(i => i.type === 'negative'),
    suggestion: reviewItems.filter(i => i.type === 'suggestion'),
  };

  const stepIndex = SCREEN_ORDER.indexOf('review');
  const totalSteps = 14;
  const score = reviewItems.length > 0
    ? Math.max(0, Math.min(100,
        Math.round(((grouped.positive.length * 3 - grouped.negative.length * 3 - grouped.warning.length) / Math.max(1, reviewItems.length * 3)) * 50 + 50)
      ))
    : 50;

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
        <div className="w-full max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="text-5xl mb-3">📊</div>
            <h1 className="text-2xl font-bold text-[#00ff88] mb-1">Criticas Pre-Apertura</h1>
            <p className="text-[#aaaaaa] text-sm">Analisis completo de tu configuracion escolar</p>
          </div>

          {/* Score Card */}
          {analyzed && (
            <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-5 text-center">
              <div className="text-sm text-[#aaaaaa] mb-2">Puntuacion general</div>
              <div className={`text-4xl font-bold ${
                score >= 80 ? 'text-[#00ff88]' : score >= 60 ? 'text-[#ffcc00]' : score >= 40 ? 'text-[#ff8800]' : 'text-[#ff4444]'
              }`}>
                {score}/100
              </div>
              <div className="w-full h-3 bg-[#111111] rounded-full overflow-hidden border border-[#222222] mt-3">
                <div
                  className={`h-full transition-all duration-1000 rounded-full ${
                    score >= 80 ? 'bg-[#00ff88]' : score >= 60 ? 'bg-[#ffcc00]' : score >= 40 ? 'bg-[#ff8800]' : 'bg-[#ff4444]'
                  }`}
                  style={{ width: `${score}%` }}
                />
              </div>
              <div className="flex justify-center gap-6 mt-3 text-xs">
                <span className="text-[#00ff88]">✅ {grouped.positive.length} positivos</span>
                <span className="text-[#ffcc00]">⚠️ {grouped.warning.length} advertencias</span>
                <span className="text-[#ff4444]">❌ {grouped.negative.length} negativos</span>
                <span className="text-[#4488ff]">💡 {grouped.suggestion.length} sugerencias</span>
              </div>
            </div>
          )}

          {/* AI Review Button */}
          <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-5">
            <Button
              onClick={requestAiReview}
              disabled={aiLoading}
              className="w-full bg-[#4488ff] text-white font-bold hover:bg-[#3366cc] h-12 disabled:opacity-50"
            >
              {aiLoading ? '⏳ Analizando con IA...' : '🤖 Solicitar analisis de IA'}
            </Button>
            {aiError && (
              <p className="text-[#ff4444] text-xs mt-2 text-center">{aiError}</p>
            )}
          </div>

          {/* Review Items by Type */}
          {(['positive', 'warning', 'negative', 'suggestion'] as const).map((type) => {
            const config = TYPE_CONFIG[type];
            const items = grouped[type];
            if (items.length === 0) return null;

            return (
              <div key={type} className={`bg-[#0d0d0d] border-l-4 ${config.borderColor} rounded-lg overflow-hidden`}>
                <div className={`px-4 py-2 ${config.bgColor} border-b border-[#222222]`}>
                  <span className={`${config.textColor} font-bold text-sm`}>
                    {config.emoji} {config.label} ({items.length})
                  </span>
                </div>
                <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
                  {items.map((item, idx) => (
                    <div
                      key={`${type}-${idx}`}
                      className="bg-[#111111] border border-[#222222] rounded px-3 py-2 text-sm text-[#cccccc] flex items-start gap-2"
                    >
                      <span className="shrink-0 mt-0.5">{item.emoji}</span>
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* No items message */}
          {analyzed && reviewItems.length === 0 && (
            <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-8 text-center">
              <div className="text-4xl mb-2">🔍</div>
              <p className="text-[#aaaaaa]">No se encontraron puntos de revision</p>
            </div>
          )}

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
              variant="ghost"
              onClick={() => {
                sounds.click();
                prevScreen();
              }}
              className="flex-1 border border-[#ffcc00] text-[#ffcc00] hover:text-white hover:border-[#ffcc00] hover:bg-[#1a1a0a] h-12"
            >
              ← Volver a corregir
            </Button>
            <Button
              onClick={() => {
                sounds.success();
                nextScreen();
              }}
              className="flex-2 bg-[#00ff88] text-black font-bold hover:bg-[#00cc6e] h-12 px-6"
            >
              Abrir la escuela →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
