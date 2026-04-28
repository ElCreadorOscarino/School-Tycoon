import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import type { EventImpact } from '@/lib/game-types';

// ============================================
// Singleton ZAI instance (shared with /api/ai)
// ============================================

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

// ============================================
// Types
// ============================================

interface EventRequest {
  schoolName: string;
  currentWeek: number;
  reputation: number;
  studentSatisfaction: number;
  academicPerformance: number;
  parentSatisfaction: number;
  activeStudents: number;
  maxStudents: number;
  money: number;
  recentEvents: string[];
  season: string;
  achievements: string[];
}

interface AIEventOption {
  text: string;
  reputationChange: number;
  moneyChange: number;
  satisfactionChange: number;
  consequence: string;
}

interface AIGeneratedEvent {
  title: string;
  description: string;
  emoji: string;
  impact: EventImpact;
  category: string;
  options: AIEventOption[];
}

// ============================================
// System Prompt
// ============================================

function buildSystemPrompt(): string {
  return `Eres un generador de eventos dinámicos para el juego "School Tycoon" (Tycoon de Escuela). Tu ÚNICA tarea es generar un evento escolar aleatorio y único en formato JSON puro. NUNCA repitas eventos que se te indiquen como recientes.

CONTEXTO DEL JUEGO:
- El jugador es el director de una escuela privada.
- Los eventos aparecen semanalmente y el jugador debe tomar decisiones.
- Cada decisión afecta la reputación, el dinero y la satisfacción.

ESTRUCTURA JSON EXACTA (SIN markdown, SIN backticks):
{
  "title": "Título del evento en español",
  "description": "Descripción de 2-3 oraciones en español que explica la situación",
  "emoji": "🔥",
  "impact": "positive|neutral|negative",
  "category": "academic|social|infrastructure|financial|staff|students|parents|seasonal",
  "options": [
    {
      "text": "Texto de la opción en español",
      "reputationChange": 0,
      "moneyChange": 0,
      "satisfactionChange": 0,
      "consequence": "Descripción del resultado en español"
    }
  ]
}

REGLAS ESTRICTAS:
1. NUNCA uses markdown (sin \`\`\`json ni nada similar). Output SOLO el JSON.
2. Genera SIEMPRE entre 2 y 3 opciones por evento.
3. reputationChange: rango de -10 a +10
4. moneyChange: rango de -15000 a +15000
5. satisfactionChange: rango de -10 a +10
6. Los cambios de dinero deben ser proporcionales al contexto (no destruyas la escuela de un golpe).
7. Las opciones deben ser significativamente diferentes entre sí (no variaciones del mismo tema).
8. Cada opción debe tener un consequence descriptivo que cuente qué pasa.
9. El emoji debe ser relevante al evento (un solo emoji).
10. Los textos deben estar completamente en español.
11. Sé creativo: mezcla situaciones realistas con algunas situaciones inesperadas y divertidas.
12. NUNCA generes eventos sobre: violencia extrema, contenido inapropiado, o situaciones demasiado irreales.
13. El campo "category" debe ser uno de: academic, social, infrastructure, financial, staff, students, parents, seasonal.

CATEGORÍAS DE EVENTOS Y EJEMPLOS:
- academic: competencias, resultados de exámenes, problemas curriculares, innovación educativa
- social: conflictos estudiantiles, festivales, integración, bullying
- infrastructure: daños, mejoras, mantenimiento, construcción
- financial: presupuestos, donaciones, deudas, inspecciones
- staff: renuncias, capacitaciones, conflictos laborales, contrataciones
- students: inscripciones, problemas disciplinarios, talentos destacados
- parents: quejas, reuniones, colaboración, exigencias
- seasonal: eventos relacionados con la estación actual`;
}

