// ============================================
// SCHOOL TYCOON - Tipos TypeScript
// ============================================

// === ALIAS TYPES ===

export type ScreenId =
  | 'api-config'
  | 'profile'
  | 'building'
  | 'office'
  | 'classrooms'
  | 'bathrooms-cafeteria'
  | 'technology'
  | 'services'
  | 'rules'
  | 'teachers'
  | 'calendar'
  | 'students'
  | 'review'
  | 'opening'
  | 'dashboard';

export type BuildingSize = 'small' | 'medium' | 'large' | 'mega';
export type Quality = 'basic' | 'standard' | 'premium';
export type Tier = 'basic' | 'medium' | 'high';
export type Difficulty = 'easy' | 'normal' | 'hard' | 'custom';
export type InternetType = 'none' | 'open' | 'password' | 'fiber';
export type Shift = 'morning' | 'afternoon' | 'night' | 'combined';
export type UniformPolicy = 'mandatory' | 'limited' | 'free';
export type CellphonePolicy = 'prohibited' | 'recess' | 'always' | 'confiscated';
export type HomeworkPolicy = 'allowed' | 'limited' | 'prohibited';
export type GradeSystem = 'digital' | 'paper' | 'mixed';
export type FoodPricing = 'free' | 'paid' | 'mixed';
export type EventImpact = 'positive' | 'neutral' | 'negative';

// === INTERFACES ===

export interface Classroom {
  id: string;
  floor: number;
  name: string;
  level: 'kinder' | 'primary' | 'secondary';
  capacity: number;
  students: number;
}

export interface Teacher {
  id: string;
  name: string;
  subject: string;
  specialty: string;
  experience: number;
  quality: number; // 1-10
  salary: number;
  personality: string;
  redFlags: string[];
  hired: boolean;
}

export interface Subject {
  id: string;
  name: string;
  emoji: string;
  mandatory: boolean;
}

export interface Student {
  id: string;
  name: string;
  age: number;
  level: 'kinder' | 'primary' | 'secondary';
  grade: string;
  personality: string;
  academicLevel: number; // 1-10
  attendance: number; // percentage
  satisfaction: number; // 0-100
}

export interface Holiday {
  name: string;
  date: string; // MM-DD
  type: 'national' | 'religious' | 'vacation';
}

export interface VacationPeriod {
  id?: string;
  name: string;
  startDate: string;
  endDate: string;
  mandatory: boolean;
}

export interface GameEvent {
  id: string;
  day: number;
  title: string;
  description: string;
  emoji: string;
  impact: EventImpact;
  options: EventOption[];
  resolved: boolean;
  chosenOption?: number;
}

export interface EventOption {
  text: string;
  reputationChange: number;
  moneyChange: number;
  satisfactionChange: number;
  consequence?: string;
}

export interface GameNotification {
  id: string;
  day: number;
  message: string;
  emoji: string;
  read: boolean;
}

export interface FinancialRecord {
  day: number;
  income: number;
  expense: number;
  balance: number;
}

export interface StaffMember {
  id: string;
  name: string;
  role: 'psychologist' | 'nurse' | 'security' | 'gardener' | 'janitor';
  salary: number;
  hired: boolean;
  morale: number; // 0-100
}

export interface AlumniRecord {
  id: string;
  name: string;
  graduationYear: number;
  career: string;
  prestige: number; // 1-5 stars
  donationAmount: number;
}

export interface ReviewItem {
  emoji: string;
  type: 'positive' | 'warning' | 'negative' | 'suggestion';
  text: string;
}

export interface BuildingConfig {
  size: BuildingSize;
  floors: number;
  maxClassrooms: number;
  cost: number;
}

// === NEW INTERFACES (Task 2-a) ===

export interface Achievement {
  id: string;
  name: string;
  emoji: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: number; // day
  condition: string; // description of condition
}

export interface Loan {
  id: string;
  amount: number;
  remaining: number;
  interestRate: number; // percentage
  weeklyPayment: number;
  weeksRemaining: number;
  takenAtDay: number;
}

export interface MarketingCampaign {
  id: string;
  type: 'flyers' | 'social_media' | 'open_house' | 'radio';
  emoji: string;
  name: string;
  cost: number;
  reputationBoost: number;
  enrollmentBoost: number;
  durationWeeks: number;
  startedAtWeek: number;
  active: boolean;
}

