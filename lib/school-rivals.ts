// School Rivals System for School Tycoon
// Self-contained module - no internal project imports

export interface SchoolRival {
  id: string;
  name: string;
  students: number;
  reputation: number;
  money: number;
  strengths: string[];
  weaknesses: string[];
  trend: 'rising' | 'stable' | 'declining';
  emoji: string;
}

// ─── Data pools ──────────────────────────────────────────────────

export const SCHOOL_NAMES: string[] = [
  'Colegio Bautista de Santiago',
  'Academia San Juan Bosco',
  'Liceo Nuestra Señora de la Altagracia',
  'Colegio Dominicano de Artes',
  'Escuela Técnica Hermanas Mirabal',
  'Instituto Educativo La Salle',
  'Colegio Padre Billini',
  'Liceo Científico Dr. Delgado',
  'Academia María Montessori RD',
  'Colegio Panamericano de Santo Domingo',
  'Escuela Bilingüe Las Américas',
  'Instituto Cultural Duarte',
  'Colegio Loyola de la Capital',
  'Liceo Experimental Pedro Henríquez Ureña',
  'Academia Los Próceres',
  'Colegio Cristóbal Colón',
  'Escuela Nueva Era',
  'Instituto Salomé Ureña',
  'Colegio San Carlos Borromeo',
  'Liceo Matemático Fermín',
  'Academia Deportiva Juan Marichal',
  'Colegio Musical Ramón Díaz',
  'Escuela Comunitaria Villa Mella',
  'Instituto Tecnológico Baní',
];

export const STRENGTH_POOL: string[] = [
  'Deportes',
  'Académica',
  'Tecnología',
  'Artes Visuales',
  'Música',
  'Ciencias',
  'Idiomas',
  'Disciplina',
  'Infraestructura',
  'Beca Estudiantil',
  'Actividades Extracurriculares',
  'Programa Bilingüe',
  'Laboratorios Modernos',
  'Biblioteca Excelente',
  'Conexiones con Universidades',
];

export const WEAKNESS_POOL: string[] = [
  'Disciplina',
  'Infraestructura',
  'Recursos Financieros',
  'Profesores Inexpertos',
  'Poca Tecnología',
  'Hacinamiento',
  'Baja Matrícula',
  'Mala Ubicación',
  'Falta de Mantenimiento',
  'Poco Deporte',
  'Ningún Programa Bilingüe',
  'Baja Retención de Alumnos',
  'Sin Laboratorios',
  'Escasa Actividad Cultural',
  'Falta de Transparencia',
];

const SCHOOL_EMOJIS = ['🏫', '📚', '🎓', '✏️', '📖', '🏛️', '🏫', '💼', '🌟', '📐'];

// ─── Helpers ─────────────────────────────────────────────────────