function buildUserPrompt(req: EventRequest): string {
  const occupancy = req.maxStudents > 0
    ? Math.round((req.activeStudents / req.maxStudents) * 100)
    : 0;

  // Determine the overall school health
  const avgScore = (req.reputation + req.studentSatisfaction + req.academicPerformance + req.parentSatisfaction) / 4;
  let healthStatus: string;
  if (avgScore >= 75) healthStatus = 'excelente';
  else if (avgScore >= 50) healthStatus = 'buena';
  else if (avgScore >= 30) healthStatus = 'regular';
  else healthStatus = 'crítica';

  // Contextual hints based on metrics
  const hints: string[] = [];
  if (req.money < 20000) hints.push('La escuela tiene problemas financieros graves. Genera eventos que reflejen esta presión económica.');
  if (req.money < 50000) hints.push('El presupuesto es ajustado. Incluye dilemas financieros.');
  if (req.reputation < 30) hints.push('La reputación es muy baja. Genera eventos que reflejen problemas de imagen.');
  if (req.reputation > 80) hints.push('La escuela es muy respetada. Pueden surgir oportunidades y envidias.');
  if (req.studentSatisfaction < 30) hints.push('Los estudiantes están muy insatisfechos. Considera problemas estudiantiles.');
  if (req.parentSatisfaction < 30) hints.push('Los padres están descontentos. Genera presión de los padres.');
  if (req.academicPerformance < 30) hints.push('El rendimiento académico es bajo. Genera desafíos académicos.');
  if (occupancy > 90) hints.push('La escuela está casi llena. Genera problemas de saturación.');
  if (occupancy < 30) hints.push('Hay pocos estudiantes. Genera eventos relacionados a la matrícula baja.');
  if (req.achievements.length > 0) hints.push(`La escuela ya desbloqueó estos logros: ${req.achievements.join(', ')}. No repitas temáticas exactas.`);

  const seasonHints: Record<string, string> = {
    spring: 'Es primavera. Puedes generar eventos sobre: inicio de ciclo, flores, actividades al aire libre, día del niño, torneos deportivos.',
    summer: 'Es verano. Puedes generar eventos sobre: vacaciones, mantenimiento, inscripciones, campamentos, altas temperaturas.',
    fall: 'Es otoño. Puedes generar eventos sobre: regreso a clases, Día de Muertos, evaluaciones, cambio de clima, reuniones de padres.',
    winter: 'Es invierno. Puedes generar eventos sobre: frío, fiestas decembrinas, posadas, cierre por clima, presupuesto de fin de año.',
  };

  return `ESTADO ACTUAL DE LA ESCUELA "${req.schoolName}":
- Semana actual: ${req.currentWeek}
- Reputación: ${req.reputation}/100
- Satisfacción de estudiantes: ${req.studentSatisfaction}/100
- Rendimiento académico: ${req.academicPerformance}/100
- Satisfacción de padres: ${req.parentSatisfaction}/100
- Estudiantes activos: ${req.activeStudents}/${req.maxStudents} (${occupancy}% de ocupación)
- Dinero disponible: $${req.money.toLocaleString('es-MX')}
- Salud general de la escuela: ${healthStatus}
- Estación actual: ${req.season}

EVENTOS RECIENTES (NO REPETIR NINGUNO DE ESTOS):
${req.recentEvents.length > 0 ? req.recentEvents.map(e => `- ${e}`).join('\n') : '(Ninguno aún)'}

${seasonHints[req.season] || ''}

${hints.length > 0 ? `INDICACIONES CONTEXTUALES:\n${hints.join('\n')}` : ''}

Genera UN evento único y creativo que sea relevante a esta situación. Recuerda: SOLO el JSON, sin markdown.`;
}

// ============================================
// JSON Parsing Utilities
// ============================================

