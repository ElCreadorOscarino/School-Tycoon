// Challenge System for School Tycoon
// Self-contained module - no internal project imports

export interface ActiveChallenge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  targetValue: number;
  currentValue: number;
  reward: { type: 'money' | 'reputation' | 'satisfaction' | 'performance'; value: number };
  deadline: number;       // week number
  completed: boolean;
  failed: boolean;
  category: 'academic' | 'financial' | 'social' | 'growth' | 'management';
}

// ─── Challenge templates ─────────────────────────────────────────

interface ChallengeTemplate {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: ActiveChallenge['category'];
  rewardType: ActiveChallenge['reward']['type'];
  baseReward: number;
  difficulty: 'easy' | 'medium' | 'hard';
  minWeek: number;          // earliest week this challenge can appear
  checkField: string;       // field name on the game state used for progress
  checkMode: 'reach' | 'accumulate' | 'spend_max' | 'maintain';
  scaleFactor: number;      // target = base * scaleFactor * gameProgress
}

export const CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
  // ── Academic challenges ──
  {
    id: 'ch-academic-1',
    name: 'Educar con Excelencia',
    description: 'Alcanza un rendimiento académico de {target} o más en 4 semanas.',
    emoji: '📚',
    category: 'academic',
    rewardType: 'reputation',
    baseReward: 8,
    difficulty: 'medium',
    minWeek: 1,
    checkField: 'academicPerformance',
    checkMode: 'reach',
    scaleFactor: 75,
  },
  {
    id: 'ch-academic-2',
    name: 'Maestros de Primera',
    description: 'Contrata al menos {target} profesores en 4 semanas.',
    emoji: '👨‍🏫',
    category: 'academic',
    rewardType: 'performance',
    baseReward: 5,
    difficulty: 'medium',
    minWeek: 2,
    checkField: 'teacherCount',
    checkMode: 'accumulate',
    scaleFactor: 2,
  },
  {
    id: 'ch-academic-3',
    name: 'Investigadores del Futuro',
    description: 'Mejora el rendimiento académico en al menos {target} puntos en 4 semanas.',
    emoji: '🔬',
    category: 'academic',
    rewardType: 'reputation',
    baseReward: 10,
    difficulty: 'hard',
    minWeek: 4,
    checkField: 'academicPerformanceGain',
    checkMode: 'accumulate',
    scaleFactor: 10,
  },
  {
    id: 'ch-academic-4',
    name: 'Aula Perfecta',
    description: 'Construye o mejora {target} aulas en 4 semanas.',
    emoji: '🏗️',
    category: 'academic',
    rewardType: 'satisfaction',
    baseReward: 6,
    difficulty: 'medium',
    minWeek: 3,
    checkField: 'classroomBuildCount',
    checkMode: 'accumulate',
    scaleFactor: 1,
  },

  // ── Financial challenges ──
  {
    id: 'ch-finance-1',
    name: 'Presupuesto Ajustado',
    description: 'No gastes más de {target} en 4 semanas. ¡Cuidado con los gastos innecesarios!',
    emoji: ' piggy',
    category: 'financial',
    rewardType: 'money',
    baseReward: 8000,
    difficulty: 'medium',
    minWeek: 2,
    checkField: 'totalSpent',
    checkMode: 'spend_max',
    scaleFactor: 12000,
  },
  {
    id: 'ch-finance-2',
    name: 'Fondo de Reserva',
    description: 'Acumula al menos {target} en la cuenta bancaria en 4 semanas.',
    emoji: '💰',
    category: 'financial',
    rewardType: 'reputation',
    baseReward: 5,
    difficulty: 'hard',
    minWeek: 3,
    checkField: 'money',
    checkMode: 'reach',
    scaleFactor: 20000,
  },
  {
    id: 'ch-finance-3',
    name: 'Gestión Eficiente',
    description: 'Reduce los gastos mensuales en al menos {target} en 4 semanas.',
    emoji: '📈',
    category: 'financial',
    rewardType: 'money',
    baseReward: 5000,
    difficulty: 'hard',
    minWeek: 5,
    checkField: 'expenseReduction',
    checkMode: 'accumulate',
    scaleFactor: 3000,
  },
  {
    id: 'ch-finance-4',
    name: 'Patrocinadores Contentos',
    description: 'Mantén una satisfacción estudiantil de al menos {target} durante 4 semanas.',
    emoji: '🤝',
    category: 'financial',
    rewardType: 'money',
    baseReward: 6000,
    difficulty: 'medium',
    minWeek: 2,
    checkField: 'studentSatisfaction',
    checkMode: 'maintain',
    scaleFactor: 75,
  },

  // ── Social challenges ──
  {
    id: 'ch-social-1',
    name: 'Estudiantes Felices',
    description: 'Alcanza una satisfacción estudiantil de {target} o más en 4 semanas.',
    emoji: '😊',
    category: 'social',
    rewardType: 'reputation',
    baseReward: 6,
    difficulty: 'medium',
    minWeek: 1,
    checkField: 'studentSatisfaction',
    checkMode: 'reach',
    scaleFactor: 80,
  },
  {
    id: 'ch-social-2',
    name: 'Cero Conflictos',
    description: 'Mantén una reputación de al menos {target} durante 4 semanas sin eventos negativos.',
    emoji: '🕊️',
    category: 'social',
    rewardType: 'satisfaction',
    baseReward: 8,
    difficulty: 'hard',
    minWeek: 4,
    checkField: 'reputation',
    checkMode: 'maintain',
    scaleFactor: 65,
  },
  {
    id: 'ch-social-3',
    name: 'Actividades para Todos',
    description: 'Organiza al menos {target} actividades extracurriculares en 4 semanas.',
    emoji: '🎭',
    category: 'social',
    rewardType: 'satisfaction',
    baseReward: 7,
    difficulty: 'easy',
    minWeek: 1,
    checkField: 'activitiesCount',
    checkMode: 'accumulate',
    scaleFactor: 3,
  },
  {
    id: 'ch-social-4',
    name: 'Integración Comunitaria',
    description: 'Alcanza +{target} puntos de reputación en 4 semanas.',
    emoji: '🌟',
    category: 'social',
    rewardType: 'money',
    baseReward: 5000,
    difficulty: 'medium',
    minWeek: 3,
    checkField: 'reputationGain',
    checkMode: 'accumulate',
    scaleFactor: 8,
  },

  // ── Growth challenges ──
  {
    id: 'ch-growth-1',
    name: 'Matrícula en Aumento',
    description: 'Incrementa la matrícula de estudiantes en al menos {target} en 4 semanas.',
    emoji: '📈',
    category: 'growth',
    rewardType: 'money',
    baseReward: 4000,
    difficulty: 'medium',
    minWeek: 2,
    checkField: 'studentGain',
    checkMode: 'accumulate',
    scaleFactor: 10,
  },
  {
    id: 'ch-growth-2',
    name: 'Escuela Reconocida',
    description: 'Alcanza una reputación de {target} puntos en 4 semanas.',
    emoji: '🏅',
    category: 'growth',
    rewardType: 'performance',
    baseReward: 5,
    difficulty: 'hard',
    minWeek: 5,
    checkField: 'reputation',
    checkMode: 'reach',
    scaleFactor: 80,
  },
  {
    id: 'ch-growth-3',
    name: 'Expansión Imponente',
    description: 'Alcanza {target} estudiantes matriculados en 4 semanas.',
    emoji: '🏫',
    category: 'growth',
    rewardType: 'reputation',
    baseReward: 10,
    difficulty: 'hard',
    minWeek: 6,
    checkField: 'activeStudents',
    checkMode: 'reach',
    scaleFactor: 120,
  },
  {
    id: 'ch-growth-4',
    name: 'Primeros Lugares',
    description: 'Supera a todos los rivales en número de estudiantes en 4 semanas.',
    emoji: '👑',
    category: 'growth',
    rewardType: 'reputation',
    baseReward: 15,
    difficulty: 'hard',
    minWeek: 8,
    checkField: 'isLeading',
    checkMode: 'reach',
    scaleFactor: 1,
  },

  // ── Management challenges ──
  {
    id: 'ch-mgmt-1',
    name: 'Administrador Ejemplar',
    description: 'No dejes que la satisfacción baje de {target} en 4 semanas.',
    emoji: '📋',
    category: 'management',
    rewardType: 'money',
    baseReward: 3000,
    difficulty: 'easy',
    minWeek: 1,
    checkField: 'studentSatisfaction',
    checkMode: 'maintain',
    scaleFactor: 60,
  },
  {
    id: 'ch-mgmt-2',
    name: 'Equipo Completo',
    description: 'Contrata al menos {target} miembros de personal en 4 semanas.',
    emoji: '👷',
    category: 'management',
    rewardType: 'satisfaction',
    baseReward: 5,
    difficulty: 'easy',
    minWeek: 1,
    checkField: 'staffHired',
    checkMode: 'accumulate',
    scaleFactor: 3,
  },
  {
    id: 'ch-mgmt-3',
    name: 'Máquinas Operativas',
    description: 'Repara o mejora {target} instalaciones en 4 semanas.',
    emoji: '🔧',
    category: 'management',
    rewardType: 'performance',
    baseReward: 4,
    difficulty: 'medium',
    minWeek: 2,
    checkField: 'repairsDone',
    checkMode: 'accumulate',
    scaleFactor: 2,
  },
  {
    id: 'ch-mgmt-4',
    name: 'Planificación Impecable',
    description: 'Alcanza un rendimiento académico de {target} y satisfacción de 70+ en 4 semanas.',
    emoji: '🎯',
    category: 'management',
    rewardType: 'reputation',
    baseReward: 12,
    difficulty: 'hard',
    minWeek: 6,
    checkField: 'academicPerformance',
    checkMode: 'reach',
    scaleFactor: 80,
  },
];

