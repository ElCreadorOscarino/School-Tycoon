// ============================================
// SCHOOL TYCOON — Premium SFX Engine v2
// Web Audio API — Rich layered sound effects
// with proper envelopes, filters, harmonics,
// and spatial depth. All procedural, no files.
// ============================================

// ---------- Internal State ----------

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let vol = 0.5;
let initialized = false;

// ---------- Core Utilities ----------

function ensure(): AudioContext {
  if (!ctx) {
    const Ctor = window.AudioContext || (window as any).webkitAudioContext;
    ctx = new Ctor();
    masterGain = ctx.createGain();
    masterGain.gain.value = vol;

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.knee.value = 8;
    comp.ratio.value = 6;
    comp.attack.value = 0.003;
    comp.release.value = 0.08;
    comp.connect(ctx.destination);

    // Presence boost for clarity
    const presence = ctx.createBiquadFilter();
    presence.type = 'peaking';
    presence.frequency.value = 2500;
    presence.gain.value = 2;
    presence.Q.value = 1;
    presence.connect(comp);

    masterGain.connect(presence);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

/** Rich tone with proper ADSR and optional harmonics */
function tone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume: number = 0.3,
  startDelay: number = 0,
  freqEnd?: number,
  detune: number = 0,
  harmonicVol: number = 0,
  harmonicFreq: number = 0,
): void {
  const c = ensure();
  if (!masterGain) return;
  const t = c.currentTime + startDelay;

  // Main oscillator
  const osc = c.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (freqEnd !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), t + duration);
  }
  osc.detune.setValueAtTime(detune, t);

  const g = c.createGain();
  const attack = Math.min(0.02, duration * 0.15);
  g.gain.setValueAtTime(0.001, t);
  g.gain.linearRampToValueAtTime(volume, t + attack);
  g.gain.exponentialRampToValueAtTime(0.001, t + duration);

  osc.connect(g);
  g.connect(masterGain);
  osc.start(t);
  osc.stop(t + duration + 0.02);

  // Optional harmonic for richness
  if (harmonicVol > 0 && harmonicFreq > 0) {
    const osc2 = c.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(harmonicFreq, t);
    if (freqEnd !== undefined) {
      osc2.frequency.exponentialRampToValueAtTime(
        Math.max(1, harmonicFreq * (freqEnd / freq)), t + duration,
      );
    }
    const g2 = c.createGain();
    g2.gain.setValueAtTime(0.001, t);
    g2.gain.linearRampToValueAtTime(harmonicVol, t + attack);
    g2.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc2.connect(g2);
    g2.connect(masterGain);
    osc2.start(t);
    osc2.stop(t + duration + 0.02);
  }
}

/** Filtered noise burst with shape and sweep */
function noise(
  duration: number,
  volume: number = 0.1,
  filterFreq: number = 2000,
  filterType: BiquadFilterType = 'bandpass',
  filterQ: number = 1,
  startDelay: number = 0,
  filterEnd?: number,
): void {
  const c = ensure();
  if (!masterGain) return;
  const bufferSize = Math.max(1, Math.floor(c.sampleRate * (duration + 0.02)));
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

  const src = c.createBufferSource();
  src.buffer = buffer;

  const filter = c.createBiquadFilter();
  filter.type = filterType;
  filter.frequency.setValueAtTime(filterFreq, c.currentTime + startDelay);
  if (filterEnd !== undefined) {
    filter.frequency.exponentialRampToValueAtTime(Math.max(1, filterEnd), c.currentTime + startDelay + duration);
  }
  filter.Q.value = filterQ;

  const g = c.createGain();
  const t = c.currentTime + startDelay;
  g.gain.setValueAtTime(0.001, t);
  g.gain.linearRampToValueAtTime(volume, t + 0.003);
  g.gain.exponentialRampToValueAtTime(0.001, t + duration);

  src.connect(filter);
  filter.connect(g);
  g.connect(masterGain);
  src.start(t);
  src.stop(t + duration + 0.02);
}