export interface Scholarship {
  id: string;
  studentName: string;
  studentId: string;
  discount: number; // percentage 0-100
  reason: string;
}

export interface MonthlyReport {
  month: number;
  year: number;
  income: number;
  expenses: number;
  newStudents: number;
  lostStudents: number;
  reputationChange: number;
  eventsResolved: number;
  highlights: string[];
}

export interface BuildingExpansion {
  id: string;
  type: 'classroom' | 'library' | 'cafeteria' | 'sports' | 'lab';
  name: string;
  cost: number;
  timeWeeks: number;
  startedAtWeek: number;
  completed: boolean;
}

// === NEW INTERFACES (Extended Systems) ===

// 1. Weather System
export interface WeatherState {
  current: 'sunny' | 'rainy' | 'stormy' | 'hot' | 'cloudy' | 'windy' | 'hurricane';
  temperature: number; // Celsius
  humidity: number; // 0-100
  forecast: WeatherForecast[]; // next 3 days
}

export interface WeatherForecast {
  day: number;
  weather: WeatherState['current'];
  temperature: number;
}

// 2. School Rivals
export interface SchoolRival {
  id: string;
  name: string;
  students: number;
  reputation: number;
  money: number;
  strengths: string[];
  weaknesses: string[];
  trend: 'rising' | 'stable' | 'declining';
}

// 3. Director Skills
export interface DirectorSkill {
  id: string;
  name: string;
  emoji: string;
  description: string;
  maxLevel: number;
  currentLevel: number;
  costPerLevel: number;
  effect: string; // what it boosts
}

export interface SkillEffect {
  reputationBonus: number;
  moneyBonus: number;
  satisfactionBonus: number;
  performanceBonus: number;
}

// 4. Student Personality System
export interface StudentPersonality {
  id: string;
  type: 'leader' | 'creative' | 'athletic' | 'academic' | 'rebel' | 'shy' | 'social' | 'disciplined';
  name: string;
  description: string;
  impact: string;
}

// 5. Transport System
export interface TransportRoute {
  id: string;
  zone: string;
  cost: number;
  capacity: number;
  studentsServed: number;
  active: boolean;
}

// 6. News/Newspaper
export interface NewsArticle {
  id: string;
  headline: string;
  content: string;
  category: 'sports' | 'academic' | 'social' | 'financial' | 'infrastructure' | 'crisis';
  emoji: string;
  week: number;
  impact: 'positive' | 'neutral' | 'negative';
}

// 7. Shop Items
export interface ShopItem {
  id: string;
  name: string;
  emoji: string;
  description: string;
  price: number;
  category: 'infrastructure' | 'academic' | 'recreational' | 'safety' | 'comfort';
  effect: {
    type: 'reputation' | 'satisfaction' | 'performance' | 'money' | 'enrollment';
    value: number;
    permanent: boolean;
  };
  purchased: boolean;
}

// 9. Difficulty/Challenge System
export interface ActiveChallenge {
  id: string;
  name: string;
  description: string;
  targetValue: number;
  currentValue: number;
  reward: { type: string; value: number };
  deadline: number; // week
  completed: boolean;
  failed: boolean;
}

// 10. Decision History
export interface DecisionRecord {
  week: number;
  eventTitle: string;
  chosenOption: string;
  outcome: string;
  reputationChange: number;
  moneyChange: number;
}

// === CONSTANTS ===

export const BUILDING_CONFIGS: Record<BuildingSize, BuildingConfig> = {
  small: { size: 'small', floors: 2, maxClassrooms: 10, cost: 50000 },
  medium: { size: 'medium', floors: 3, maxClassrooms: 20, cost: 120000 },
  large: { size: 'large', floors: 4, maxClassrooms: 40, cost: 250000 },
  mega: { size: 'mega', floors: 5, maxClassrooms: 60, cost: 500000 },
};

export const DIFFICULTY_CAPITAL: Record<Difficulty, number> = {
  easy: 500000,
  normal: 300000,
  hard: 150000,
  custom: 0,
};

export const SCREEN_ORDER: ScreenId[] = [
  'api-config',
  'profile',
  'building',
  'office',
  'classrooms',
  'bathrooms-cafeteria',
  'technology',
  'services',
  'rules',
  'teachers',
  'calendar',
  'students',
  'review',
  'opening',
];