// ─── Helpers ─────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function getEligibleTemplates(currentWeek: number): ChallengeTemplate[] {
  return CHALLENGE_TEMPLATES.filter(t => currentWeek >= t.minWeek);
}

function scaleTarget(template: ChallengeTemplate, currentWeek: number, state: {
  reputation: number;
  money: number;
  activeStudents: number;
  academicPerformance: number;
  studentSatisfaction: number;
}): number {
  // Game progress factor: ramps up over time
  const progressFactor = 1 + (currentWeek / 50) * 0.5;

  // Scale relative to player state where appropriate
  let base = template.scaleFactor;

  if (template.checkField === 'money' || template.checkMode === 'spend_max') {
    base = Math.round(state.money * (template.checkMode === 'spend_max' ? 1.5 : 0.8));
  } else if (template.checkField === 'activeStudents') {
    base = Math.round(state.activeStudents * 1.15);
  } else if (template.checkField === 'academicPerformance' || template.checkField === 'studentSatisfaction') {
    base = Math.round(base * (0.9 + (state[template.checkField === 'academicPerformance' ? 'academicPerformance' : 'studentSatisfaction'] / 100) * 0.3));
  }

  const scaled = Math.round(base * progressFactor);

  // Round to nice numbers
  if (scaled >= 100) return Math.ceil(scaled / 10) * 10;
  if (scaled >= 10) return Math.ceil(scaled / 5) * 5;
  return Math.max(1, scaled);
}

