import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StateStorage } from 'zustand/middleware';

// Throttled localStorage storage — prevents jank from rapid writes during gameplay
// CRITICAL: flushes on beforeunload to prevent data loss on page refresh
function createThrottledStorage(delay: number): StateStorage & { flush: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let pendingName: string | null = null;
  let pendingState: string | null = null;

  const flush = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    if (pendingName && pendingState) {
      try {
        localStorage.setItem(pendingName, pendingState);
      } catch { /* quota exceeded — ignore */ }
      pendingName = null;
      pendingState = null;
    }
  };

  // Flush on page unload to prevent data loss
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', flush);
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flush();
    });
  }

  return {
    getItem: (name: string) => {
      try {
        return localStorage.getItem(name);
      } catch {
        return null;
      }
    },
    setItem: (name: string, value: string) => {
      pendingName = name;
      pendingState = value;
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        try {
          localStorage.setItem(pendingName!, pendingState!);
        } catch { /* quota exceeded — ignore */ }
        pendingName = null;
        pendingState = null;
        timeoutId = null;
      }, delay);
    },
    removeItem: (name: string) => {
      if (timeoutId) { clearTimeout(timeoutId); timeoutId = null; }
      pendingName = null;
      pendingState = null;
      try {
        localStorage.removeItem(name);
      } catch { /* ignore */ }
    },
    flush,
  };
}

const throttledStorage = createThrottledStorage(2000); // Write at most every 2s
import type {
  ScreenId,
  BuildingSize,
  Quality,
  Tier,
  Difficulty,
  InternetType,
  Shift,
  UniformPolicy,
  CellphonePolicy,
  HomeworkPolicy,
  GradeSystem,
  FoodPricing,
  Classroom,
  Teacher,
  Subject,
  Student,
  Holiday,
  VacationPeriod,
  GameEvent,
  GameNotification,
  FinancialRecord,
  StaffMember,
  ReviewItem,
  Achievement,
  Loan,
  MarketingCampaign,
  Scholarship,
  MonthlyReport,
  BuildingExpansion,
  WeatherState,
  WeatherForecast,
  WeatherType,
  SchoolRival,
  DirectorSkill,
  StudentPersonality,
  TransportRoute,
  NewsArticle,
  ShopItem,
  ActiveChallenge,
  DecisionRecord,
  AlumniRecord,
} from './game-types';
import {
  BUILDING_CONFIGS,
  DIFFICULTY_CAPITAL,
  ACHIEVEMENT_DEFS,
  EXPANSION_OPTIONS,
  DEFAULT_DIRECTOR_SKILLS,
  DEFAULT_SHOP_ITEMS,
  WEATHER_OPTIONS,
  STUDENT_PERSONALITY_TYPES,
} from './game-types';

// === INTERNAL INTERFACES ===

interface OfficeStaff {
  subdirectors: number;
  secretaries: number;
  receptionists: number;
  security: number;
}

interface CafeteriaStaff {
  cooks: number;
  cashiers: number;
  waiters: number;
}

// === MAIN GAME STATE INTERFACE ===

interface GameState {
  // Navigation
  currentScreen: ScreenId;
  setupComplete: boolean;
  gameStarted: boolean;
  gameOver: boolean;
  newGame: boolean;

  // Profile
  schoolName: string;
  directorName: string;
  currency: string;
  capital: number;
  difficulty: Difficulty;
  customCapital: number;

  // Building
  buildingSize: BuildingSize;
  classrooms: Classroom[];

  // Office
  officeSize: Quality;
  officeComputers: { count: number; tier: Tier };
  officePhone: 'none' | 'basic' | 'multi';
  officeStaff: OfficeStaff;
  officeFurniture: Quality;

  // Classroom config
  chairType: 'padded' | 'common';
  presentationSystem: 'whiteboard' | 'digital';
  digitalScreenSize: number;
  digitalScreenTier: Tier;
  recordingMethod: 'paper' | 'laptop' | 'tablet';

  // Bathrooms
  bathroomCount: number;
  bathroomQuality: Quality;
  bathroomCleaners: number;
  inclusiveBathroom: boolean;

  // Cafeteria
  cafeteriaBuilt: boolean;
  cafeteriaSize: Quality;
  cafeteriaFoodQuality: Quality;
  cafeteriaPricing: FoodPricing;
  cafeteriaMealPrice: number;
  cafeteriaStaff: CafeteriaStaff;

  // Technology
  internetType: InternetType;
  teacherLaptops: { enabled: boolean; tier: Tier };
  studentDevices: { enabled: boolean; type: 'laptop' | 'tablet'; tier: Tier };
  cameraCount: number;
  cameraType: 'basic' | '360';
  cameraLocations: string[];
  computerLabEnabled: boolean;
  computerLabCount: number;
  computerLabTier: Tier;
  computerLabSoftware: 'basic' | 'educational' | 'programming';

  // Services
  libraryEnabled: boolean;
  librarySize: Quality;
  libraryBookCount: number;
  libraryHasLibrarian: boolean;
  meetingRoomEnabled: boolean;
  meetingRoomSize: Quality;
  sportsAreaEnabled: boolean;
  sportsAreaType: 'soccer' | 'basketball' | 'recreational';

  // Rules
  uniformPolicy: UniformPolicy;
  uniformDescription: string;
  cellphonePolicy: CellphonePolicy;
  disciplineRules: string;
  sanctionSystem: 'warning' | 'suspension' | 'expulsion';
  maxAbsences: number;
  homeworkPolicy: HomeworkPolicy;
  noHomeworkVacations: boolean;
  gradeSystem: GradeSystem;
  customRules: string[];

  // Teachers
  subjects: Subject[];
  teachers: Teacher[];
  staffMembers: StaffMember[];

  // Calendar
  country: string;
  religion: 'catholic' | 'other' | 'none';
  holidays: Holiday[];
  shift: Shift;
  classDuration: 45 | 60;
  breakTimeMinutes: number;
  vacationPeriods: VacationPeriod[];

  // Students
  students: Student[];
  tuition: number;
  monthlyFee: number;

  // Reviews
  reviewItems: ReviewItem[];

  // Gameplay - Time
  currentDay: number;
  currentWeek: number;
  currentMonth: number;
  currentYear: number;
  timeSpeed: 1 | 2 | 5 | 10 | 50;
  paused: boolean;
  schoolOpenedDay: number;

  // Gameplay - Stats
  reputation: number;
  studentSatisfaction: number;
  academicPerformance: number;
  parentSatisfaction: number;
  money: number;
  totalIncome: number;
  totalExpenses: number;
  activeStudents: number;
  activeTeachers: number;

  // Events
  events: GameEvent[];
  pendingEvents: GameEvent[];
  notifications: GameNotification[];

  // Financial history
  financialHistory: FinancialRecord[];

  // Volume
  soundVolume: number; // 0-1

  // Achievements
  achievements: Achievement[];

  // Loans
  loans: Loan[];

  // Marketing
  activeCampaigns: MarketingCampaign[];

  // Scholarships
  scholarships: Scholarship[];

  // Monthly reports
  monthlyReports: MonthlyReport[];

  // Building expansions
  expansions: BuildingExpansion[];

  // Victory
  victoryAchieved: boolean;
  victoryType: string;

  // Tracking
  lastEnrollmentWeek: number;
  lastStaffEventWeek: number;
  lastInspectionWeek: number;

  // Holiday system
  isHoliday: boolean;
  isVacation: boolean;

  // === NEW SYSTEMS STATE ===

  // Weather
  weather: WeatherState;

  // School Rivals
  rivals: SchoolRival[];

  // Director Skills
  directorSkills: DirectorSkill[];

  // Student Personalities
  studentPersonalities: StudentPersonality[];

  // Transport Routes
  transportRoutes: TransportRoute[];

  // News History
  newsHistory: NewsArticle[];

  // Shop Items
  shopItems: ShopItem[];

  // Active Challenges
  activeChallenges: ActiveChallenge[];

  // Decision History
  decisionHistory: DecisionRecord[];

  // Extended Stats Counters
  eventsResolved: number;
  aiAdvisorUses: number;
  totalIncomeEarned: number;
  loansRepaid: number;
  disastersSurvived: number;

  // Tracking Weeks
  lastNewsWeek: number;
  lastWeatherWeek: number;
  lastChallengeWeek: number;

  // Music
  musicVolume: number;
  musicMuted: boolean;
  currentMusicTrack: string | null;

  // === PERSONAL ADICIONAL SYSTEM ===
  staff: StaffMember[];
  morale: number; // Overall staff morale 0-100
  alumni: AlumniRecord[];
  uniformColors: { primary: string; secondary: string };
  schoolMotto: string;
  schoolMascot: string;
  decorations: Array<{ id: string; name: string; emoji: string; cost: number; reputation: number; purchased: boolean }>;
  saveSlots: Array<{ id: string; name: string; week: number; timestamp: number }>;
  activeSaveSlot: string | null;
  campaignChapter: number; // 0 = free play, 1+ = campaign chapters
  tutorialStep: number; // 0 = no tutorial, 1+ = active tutorial step
  totalPlayTime: number; // seconds
  bestSchoolStats: { maxStudents: number; maxReputation: number; maxMoney: number; totalEventsResolved: number; totalPlayTime: number };
  parentEvents: number; // Counter for parent meetings/PTA

  // === ACTIONS ===

  // Actions - Navigation
  setScreen: (screen: ScreenId) => void;
  nextScreen: () => void;
  prevScreen: () => void;
  setSetupComplete: (complete: boolean) => void;
  setGameStarted: (started: boolean) => void;
  setGameOver: (over: boolean) => void;
  startNewGame: () => void;

  // Actions - Profile
  setSchoolName: (name: string) => void;
  setDirectorName: (name: string) => void;
  setCurrency: (currency: string) => void;
  setCapital: (capital: number) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  setCustomCapital: (capital: number) => void;

  // Actions - Building
  setBuildingSize: (size: BuildingSize) => void;
  setClassrooms: (classrooms: Classroom[]) => void;
  addClassroom: (classroom: Classroom) => void;
  removeClassroom: (id: string) => void;

  // Actions - Office
  setOfficeSize: (size: Quality) => void;
  setOfficeComputers: (computers: { count: number; tier: Tier }) => void;
  setOfficePhone: (phone: 'none' | 'basic' | 'multi') => void;
  setOfficeStaff: (staff: OfficeStaff) => void;
  setOfficeFurniture: (furniture: Quality) => void;

  // Actions - Classroom config
  setChairType: (type: 'padded' | 'common') => void;
  setPresentationSystem: (system: 'whiteboard' | 'digital') => void;
  setDigitalScreenSize: (size: number) => void;
  setDigitalScreenTier: (tier: Tier) => void;
  setRecordingMethod: (method: 'paper' | 'laptop' | 'tablet') => void;

  // Actions - Bathrooms
  setBathroomCount: (count: number) => void;
  setBathroomQuality: (quality: Quality) => void;
  setBathroomCleaners: (count: number) => void;
  setInclusiveBathroom: (enabled: boolean) => void;

  // Actions - Cafeteria
  setCafeteriaBuilt: (built: boolean) => void;
  setCafeteriaSize: (size: Quality) => void;
  setCafeteriaFoodQuality: (quality: Quality) => void;
  setCafeteriaPricing: (pricing: FoodPricing) => void;
  setCafeteriaMealPrice: (price: number) => void;
  setCafeteriaStaff: (staff: CafeteriaStaff) => void;