export const SCREEN_TITLES: Record<ScreenId, { title: string; emoji: string }> = {
  'api-config': { title: 'Configuracion de API', emoji: '🔑' },
  'profile': { title: 'Creacion de Perfil', emoji: '🏫' },
  'building': { title: 'Construccion del Edificio', emoji: '🏗️' },
  'office': { title: 'La Direccion', emoji: '🎓' },
  'classrooms': { title: 'Equipamiento de Aulas', emoji: '📋' },
  'bathrooms-cafeteria': { title: 'Banos y Cafeteria', emoji: '🚽' },
  'technology': { title: 'Tecnologia e Infraestructura', emoji: '💻' },
  'services': { title: 'Servicios Adicionales', emoji: '📚' },
  'rules': { title: 'Reglas de la Escuela', emoji: '📜' },
  'teachers': { title: 'Contratacion de Profesores', emoji: '👨‍🏫' },
  'calendar': { title: 'Calendario y Vacaciones', emoji: '🗓️' },
  'students': { title: 'Inscripcion de Estudiantes', emoji: '👩‍🎓' },
  'review': { title: 'Criticas Pre-Apertura', emoji: '📊' },
  'opening': { title: 'Apertura de la Escuela', emoji: '🎉' },
  'dashboard': { title: 'Panel de Control', emoji: '📊' },
};

export const DEFAULT_SUBJECTS: Subject[] = [
  { id: 'math', name: 'Matematicas', emoji: '📐', mandatory: true },
  { id: 'spanish', name: 'Espanol', emoji: '📖', mandatory: true },
  { id: 'social', name: 'Ciencias Sociales', emoji: '🌍', mandatory: true },
  { id: 'science', name: 'Ciencias Naturales', emoji: '🔬', mandatory: true },
  { id: 'art', name: 'Arte', emoji: '🎨', mandatory: true },
  { id: 'pe', name: 'Educacion Fisica', emoji: '🏃', mandatory: true },
  { id: 'it', name: 'Informatica', emoji: '💻', mandatory: false },
  { id: 'music', name: 'Musica', emoji: '🎵', mandatory: false },
  { id: 'english', name: 'Ingles', emoji: '🌐', mandatory: true },
];

// === NEW CONSTANTS (Task 2-a) ===