// ============================================
// SOUNDS CATALOG — 28 Professional SFX
// ============================================

export const sounds = {
  // ==================== CONTROLS ====================

  init(): void {
    if (initialized) return;
    initialized = true;
    try { ensure(); } catch { /* ok */ }
  },

  setVolume(v: number): void {
    vol = Math.max(0, Math.min(1, v));
    if (masterGain) masterGain.gain.setValueAtTime(vol, ctx!.currentTime);
  },

  getVolume(): number { return vol; },

  // ==================== UI SOUNDS (8) ====================

  /** Click — short snap with subtle body */
  click(): void {
    try {
      noise(0.03, 0.12, 4000, 'bandpass', 2.5);
      tone(1200, 0.04, 'sine', 0.06, 0, 600, 0, 0.03, 2400);
    } catch { /* ok */ }
  },

  /** Menu open — smooth whoosh with air */
  menuOpen(): void {
    try {
      noise(0.18, 0.1, 5000, 'bandpass', 1, 0, 800);
      tone(400, 0.15, 'sine', 0.03, 0, 180, 0, 0.01, 800);
    } catch { /* ok */ }
  },

  /** Success — warm ascending bell C5→E5→G5 */
  success(): void {
    try {
      tone(523.25, 0.2, 'sine', 0.18, 0, 0, 0, 0.04, 1046.5);
      tone(659.25, 0.3, 'sine', 0.18, 0.08, 0, 0, 0.04, 1318.5);
      tone(783.99, 0.4, 'sine', 0.15, 0.16, 0, 0, 0.03, 1568);
    } catch { /* ok */ }
  },

  /** Error — deep descending buzz */
  error(): void {
    try {
      tone(220, 0.3, 'sawtooth', 0.08, 0, 110, 0, 0.02, 440);
      noise(0.1, 0.05, 600, 'lowpass', 1.5);
      tone(150, 0.15, 'sine', 0.1, 0.1, 80);
    } catch { /* ok */ }
  },

  /** Notification — crystalline double chime */
  notification(): void {
    try {
      tone(880, 0.5, 'sine', 0.12, 0, 0, 3, 0.04, 1760);
      tone(1320, 0.35, 'sine', 0.06, 0.03, 0, -3, 0.02, 2640);
      tone(1760, 0.2, 'sine', 0.025, 0.06, 0, 5, 0, 0);
    } catch { /* ok */ }
  },

  /** Warning — two-note descending triangle */
  warning(): void {
    try {
      tone(523.25, 0.15, 'triangle', 0.15, 0, 0, 0, 0.03, 1046.5);
      tone(392.0, 0.2, 'triangle', 0.15, 0.12, 0, 0, 0.03, 784);
    } catch { /* ok */ }
  },

  /** Typing — extremely subtle mechanical tap */
  typing(): void {
    try {
      noise(0.012, 0.035, 2500 + Math.random() * 3000, 'bandpass', 1.5);
    } catch { /* ok */ }
  },

  /** Level up — triumphant arpegio C5→E5→G5→C6 */
  levelUp(): void {
    try {
      tone(523.25, 0.12, 'sine', 0.18, 0, 0, 0, 0.03, 1046.5);
      tone(659.25, 0.12, 'sine', 0.18, 0.08, 0, 0, 0.03, 1318.5);
      tone(783.99, 0.15, 'sine', 0.2, 0.16, 0, 0, 0.03, 1568);
      tone(1046.5, 0.3, 'sine', 0.15, 0.22, 0, 0, 0.04, 2093);
      tone(1318.5, 0.15, 'sine', 0.05, 0.32, 0, 5, 0, 0);
    } catch { /* ok */ }
  },

  // ==================== GAME EVENTS (7) ====================

  /** Construction — impact + grinding + sparks */
  construction(): void {
    try {
      noise(0.06, 0.14, 250, 'lowpass', 1.5);
      tone(120, 0.1, 'square', 0.06, 0);
      noise(0.25, 0.05, 3000, 'bandpass', 1, 0.05, 5000);
      tone(180, 0.3, 'sawtooth', 0.04, 0.05, 400, 0, 0.01, 360);
    } catch { /* ok */ }
  },

  /** Purchase — satisfying "ka-ching" */
  purchase(): void {
    try {
      noise(0.03, 0.1, 3000, 'bandpass', 2.5);
      tone(1568, 0.12, 'sine', 0.14, 0.04, 0, 0, 0.04, 3136);
      tone(2093, 0.15, 'sine', 0.1, 0.08, 0, 4, 0.02, 4186);
      tone(2637, 0.1, 'sine', 0.04, 0.12, 0, -3, 0, 0);
    } catch { /* ok */ }
  },

  /** Enrollment — warm school bell chime */
  enrollment(): void {
    try {
      tone(660, 0.5, 'sine', 0.18, 0, 0, 2, 0.05, 1320);
      tone(1320, 0.35, 'sine', 0.05, 0.02, 0, -4, 0.02, 2640);
      noise(0.02, 0.02, 6000, 'highpass', 1.5);
      tone(990, 0.3, 'sine', 0.04, 0.04, 0, 6, 0, 0);
    } catch { /* ok */ }
  },

  /** Teacher hire — professional warm tone */
  teacherHire(): void {
    try {
      tone(440, 0.35, 'sine', 0.13, 0, 0, 3, 0.04, 880);
      tone(554.37, 0.3, 'triangle', 0.06, 0.06, 0, 0, 0, 0);
      tone(659.25, 0.2, 'sine', 0.04, 0.1, 0, -2, 0, 0);
    } catch { /* ok */ }
  },

  /** Promotion — bright ascending sparkle */
  promotion(): void {
    try {
      tone(523.25, 0.08, 'sine', 0.14, 0, 0, 0, 0.03, 1046.5);
      tone(659.25, 0.08, 'sine', 0.14, 0.06, 0, 0, 0.03, 1318.5);
      tone(783.99, 0.08, 'sine', 0.14, 0.12, 0, 0, 0.03, 1568);
      tone(1046.5, 0.08, 'sine', 0.14, 0.18, 0, 0, 0.03, 2093);
      tone(1318.5, 0.15, 'sine', 0.08, 0.24, 0, 5, 0.02, 2637);
    } catch { /* ok */ }
  },

  /** Scandal — dramatic dissonant cluster */
  scandal(): void {
    try {
      tone(233.08, 0.5, 'sawtooth', 0.07, 0, 0, -8, 0.02, 466.16);
      tone(277.18, 0.5, 'sawtooth', 0.07, 0, 0, 8, 0.02, 554.37);
      tone(311.13, 0.5, 'sawtooth', 0.07, 0, 0, -3, 0, 0);
      tone(185.0, 0.4, 'sine', 0.1, 0.05, 0, 0, 0.03, 370);
      noise(0.15, 0.06, 500, 'bandpass', 1, 0.1);
    } catch { /* ok */ }
  },

  /** Emergency — urgent triple pulse */
  emergency(): void {
    try {
      for (let i = 0; i < 3; i++) {
        tone(800, 0.08, 'square', 0.1, i * 0.18, 0, -5, 0.02, 1600);
        tone(600, 0.08, 'square', 0.1, i * 0.18 + 0.08, 0, 5, 0.02, 1200);
      }
      noise(0.15, 0.04, 2000, 'highpass', 1, 0.45);
    } catch { /* ok */ }
  },

  // ==================== FINANCIAL (3) ====================

  /** Money in — bright coin sparkle */
  moneyIn(): void {
    try {
      noise(0.015, 0.06, 6000, 'highpass', 1.5);
      tone(2400, 0.1, 'sine', 0.1, 0, 3800, 0, 0.03, 4800);
      tone(3800, 0.08, 'sine', 0.04, 0.04, 0, 4, 0.01, 7600);
      tone(5000, 0.05, 'sine', 0.02, 0.08, 0, -2, 0, 0);
    } catch { /* ok */ }
  },

  /** Money out — descending soft "womp" */
  moneyOut(): void {
    try {
      tone(440, 0.35, 'triangle', 0.15, 0, 130, -5, 0.03, 880);
      tone(220, 0.25, 'sine', 0.07, 0.1, 90, 0, 0, 0);
    } catch { /* ok */ }
  },

  /** Fanfare — triumphant short flourish */
  fanfare(): void {
    try {
      tone(523.25, 0.1, 'triangle', 0.1, 0, 0, 2, 0.02, 1046.5);
      tone(659.25, 0.1, 'triangle', 0.1, 0.1, 0, 2, 0.02, 1318.5);
      tone(783.99, 0.2, 'triangle', 0.13, 0.2, 0, 2, 0.02, 1568);
      tone(1046.5, 0.35, 'sine', 0.08, 0.3, 0, 0, 0.03, 2093);
    } catch { /* ok */ }
  },

  // ==================== AMBIENT (3) ====================

  /** Thunder — distant rolling rumble */
  thunder(): void {
    try {
      noise(0.6, 0.12, 100, 'lowpass', 1, 0, 35);
      tone(45, 0.7, 'sine', 0.1, 0.15, 0, 0, 0.02, 90);
      noise(0.3, 0.06, 250, 'lowpass', 2, 0.35);
    } catch { /* ok */ }
  },

  /** Rain — gentle continuous patter */
  rain(): void {
    try {
      noise(0.45, 0.05, 3500, 'bandpass', 0.5);
      noise(0.4, 0.025, 7000, 'highpass', 0.4, 0.02);
      noise(0.35, 0.015, 12000, 'highpass', 0.3, 0.05);
    } catch { /* ok */ }
  },

  /** Applause — crowd clapping */
  applause(): void {
    try {
      noise(0.5, 0.1, 1800, 'bandpass', 0.7);
      noise(0.45, 0.07, 4500, 'bandpass', 2, 0.02);
      noise(0.4, 0.04, 700, 'lowpass', 1, 0.05);
      noise(0.35, 0.03, 9000, 'highpass', 0.5, 0.08);
    } catch { /* ok */ }
  },

  // ==================== EVENT SOUNDS (7) ====================

  /** Positive event — warm major chord rise */
  eventPositive(): void {
    try {
      tone(523.25, 0.25, 'sine', 0.12, 0, 0, 3, 0.03, 1046.5);
      tone(659.25, 0.25, 'sine', 0.12, 0.03, 0, -3, 0.03, 1318.5);
      tone(783.99, 0.3, 'sine', 0.12, 0.06, 0, 0, 0.03, 1568);
      tone(1046.5, 0.25, 'sine', 0.05, 0.12, 0, 5, 0.01, 2093);
    } catch { /* ok */ }
  },

  /** Negative event — descending minor with weight */
  eventNegative(): void {
    try {
      tone(440, 0.15, 'sine', 0.13, 0, 0, -4, 0.02, 880);
      tone(392, 0.15, 'sine', 0.13, 0.12, 0, -4, 0.02, 784);
      tone(311.13, 0.2, 'sine', 0.13, 0.24, 0, -3, 0.02, 622.26);
      tone(261.63, 0.3, 'sine', 0.08, 0.36, 0, 0, 0, 0);
    } catch { /* ok */ }
  },

  /** Neutral event — balanced single tone */
  eventNeutral(): void {
    try {
      tone(440, 0.25, 'triangle', 0.1, 0, 0, 4, 0.02, 880);
      tone(660, 0.15, 'sine', 0.03, 0.02, 0, -5, 0, 0);
    } catch { /* ok */ }
  },

  /** Natural disaster — ominous rumble + impact */
  naturalDisaster(): void {
    try {
      noise(0.6, 0.1, 80, 'lowpass', 1, 0, 25);
      tone(55, 0.7, 'sawtooth', 0.06, 0.1, 0, -10, 0.01, 110);
      tone(82, 0.5, 'sine', 0.08, 0.15, 0, 5, 0.02, 164);
      noise(0.25, 0.12, 700, 'bandpass', 1.5, 0.35);
      noise(0.15, 0.05, 3500, 'highpass', 1, 0.55);
    } catch { /* ok */ }
  },

  /** Celebration — joyful sparkle burst */
  celebration(): void {
    try {
      const freqs = [1046.5, 1318.5, 1568, 2093, 2637];
      freqs.forEach((f, i) => {
        tone(f, 0.08, 'sine', 0.08, i * 0.035, 0, i % 2 === 0 ? 4 : -4, 0.02, f * 2);
        noise(0.015, 0.015, f * 2, 'highpass', 1, i * 0.035);
      });
      tone(2093, 0.2, 'sine', 0.05, 0.22, 0, 6, 0.01, 4186);
    } catch { /* ok */ }
  },

  /** Game over — somber descending triad */
  gameOver(): void {
    try {
      tone(523.25, 0.3, 'triangle', 0.12, 0, 0, -4, 0.02, 1046.5);
      tone(440, 0.3, 'triangle', 0.12, 0.25, 0, -4, 0.02, 880);
      tone(349.23, 0.4, 'triangle', 0.14, 0.5, 0, -2, 0.02, 698.46);
      tone(261.63, 0.6, 'sine', 0.08, 0.75, 0, 0, 0.03, 523.25);
    } catch { /* ok */ }
  },

  /** Victory — full triumphant fanfare with chord */
  victory(): void {
    try {
      // Rising fanfare
      tone(523.25, 0.1, 'triangle', 0.1, 0, 0, 3, 0.02, 1046.5);
      tone(659.25, 0.1, 'triangle', 0.1, 0.1, 0, 3, 0.02, 1318.5);
      tone(783.99, 0.1, 'triangle', 0.1, 0.2, 0, 3, 0.02, 1568);
      tone(1046.5, 0.12, 'triangle', 0.12, 0.3, 0, 0, 0.02, 2093);
      // Final major chord sustained
      tone(1046.5, 0.6, 'sine', 0.08, 0.45, 0, -2, 0.02, 2093);
      tone(1318.5, 0.6, 'sine', 0.06, 0.45, 0, 3, 0.015, 2637);
      tone(1568, 0.6, 'sine', 0.06, 0.45, 0, -5, 0.01, 3136);
      tone(2093, 0.5, 'sine', 0.03, 0.47, 0, 7, 0, 0);
    } catch { /* ok */ }
  },

  // ==================== COMPATIBILITY ALIASES ====================

  hover(): void { tone(700, 0.02, 'sine', 0.03); },
  coinEarn(): void { this.moneyIn(); },
  coinSpend(): void { this.moneyOut(); },
  loanApproved(): void { this.purchase(); },
  bankruptcy(): void { this.gameOver(); },
  studentEnroll(): void { this.enrollment(); },
  studentLeave(): void { this.eventNegative(); },
  examPassed(): void { this.success(); },
  examFailed(): void { this.error(); },
  graduation(): void { this.levelUp(); },
  teacherHired(): void { this.teacherHire(); },
  teacherFired(): void { this.error(); },
  teacherRaise(): void { this.promotion(); },
  teacherResign(): void { this.eventNegative(); },
  inspection(): void { this.warning(); },
  buildComplete(): void { this.construction(); },
  renovate(): void { this.construction(); },
  demolish(): void { this.naturalDisaster(); },
  expand(): void { this.construction(); },
  achievement(): void { this.celebration(); },
  whoosh(): void { this.menuOpen(); },
  pop(): void { this.click(); },
};

// Auto-init on first interaction
if (typeof window !== 'undefined') {
  const handler = () => {
    sounds.init();
    document.removeEventListener('click', handler);
    document.removeEventListener('touchstart', handler);
    document.removeEventListener('keydown', handler);
  };
  document.addEventListener('click', handler);
  document.addEventListener('touchstart', handler);
  document.addEventListener('keydown', handler);
}
