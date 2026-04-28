// Weather System for School Tycoon - Caribbean Climate (Dominican Republic)
// Self-contained module - no internal project imports

export type WeatherType = 'sunny' | 'rainy' | 'stormy' | 'hot' | 'cloudy' | 'windy' | 'hurricane';

export interface WeatherState {
  current: WeatherType;
  temperature: number;
  humidity: number;
  forecast: { day: number; weather: WeatherType; temperature: number }[];
  emoji: string;
  description: string;
  effects: {
    attendance: number;       // -20 to +10 percentage points
    satisfaction: number;     // -5 to +5
    eventChance: number;      // modifier to event probability
    maintenanceRisk: number;  // 0 to 1 chance of infrastructure events
  };
}

// ─── Season helpers ───────────────────────────────────────────────

export function getSeasonName(month: number): string {
  if (month >= 3 && month <= 5) return 'Primavera';
  if (month >= 6 && month <= 8) return 'Verano';
  if (month >= 9 && month <= 11) return 'Otoño';
  return 'Invierno';
}

export function getWeatherEmoji(weather: WeatherType): string {
  const map: Record<WeatherType, string> = {
    sunny: '☀️',
    rainy: '🌧️',
    stormy: '⛈️',
    hot: '🔥',
    cloudy: '☁️',
    windy: '💨',
    hurricane: '🌪️',
  };
  return map[weather];
}

// ─── Weighted weather selection per month ─────────────────────────

interface WeatherWeight {
  weather: WeatherType;
  weight: number;
  tempRange: [number, number];
  humidityRange: [number, number];
}