export const ACHIEVEMENT_DEFS: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = [
  // Original 12
  { id: 'first_week', name: 'Primera Semana', emoji: '📅', description: 'Sobrevive la primera semana', condition: 'currentDay >= 7' },
  { id: 'first_month', name: 'Primer Mes', emoji: '🗓️', description: 'Sobrevive un mes completo', condition: 'currentDay >= 30' },
  { id: 'first_year', name: 'Primer Ano', emoji: '🏆', description: 'Sobrevive un ano completo', condition: 'currentDay >= 365' },
  { id: 'rep_80', name: 'Reputacion Estelar', emoji: '⭐', description: 'Alcanza reputacion 80+', condition: 'reputation >= 80' },
  { id: 'rep_100', name: 'Escuela Legendaria', emoji: '🌟', description: 'Alcanza reputacion 100', condition: 'reputation >= 100' },
  { id: 'students_50', name: 'Institucion Popular', emoji: '👥', description: 'Tiene 50+ estudiantes', condition: 'activeStudents >= 50' },
  { id: 'students_100', name: 'Gran Escuela', emoji: '🏫', description: 'Tiene 100+ estudiantes', condition: 'activeStudents >= 100' },
  { id: 'money_100k', name: 'Capital Solido', emoji: '💰', description: 'Alcanza $100,000 en el banco', condition: 'money >= 100000' },
  { id: 'money_500k', name: 'Magnate Escolar', emoji: '💎', description: 'Alcanza $500,000 en el banco', condition: 'money >= 500000' },
  { id: 'no_complaints_month', name: 'Mes Perfecto', emoji: '✨', description: 'Un mes sin eventos negativos', condition: 'special' },
  { id: 'hire_10_teachers', name: 'Equipo Grande', emoji: '👨‍🏫', description: 'Contrata 10 profesores', condition: 'activeTeachers >= 10' },
  { id: 'pay_loan', name: 'Buen Pagador', emoji: '🏦', description: 'Paga un prestamo completo', condition: 'special' },
  // New 18 achievements
  { id: 'profesional', name: 'Profesional', emoji: '🎓', description: 'Contrata 5 profesores', condition: 'activeTeachers >= 5' },
  { id: 'popular', name: 'Popular', emoji: '🎉', description: 'Alcanza 50 estudiantes', condition: 'activeStudents >= 50_popular' },
  { id: 'leyenda', name: 'Leyenda', emoji: '👑', description: 'Alcanza 500 estudiantes', condition: 'activeStudents >= 500' },
  { id: 'magnate', name: 'Magnate', emoji: '💵', description: 'Acumula $1M en ingresos totales', condition: 'totalIncomeEarned >= 1000000' },
  { id: 'filantropo', name: 'Filantropo', emoji: '🤲', description: 'Otorga 5 becas', condition: 'scholarships >= 5' },
  { id: 'constructor', name: 'Constructor', emoji: '🔨', description: 'Completa 3 expansiones', condition: 'expansionsCompleted >= 3' },
  { id: 'innovador', name: 'Innovador', emoji: '💡', description: 'Habilita lab de computacion + biblioteca', condition: 'computerLab + library' },
  { id: 'deportista', name: 'Deportista', emoji: '⚽', description: 'Habilita area deportiva + gana torneo', condition: 'sportsArea + tournament' },
  { id: 'artista', name: 'Artista', emoji: '🎭', description: 'Estudiantes ganan evento artistico', condition: 'artEvent' },
  { id: 'ingeniero', name: 'Ingeniero', emoji: '🔧', description: 'Sobrevive 3 desastres naturales', condition: 'disastersSurvived >= 3' },
  { id: 'financiero', name: 'Financiero', emoji: '📈', description: 'Toma y paga 3 prestamos', condition: 'loansRepaid >= 3' },
  { id: 'diplomático', name: 'Diplomatico', emoji: '🤝', description: 'Resuelve 20 eventos positivamente', condition: 'eventsResolved >= 20' },
  { id: 'investigador', name: 'Investigador', emoji: '🔍', description: 'Usa asesor IA 10 veces', condition: 'aiAdvisorUses >= 10' },
  { id: 'veloz', name: 'Veloz', emoji: '⚡', description: 'Completa el juego en menos de 30 min', condition: 'fastCompletion' },
  { id: 'perfecto', name: 'Perfecto', emoji: '💯', description: 'Alcanza reputacion 95+', condition: 'reputation >= 95' },
  { id: 'sobreviviente', name: 'Sobreviviente', emoji: '🛡️', description: 'Llega a semana 52 con menos de $10,000', condition: 'survivor' },
  { id: 'imperio', name: 'Imperio', emoji: '🏰', description: 'Alcanza 1000 estudiantes', condition: 'activeStudents >= 1000' },
];

export const LOAN_OPTIONS = [
  { amount: 10000, interestRate: 10, weeksToPay: 10 },
  { amount: 25000, interestRate: 12, weeksToPay: 15 },
  { amount: 50000, interestRate: 15, weeksToPay: 20 },
  { amount: 100000, interestRate: 18, weeksToPay: 30 },
];

export const MARKETING_OPTIONS = [
  { type: 'flyers' as const, emoji: '📄', name: 'Folletos', cost: 2000, reputationBoost: 2, enrollmentBoost: 2, durationWeeks: 2 },
  { type: 'social_media' as const, emoji: '📱', name: 'Redes Sociales', cost: 5000, reputationBoost: 4, enrollmentBoost: 3, durationWeeks: 3 },
  { type: 'open_house' as const, emoji: '🏠', name: 'Puertas Abiertas', cost: 8000, reputationBoost: 6, enrollmentBoost: 5, durationWeeks: 1 },
  { type: 'radio' as const, emoji: '📻', name: 'Radio Comercial', cost: 15000, reputationBoost: 8, enrollmentBoost: 8, durationWeeks: 4 },
];

export const EXPANSION_OPTIONS = [
  { type: 'classroom' as const, name: 'Nueva Aula', cost: 15000, timeWeeks: 2, capacity: 25 },
  { type: 'library' as const, name: 'Biblioteca', cost: 20000, timeWeeks: 3, capacity: 0 },
  { type: 'cafeteria' as const, name: 'Cafeteria', cost: 25000, timeWeeks: 4, capacity: 0 },
  { type: 'sports' as const, name: 'Area Deportiva', cost: 30000, timeWeeks: 3, capacity: 0 },
  { type: 'lab' as const, name: 'Lab. Computacion', cost: 35000, timeWeeks: 3, capacity: 0 },
];