// ─── Core generation ─────────────────────────────────────────────

export function generateWeeklyChallenge(
  currentWeek: number,
  state: {
    reputation: number;
    money: number;
    activeStudents: number;
    academicPerformance: number;
    studentSatisfaction: number;
  }
): ActiveChallenge {
  const eligible = getEligibleTemplates(currentWeek);
  if (eligible.length === 0) {
    // Fallback challenge
    return {
      id: `challenge-fallback-${currentWeek}`,
      name: 'Mantén la Escuela Funcionando',
      description: 'Continúa operando tu escuela sin problemas durante 4 semanas.',
      emoji: '✅',
      targetValue: 1,
      currentValue: 0,
      reward: { type: 'money', value: 1000 },
      deadline: currentWeek + 4,
      completed: false,
      failed: false,
      category: 'management',
    };
  }

  // Weight selection by difficulty based on game state
  const poorState = state.money < 3000 || state.reputation < 30 || state.studentSatisfaction < 30;
  const strongState = state.reputation >= 70 && state.money >= 15000 && state.studentSatisfaction >= 70;

  const weighted = eligible.map(t => {
    let weight = 1;
    if (poorState && t.difficulty === 'easy') weight = 3;
    if (poorState && t.difficulty === 'hard') weight = 0.3;
    if (strongState && t.difficulty === 'hard') weight = 3;
    if (strongState && t.difficulty === 'easy') weight = 0.5;
    return { template: t, weight };
  });

  const totalWeight = weighted.reduce((s, w) => s + w.weight, 0);
  let roll = Math.random() * totalWeight;
  let chosen = weighted[0].template;

  for (const w of weighted) {
    roll -= w.weight;
    if (roll <= 0) {
      chosen = w.template;
      break;
    }
  }

  const target = scaleTarget(chosen, currentWeek, state);

  // Scale reward with difficulty and game progress
  const progressMultiplier = 1 + (currentWeek / 100);
  const difficultyMultiplier = chosen.difficulty === 'easy' ? 0.8 : chosen.difficulty === 'hard' ? 1.5 : 1.0;
  const rewardValue = Math.round(chosen.baseReward * progressMultiplier * difficultyMultiplier);

  const name = chosen.name;
  const description = chosen.description.replace('{target}', String(target));

  return {
    id: `challenge-${chosen.id}-${currentWeek}`,
    name,
    description,
    emoji: chosen.emoji,
    targetValue: target,
    currentValue: 0,
    reward: { type: chosen.rewardType, value: rewardValue },
    deadline: currentWeek + 4,
    completed: false,
    failed: false,
    category: chosen.category,
  };
}

// ─── Progress checking ───────────────────────────────────────────

export function checkChallengeProgress(challenge: ActiveChallenge, state: Record<string, number>): number {
  // Find the matching template for check logic
  const template = CHALLENGE_TEMPLATES.find(t => challenge.id.includes(t.id));
  if (!template) return challenge.currentValue;

  const fieldValue = state[template.checkField] ?? 0;

  switch (template.checkMode) {
    case 'reach':
      // currentValue = how close to reaching the target (clamped 0..target)
      return clamp(fieldValue, 0, challenge.targetValue);

    case 'accumulate':
      // currentValue = accumulated amount so far
      return Math.max(0, Math.min(fieldValue, challenge.targetValue));

    case 'spend_max':
      // currentValue = how much has been spent (fail if over target)
      return fieldValue;

    case 'maintain':
      // currentValue = current field value (check if it stays above target)
      return fieldValue;

    default:
      return challenge.currentValue;
  }
}