  // Actions - Technology
  setInternetType: (type: InternetType) => void;
  setTeacherLaptops: (laptops: { enabled: boolean; tier: Tier }) => void;
  setStudentDevices: (devices: { enabled: boolean; type: 'laptop' | 'tablet'; tier: Tier }) => void;
  setCameraCount: (count: number) => void;
  setCameraType: (type: 'basic' | '360') => void;
  setCameraLocations: (locations: string[]) => void;
  setComputerLabEnabled: (enabled: boolean) => void;
  setComputerLabCount: (count: number) => void;
  setComputerLabTier: (tier: Tier) => void;
  setComputerLabSoftware: (software: 'basic' | 'educational' | 'programming') => void;

  // Actions - Services
  setLibraryEnabled: (enabled: boolean) => void;
  setLibrarySize: (size: Quality) => void;
  setLibraryBookCount: (count: number) => void;
  setLibraryHasLibrarian: (has: boolean) => void;
  setMeetingRoomEnabled: (enabled: boolean) => void;
  setMeetingRoomSize: (size: Quality) => void;
  setSportsAreaEnabled: (enabled: boolean) => void;
  setSportsAreaType: (type: 'soccer' | 'basketball' | 'recreational') => void;

  // Actions - Rules
  setUniformPolicy: (policy: UniformPolicy) => void;
  setUniformDescription: (desc: string) => void;
  setCellphonePolicy: (policy: CellphonePolicy) => void;
  setDisciplineRules: (rules: string) => void;
  setSanctionSystem: (system: 'warning' | 'suspension' | 'expulsion') => void;
  setMaxAbsences: (max: number) => void;
  setHomeworkPolicy: (policy: HomeworkPolicy) => void;
  setNoHomeworkVacations: (enabled: boolean) => void;
  setGradeSystem: (system: GradeSystem) => void;
  setCustomRules: (rules: string[]) => void;
  addCustomRule: (rule: string) => void;
  removeCustomRule: (index: number) => void;

  // Actions - Teachers
  setSubjects: (subjects: Subject[]) => void;
  setTeachers: (teachers: Teacher[]) => void;
  addTeacher: (teacher: Teacher) => void;
  removeTeacher: (id: string) => void;

  // Actions - Staff
  setStaffMembers: (staff: StaffMember[]) => void;
  addStaffMember: (staff: StaffMember) => void;
  removeStaffMember: (id: string) => void;

  // Actions - Calendar
  setCountry: (country: string) => void;
  setReligion: (religion: 'catholic' | 'other' | 'none') => void;
  setHolidays: (holidays: Holiday[]) => void;
  setShift: (shift: Shift) => void;
  setClassDuration: (duration: 45 | 60) => void;
  setBreakTimeMinutes: (minutes: number) => void;
  setVacationPeriods: (periods: VacationPeriod[]) => void;

  // Actions - Students
  setStudents: (students: Student[]) => void;
  addStudent: (student: Student) => void;
  removeStudent: (id: string) => void;
  setTuition: (amount: number) => void;
  setMonthlyFee: (amount: number) => void;

  // Actions - Reviews
  setReviewItems: (items: ReviewItem[]) => void;

  // Actions - Time
  advanceDay: () => void; // backwards compat wrapper
  advanceWeek: () => void;
  setTimeSpeed: (speed: 1 | 2 | 5 | 10 | 50) => void;
  togglePause: () => void;

  // Actions - Stats
  adjustReputation: (amount: number) => void;
  adjustSatisfaction: (amount: number) => void;
  adjustAcademicPerformance: (amount: number) => void;
  adjustMoney: (amount: number) => void;

  // Actions - Events
  addEvent: (event: GameEvent) => void;
  resolveEvent: (eventId: string, optionIndex: number) => void;
  addNotification: (notification: GameNotification) => void;
  markNotificationRead: (id: string) => void;
  addPendingEvent: (event: GameEvent) => void;
  clearExtraPendingEvents: () => void;

  // Actions - Financial
  addFinancialRecord: (record: FinancialRecord) => void;

  // Actions - Sound
  setSoundVolume: (v: number) => void;

  // Actions - Loans
  addLoan: (loan: Loan) => void;
  makeLoanPayment: (loanId: string) => void;

  // Actions - Marketing
  startCampaign: (campaign: MarketingCampaign) => void;

  // Actions - Scholarships
  addScholarship: (scholarship: Scholarship) => void;
  removeScholarship: (id: string) => void;

  // Actions - Expansions
  addExpansion: (expansion: BuildingExpansion) => void;
  completeExpansions: () => void;

  // Actions - Achievements
  unlockAchievement: (id: string) => void;

  // Actions - Reports
  addMonthlyReport: (report: MonthlyReport) => void;

  // Actions - Auto Enrollment
  enrollAutoStudents: () => void;

  // Actions - Reset
  resetGame: () => void;

  // === NEW SYSTEM ACTIONS ===

  // Actions - Weather
  setWeather: (weather: WeatherState) => void;

  // Actions - Rivals
  addRival: (rival: SchoolRival) => void;
  updateRival: (id: string, updates: Partial<SchoolRival>) => void;

  // Actions - Director Skills
  upgradeSkill: (skillId: string) => void;

  // Actions - News
  addNewsArticle: (article: NewsArticle) => void;

  // Actions - Shop
  purchaseShopItem: (itemId: string) => void;

  // Actions - Transport
  addTransportRoute: (route: TransportRoute) => void;
  toggleTransportRoute: (routeId: string) => void;

  // Actions - Challenges
  addChallenge: (challenge: ActiveChallenge) => void;
  updateChallenge: (challengeId: string, value: number) => void;

  // Actions - Decision History
  addDecisionRecord: (record: DecisionRecord) => void;

  // Actions - Music
  setMusicVolume: (vol: number) => void;
  setMusicMuted: (muted: boolean) => void;
  setCurrentMusicTrack: (track: string | null) => void;

  // Actions - Extended Stats
  incrementStats: (stats: {
    eventsResolved?: number;
    aiAdvisorUses?: number;
    totalIncomeEarned?: number;
    loansRepaid?: number;
    disastersSurvived?: number;
  }) => void;

  // === PERSONAL ADICIONAL ACTIONS ===
  hireStaff: (staffId: string) => void;
  fireStaffMember: (staffId: string) => void;
  adjustMorale: (amount: number) => void;
  addAlumni: (alumni: AlumniRecord) => void;
  processAlumniDonation: () => void;
  setUniformColors: (primary: string, secondary: string) => void;
  setSchoolMotto: (motto: string) => void;
  setSchoolMascot: (mascot: string) => void;
  purchaseDecoration: (decoId: string) => void;
  createSaveSlot: (name: string) => void;
  deleteSaveSlot: (slotId: string) => void;
  setCampaignChapter: (chapter: number) => void;
  setTutorialStep: (step: number) => void;
  incrementPlayTime: (seconds: number) => void;
  incrementParentEvents: () => void;
  generateStaffCandidates: () => StaffMember[];

  // Computed
  getMaxStudents: () => number;
  getMinBathrooms: () => number;
  getTotalMonthlyExpenses: () => number;
  getTotalWeeklyExpenses: () => number;
  getWeeklyIncome: () => number;
}

// === DEFAULT VALUES ===