// Probability weights change by month to simulate Caribbean seasons
const MONTHLY_WEIGHTS: WeatherWeight[][] = [
  // January – cool dry season
  [
    { weather: 'sunny',   weight: 40, tempRange: [24, 30], humidityRange: [55, 70] },
    { weather: 'cloudy',  weight: 25, tempRange: [22, 28], humidityRange: [60, 75] },
    { weather: 'windy',   weight: 15, tempRange: [22, 27], humidityRange: [50, 65] },
    { weather: 'rainy',   weight: 10, tempRange: [23, 28], humidityRange: [70, 85] },
    { weather: 'hot',     weight: 10, tempRange: [29, 33], humidityRange: [60, 75] },
  ],
  // February – cool dry
  [
    { weather: 'sunny',   weight: 45, tempRange: [24, 31], humidityRange: [50, 65] },
    { weather: 'cloudy',  weight: 20, tempRange: [23, 28], humidityRange: [55, 70] },
    { weather: 'windy',   weight: 15, tempRange: [22, 28], humidityRange: [45, 60] },
    { weather: 'rainy',   weight: 10, tempRange: [23, 29], humidityRange: [65, 80] },
    { weather: 'hot',     weight: 10, tempRange: [29, 34], humidityRange: [55, 70] },
  ],
  // March – warming
  [
    { weather: 'sunny',   weight: 40, tempRange: [25, 32], humidityRange: [50, 65] },
    { weather: 'hot',     weight: 20, tempRange: [30, 35], humidityRange: [55, 70] },
    { weather: 'cloudy',  weight: 15, tempRange: [24, 30], humidityRange: [55, 70] },
    { weather: 'rainy',   weight: 10, tempRange: [24, 30], humidityRange: [65, 80] },
    { weather: 'windy',   weight: 15, tempRange: [23, 29], humidityRange: [45, 60] },
  ],
  // April – pre-rainy season
  [
    { weather: 'sunny',   weight: 30, tempRange: [26, 33], humidityRange: [55, 70] },
    { weather: 'hot',     weight: 25, tempRange: [31, 36], humidityRange: [60, 75] },
    { weather: 'rainy',   weight: 20, tempRange: [25, 31], humidityRange: [70, 85] },
    { weather: 'cloudy',  weight: 15, tempRange: [25, 31], humidityRange: [60, 75] },
    { weather: 'windy',   weight: 10, tempRange: [24, 30], humidityRange: [50, 65] },
  ],
  // May – rainy season begins
  [
    { weather: 'rainy',   weight: 30, tempRange: [25, 32], humidityRange: [75, 90] },
    { weather: 'sunny',   weight: 25, tempRange: [27, 34], humidityRange: [55, 70] },
    { weather: 'hot',     weight: 20, tempRange: [30, 36], humidityRange: [65, 80] },
    { weather: 'cloudy',  weight: 15, tempRange: [25, 31], humidityRange: [65, 80] },
    { weather: 'stormy',  weight: 10, tempRange: [24, 30], humidityRange: [80, 95] },
  ],
  // June – hurricane season starts
  [
    { weather: 'rainy',   weight: 30, tempRange: [26, 33], humidityRange: [75, 90] },
    { weather: 'sunny',   weight: 20, tempRange: [28, 35], humidityRange: [55, 70] },
    { weather: 'hot',     weight: 20, tempRange: [31, 37], humidityRange: [65, 80] },
    { weather: 'cloudy',  weight: 15, tempRange: [26, 32], humidityRange: [65, 80] },
    { weather: 'stormy',  weight: 10, tempRange: [25, 30], humidityRange: [80, 95] },
    { weather: 'windy',   weight: 5,  tempRange: [25, 31], humidityRange: [60, 75] },
  ],
  // July – hot & humid
  [
    { weather: 'hot',     weight: 30, tempRange: [32, 38], humidityRange: [70, 85] },
    { weather: 'sunny',   weight: 20, tempRange: [29, 36], humidityRange: [55, 70] },
    { weather: 'rainy',   weight: 25, tempRange: [26, 33], humidityRange: [75, 90] },
    { weather: 'cloudy',  weight: 10, tempRange: [27, 33], humidityRange: [65, 80] },
    { weather: 'stormy',  weight: 10, tempRange: [25, 30], humidityRange: [80, 95] },
    { weather: 'windy',   weight: 5,  tempRange: [26, 32], humidityRange: [60, 75] },
  ],
  // August – peak heat
  [
    { weather: 'hot',     weight: 30, tempRange: [33, 38], humidityRange: [70, 85] },
    { weather: 'rainy',   weight: 25, tempRange: [27, 33], humidityRange: [75, 90] },
    { weather: 'sunny',   weight: 15, tempRange: [30, 37], humidityRange: [55, 70] },
    { weather: 'stormy',  weight: 15, tempRange: [25, 31], humidityRange: [80, 95] },
    { weather: 'cloudy',  weight: 10, tempRange: [27, 33], humidityRange: [65, 80] },
    { weather: 'windy',   weight: 5,  tempRange: [26, 32], humidityRange: [60, 75] },
  ],
  // September – peak hurricane risk
  [
    { weather: 'rainy',   weight: 25, tempRange: [26, 32], humidityRange: [80, 95] },
    { weather: 'stormy',  weight: 20, tempRange: [24, 30], humidityRange: [85, 98] },
    { weather: 'hot',     weight: 20, tempRange: [31, 37], humidityRange: [70, 85] },
    { weather: 'sunny',   weight: 15, tempRange: [28, 35], humidityRange: [55, 70] },
    { weather: 'cloudy',  weight: 10, tempRange: [26, 32], humidityRange: [70, 85] },
    { weather: 'windy',   weight: 5,  tempRange: [25, 31], humidityRange: [65, 80] },
    { weather: 'hurricane', weight: 5, tempRange: [22, 28], humidityRange: [90, 100] },
  ],
  // October – still hurricane season
  [
    { weather: 'rainy',   weight: 30, tempRange: [25, 31], humidityRange: [75, 90] },
    { weather: 'stormy',  weight: 15, tempRange: [24, 29], humidityRange: [80, 95] },
    { weather: 'hot',     weight: 20, tempRange: [30, 36], humidityRange: [65, 80] },
    { weather: 'sunny',   weight: 15, tempRange: [27, 34], humidityRange: [55, 70] },
    { weather: 'cloudy',  weight: 10, tempRange: [25, 31], humidityRange: [65, 80] },
    { weather: 'windy',   weight: 5,  tempRange: [24, 30], humidityRange: [60, 75] },
    { weather: 'hurricane', weight: 5, tempRange: [22, 27], humidityRange: [90, 100] },
  ],
  // November – rainy season tapers
  [
    { weather: 'sunny',   weight: 25, tempRange: [26, 33], humidityRange: [55, 70] },
    { weather: 'rainy',   weight: 25, tempRange: [25, 31], humidityRange: [70, 85] },
    { weather: 'cloudy',  weight: 20, tempRange: [24, 30], humidityRange: [60, 75] },
    { weather: 'hot',     weight: 15, tempRange: [29, 35], humidityRange: [60, 75] },
    { weather: 'windy',   weight: 10, tempRange: [23, 29], humidityRange: [50, 65] },
    { weather: 'stormy',  weight: 5,  tempRange: [24, 29], humidityRange: [75, 90] },
  ],
  // December – cool dry season returns
  [
    { weather: 'sunny',   weight: 40, tempRange: [24, 30], humidityRange: [50, 65] },
    { weather: 'cloudy',  weight: 20, tempRange: [22, 28], humidityRange: [55, 70] },
    { weather: 'windy',   weight: 15, tempRange: [22, 27], humidityRange: [45, 60] },
    { weather: 'rainy',   weight: 10, tempRange: [23, 28], humidityRange: [65, 80] },
    { weather: 'hot',     weight: 10, tempRange: [28, 33], humidityRange: [55, 70] },
    { weather: 'stormy',  weight: 5,  tempRange: [23, 28], humidityRange: [70, 85] },
  ],
];