function stripMarkdownFences(text: string): string {
  // Remove ```json ... ``` or ``` ... ``` blocks
  return text
    .replace(/^```json\s*\n?/i, '')
    .replace(/^```\s*\n?/i, '')
    .replace(/\n?```\s*$/i, '')
    .trim();
}

function isValidImpact(value: unknown): value is EventImpact {
  return value === 'positive' || value === 'neutral' || value === 'negative';
}

function isValidCategory(value: unknown): boolean {
  const categories = ['academic', 'social', 'infrastructure', 'financial', 'staff', 'students', 'parents', 'seasonal'];
  return typeof value === 'string' && categories.includes(value);
}

function clampRange(value: number, min: number, max: number): number {
  return Math.round(Math.min(max, Math.max(min, value)));
}

function validateAndNormalizeEvent(raw: unknown): AIGeneratedEvent | null {
  if (!raw || typeof raw !== 'object') return null;

  const obj = raw as Record<string, unknown>;

  // Required string fields
  const title = typeof obj.title === 'string' && obj.title.trim().length > 0 ? obj.title.trim() : null;
  const description = typeof obj.description === 'string' && obj.description.trim().length > 0 ? obj.description.trim() : null;

  if (!title || !description) return null;

  // Optional fields with defaults
  const emoji = typeof obj.emoji === 'string' ? obj.emoji.slice(0, 2) : '📰';
  const impact = isValidImpact(obj.impact) ? obj.impact : 'neutral';
  const category = isValidCategory(obj.category) ? (obj.category as string) : 'social';

  // Options validation
  let options = obj.options;
  if (!Array.isArray(options) || options.length === 0) return null;

  // Take first 3 options max
  const normalizedOptions: AIEventOption[] = options.slice(0, 3).map((opt: unknown): AIEventOption => {
    if (!opt || typeof opt !== 'object') {
      return {
        text: 'No hay opción disponible',
        reputationChange: 0,
        moneyChange: 0,
        satisfactionChange: 0,
        consequence: 'Sin consecuencias.',
      };
    }

    const o = opt as Record<string, unknown>;
    return {
      text: typeof o.text === 'string' && o.text.trim().length > 0 ? o.text.trim() : 'Sin descripción',
      reputationChange: clampRange(typeof o.reputationChange === 'number' ? o.reputationChange : 0, -10, 10),
      moneyChange: clampRange(typeof o.moneyChange === 'number' ? o.moneyChange : 0, -15000, 15000),
      satisfactionChange: clampRange(typeof o.satisfactionChange === 'number' ? o.satisfactionChange : 0, -10, 10),
      consequence: typeof o.consequence === 'string' ? o.consequence.trim() : 'El resultado se verá reflejado pronto.',
    };
  });

  // Ensure at least one valid option
  if (normalizedOptions.length === 0) return null;

  return {
    title,
    description,
    emoji,
    impact,
    category,
    options: normalizedOptions,
  };
}

// ============================================
// Route Handler
// ============================================

export async function POST(req: NextRequest) {
  try {
    // 1. Parse and validate request body
    const body = await req.json() as Partial<EventRequest>;

    const {
      schoolName = 'Mi Escuela',
      currentWeek = 1,
      reputation = 50,
      studentSatisfaction = 50,
      academicPerformance = 50,
      parentSatisfaction = 50,
      activeStudents = 0,
      maxStudents = 100,
      money = 50000,
      recentEvents = [],
      season = 'spring',
      achievements = [],
    } = body;

    // 2. Build prompts
    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt({
      schoolName,
      currentWeek,
      reputation,
      studentSatisfaction,
      academicPerformance,
      parentSatisfaction,
      activeStudents,
      maxStudents,
      money,
      recentEvents: Array.isArray(recentEvents) ? recentEvents : [],
      season,
      achievements: Array.isArray(achievements) ? achievements : [],
    });

    // 3. Call Z.ai SDK with 8-second timeout
    const zai = await getZAI();

    const completionPromise = zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      thinking: { type: 'disabled' },
    });

    const completion = await Promise.race([
      completionPromise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI request timed out after 8 seconds')), 8000)
      ),
    ]);

    const rawContent = completion.choices?.[0]?.message?.content;
    if (!rawContent) {
      return NextResponse.json({ event: null, error: 'Empty AI response' }, { status: 200 });
    }

    // 4. Parse and validate the response
    const strippedContent = stripMarkdownFences(rawContent);

    let parsed: unknown;
    try {
      parsed = JSON.parse(strippedContent);
    } catch {
      // Try to extract JSON from the response if it's embedded in text
      const jsonMatch = strippedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch {
          return NextResponse.json(
            { event: null, error: 'Failed to parse AI response as JSON' },
            { status: 200 }
          );
        }
      } else {
        return NextResponse.json(
          { event: null, error: 'No JSON found in AI response' },
          { status: 200 }
        );
      }
    }

    // 5. Validate and normalize the event structure
    const event = validateAndNormalizeEvent(parsed);
    if (!event) {
      return NextResponse.json(
        { event: null, error: 'AI response had invalid event structure' },
        { status: 200 }
      );
    }

    // 6. Return the successful event
    return NextResponse.json({ event }, { status: 200 });
  } catch (error) {
    console.error('[AI Events] Error generating event:', error instanceof Error ? error.message : error);

    // Return null event so the game can fall back to local events
    return NextResponse.json(
      { event: null, error: 'Failed to generate event' },
      { status: 200 }
    );
  }
}