const DEFAULT_SUBJECTS_LIST: Subject[] = [
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

const DEFAULT_VACATIONS: VacationPeriod[] = [
  {
    name: 'Navidad y Reyes',
    startDate: '12-20',
    endDate: '01-07',
    mandatory: true,
  },
  {
    name: 'Semana Santa',
    startDate: '03-24',
    endDate: '03-31',
    mandatory: true,
  },
  {
    name: 'Verano',
    startDate: '06-15',
    endDate: '08-15',
    mandatory: true,
  },
];

const DEFAULT_HOLIDAYS: Holiday[] = [
  { name: 'Ano Nuevo', date: '01-01', type: 'national' },
  { name: 'Dia de los Reyes Magos', date: '01-06', type: 'religious' },
  { name: 'Dia del Trabajador', date: '05-01', type: 'national' },
  { name: 'Navidad', date: '12-25', type: 'religious' },
];

// === HELPER: Generate initial weather ===
function generateInitialWeather(): WeatherState {
  const forecast: WeatherForecast[] = Array.from({ length: 3 }, (_, i) => ({
    day: i + 1,
    weather: 'sunny' as WeatherType,
    temperature: 28 + Math.floor(Math.random() * 4),
  }));
  return {
    current: 'sunny',
    temperature: 28,
    humidity: 60,
    forecast,
  };
}

// === HELPER: Generate weather based on season/month ===
function generateWeatherForMonth(month: number): WeatherState {
  // Seasonal temperature baselines (tropical Dominican Republic style)
  const seasonalTemp: Record<number, { min: number; max: number }> = {
    1: { min: 22, max: 28 },   // January - cool
    2: { min: 22, max: 29 },   // February
    3: { min: 23, max: 30 },   // March
    4: { min: 24, max: 31 },   // April
    5: { min: 25, max: 33 },   // May - getting hot
    6: { min: 26, max: 34 },   // June - hot
    7: { min: 26, max: 35 },   // July - hot/rainy
    8: { min: 26, max: 34 },   // August - hurricane season
    9: { min: 25, max: 33 },   // September - hurricane season
    10: { min: 24, max: 32 },  // October
    11: { min: 23, max: 30 },  // November
    12: { min: 22, max: 29 },  // December
  };

  const season = seasonalTemp[month] || { min: 24, max: 30 };
  const rand = Math.random();

  let current: WeatherType;
  let temperature: number;

  // Weighted weather probabilities by season
  if (month >= 6 && month <= 9) {
    // Rainy/hurricane season
    if (rand < 0.3) current = 'rainy';
    else if (rand < 0.45) current = 'stormy';
    else if (rand < 0.55) current = 'hot';
    else if (rand < 0.65) current = 'cloudy';
    else if (rand < 0.75) current = 'windy';
    else if (rand < 0.82) current = 'hurricane';
    else current = 'sunny';
  } else if (month >= 3 && month <= 5) {
    // Hot season
    if (rand < 0.4) current = 'sunny';
    else if (rand < 0.55) current = 'hot';
    else if (rand < 0.7) current = 'cloudy';
    else if (rand < 0.8) current = 'windy';
    else if (rand < 0.9) current = 'rainy';
    else current = 'stormy';
  } else {
    // Cooler months
    if (rand < 0.45) current = 'sunny';
    else if (rand < 0.6) current = 'cloudy';
    else if (rand < 0.72) current = 'windy';
    else if (rand < 0.84) current = 'rainy';
    else if (rand < 0.92) current = 'hot';
    else current = 'stormy';
  }

  // Temperature based on weather and season
  const baseTemp = Math.floor(Math.random() * (season.max - season.min + 1)) + season.min;
  switch (current) {
    case 'sunny': temperature = baseTemp + 1; break;
    case 'hot': temperature = season.max + 2; break;
    case 'rainy': temperature = baseTemp - 2; break;
    case 'stormy': temperature = baseTemp - 4; break;
    case 'cloudy': temperature = baseTemp - 1; break;
    case 'windy': temperature = baseTemp - 1; break;
    case 'hurricane': temperature = baseTemp - 5; break;
    default: temperature = baseTemp;
  }

  const humidity = current === 'rainy' || current === 'stormy'
    ? 75 + Math.floor(Math.random() * 20)
    : current === 'hot'
    ? 40 + Math.floor(Math.random() * 25)
    : 50 + Math.floor(Math.random() * 20);

  const forecast: WeatherForecast[] = Array.from({ length: 3 }, (_, i) => {
    const fRand = Math.random();
    let fWeather: WeatherType;
    if (fRand < 0.35) fWeather = 'sunny';
    else if (fRand < 0.55) fWeather = 'cloudy';
    else if (fRand < 0.7) fWeather = 'rainy';
    else if (fRand < 0.82) fWeather = 'hot';
    else if (fRand < 0.9) fWeather = 'windy';
    else fWeather = 'stormy';
    return {
      day: i + 1,
      weather: fWeather,
      temperature: Math.floor(Math.random() * (season.max - season.min + 1)) + season.min,
    };
  });

  return { current, temperature, humidity, forecast };
}

// === HELPER: Generate random rivals ===
function generateInitialRivals(): SchoolRival[] {
  const rivalNames = [
    { name: 'Colegio San Jose', strengths: ['Academico', 'Disciplina'], weaknesses: ['Deportes', 'Tecnologia'] },
    { name: 'Academia La Esperanza', strengths: ['Deportes', 'Comunidad'], weaknesses: ['Infraestructura', 'Finanzas'] },
    { name: 'Instituto Renacimiento', strengths: ['Tecnologia', 'Arte'], weaknesses: ['Tamanho', 'Reputacion'] },
  ];

  return rivalNames.map((r, i) => ({
    id: `rival_${i + 1}`,
    name: r.name,
    students: 30 + Math.floor(Math.random() * 120),
    reputation: 30 + Math.floor(Math.random() * 40),
    money: 100000 + Math.floor(Math.random() * 200000),
    strengths: r.strengths,
    weaknesses: r.weaknesses,
    trend: (['rising', 'stable', 'declining'] as const)[Math.floor(Math.random() * 3)],
  }));
}

// === HELPER: Check if a date is during holiday or vacation ===
function checkIfHolidayOrVacation(
  month: number,
  day: number,
  holidays: Holiday[],
  vacations: VacationPeriod[]
): boolean {
  // Check holidays (exact date match)
  const monthStr = String(month).padStart(2, '0');
  const dayStr = String(day).padStart(2, '0');
  const dateStr = `${monthStr}-${dayStr}`;

  for (const h of holidays) {
    if (h.date === dateStr) return true;
  }

  // Check vacation periods (range check)
  for (const v of vacations) {
    const startParts = v.startDate.split('-').map(Number);
    const endParts = v.endDate.split('-').map(Number);
    const startMonth = startParts[0], startDay = startParts[1];
    const endMonth = endParts[0], endDay = endParts[1];

    if (startMonth === endMonth) {
      // Same month vacation
      if (month === startMonth && day >= startDay && day <= endDay) return true;
    } else {
      // Cross-month vacation (e.g., Dec 20 to Jan 5)
      if (month === startMonth && day >= startDay) return true;
      if (month === endMonth && day <= endDay) return true;
    }
  }

  return false;
}

// === ZUSTAND STORE ===

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // ============================
      // INITIAL STATE
      // ============================

      // Navigation
      currentScreen: 'api-config',
      setupComplete: false,
      gameStarted: false,
      gameOver: false,
      newGame: false,

      // Profile
      schoolName: '',
      directorName: '',
      currency: '$',
      capital: 300000,
      difficulty: 'normal',
      customCapital: 300000,

      // Building
      buildingSize: 'small',
      classrooms: [],

      // Office
      officeSize: 'standard',
      officeComputers: { count: 2, tier: 'basic' },
      officePhone: 'basic',
      officeStaff: {
        subdirectors: 0,
        secretaries: 1,
        receptionists: 1,
        security: 1,
      },
      officeFurniture: 'standard',

      // Classroom config
      chairType: 'common',
      presentationSystem: 'whiteboard',
      digitalScreenSize: 55,
      digitalScreenTier: 'basic',
      recordingMethod: 'paper',

      // Bathrooms
      bathroomCount: 2,
      bathroomQuality: 'standard',
      bathroomCleaners: 1,
      inclusiveBathroom: false,

      // Cafeteria
      cafeteriaBuilt: true,
      cafeteriaSize: 'standard',
      cafeteriaFoodQuality: 'standard',
      cafeteriaPricing: 'paid',
      cafeteriaMealPrice: 5,
      cafeteriaStaff: { cooks: 2, cashiers: 1, waiters: 1 },

      // Technology
      internetType: 'password',
      teacherLaptops: { enabled: true, tier: 'medium' },
      studentDevices: { enabled: false, type: 'tablet', tier: 'basic' },
      cameraCount: 4,
      cameraType: 'basic',
      cameraLocations: ['entradas', 'pasillos'],
      computerLabEnabled: false,
      computerLabCount: 10,
      computerLabTier: 'basic',
      computerLabSoftware: 'basic',

      // Services
      libraryEnabled: true,
      librarySize: 'standard',
      libraryBookCount: 500,
      libraryHasLibrarian: true,
      meetingRoomEnabled: true,
      meetingRoomSize: 'standard',
      sportsAreaEnabled: false,
      sportsAreaType: 'soccer',

      // Rules
      uniformPolicy: 'mandatory',
      uniformDescription: 'Camisa blanca, pantalon azul oscuro',
      cellphonePolicy: 'recess',
      disciplineRules: 'Respeto entre todos los miembros de la comunidad educativa',
      sanctionSystem: 'warning',
      maxAbsences: 5,
      homeworkPolicy: 'allowed',
      noHomeworkVacations: false,
      gradeSystem: 'digital',
      customRules: [],

      // Teachers
      subjects: DEFAULT_SUBJECTS_LIST,
      teachers: [],
      staffMembers: [],

      // Calendar
      country: 'Republica Dominicana',
      religion: 'catholic',
      holidays: DEFAULT_HOLIDAYS,
      shift: 'morning',
      classDuration: 45,
      breakTimeMinutes: 15,
      vacationPeriods: DEFAULT_VACATIONS,

      // Students
      students: [],
      tuition: 500,
      monthlyFee: 150,

      // Reviews
      reviewItems: [],

      // Gameplay - Time
      currentDay: 1,
      currentWeek: 1,
      currentMonth: 9,
      currentYear: 2025,
      timeSpeed: 1,
      paused: false,
      schoolOpenedDay: 1,

      // Gameplay - Stats
      reputation: 50,
      studentSatisfaction: 60,
      academicPerformance: 65,
      parentSatisfaction: 55,
      money: 300000,
      totalIncome: 0,
      totalExpenses: 0,
      activeStudents: 0,
      activeTeachers: 0,

      // Events
      events: [],
      pendingEvents: [],
      notifications: [],

      // Financial history
      financialHistory: [],

      // Volume
      soundVolume: 0.5,

      // Achievements
      achievements: ACHIEVEMENT_DEFS.map(a => ({ ...a, unlocked: false })),

      // Loans
      loans: [],

      // Marketing
      activeCampaigns: [],

      // Scholarships
      scholarships: [],

      // Monthly reports
      monthlyReports: [],

      // Building expansions
      expansions: [],

      // Victory
      victoryAchieved: false,
      victoryType: '',

      // Tracking
      lastEnrollmentWeek: 0,
      lastStaffEventWeek: 0,
      lastInspectionWeek: 0,

      // Holiday system
      isHoliday: false,
      isVacation: false,

      // === NEW SYSTEMS STATE ===

      // Weather
      weather: generateInitialWeather(),

      // School Rivals
      rivals: [],

      // Director Skills
      directorSkills: DEFAULT_DIRECTOR_SKILLS.map(s => ({ ...s })),

      // Student Personalities
      studentPersonalities: STUDENT_PERSONALITY_TYPES.map(p => ({ ...p })),

      // Transport Routes
      transportRoutes: [],

      // News History
      newsHistory: [],

      // Shop Items
      shopItems: DEFAULT_SHOP_ITEMS.map(i => ({ ...i })),

      // Active Challenges
      activeChallenges: [],

      // Decision History
      decisionHistory: [],

      // Extended Stats Counters
      eventsResolved: 0,
      aiAdvisorUses: 0,
      totalIncomeEarned: 0,
      loansRepaid: 0,
      disastersSurvived: 0,

      // Tracking Weeks
      lastNewsWeek: 0,
      lastWeatherWeek: 0,
      lastChallengeWeek: 0,

      // Music
      musicVolume: 0.3,
      musicMuted: false,
      currentMusicTrack: null,

      // === PERSONAL ADICIONAL SYSTEM ===
      staff: [] as StaffMember[],
      morale: 75 as number,
      alumni: [] as AlumniRecord[],
      uniformColors: { primary: '#00ff88', secondary: '#000000' } as { primary: string; secondary: string },
      schoolMotto: '' as string,
      schoolMascot: '' as string,
      decorations: [
        { id: 'deco-garden', name: 'Jardin Botanico', emoji: '🌺', cost: 8000, reputation: 3, purchased: false },
        { id: 'deco-fountain', name: 'Fuente Central', emoji: '⛲', cost: 15000, reputation: 5, purchased: false },
        { id: 'deco-statue', name: 'Estatua Fundador', emoji: '🗿', cost: 20000, reputation: 4, purchased: false },
        { id: 'deco-mural', name: 'Mural Artistico', emoji: '🎨', cost: 5000, reputation: 3, purchased: false },
        { id: 'deco-library-ext', name: 'Biblioteca Exterior', emoji: '📚', cost: 12000, reputation: 4, purchased: false },
        { id: 'deco-playground', name: 'Parque de Juegos', emoji: '🎠', cost: 18000, reputation: 5, purchased: false },
        { id: 'deco-sports-field', name: 'Cancha Deportiva', emoji: '⚽', cost: 25000, reputation: 6, purchased: false },
        { id: 'deco-science-lab', name: 'Lab de Ciencias', emoji: '🔬', cost: 30000, reputation: 7, purchased: false },
      ] as Array<{ id: string; name: string; emoji: string; cost: number; reputation: number; purchased: boolean }>,
      saveSlots: [] as Array<{ id: string; name: string; week: number; timestamp: number }>,
      activeSaveSlot: null as string | null,
      campaignChapter: 0 as number,
      tutorialStep: 0 as number,
      totalPlayTime: 0 as number,
      bestSchoolStats: { maxStudents: 0, maxReputation: 0, maxMoney: 0, totalEventsResolved: 0, totalPlayTime: 0 } as { maxStudents: number; maxReputation: number; maxMoney: number; totalEventsResolved: number; totalPlayTime: number },
      parentEvents: 0 as number,

      // ============================
      // ACTIONS
      // ============================

      // --- Navigation ---
      setScreen: (screen) => set({ currentScreen: screen }),
      nextScreen: () => {
        const { currentScreen, setupComplete } = get();
        if (setupComplete) {
          set({ currentScreen: 'dashboard' });
          return;
        }
        const order: ScreenId[] = [
          'api-config', 'profile', 'building', 'office', 'classrooms',
          'bathrooms-cafeteria', 'technology', 'services', 'rules',
          'teachers', 'calendar', 'students', 'review', 'opening', 'dashboard',
        ];
        const idx = order.indexOf(currentScreen);
        if (idx >= 0 && idx < order.length - 1) {
          set({ currentScreen: order[idx + 1] });
        }
      },
      prevScreen: () => {
        const { currentScreen } = get();
        const order: ScreenId[] = [
          'api-config', 'profile', 'building', 'office', 'classrooms',
          'bathrooms-cafeteria', 'technology', 'services', 'rules',
          'teachers', 'calendar', 'students', 'review', 'opening',
        ];
        const idx = order.indexOf(currentScreen);
        if (idx > 0) {
          set({ currentScreen: order[idx - 1] });
        }
      },
      setSetupComplete: (complete) => set({ setupComplete: complete }),
      setGameStarted: (started) => {
        if (started) {
          const state = get();
          set({
            gameStarted: true,
            currentWeek: 1,
            money: state.capital,
            activeStudents: state.students.length,
            activeTeachers: state.teachers.filter(t => t.hired).length,
            schoolOpenedDay: state.currentDay,
            rivals: generateInitialRivals(),
          });
        }
        set({ gameStarted: started });
      },
      setGameOver: (over) => set({ gameOver: over }),
      startNewGame: () => {
        // Reset to initial state first
        set({
          currentScreen: 'profile',
          setupComplete: false,
          gameStarted: false,
          gameOver: false,
          newGame: true,
          money: get().customCapital || 300000,
          reputation: 50,
          studentSatisfaction: 60,
          academicPerformance: 65,
          parentSatisfaction: 55,
          totalIncome: 0,
          totalExpenses: 0,
          currentDay: 1,
          currentWeek: 1,
          currentMonth: 9,
          currentYear: 2025,
          paused: false,
          timeSpeed: 1,
          soundVolume: 0.5,
          achievements: ACHIEVEMENT_DEFS.map(a => ({ ...a, unlocked: false })),
          loans: [],
          activeCampaigns: [],
          scholarships: [],
          monthlyReports: [],
          expansions: [],
          victoryAchieved: false,
          victoryType: '',
          lastEnrollmentWeek: 0,
          lastStaffEventWeek: 0,
          lastInspectionWeek: 0,
          isHoliday: false,
          isVacation: false,
          // New systems reset
          weather: generateInitialWeather(),
          rivals: [],
          directorSkills: DEFAULT_DIRECTOR_SKILLS.map(s => ({ ...s })),
          studentPersonalities: STUDENT_PERSONALITY_TYPES.map(p => ({ ...p })),
          transportRoutes: [],
          newsHistory: [],
          shopItems: DEFAULT_SHOP_ITEMS.map(i => ({ ...i })),
          activeChallenges: [],
          decisionHistory: [],
          eventsResolved: 0,
          aiAdvisorUses: 0,
          totalIncomeEarned: 0,
          loansRepaid: 0,
          disastersSurvived: 0,
          lastNewsWeek: 0,
          lastWeatherWeek: 0,
          lastChallengeWeek: 0,
          musicVolume: 0.3,
          musicMuted: false,
          currentMusicTrack: null,
          // Personal adicional reset
          staff: [] as StaffMember[],
          morale: 75 as number,
          alumni: [] as AlumniRecord[],
          uniformColors: { primary: '#00ff88', secondary: '#000000' } as { primary: string; secondary: string },
          schoolMotto: '' as string,
          schoolMascot: '' as string,
          decorations: [
            { id: 'deco-garden', name: 'Jardin Botanico', emoji: '🌺', cost: 8000, reputation: 3, purchased: false },
            { id: 'deco-fountain', name: 'Fuente Central', emoji: '⛲', cost: 15000, reputation: 5, purchased: false },
            { id: 'deco-statue', name: 'Estatua Fundador', emoji: '🗿', cost: 20000, reputation: 4, purchased: false },
            { id: 'deco-mural', name: 'Mural Artistico', emoji: '🎨', cost: 5000, reputation: 3, purchased: false },
            { id: 'deco-library-ext', name: 'Biblioteca Exterior', emoji: '📚', cost: 12000, reputation: 4, purchased: false },
            { id: 'deco-playground', name: 'Parque de Juegos', emoji: '🎠', cost: 18000, reputation: 5, purchased: false },
            { id: 'deco-sports-field', name: 'Cancha Deportiva', emoji: '⚽', cost: 25000, reputation: 6, purchased: false },
            { id: 'deco-science-lab', name: 'Lab de Ciencias', emoji: '🔬', cost: 30000, reputation: 7, purchased: false },
          ] as Array<{ id: string; name: string; emoji: string; cost: number; reputation: number; purchased: boolean }>,
          saveSlots: [] as Array<{ id: string; name: string; week: number; timestamp: number }>,
          activeSaveSlot: null as string | null,
          campaignChapter: 0 as number,
          tutorialStep: 0 as number,
          totalPlayTime: 0 as number,
          bestSchoolStats: { maxStudents: 0, maxReputation: 0, maxMoney: 0, totalEventsResolved: 0, totalPlayTime: 0 } as { maxStudents: number; maxReputation: number; maxMoney: number; totalEventsResolved: number; totalPlayTime: number },
          parentEvents: 0 as number,
        });
        // Flush any pending writes, clear persisted data, then reload
        throttledStorage.flush();
        try {
          localStorage.removeItem('school-tycoon-storage');
        } catch { /* ignore */ }
        // Force page reload to clear all state
        window.location.reload();
      },

      // --- Profile ---
      setSchoolName: (name) => set({ schoolName: name }),
      setDirectorName: (name) => set({ directorName: name }),
      setCurrency: (currency) => set({ currency }),
      setCapital: (capital) => set({ capital, money: capital }),
      setDifficulty: (difficulty) => {
        const capital = DIFFICULTY_CAPITAL[difficulty];
        set({ difficulty, capital, money: capital });
      },
      setCustomCapital: (capital) => set({ customCapital: capital, capital, money: capital }),

      // --- Building ---
      setBuildingSize: (size) => {
        void BUILDING_CONFIGS[size]; // reference config
        set({ buildingSize: size, classrooms: [] });
      },
      setClassrooms: (classrooms) => set({ classrooms }),
      addClassroom: (classroom) =>
        set((s) => ({ classrooms: [...s.classrooms, classroom] })),
      removeClassroom: (id) =>
        set((s) => ({ classrooms: s.classrooms.filter(c => c.id !== id) })),

      // --- Office ---
      setOfficeSize: (size) => set({ officeSize: size }),
      setOfficeComputers: (computers) => set({ officeComputers: computers }),
      setOfficePhone: (phone) => set({ officePhone: phone }),
      setOfficeStaff: (staff) => set({ officeStaff: staff }),
      setOfficeFurniture: (furniture) => set({ officeFurniture: furniture }),

      // --- Classroom config ---
      setChairType: (type) => set({ chairType: type }),
      setPresentationSystem: (system) => set({ presentationSystem: system }),
      setDigitalScreenSize: (size) => set({ digitalScreenSize: size }),
      setDigitalScreenTier: (tier) => set({ digitalScreenTier: tier }),
      setRecordingMethod: (method) => set({ recordingMethod: method }),

      // --- Bathrooms ---
      setBathroomCount: (count) => set({ bathroomCount: count }),
      setBathroomQuality: (quality) => set({ bathroomQuality: quality }),
      setBathroomCleaners: (count) => set({ bathroomCleaners: count }),
      setInclusiveBathroom: (enabled) => set({ inclusiveBathroom: enabled }),

      // --- Cafeteria ---
      setCafeteriaBuilt: (built) => set({ cafeteriaBuilt: built }),
      setCafeteriaSize: (size) => set({ cafeteriaSize: size }),
      setCafeteriaFoodQuality: (quality) => set({ cafeteriaFoodQuality: quality }),
      setCafeteriaPricing: (pricing) => set({ cafeteriaPricing: pricing }),
      setCafeteriaMealPrice: (price) => set({ cafeteriaMealPrice: price }),
      setCafeteriaStaff: (staff) => set({ cafeteriaStaff: staff }),

      // --- Technology ---
      setInternetType: (type) => set({ internetType: type }),
      setTeacherLaptops: (laptops) => set({ teacherLaptops: laptops }),
      setStudentDevices: (devices) => set({ studentDevices: devices }),
      setCameraCount: (count) => set({ cameraCount: count }),
      setCameraType: (type) => set({ cameraType: type }),
      setCameraLocations: (locations) => set({ cameraLocations: locations }),
      setComputerLabEnabled: (enabled) => set({ computerLabEnabled: enabled }),
      setComputerLabCount: (count) => set({ computerLabCount: count }),
      setComputerLabTier: (tier) => set({ computerLabTier: tier }),
      setComputerLabSoftware: (software) => set({ computerLabSoftware: software }),

      // --- Services ---
      setLibraryEnabled: (enabled) => set({ libraryEnabled: enabled }),
      setLibrarySize: (size) => set({ librarySize: size }),
      setLibraryBookCount: (count) => set({ libraryBookCount: count }),
      setLibraryHasLibrarian: (has) => set({ libraryHasLibrarian: has }),
      setMeetingRoomEnabled: (enabled) => set({ meetingRoomEnabled: enabled }),
      setMeetingRoomSize: (size) => set({ meetingRoomSize: size }),
      setSportsAreaEnabled: (enabled) => set({ sportsAreaEnabled: enabled }),
      setSportsAreaType: (type) => set({ sportsAreaType: type }),

      // --- Rules ---
      setUniformPolicy: (policy) => set({ uniformPolicy: policy }),
      setUniformDescription: (desc) => set({ uniformDescription: desc }),
      setCellphonePolicy: (policy) => set({ cellphonePolicy: policy }),
      setDisciplineRules: (rules) => set({ disciplineRules: rules }),
      setSanctionSystem: (system) => set({ sanctionSystem: system }),
      setMaxAbsences: (max) => set({ maxAbsences: max }),
      setHomeworkPolicy: (policy) => set({ homeworkPolicy: policy }),
      setNoHomeworkVacations: (enabled) => set({ noHomeworkVacations: enabled }),
      setGradeSystem: (system) => set({ gradeSystem: system }),
      setCustomRules: (rules) => set({ customRules: rules }),
      addCustomRule: (rule) =>
        set((s) => ({ customRules: [...s.customRules, rule] })),
      removeCustomRule: (index) =>
        set((s) => ({ customRules: s.customRules.filter((_, i) => i !== index) })),

      // --- Teachers ---
      setSubjects: (subjects) => set({ subjects }),
      setTeachers: (teachers) => set({ teachers }),
      addTeacher: (teacher) =>
        set((s) => ({ teachers: [...s.teachers, teacher], activeTeachers: teacher.hired ? s.activeTeachers + 1 : s.activeTeachers })),
      removeTeacher: (id) =>
        set((s) => {
          const removed = s.teachers.find(t => t.id === id);
          return { teachers: s.teachers.filter(t => t.id !== id), activeTeachers: removed?.hired ? Math.max(0, s.activeTeachers - 1) : s.activeTeachers };
        }),

      // --- Staff ---
      setStaffMembers: (staff) => set({ staffMembers: staff }),
      addStaffMember: (member) =>
        set((s) => ({ staffMembers: [...s.staffMembers, member] })),
      removeStaffMember: (id) =>
        set((s) => ({ staffMembers: s.staffMembers.filter(m => m.id !== id) })),

      // --- Calendar ---
      setCountry: (country) => set({ country }),
      setReligion: (religion) => set({ religion }),
      setHolidays: (holidays) => set({ holidays }),
      setShift: (shift) => set({ shift }),
      setClassDuration: (duration) => set({ classDuration: duration }),
      setBreakTimeMinutes: (minutes) => set({ breakTimeMinutes: minutes }),
      setVacationPeriods: (periods) => set({ vacationPeriods: periods }),

      // --- Students ---
      setStudents: (students) => set({ students }),
      addStudent: (student) =>
        set((s) => ({ students: [...s.students, student] })),
      removeStudent: (id) =>
        set((s) => ({ students: s.students.filter(st => st.id !== id), activeStudents: Math.max(0, s.activeStudents - 1) })),
      setTuition: (amount) => set({ tuition: amount }),
      setMonthlyFee: (amount) => set({ monthlyFee: amount }),

      // --- Reviews ---
      setReviewItems: (items) => set({ reviewItems: items }),

      // --- Time ---
      advanceDay: () => {
        // Backwards compatibility wrapper: advanceDay now just calls advanceWeek
        get().advanceWeek();
      },

      advanceWeek: () =>
        set((state) => {
          const newWeek = state.currentWeek + 1;
          const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

          let newMonth = state.currentMonth;
          let newYear = state.currentYear;
          let newDay = state.currentDay + 7;

          // Properly wrap months
          while (newDay > daysInMonth[newMonth - 1]) {
            newDay -= daysInMonth[newMonth - 1];
            newMonth++;
            if (newMonth > 12) {
              newMonth = 1;
              newYear++;
            }
          }

          // Check holidays/vacations - reduce expenses by 50% during
          const isHolidayOrVacation = checkIfHolidayOrVacation(
            newMonth,
            newDay,
            state.holidays,
            state.vacationPeriods
          );
          const expenseMultiplier = isHolidayOrVacation ? 0.5 : 1;

          // Dynamic difficulty: expenses scale slowly as weeks progress
          const difficultyScaling = 1 + Math.min(0.3, newWeek / 200); // grows slowly from 1.0 to 1.3

          // Weekly expenses
          const weeklyExpenses = Math.round(get().getTotalWeeklyExpenses() * expenseMultiplier * difficultyScaling);

          // Weekly income
          const weeklyIncome = get().getWeeklyIncome();

          // Loan payments
          let loanPayments = 0;
          const updatedLoans = state.loans.map(loan => {
            if (loan.weeksRemaining > 0) {
              loanPayments += loan.weeklyPayment;
              return {
                ...loan,
                weeksRemaining: loan.weeksRemaining - 1,
                remaining: Math.max(0, loan.remaining - loan.weeklyPayment),
              };
            }
            return loan;
          }).filter(l => l.weeksRemaining > 0);

          // New money
          const newMoney = state.money - weeklyExpenses + weeklyIncome - loanPayments;

          // Reputation drift based on facilities
          let repChange = 0;
          if (state.bathroomCleaners < 1 && state.bathroomCount > 0) repChange -= 0.1;
          if (state.internetType === 'fiber') repChange += 0.05;
          if (state.cafeteriaBuilt && state.cafeteriaFoodQuality === 'premium') repChange += 0.08;
          if (!state.cafeteriaBuilt) repChange -= 0.1;
          if (state.chairType === 'padded') repChange += 0.03;
          if (state.libraryEnabled) repChange += 0.05;
          if (state.activeTeachers > 0) {
            const hiredTeachers = state.teachers.filter(t => t.hired);
            const avgQuality = hiredTeachers.length > 0
              ? hiredTeachers.reduce((s, t) => s + t.quality, 0) / hiredTeachers.length
              : 0;
            if (avgQuality >= 7) repChange += 0.08;
            else if (avgQuality < 4) repChange -= 0.1;
          }

          // Weather impact on reputation and satisfaction
          if (state.weather.current === 'stormy' || state.weather.current === 'hurricane') {
            repChange -= 0.15;
          } else if (state.weather.current === 'sunny') {
            repChange += 0.02;
          }
          if (state.weather.current === 'hot' && !state.shopItems.find(i => i.id === 'aire_acondicionado' && i.purchased)) {
            repChange -= 0.05;
          }

          // Director skill bonuses
          const negociadorLevel = state.directorSkills.find(s => s.id === 'negociador')?.currentLevel || 0;
          if (negociadorLevel > 0) repChange += negociadorLevel * 0.02;

          const liderLevel = state.directorSkills.find(s => s.id === 'lider')?.currentLevel || 0;

          // Marketing campaigns
          let marketingRep = 0;
          const updatedCampaigns = state.activeCampaigns.map(c => {
            const weeksActive = newWeek - c.startedAtWeek;
            if (weeksActive <= c.durationWeeks) {
              marketingRep += c.reputationBoost / c.durationWeeks;
              return { ...c, active: weeksActive < c.durationWeeks };
            }
            return { ...c, active: false };
          }).filter(c => c.active);

          // Student satisfaction drift
          let satChange = 0;
          if (state.breakTimeMinutes >= 15) satChange += 0.05;
          else satChange -= 0.08;
          if (state.chairType === 'padded') satChange += 0.03;
          if (state.cafeteriaBuilt && state.cafeteriaFoodQuality === 'premium') satChange += 0.05;
          if (state.sportsAreaEnabled) satChange += 0.03;
          if (!state.cafeteriaBuilt) satChange -= 0.05;

          // Lider skill bonus for satisfaction
          if (liderLevel > 0) satChange += liderLevel * 0.03;

          // Weather impact on satisfaction
          if (state.weather.current === 'stormy' || state.weather.current === 'hurricane') {
            satChange -= 0.2;
          } else if (state.weather.current === 'sunny') {
            satChange += 0.03;
          }

          // Academic performance drift
          let acadChange = 0;
          if (state.activeTeachers > 0) {
            const hiredTeachers = state.teachers.filter(t => t.hired);
            const avgTeacherQuality = hiredTeachers.length > 0
              ? hiredTeachers.reduce((s, t) => s + t.quality, 0) / hiredTeachers.length
              : 5;
            acadChange += (avgTeacherQuality - 5) * 0.02;
          }
          if (state.libraryEnabled) acadChange += 0.03;
          if (state.computerLabEnabled) acadChange += 0.04;
          if (state.presentationSystem === 'digital') acadChange += 0.02;

          // Cientifico skill bonus
          const cientificoLevel = state.directorSkills.find(s => s.id === 'cientifico')?.currentLevel || 0;
          if (cientificoLevel > 0) acadChange += cientificoLevel * 0.02;

          // Natural regression toward 50 if no positive factors
          if (acadChange === 0) acadChange = (50 - state.academicPerformance) * 0.01;

          // Parent satisfaction
          let parentChange = 0;
          if (state.meetingRoomEnabled) parentChange += 0.03;
          if (state.reputation >= 70) parentChange += 0.05;
          if (repChange < -0.05) parentChange -= 0.03;

          // Staff morale drift
          let newMorale = state.morale;
          let moraleChange = 0;
          const hiredStaff = state.staff.filter(s => s.hired);
          if (hiredStaff.length === 0 && state.activeStudents > 20) moraleChange -= 2;
          if (hiredStaff.length > 0 && state.cafeteriaBuilt) moraleChange += 0.5;
          if (hiredStaff.length > 0 && state.internetType === 'fiber') moraleChange += 0.3;
          if (moraleChange !== 0) {
            newMorale = Math.max(0, Math.min(100, state.morale + moraleChange));
          }
          // Low morale causes teacher quality degradation - chance of losing a teacher
          if (newMorale < 30 && state.activeTeachers > 0 && Math.random() < 0.05) {
            // Low morale event: reduce satisfaction
            satChange -= 1;
          }

          // Auto-enrollment: every 2 weeks, reputation attracts students
          let newStudentCount = 0;
          if (newWeek % 2 === 0 && newWeek > state.lastEnrollmentWeek) {
            const maxStudents = get().getMaxStudents();
            if (state.activeStudents < maxStudents) {
              const enrollmentRate = Math.floor(state.reputation / 25); // 0-4 per cycle
              newStudentCount = Math.min(enrollmentRate, maxStudents - state.activeStudents);
            }
          }

          // Staff rotation: every 8 weeks, a teacher might request raise or leave
          void (newWeek > state.lastStaffEventWeek + 8); // used by event system externally

          // Financial history (weekly, every 4 weeks)
          const financialHistory = [...state.financialHistory];
          if (newWeek % 4 === 0) {
            financialHistory.push({
              day: newDay,
              income: weeklyIncome,
              expense: weeklyExpenses,
              balance: newMoney,
            });
            if (financialHistory.length > 52) financialHistory.shift();
          }

          // Alumni graduation (every 12 weeks)
          const newAlumni = [...state.alumni];
          if (newWeek % 12 === 0 && newWeek > 12 && state.activeStudents > 10) {
            const careers = ['Ingeniero', 'Medico', 'Abogado', 'Profesor', 'Arquitecto', 'Periodista', 'Empresario', 'Cientifico', 'Artista', 'Programador'];
            const numGraduates = Math.min(3, Math.floor(state.activeStudents * 0.05));
            for (let i = 0; i < numGraduates; i++) {
              const names = ['Carlos', 'Maria', 'Juan', 'Ana', 'Luis', 'Sofia', 'Pedro', 'Elena', 'Diego', 'Valentina', 'Miguel', 'Camila'];
              newAlumni.push({
                id: `alumni_${newWeek}_${i}`,
                name: names[Math.floor(Math.random() * names.length)] + ' ' + ['Garcia', 'Rodriguez', 'Martinez', 'Lopez', 'Hernandez', 'Gonzalez', 'Perez', 'Sanchez'][Math.floor(Math.random() * 8)],
                graduationYear: newYear,
                career: careers[Math.floor(Math.random() * careers.length)],
                prestige: Math.floor(Math.random() * 5) + 1,
                donationAmount: 0,
              });
            }
            if (newAlumni.length > 50) newAlumni.splice(0, newAlumni.length - 50);
          }

          // Monthly report (every 4 weeks)
          const monthlyReports = [...state.monthlyReports];
          if (newWeek % 4 === 0) {
            monthlyReports.push({
              month: newMonth,
              year: newYear,
              income: weeklyIncome * 4,
              expenses: weeklyExpenses * 4,
              newStudents: newStudentCount,
              lostStudents: 0,
              reputationChange: Math.round(repChange * 100) / 100,
              eventsResolved: 0,
              highlights: [],
            });
            if (monthlyReports.length > 24) monthlyReports.shift();
          }

          // === WEATHER UPDATE (every 2 weeks) ===
          let weather = state.weather;
          if (newWeek - state.lastWeatherWeek >= 2) {
            weather = generateWeatherForMonth(newMonth);
          }

          // === RIVALS UPDATE (random fluctuations each week) ===
          const updatedRivals = state.rivals.map(rival => {
            const studentChange = Math.floor(Math.random() * 7) - 2; // -2 to +4
            const repChange2 = Math.floor(Math.random() * 5) - 2; // -2 to +2
            const moneyChange = Math.floor(Math.random() * 10000) - 3000; // -3k to +7k
            const trends = ['rising', 'stable', 'declining'] as const;
            let newTrend = rival.trend;
            if (repChange2 > 1) newTrend = 'rising';
            else if (repChange2 < -1) newTrend = 'declining';
            else newTrend = 'stable';
            return {
              ...rival,
              students: Math.max(10, rival.students + studentChange),
              reputation: Math.max(10, Math.min(100, rival.reputation + repChange2)),
              money: Math.max(0, rival.money + moneyChange),
              trend: newTrend,
            };
          });

          // === CHALLENGES PROGRESS ===
          const updatedChallenges = state.activeChallenges.map(ch => {
            if (ch.completed || ch.failed) return ch;
            // Check if deadline has passed
            if (newWeek > ch.deadline) {
              return { ...ch, failed: true };
            }
            return ch;
          });

          // Award challenge rewards for completed challenges
          let challengeMoneyReward = 0;
          let challengeRepReward = 0;
          const finalChallenges = updatedChallenges.map(ch => {
            if (ch.currentValue >= ch.targetValue && !ch.completed && !ch.failed) {
              if (ch.reward.type === 'money') challengeMoneyReward += ch.reward.value;
              if (ch.reward.type === 'reputation') challengeRepReward += ch.reward.value;
              return { ...ch, completed: true };
            }
            return ch;
          });

          // === NEWS UPDATE (every 4 weeks) ===
          const newsHistory = [...state.newsHistory];
          if (newWeek % 4 === 0) {
            const newsCategories: Array<{ category: NewsArticle['category']; emoji: string; headlines: string[] }> = [
              {
                category: 'sports',
                emoji: '⚽',
                headlines: [
                  'Equipo escolar clasifica al regional',
                  'Nuevo torneo interscolar anunciado',
                  'Estudiante destaca en atletismo',
                ],
              },
              {
                category: 'academic',
                emoji: '📚',
                headlines: [
                  'Alumnos obtienen altas calificaciones',
                  'Ferencia de ciencias exitosa',
                  'Nuevo programa de lectura implementado',
                ],
              },
              {
                category: 'social',
                emoji: '🤝',
                headlines: [
                  'Festival cultural reune a la comunidad',
                  'Actividad de voluntariado escolar',
                  'Padres participan en jornada escolar',
                ],
              },
              {
                category: 'financial',
                emoji: '💰',
                headlines: [
                  'Inversion en infraestructura aprobada',
                  'Nuevas becas disponibles',
                  'Aumento de matricula planificado',
                ],
              },
              {
                category: 'infrastructure',
                emoji: '🏗️',
                headlines: [
                  'Remodelacion de aulas en progreso',
                  'Nuevo equipo tecnologico instalado',
                  'Mejoras en areas verdes completadas',
                ],
              },
              {
                category: 'crisis',
                emoji: '⚠️',
                headlines: [
                  'Corte de energia afecta clases',
                  'Lluvia fuerte causa danos menores',
                  'Protesta de vecinos por trafico',
                ],
              },
            ];

            const selected = newsCategories[Math.floor(Math.random() * newsCategories.length)];
            const headline = selected.headlines[Math.floor(Math.random() * selected.headlines.length)];
            const impactRoll = Math.random();
            const impact: NewsArticle['impact'] = impactRoll < 0.5 ? 'neutral' : impactRoll < 0.8 ? 'positive' : 'negative';

            newsHistory.push({
              id: `news_${newWeek}`,
              headline,
              content: `Semana ${newWeek}: ${headline}`,
              category: selected.category,
              emoji: selected.emoji,
              week: newWeek,
              impact,
            });
            if (newsHistory.length > 50) newsHistory.shift();
          }

          // Achievement reward lookup
          const achievementRewardMap: Record<string, { money: number; rep: number }> = {
            'first_week': { money: 500, rep: 0 },
            'first_month': { money: 2000, rep: 2 },
            'first_year': { money: 10000, rep: 5 },
            'rep_80': { money: 3000, rep: 3 },
            'rep_100': { money: 10000, rep: 10 },
            'students_50': { money: 2000, rep: 0 },
            'students_100': { money: 5000, rep: 3 },
            'students_500': { money: 15000, rep: 5 },
            'students_1000': { money: 50000, rep: 10 },
            'money_100k': { money: 2000, rep: 2 },
            'money_500k': { money: 5000, rep: 5 },
            'profesional': { money: 1000, rep: 0 },
            'magnate': { money: 5000, rep: 3 },
            'ingeniero': { money: 2000, rep: 0 },
            'financiero': { money: 3000, rep: 0 },
            'diplomático': { money: 2000, rep: 0 },
            'perfecto': { money: 8000, rep: 5 },
          };

          // Check achievements and collect rewards
          let achievementRewardMoney = 0;
          let achievementRewardRep = 0;
          const achievements = state.achievements.map(a => {
            if (a.unlocked) return a;
            let shouldUnlock = false;
            if (a.condition === 'currentDay >= 7' && newDay >= 7) shouldUnlock = true;
            else if (a.condition === 'currentDay >= 30' && newDay >= 30) shouldUnlock = true;
            else if (a.condition === 'currentDay >= 365' && newDay >= 365) shouldUnlock = true;
            else if (a.condition === 'reputation >= 80' && state.reputation >= 80) shouldUnlock = true;
            else if (a.condition === 'reputation >= 100' && state.reputation >= 100) shouldUnlock = true;
            else if (a.condition === 'reputation >= 95' && state.reputation >= 95) shouldUnlock = true;
            else if (a.condition === 'activeStudents >= 50' && (state.activeStudents + newStudentCount) >= 50) shouldUnlock = true;
            else if (a.condition === 'activeStudents >= 100' && (state.activeStudents + newStudentCount) >= 100) shouldUnlock = true;
            else if (a.condition === 'activeStudents >= 50_popular' && (state.activeStudents + newStudentCount) >= 50) shouldUnlock = true;
            else if (a.condition === 'activeStudents >= 500' && (state.activeStudents + newStudentCount) >= 500) shouldUnlock = true;
            else if (a.condition === 'activeStudents >= 1000' && (state.activeStudents + newStudentCount) >= 1000) shouldUnlock = true;
            else if (a.condition === 'money >= 100000' && newMoney >= 100000) shouldUnlock = true;
            else if (a.condition === 'money >= 500000' && newMoney >= 500000) shouldUnlock = true;
            else if (a.condition === 'activeTeachers >= 5' && state.activeTeachers >= 5) shouldUnlock = true;
            else if (a.condition === 'activeTeachers >= 10' && state.activeTeachers >= 10) shouldUnlock = true;
            else if (a.condition === 'totalIncomeEarned >= 1000000' && (state.totalIncomeEarned + weeklyIncome) >= 1000000) shouldUnlock = true;
            else if (a.condition === 'scholarships >= 5' && state.scholarships.length >= 5) shouldUnlock = true;
            else if (a.condition === 'expansionsCompleted >= 3' && state.expansions.filter(e => e.completed).length >= 3) shouldUnlock = true;
            else if (a.condition === 'computerLab + library' && state.computerLabEnabled && state.libraryEnabled) shouldUnlock = true;
            else if (a.condition === 'sportsArea + tournament' && state.sportsAreaEnabled) shouldUnlock = true;
            else if (a.condition === 'disastersSurvived >= 3' && state.disastersSurvived >= 3) shouldUnlock = true;
            else if (a.condition === 'loansRepaid >= 3' && state.loansRepaid >= 3) shouldUnlock = true;
            else if (a.condition === 'eventsResolved >= 20' && state.eventsResolved >= 20) shouldUnlock = true;
            else if (a.condition === 'aiAdvisorUses >= 10' && state.aiAdvisorUses >= 10) shouldUnlock = true;
            else if (a.condition === 'survivor' && newWeek >= 52 && newMoney < 10000) shouldUnlock = true;
            // Special art event (checked externally when art event triggers)
            if (a.condition === 'artEvent') return a;
            // Special fast completion (checked externally)
            if (a.condition === 'fastCompletion') return a;
            if (shouldUnlock) {
              const reward = achievementRewardMap[a.id] || { money: 500, rep: 0 };
              achievementRewardMoney += reward.money;
              achievementRewardRep += reward.rep;
              return { ...a, unlocked: true, unlockedAt: newDay };
            }
            return a;
          });

          // Victory check
          let victoryAchieved = state.victoryAchieved;
          let victoryType = state.victoryType;
          if (!victoryAchieved && newDay >= 365) {
            victoryAchieved = true;
            victoryType = ' aniversario!';
          } else if (!victoryAchieved && state.reputation >= 95) {
            victoryAchieved = true;
            victoryType = ' reputacion perfecta!';
          }

          const isGameOver = newMoney <= 0;

          return {
            currentWeek: newWeek,
            currentDay: newDay,
            currentMonth: newMonth,
            currentYear: newYear,
            money: Math.round(newMoney + challengeMoneyReward + achievementRewardMoney),
            totalIncome: Math.round(state.totalIncome + weeklyIncome),
            totalExpenses: Math.round(state.totalExpenses + weeklyExpenses),
            totalIncomeEarned: state.totalIncomeEarned + weeklyIncome,
            reputation: Math.max(0, Math.min(100, Math.round((state.reputation + repChange + marketingRep + challengeRepReward + achievementRewardRep) * 100) / 100)),
            studentSatisfaction: Math.max(0, Math.min(100, Math.round((state.studentSatisfaction + satChange) * 100) / 100)),
            academicPerformance: Math.max(0, Math.min(100, Math.round((state.academicPerformance + acadChange) * 100) / 100)),
            parentSatisfaction: Math.max(0, Math.min(100, Math.round((state.parentSatisfaction + parentChange) * 100) / 100)),
            activeStudents: state.activeStudents + newStudentCount,
            activeTeachers: state.teachers.filter(t => t.hired).length,
            loans: updatedLoans,
            activeCampaigns: updatedCampaigns,
            financialHistory,
            monthlyReports,
            achievements,
            lastEnrollmentWeek: newWeek,
            lastStaffEventWeek: state.lastStaffEventWeek,
            isHoliday: false,
            isVacation: false,
            gameOver: isGameOver,
            victoryAchieved,
            victoryType,
            // New systems
            weather,
            rivals: updatedRivals,
            activeChallenges: finalChallenges,
            newsHistory,
            lastWeatherWeek: newWeek % 2 === 0 ? newWeek : state.lastWeatherWeek,
            lastNewsWeek: newWeek % 4 === 0 ? newWeek : state.lastNewsWeek,
            morale: newMorale,
            alumni: newAlumni,
            lastInspectionWeek: newWeek > state.lastInspectionWeek + 20 ? newWeek : state.lastInspectionWeek,
            parentEvents: state.parentEvents + (newWeek % 6 === 0 ? 1 : 0),
          };
        }),

      setTimeSpeed: (speed) => set({ timeSpeed: speed }),
      togglePause: () => set((s) => ({ paused: !s.paused })),

      // --- Stats ---
      adjustReputation: (amount) =>
        set((s) => ({
          reputation: Math.max(0, Math.min(100, s.reputation + amount)),
        })),
      adjustSatisfaction: (amount) =>
        set((s) => ({
          studentSatisfaction: Math.max(0, Math.min(100, s.studentSatisfaction + amount)),
        })),
      adjustAcademicPerformance: (amount) =>
        set((s) => ({
          academicPerformance: Math.max(0, Math.min(100, s.academicPerformance + amount)),
        })),
      adjustMoney: (amount) =>
        set((s) => ({ money: s.money + amount })),

      // --- Events ---
      addEvent: (event) =>
        set((s) => ({ events: [...s.events, event] })),
      resolveEvent: (eventId, optionIndex) =>
        set((s) => {
          const event = s.pendingEvents.find(e => e.id === eventId);
          if (!event) return {};
          const option = event.options[optionIndex];
          if (!option) return {};
          return {
            pendingEvents: s.pendingEvents.filter(e => e.id !== eventId),
            events: [...s.events, { ...event, resolved: true, chosenOption: optionIndex }],
            reputation: Math.max(0, Math.min(100, s.reputation + option.reputationChange)),
            money: s.money + option.moneyChange,
            studentSatisfaction: Math.max(0, Math.min(100, s.studentSatisfaction + option.satisfactionChange)),
          };
        }),
      addNotification: (notification) =>
        set((s) => ({ notifications: [notification, ...s.notifications].slice(0, 50) })),
      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),
      addPendingEvent: (event) =>
        set((s) => ({ pendingEvents: [...s.pendingEvents, event] })),
      clearExtraPendingEvents: () =>
        set((s) => {
          if (s.pendingEvents.length <= 1) return s;
          // Keep only the most recent pending event, discard accumulated extras
          const keep = s.pendingEvents[s.pendingEvents.length - 1];
          return { pendingEvents: [keep] };
        }),

      // --- Financial ---
      addFinancialRecord: (record) =>
        set((s) => ({
          financialHistory: [...s.financialHistory, record].slice(-100),
        })),

      // --- Sound ---
      setSoundVolume: (v) => set({ soundVolume: Math.max(0, Math.min(1, v)) }),

      // --- Loans ---
      addLoan: (loan) =>
        set((s) => ({
          loans: [...s.loans, loan],
          money: s.money + loan.amount,
        })),
      makeLoanPayment: (loanId) =>
        set((s) => {
          const loan = s.loans.find(l => l.id === loanId);
          if (!loan) return {};
          const payment = loan.weeklyPayment;
          if (s.money < payment) return {};
          // Check if this was the last payment (loan will be fully repaid)
          const newRemaining = Math.max(0, loan.remaining - payment);
          const isLastPayment = newRemaining <= 0 || loan.weeksRemaining <= 1;
          return {
            money: s.money - payment,
            loans: s.loans.map(l => {
              if (l.id !== loanId) return l;
              const newWeeks = l.weeksRemaining - 1;
              return { ...l, remaining: newRemaining, weeksRemaining: newWeeks };
            }).filter(l => l.weeksRemaining > 0),
            loansRepaid: isLastPayment ? s.loansRepaid + 1 : s.loansRepaid,
          };
        }),

      // --- Marketing ---
      startCampaign: (campaign) =>
        set((s) => ({
          activeCampaigns: [...s.activeCampaigns, campaign],
          money: s.money - campaign.cost,
        })),

      // --- Scholarships ---
      addScholarship: (scholarship) =>
        set((s) => ({
          scholarships: [...s.scholarships, scholarship],
        })),
      removeScholarship: (id) =>
        set((s) => ({
          scholarships: s.scholarships.filter(sc => sc.id !== id),
        })),

      // --- Expansions ---
      addExpansion: (expansion) =>
        set((s) => ({
          expansions: [...s.expansions, expansion],
          money: s.money - expansion.cost,
        })),
      completeExpansions: () =>
        set((s) => {
          const updated = s.expansions.map(e => {
            if (e.completed) return e;
            const weeksElapsed = s.currentWeek - e.startedAtWeek;
            if (weeksElapsed >= e.timeWeeks) {
              return { ...e, completed: true };
            }
            return e;
          });

          // Note: classroom capacity from expansions would be handled by UI
          void EXPANSION_OPTIONS; // reference for future use

          return { expansions: updated };
        }),

      // --- Achievements ---
      unlockAchievement: (id) =>
        set((s) => ({
          achievements: s.achievements.map(a =>
            a.id === id && !a.unlocked
              ? { ...a, unlocked: true, unlockedAt: s.currentDay }
              : a
          ),
        })),

      // --- Reports ---
      addMonthlyReport: (report) =>
        set((s) => ({
          monthlyReports: [...s.monthlyReports, report].slice(-24),
        })),

      // --- Auto Enrollment ---
      enrollAutoStudents: () =>
        set((s) => {
          const maxStudents = get().getMaxStudents();
          if (s.activeStudents >= maxStudents) return {};
          const enrollmentRate = Math.floor(s.reputation / 25);
          const newCount = Math.min(enrollmentRate, maxStudents - s.activeStudents);
          return { activeStudents: s.activeStudents + newCount };
        }),

      // --- Reset ---
      resetGame: () => {
        localStorage.removeItem('school-tycoon-storage');
        window.location.reload();
      },

      // ============================
      // NEW SYSTEM ACTIONS
      // ============================

      // --- Weather ---
      setWeather: (weather) => set({ weather }),

      // --- Rivals ---
      addRival: (rival) =>
        set((s) => ({ rivals: [...s.rivals, rival] })),
      updateRival: (id, updates) =>
        set((s) => ({
          rivals: s.rivals.map(r =>
            r.id === id ? { ...r, ...updates } : r
          ),
        })),

      // --- Director Skills ---
      upgradeSkill: (skillId) =>
        set((s) => {
          const skill = s.directorSkills.find(sk => sk.id === skillId);
          if (!skill) return {};
          if (skill.currentLevel >= skill.maxLevel) return {};
          const cost = skill.costPerLevel * (skill.currentLevel + 1);
          if (s.money < cost) return {};
          return {
            money: s.money - cost,
            directorSkills: s.directorSkills.map(sk =>
              sk.id === skillId
                ? { ...sk, currentLevel: sk.currentLevel + 1 }
                : sk
            ),
          };
        }),

      // --- News ---
      addNewsArticle: (article) =>
        set((s) => ({
          newsHistory: [article, ...s.newsHistory].slice(0, 50),
        })),

      // --- Shop ---
      purchaseShopItem: (itemId) =>
        set((s) => {
          const item = s.shopItems.find(i => i.id === itemId);
          if (!item) return {};
          if (item.purchased) return {};
          if (s.money < item.price) return {};

          let moneyDelta = -item.price;
          let reputationDelta = 0;
          let satisfactionDelta = 0;
          let performanceDelta = 0;

          switch (item.effect.type) {
            case 'reputation':
              reputationDelta = item.effect.value;
              break;
            case 'satisfaction':
              satisfactionDelta = item.effect.value;
              break;
            case 'performance':
              performanceDelta = item.effect.value;
              break;
            case 'money':
              // money.value is negative (reduces expenses, so effectively income)
              moneyDelta += item.effect.value;
              break;
            case 'enrollment':
              // Would need special handling
              break;
          }

          return {
            money: s.money + moneyDelta,
            reputation: Math.max(0, Math.min(100, s.reputation + reputationDelta)),
            studentSatisfaction: Math.max(0, Math.min(100, s.studentSatisfaction + satisfactionDelta)),
            academicPerformance: Math.max(0, Math.min(100, s.academicPerformance + performanceDelta)),
            shopItems: s.shopItems.map(i =>
              i.id === itemId ? { ...i, purchased: true } : i
            ),
          };
        }),

      // --- Transport ---
      addTransportRoute: (route) =>
        set((s) => ({
          transportRoutes: [...s.transportRoutes, route],
        })),
      toggleTransportRoute: (routeId) =>
        set((s) => ({
          transportRoutes: s.transportRoutes.map(r =>
            r.id === routeId ? { ...r, active: !r.active } : r
          ),
        })),

      // --- Challenges ---
      addChallenge: (challenge) =>
        set((s) => ({
          activeChallenges: [...s.activeChallenges, challenge],
        })),
      updateChallenge: (challengeId, value) =>
        set((s) => ({
          activeChallenges: s.activeChallenges.map(ch =>
            ch.id === challengeId && !ch.completed && !ch.failed
              ? { ...ch, currentValue: ch.currentValue + value }
              : ch
          ),
        })),

      // --- Decision History ---
      addDecisionRecord: (record) =>
        set((s) => ({
          decisionHistory: [...s.decisionHistory, record].slice(-100),
        })),

      // --- Music ---
      setMusicVolume: (vol) => set({ musicVolume: Math.max(0, Math.min(1, vol)) }),
      setMusicMuted: (muted) => set({ musicMuted: muted }),
      setCurrentMusicTrack: (track) => set({ currentMusicTrack: track }),

      // --- Extended Stats ---
      incrementStats: (stats) =>
        set((s) => ({
          eventsResolved: s.eventsResolved + (stats.eventsResolved || 0),
          aiAdvisorUses: s.aiAdvisorUses + (stats.aiAdvisorUses || 0),
          totalIncomeEarned: s.totalIncomeEarned + (stats.totalIncomeEarned || 0),
          loansRepaid: s.loansRepaid + (stats.loansRepaid || 0),
          disastersSurvived: s.disastersSurvived + (stats.disastersSurvived || 0),
        })),

      // ============================
      // PERSONAL ADICIONAL ACTIONS
      // ============================

      // --- Staff Management ---
      hireStaff: (staffId) => set((s) => ({
        staff: s.staff.map(st => st.id === staffId ? { ...st, hired: true } : st),
        money: s.money - (s.staff.find(st => st.id === staffId)?.salary || 0),
      })),
      fireStaffMember: (staffId) => set((s) => ({
        staff: s.staff.map(st => st.id === staffId ? { ...st, hired: false } : st),
      })),

      // --- Staff Morale ---
      adjustMorale: (amount) => set((s) => ({
        morale: Math.max(0, Math.min(100, s.morale + amount)),
      })),

      // --- Alumni ---
      addAlumni: (alumni) => set((s) => ({
        alumni: [...s.alumni, alumni],
      })),
      processAlumniDonation: () => set((s) => {
        const totalDonation = s.alumni.reduce((sum, a) => sum + Math.floor(a.donationAmount * a.prestige * 0.1), 0);
        return { money: s.money + totalDonation };
      }),

      // --- School Customization ---
      setUniformColors: (primary, secondary) => set({ uniformColors: { primary, secondary } }),
      setSchoolMotto: (motto) => set({ schoolMotto: motto }),
      setSchoolMascot: (mascot) => set({ schoolMascot: mascot }),

      // --- Decorations ---
      purchaseDecoration: (decoId) => set((s) => ({
        decorations: s.decorations.map(d => d.id === decoId ? { ...d, purchased: true } : d),
        money: s.money - (s.decorations.find(d => d.id === decoId)?.cost || 0),
      })),

      // --- Save/Load ---
      createSaveSlot: (name) => set((s) => {
        const slot = { id: `save-${Date.now()}`, name, week: s.currentWeek, timestamp: Date.now() };
        return { saveSlots: [...s.saveSlots, slot] };
      }),
      deleteSaveSlot: (slotId) => set((s) => ({
        saveSlots: s.saveSlots.filter(sl => sl.id !== slotId),
        activeSaveSlot: s.activeSaveSlot === slotId ? null : s.activeSaveSlot,
      })),

      // --- Campaign ---
      setCampaignChapter: (chapter) => set({ campaignChapter: chapter }),

      // --- Tutorial ---
      setTutorialStep: (step) => set({ tutorialStep: step }),

      // --- Stats ---
      incrementPlayTime: (seconds) => set((s) => {
        const newTotal = s.totalPlayTime + seconds;
        return {
          totalPlayTime: newTotal,
          bestSchoolStats: {
            ...s.bestSchoolStats,
            maxStudents: Math.max(s.bestSchoolStats.maxStudents, s.activeStudents),
            maxReputation: Math.max(s.bestSchoolStats.maxReputation, Math.round(s.reputation)),
            maxMoney: Math.max(s.bestSchoolStats.maxMoney, s.money),
            totalPlayTime: newTotal,
          },
        };
      }),

      // --- Parent System ---
      incrementParentEvents: () => set((s) => ({ parentEvents: s.parentEvents + 1 })),

      // --- Generate Staff Candidates ---
      generateStaffCandidates: () => {
        const roles: Array<{ role: StaffMember['role']; names: string[]; salaryRange: [number, number] }> = [
          { role: 'psychologist', names: ['Dra. Martinez', 'Lic. Rodriguez', 'Dra. Lopez'], salaryRange: [800, 1500] },
          { role: 'nurse', names: ['Enf. Garcia', 'Enf. Hernandez', 'Enf. Torres'], salaryRange: [600, 1200] },
          { role: 'security', names: ['Guardia Ramirez', 'Guardia Cruz', 'Guardia Flores'], salaryRange: [500, 900] },
          { role: 'gardener', names: ['Jardinero Diaz', 'Jardinero Morales', 'Jardinero Castro'], salaryRange: [400, 700] },
          { role: 'janitor', names: ['Conserje Ruiz', 'Conserje Aguilar', 'Conserje Vargas'], salaryRange: [350, 600] },
        ];
        const candidates: StaffMember[] = [];
        const usedRoles = new Set<number>();
        for (let i = 0; i < 5; i++) {
          let roleIdx: number;
          do {
            roleIdx = Math.floor(Math.random() * roles.length);
          } while (usedRoles.has(roleIdx) && usedRoles.size < roles.length);
          usedRoles.add(roleIdx);
          const r = roles[roleIdx];
          const name = r.names[Math.floor(Math.random() * r.names.length)];
          const salary = r.salaryRange[0] + Math.floor(Math.random() * (r.salaryRange[1] - r.salaryRange[0]));
          candidates.push({
            id: `staff-candidate-${Date.now()}-${i}`,
            name,
            role: r.role,
            salary,
            hired: false,
            morale: 50 + Math.floor(Math.random() * 30),
          });
        }
        return candidates;
      },

      // ============================
      // COMPUTED METHODS
      // ============================

      getMaxStudents: () => {
        const state = get();
        return state.classrooms.reduce((sum, c) => sum + c.capacity, 0);
      },

      getMinBathrooms: () => {
        const maxStudents = get().getMaxStudents();
        return Math.max(2, Math.ceil(maxStudents / 40));
      },

      getTotalMonthlyExpenses: () => {
        const state = get();
        let total = 0;

        // Teacher salaries
        total += state.teachers.filter(t => t.hired).reduce((s, t) => s + t.salary, 0);

        // Staff salaries
        total += state.staffMembers.reduce((s, m) => s + m.salary, 0);

        // Office staff
        total += state.officeStaff.subdirectors * 1500;
        total += state.officeStaff.secretaries * 800;
        total += state.officeStaff.receptionists * 600;
        total += state.officeStaff.security * 700;

        // Cafeteria staff
        if (state.cafeteriaBuilt) {
          total += state.cafeteriaStaff.cooks * 700;
          total += state.cafeteriaStaff.cashiers * 500;
          total += state.cafeteriaStaff.waiters * 450;
        }

        // Bathroom cleaners
        total += state.bathroomCleaners * 500;

        // Library
        if (state.libraryEnabled && state.libraryHasLibrarian) {
          total += 800;
        }

        // Services
        const internetCosts: Record<string, number> = { none: 0, open: 50, password: 100, fiber: 300 };
        total += (internetCosts[state.internetType] || 0) * 4; // monthly

        // Staff salaries (Personal adicional - hired support staff)
        const staffSalaries = state.staff.filter(s => s.hired).reduce((sum, s) => sum + s.salary, 0);
        total += staffSalaries;

        // Building maintenance
        const maintenanceCosts: Record<BuildingSize, number> = {
          small: 500, medium: 1000, large: 2000, mega: 4000,
        };
        total += maintenanceCosts[state.buildingSize];

        // Contador skill: reduces expenses
        const contadorLevel = state.directorSkills.find(sk => sk.id === 'contador')?.currentLevel || 0;
        if (contadorLevel > 0) {
          total = Math.round(total * (1 - contadorLevel * 0.03));
        }

        // Transport route costs
        total += state.transportRoutes.filter(r => r.active).reduce((sum, r) => sum + r.cost, 0);

        return total;
      },

      getTotalWeeklyExpenses: () => {
        return Math.round(get().getTotalMonthlyExpenses() / 4);
      },

      getWeeklyIncome: () => {
        const state = get();
        if (!state.gameStarted) return 0;
        const studentCount = state.students.length || state.activeStudents;

        // Weekly tuition (monthly fee spread over ~4 weeks)
        let weeklyFromFees = (state.monthlyFee * studentCount) / 4;

        // Emprendedor skill: bonus income from services
        const emprendedorLevel = state.directorSkills.find(sk => sk.id === 'emprendedor')?.currentLevel || 0;
        if (emprendedorLevel > 0) {
          weeklyFromFees = Math.round(weeklyFromFees * (1 + emprendedorLevel * 0.04));
        }

        // Cafeteria income
        let cafeteriaIncome = 0;
        if (state.cafeteriaBuilt && state.cafeteriaPricing === 'paid') {
          cafeteriaIncome = (state.cafeteriaMealPrice * studentCount * 0.7) / 4; // 70% buy
        }

        // Scholarship discounts reduce income
        const scholarshipDeduction = state.scholarships.reduce((sum, sc) => {
          return sum + (state.monthlyFee * sc.discount / 100) / 4;
        }, 0);

        // Shop item money effects (negative value = reduces expenses = adds income)
        const shopMoneyEffect = state.shopItems
          .filter(i => i.purchased && i.effect.type === 'money')
          .reduce((sum, i) => sum + Math.abs(i.effect.value), 0) / 4; // spread monthly

        return Math.round(weeklyFromFees + cafeteriaIncome - scholarshipDeduction + shopMoneyEffect);
      },
    }),
    {
      name: 'school-tycoon-storage',
      partialize: (state) => ({
        schoolName: state.schoolName,
        directorName: state.directorName,
        currency: state.currency,
        capital: state.capital,
        difficulty: state.difficulty,
        buildingSize: state.buildingSize,
        classrooms: state.classrooms,
        officeSize: state.officeSize,
        officeComputers: state.officeComputers,
        officePhone: state.officePhone,
        officeStaff: state.officeStaff,
        officeFurniture: state.officeFurniture,
        chairType: state.chairType,
        presentationSystem: state.presentationSystem,
        digitalScreenSize: state.digitalScreenSize,
        digitalScreenTier: state.digitalScreenTier,
        recordingMethod: state.recordingMethod,
        bathroomCount: state.bathroomCount,
        bathroomQuality: state.bathroomQuality,
        bathroomCleaners: state.bathroomCleaners,
        inclusiveBathroom: state.inclusiveBathroom,
        cafeteriaBuilt: state.cafeteriaBuilt,
        cafeteriaSize: state.cafeteriaSize,
        cafeteriaFoodQuality: state.cafeteriaFoodQuality,
        cafeteriaPricing: state.cafeteriaPricing,
        cafeteriaMealPrice: state.cafeteriaMealPrice,
        cafeteriaStaff: state.cafeteriaStaff,
        internetType: state.internetType,
        teacherLaptops: state.teacherLaptops,
        studentDevices: state.studentDevices,
        cameraCount: state.cameraCount,
        cameraType: state.cameraType,
        cameraLocations: state.cameraLocations,
        computerLabEnabled: state.computerLabEnabled,
        computerLabCount: state.computerLabCount,
        computerLabTier: state.computerLabTier,
        computerLabSoftware: state.computerLabSoftware,
        libraryEnabled: state.libraryEnabled,
        librarySize: state.librarySize,
        libraryBookCount: state.libraryBookCount,
        libraryHasLibrarian: state.libraryHasLibrarian,
        meetingRoomEnabled: state.meetingRoomEnabled,
        meetingRoomSize: state.meetingRoomSize,
        sportsAreaEnabled: state.sportsAreaEnabled,
        sportsAreaType: state.sportsAreaType,
        uniformPolicy: state.uniformPolicy,
        uniformDescription: state.uniformDescription,
        cellphonePolicy: state.cellphonePolicy,
        disciplineRules: state.disciplineRules,
        sanctionSystem: state.sanctionSystem,
        maxAbsences: state.maxAbsences,
        homeworkPolicy: state.homeworkPolicy,
        noHomeworkVacations: state.noHomeworkVacations,
        gradeSystem: state.gradeSystem,
        customRules: state.customRules,
        subjects: state.subjects,
        teachers: state.teachers,
        staffMembers: state.staffMembers,
        country: state.country,
        religion: state.religion,
        holidays: state.holidays,
        shift: state.shift,
        classDuration: state.classDuration,
        breakTimeMinutes: state.breakTimeMinutes,
        vacationPeriods: state.vacationPeriods,
        students: state.students,
        tuition: state.tuition,
        monthlyFee: state.monthlyFee,
        reviewItems: state.reviewItems,
        currentDay: state.currentDay,
        currentWeek: state.currentWeek,
        currentMonth: state.currentMonth,
        currentYear: state.currentYear,
        timeSpeed: state.timeSpeed,
        reputation: state.reputation,
        studentSatisfaction: state.studentSatisfaction,
        academicPerformance: state.academicPerformance,
        parentSatisfaction: state.parentSatisfaction,
        money: state.money,
        totalIncome: state.totalIncome,
        totalExpenses: state.totalExpenses,
        activeStudents: state.activeStudents,
        activeTeachers: state.activeTeachers,
        events: state.events,
        pendingEvents: state.pendingEvents,
        notifications: state.notifications,
        financialHistory: state.financialHistory,
        setupComplete: state.setupComplete,
        gameStarted: state.gameStarted,
        gameOver: state.gameOver,
        currentScreen: state.currentScreen,
        schoolOpenedDay: state.schoolOpenedDay,
        soundVolume: state.soundVolume,
        achievements: state.achievements,
        loans: state.loans,
        activeCampaigns: state.activeCampaigns,
        scholarships: state.scholarships,
        monthlyReports: state.monthlyReports,
        expansions: state.expansions,
        victoryAchieved: state.victoryAchieved,
        victoryType: state.victoryType,
        lastEnrollmentWeek: state.lastEnrollmentWeek,
        lastStaffEventWeek: state.lastStaffEventWeek,
        lastInspectionWeek: state.lastInspectionWeek,
        isHoliday: state.isHoliday,
        isVacation: state.isVacation,
        // New systems
        weather: state.weather,
        rivals: state.rivals,
        directorSkills: state.directorSkills,
        studentPersonalities: state.studentPersonalities,
        transportRoutes: state.transportRoutes,
        newsHistory: state.newsHistory,
        shopItems: state.shopItems,
        activeChallenges: state.activeChallenges,
        decisionHistory: state.decisionHistory,
        eventsResolved: state.eventsResolved,
        aiAdvisorUses: state.aiAdvisorUses,
        totalIncomeEarned: state.totalIncomeEarned,
        loansRepaid: state.loansRepaid,
        disastersSurvived: state.disastersSurvived,
        lastNewsWeek: state.lastNewsWeek,
        lastWeatherWeek: state.lastWeatherWeek,
        lastChallengeWeek: state.lastChallengeWeek,
        musicVolume: state.musicVolume,
        musicMuted: state.musicMuted,
        currentMusicTrack: state.currentMusicTrack,
        // Personal adicional
        staff: state.staff,
        morale: state.morale,
        alumni: state.alumni,
        uniformColors: state.uniformColors,
        schoolMotto: state.schoolMotto,
        schoolMascot: state.schoolMascot,
        decorations: state.decorations,
        saveSlots: state.saveSlots,
        activeSaveSlot: state.activeSaveSlot,
        campaignChapter: state.campaignChapter,
        tutorialStep: state.tutorialStep,
        totalPlayTime: state.totalPlayTime,
        bestSchoolStats: state.bestSchoolStats,
        parentEvents: state.parentEvents,
      }),
      storage: {
        getItem: (name: string) => {
          const str = throttledStorage.getItem(name);
          if (typeof str !== 'string') return null;
          try { return JSON.parse(str); } catch { return null; }
        },
        setItem: (name: string, value: unknown) => {
          throttledStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name: string) => {
          throttledStorage.removeItem(name);
        },
      },
      // Skip SSR hydration to prevent mismatch — client components hydrate with default state,
      // then the persist middleware loads from localStorage after mount.
      skipHydration: typeof window === 'undefined',
      onRehydrateStorage: () => {
        // Called after hydration completes — useful for post-hydration fixes
        return (state: GameState | undefined) => {
          if (!state) return;
          // Fix corrupted state: if screen is dashboard but game hasn't started, reset to api-config
          if (state.currentScreen === 'dashboard' && !state.gameStarted) {
            state.currentScreen = 'api-config';
          }
        };
      },
    }
  )
);