// === PRE-POPULATED DIRECTOR SKILLS (8) ===

export const DEFAULT_DIRECTOR_SKILLS: DirectorSkill[] = [
  {
    id: 'negociador',
    name: 'Negociador',
    emoji: '🤝',
    description: 'Mejora los resultados de eventos (bono de reputacion)',
    maxLevel: 5,
    currentLevel: 0,
    costPerLevel: 5000,
    effect: 'reputationBonus',
  },
  {
    id: 'contador',
    name: 'Contador',
    emoji: '🧮',
    description: 'Reduce los gastos operativos',
    maxLevel: 5,
    currentLevel: 0,
    costPerLevel: 4000,
    effect: 'moneyBonus',
  },
  {
    id: 'arquitecto',
    name: 'Arquitecto',
    emoji: '🏗️',
    description: 'Expansiones mas baratas',
    maxLevel: 5,
    currentLevel: 0,
    costPerLevel: 6000,
    effect: 'expansionDiscount',
  },
  {
    id: 'lider',
    name: 'Lider',
    emoji: '👑',
    description: 'Mayor satisfaccion estudiantil',
    maxLevel: 5,
    currentLevel: 0,
    costPerLevel: 4500,
    effect: 'satisfactionBonus',
  },
  {
    id: 'cientifico',
    name: 'Cientifico',
    emoji: '🔬',
    description: 'Mejor rendimiento academico',
    maxLevel: 5,
    currentLevel: 0,
    costPerLevel: 5000,
    effect: 'performanceBonus',
  },
  {
    id: 'artista_skill',
    name: 'Artista',
    emoji: '🎨',
    description: 'Bonus en eventos culturales',
    maxLevel: 5,
    currentLevel: 0,
    costPerLevel: 3500,
    effect: 'culturalEventBonus',
  },
  {
    id: 'deportista_skill',
    name: 'Deportista',
    emoji: '⚽',
    description: 'Bonus en eventos deportivos',
    maxLevel: 5,
    currentLevel: 0,
    costPerLevel: 3500,
    effect: 'sportsEventBonus',
  },
  {
    id: 'emprendedor',
    name: 'Emprendedor',
    emoji: '💼',
    description: 'Mas ingresos por servicios',
    maxLevel: 5,
    currentLevel: 0,
    costPerLevel: 5500,
    effect: 'incomeBonus',
  },
];

// === PRE-POPULATED SHOP ITEMS (15) ===