function pickRandom<T>(arr: T[], count: number, exclude?: T[]): T[] {
  const pool = exclude ? arr.filter(item => !exclude.includes(item)) : [...arr];
  const result: T[] = [];
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  for (let i = 0; i < Math.min(count, shuffled.length); i++) {
    result.push(shuffled[i]);
  }
  return result;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ─── Rival generation ────────────────────────────────────────────

export function generateRivals(count: number, playerStudents: number): SchoolRival[] {
  const usedNames = new Set<string>();
  const rivals: SchoolRival[] = [];

  // Variety profiles: some stronger, some weaker, some similar
  const profiles = [
    { studentFactor: 1.4, repFactor: 1.3 },  // stronger
    { studentFactor: 0.7, repFactor: 0.6 },  // weaker
    { studentFactor: 1.0, repFactor: 1.1 },  // slightly better
  ];

  for (let i = 0; i < count; i++) {
    // Pick a unique name
    let name: string;
    do {
      name = SCHOOL_NAMES[Math.floor(Math.random() * SCHOOL_NAMES.length)];
    } while (usedNames.has(name));
    usedNames.add(name);

    const profile = profiles[i % profiles.length];
    const studentCount = Math.max(20, Math.round(
      playerStudents * profile.studentFactor * (0.85 + Math.random() * 0.3)
    ));
    const reputation = clamp(
      Math.round(50 * profile.repFactor * (0.8 + Math.random() * 0.4)),
      10,
      100
    );
    const money = Math.round(studentCount * (800 + Math.random() * 600));

    const strengths = pickRandom(STRENGTH_POOL, 2 + Math.floor(Math.random() * 2));
    const weaknesses = pickRandom(WEAKNESS_POOL, 1 + Math.floor(Math.random() * 2), strengths);

    const trends: SchoolRival['trend'][] = ['rising', 'stable', 'declining'];
    const trend = trends[Math.floor(Math.random() * trends.length)];

    rivals.push({
      id: `rival-${i + 1}-${Date.now()}`,
      name,
      students: studentCount,
      reputation,
      money,
      strengths,
      weaknesses,
      trend,
      emoji: SCHOOL_EMOJIS[i % SCHOOL_EMOJIS.length],
    });
  }

  return rivals;
}

// ─── Rival update (weekly) ───────────────────────────────────────

export function updateRivals(rivals: SchoolRival[], currentWeek: number): SchoolRival[] {
  return rivals.map(rival => {
    const updated = { ...rival };
    const rand = () => Math.random();

    // ── Student fluctuation ──
    const studentBias = updated.trend === 'rising' ? 5 : updated.trend === 'declining' ? -5 : 0;
    const studentChange = Math.round((rand() * 10 - 5) + studentBias * 0.5);
    updated.students = Math.max(15, updated.students + studentChange);

    // ── Reputation fluctuation ──
    const repBias = updated.trend === 'rising' ? 3 : updated.trend === 'declining' ? -3 : 0;
    const repChange = Math.round((rand() * 6 - 3) + repBias * 0.5);
    updated.reputation = clamp(updated.reputation + repChange, 5, 100);

    // ── Income ──
    const incomeFactor = 0.6 + rand() * 0.8;
    const weeklyIncome = Math.round(updated.students * incomeFactor);
    const weeklyExpense = Math.round(updated.students * (0.3 + rand() * 0.4));
    updated.money = Math.max(0, updated.money + weeklyIncome - weeklyExpense);

    // ── Trend might change ──
    if (rand() < 0.15) {
      // 15% chance each week to re-evaluate trend
      if (updated.reputation >= 75 && updated.students > 150) {
        updated.trend = 'rising';
      } else if (updated.reputation <= 30 || updated.students < 50) {
        updated.trend = 'declining';
      } else {
        updated.trend = 'stable';
      }
    }

    return updated;
  });
}

// ─── Competition analysis ────────────────────────────────────────

export function getCompetitionInfo(
  playerStudents: number,
  playerReputation: number,
  rivals: SchoolRival[]
): {
  ranking: number;
  totalSchools: number;
  marketShare: number;
  closestRival: SchoolRival | null;
  isLeading: boolean;
} {
  const totalSchools = 1 + rivals.length;
  const totalStudents = playerStudents + rivals.reduce((s, r) => s + r.students, 0);
  const marketShare = totalStudents > 0 ? Math.round((playerStudents / totalStudents) * 10000) / 100 : 0;

  // Build ranking by student count (higher is better)
  const allSchools = [
    { name: 'player', students: playerStudents, reputation: playerReputation },
    ...rivals.map(r => ({ name: r.name, students: r.students, reputation: r.reputation })),
  ];
  allSchools.sort((a, b) => b.students - a.students || b.reputation - a.reputation);

  const ranking = allSchools.findIndex(s => s.name === 'player') + 1;
  const isLeading = ranking === 1;

  // Closest rival = smallest student-count difference
  let closestRival: SchoolRival | null = null;
  let closestGap = Infinity;
  for (const rival of rivals) {
    const gap = Math.abs(rival.students - playerStudents);
    if (gap < closestGap) {
      closestGap = gap;
      closestRival = rival;
    }
  }

  return {
    ranking,
    totalSchools,
    marketShare,
    closestRival,
    isLeading,
  };
}