// ─── Weather effects on gameplay ──────────────────────────────────

const WEATHER_EFFECTS: Record<WeatherType, WeatherState['effects']> = {
  sunny: {
    attendance: 5,
    satisfaction: 3,
    eventChance: 0,
    maintenanceRisk: 0.02,
  },
  cloudy: {
    attendance: 0,
    satisfaction: 0,
    eventChance: 0,
    maintenanceRisk: 0.03,
  },
  rainy: {
    attendance: -10,
    satisfaction: -1,
    eventChance: 0.1,
    maintenanceRisk: 0.12,
  },
  stormy: {
    attendance: -15,
    satisfaction: -3,
    eventChance: 0.25,
    maintenanceRisk: 0.3,
  },
  hot: {
    attendance: -5,
    satisfaction: -2,
    eventChance: 0.05,
    maintenanceRisk: 0.1,
  },
  windy: {
    attendance: -3,
    satisfaction: -1,
    eventChance: 0.05,
    maintenanceRisk: 0.08,
  },
  hurricane: {
    attendance: -20,
    satisfaction: -5,
    eventChance: 0.5,
    maintenanceRisk: 0.7,
  },
};

// ─── Weather descriptions (Spanish) ──────────────────────────────

const WEATHER_DESCRIPTIONS: Record<WeatherType, string> = {
  sunny: 'Día soleado y agradable. Los estudiantes están de buen humor.',
  rainy: 'Lluvia constante. Algunos estudiantes podrían faltar a clases.',
  stormy: 'Tormenta eléctrica. Condiciones peligrosas para desplazarse.',
  hot: 'Día extremadamente caluroso. Las aletas pueden ser insoportables.',
  cloudy: 'Cielo nublado. Un día tranquilo sin grandes contratiempos.',
  windy: 'Vientos fuertes. Se recomienda cuidado con estructuras al aire libre.',
  hurricane: '¡Huracán! Clase suspendida. Riesgo extremo de daños a la infraestructura.',
};

// ─── Seeded random for deterministic forecasts ───────────────────

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ─── Core generation ─────────────────────────────────────────────

function pickWeather(month: number, day: number, rand: () => number): WeatherType {
  const weights = MONTHLY_WEIGHTS[month];
  const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
  let roll = rand() * totalWeight;

  for (const w of weights) {
    roll -= w.weight;
    if (roll <= 0) return w.weather;
  }
  return 'sunny'; // fallback
}

function pickTemperature(weather: WeatherType, month: number, rand: () => number): number {
  const weights = MONTHLY_WEIGHTS[month];
  const entry = weights.find(w => w.weather === weather);
  if (!entry) return 28;

  const [min, max] = entry.tempRange;
  return Math.round((min + rand() * (max - min)) * 10) / 10;
}

function pickHumidity(weather: WeatherType, month: number, rand: () => number): number {
  const weights = MONTHLY_WEIGHTS[month];
  const entry = weights.find(w => w.weather === weather);
  if (!entry) return 70;

  const [min, max] = entry.humidityRange;
  return Math.round(min + rand() * (max - min));
}

export function generateWeather(currentMonth: number, currentDay: number, currentWeek: number): WeatherState {
  // Combine month, day and week into a seed for deterministic but varied weather
  const baseSeed = currentMonth * 10000 + currentDay * 100 + currentWeek;
  const rand = seededRandom(baseSeed);

  const current = pickWeather(currentMonth, currentDay, rand);
  const temperature = pickTemperature(current, currentMonth, rand);
  const humidity = pickHumidity(current, currentMonth, rand);

  // Generate 3-day forecast
  const forecast: WeatherState['forecast'] = [];
  for (let d = 1; d <= 3; d++) {
    const fDay = (currentDay + d) % 30;
    const fWeather = pickWeather(currentMonth, fDay, rand);
    const fTemp = pickTemperature(fWeather, currentMonth, rand);
    forecast.push({
      day: d,
      weather: fWeather,
      temperature: fTemp,
    });
  }

  return {
    current,
    temperature,
    humidity,
    forecast,
    emoji: getWeatherEmoji(current),
    description: WEATHER_DESCRIPTIONS[current],
    effects: { ...WEATHER_EFFECTS[current] },
  };
}