export const DEFAULT_SHOP_ITEMS: ShopItem[] = [
  {
    id: 'pizarra_digital',
    name: 'Pizarra Digital',
    emoji: '📺',
    description: 'Mejora el rendimiento academico',
    price: 8000,
    category: 'academic',
    effect: { type: 'performance', value: 3, permanent: true },
    purchased: false,
  },
  {
    id: 'aire_acondicionado',
    name: 'Aire Acondicionado',
    emoji: '❄️',
    description: 'Mejora la satisfaccion',
    price: 12000,
    category: 'comfort',
    effect: { type: 'satisfaction', value: 5, permanent: true },
    purchased: false,
  },
  {
    id: 'sistema_riego',
    name: 'Sistema de Riego',
    emoji: '🌿',
    description: 'Reduce los costos de mantenimiento',
    price: 5000,
    category: 'infrastructure',
    effect: { type: 'money', value: -500, permanent: true },
    purchased: false,
  },
  {
    id: 'paneles_solares',
    name: 'Paneles Solares',
    emoji: '☀️',
    description: 'Reduce los gastos de electricidad',
    price: 25000,
    category: 'infrastructure',
    effect: { type: 'money', value: -1500, permanent: true },
    purchased: false,
  },
  {
    id: 'camaras_seguridad',
    name: 'Camaras de Seguridad',
    emoji: '📷',
    description: 'Reduce eventos negativos',
    price: 15000,
    category: 'safety',
    effect: { type: 'reputation', value: 3, permanent: true },
    purchased: false,
  },
  {
    id: 'lab_ciencias',
    name: 'Laboratorio de Ciencias',
    emoji: '🔬',
    description: 'Impulso academico',
    price: 20000,
    category: 'academic',
    effect: { type: 'performance', value: 5, permanent: true },
    purchased: false,
  },
  {
    id: 'sala_musica',
    name: 'Sala de Musica',
    emoji: '🎵',
    description: 'Satisfaccion + eventos culturales',
    price: 18000,
    category: 'recreational',
    effect: { type: 'satisfaction', value: 4, permanent: true },
    purchased: false,
  },
  {
    id: 'piscina',
    name: 'Piscina',
    emoji: '🏊',
    description: 'Gran impulso de satisfaccion',
    price: 45000,
    category: 'recreational',
    effect: { type: 'satisfaction', value: 10, permanent: true },
    purchased: false,
  },
  {
    id: 'auditorio',
    name: 'Auditorio',
    emoji: '🎭',
    description: 'Impulso de reputacion para eventos',
    price: 35000,
    category: 'infrastructure',
    effect: { type: 'reputation', value: 8, permanent: true },
    purchased: false,
  },
  {
    id: 'biblioteca_ampliada',
    name: 'Biblioteca Ampliada',
    emoji: '📚',
    description: 'Rendimiento academico y general',
    price: 15000,
    category: 'academic',
    effect: { type: 'performance', value: 4, permanent: true },
    purchased: false,
  },
  {
    id: 'cancha_techada',
    name: 'Cancha Techada',
    emoji: '⚽',
    description: 'Deportes en todo clima',
    price: 40000,
    category: 'recreational',
    effect: { type: 'satisfaction', value: 6, permanent: true },
    purchased: false,
  },
  {
    id: 'comedor_premium',
    name: 'Comedor Premium',
    emoji: '🍽️',
    description: 'Impulso de satisfaccion',
    price: 22000,
    category: 'comfort',
    effect: { type: 'satisfaction', value: 7, permanent: true },
    purchased: false,
  },
  {
    id: 'jardin_botanico',
    name: 'Jardin Botanico',
    emoji: '🌺',
    description: 'Reputacion + satisfaccion',
    price: 10000,
    category: 'infrastructure',
    effect: { type: 'reputation', value: 3, permanent: true },
    purchased: false,
  },
  {
    id: 'estacionamiento',
    name: 'Estacionamiento',
    emoji: '🅿️',
    description: 'Comodidad para los padres',
    price: 18000,
    category: 'infrastructure',
    effect: { type: 'reputation', value: 4, permanent: true },
    purchased: false,
  },
  {
    id: 'generador_electrico',
    name: 'Generador Electrico',
    emoji: '⚡',
    description: 'Previene cortes de energia',
    price: 8000,
    category: 'safety',
    effect: { type: 'reputation', value: 2, permanent: true },
    purchased: false,
  },
];

// === WEATHER TYPES ===

export type WeatherType = WeatherState['current'];

export const WEATHER_OPTIONS: WeatherType[] = [
  'sunny', 'rainy', 'stormy', 'hot', 'cloudy', 'windy', 'hurricane',
];

export const WEATHER_EMOJIS: Record<WeatherType, string> = {
  sunny: '☀️',
  rainy: '🌧️',
  stormy: '⛈️',
  hot: '🔥',
  cloudy: '☁️',
  windy: '💨',
  hurricane: '🌪️',
};

// === DEFAULT STUDENT PERSONALITIES ===

export const STUDENT_PERSONALITY_TYPES: StudentPersonality[] = [
  { id: 'leader', type: 'leader', name: 'Lider', description: 'Organiza grupos y toma iniciativa', impact: '+satisfaccion grupal' },
  { id: 'creative', type: 'creative', name: 'Creativo', description: 'Piensa fuera de la caja', impact: '+rendimiento en arte' },
  { id: 'athletic', type: 'athletic', name: 'Atletico', description: 'Destaca en actividades fisicas', impact: '+eventos deportivos' },
  { id: 'academic', type: 'academic', name: 'Academico', description: 'Busca la excelencia escolar', impact: '+rendimiento general' },
  { id: 'rebel', type: 'rebel', name: 'Rebelde', description: 'Desafia las reglas', impact: '-disciplina, +eventos' },
  { id: 'shy', type: 'shy', name: 'Timido', description: 'Prefiere trabajar solo', impact: '+concentracion, -social' },
  { id: 'social', type: 'social', name: 'Social', description: 'Hace amigos facilmente', impact: '+satisfaccion general' },
  { id: 'disciplined', type: 'disciplined', name: 'Disciplinado', description: 'Sigue reglas y horarios', impact: '+asistencia y rendimiento' },
];
