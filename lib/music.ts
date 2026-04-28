// ============================================
// SCHOOL TYCOON - Premium Music Engine v2
// Rich layered procedural music with multiple
// oscillator types, detuning, filter sweeps,
// and evolving patterns. Warm cinematic sound.
// ============================================

export type TrackName = 'menu' | 'ambient' | 'active' | 'tension' | 'celebration';

interface TrackInstance {
  name: TrackName;
  gainNode: GainNode;
  active: boolean;
  cleanup: () => void;
}

interface NoteDef {
  midi: number;
  duration: number;
  velocity?: number; // 0-1, per-note volume
}

interface ChordBlock {
  notes: number[];
  beats: number;
}

interface Layer {
  notes: NoteDef[];
  type: OscillatorType;
  volume: number;
  detune: number;       // cents, for thickness
  filterFreq?: number;  // Hz, 0 = bypass
  filterQ?: number;
  delay?: number;       // delay in beats before this layer starts
}

interface TrackData {
  layers: Layer[];
  chords: ChordBlock[];
  bass: NoteDef[];
  tempo: number;
  bassVol: number;
  chordVol: number;
}

// --- Audio State ---

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let currentTrack: TrackInstance | null = null;
let volume = 0.015;
let muted = false;
let initialized = false;

function getContext(): AudioContext {
  if (!ctx) {
    const Ctor = window.AudioContext || (window as any).webkitAudioContext;
    ctx = new Ctor();

    // Master limiter/compressor
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -24;
    limiter.knee.value = 3;
    limiter.ratio.value = 8;
    limiter.attack.value = 0.005;
    limiter.release.value = 0.2;
    limiter.connect(ctx.destination);

    // Warm shelving filter — cuts harsh highs, boosts warmth
    const warmth = ctx.createBiquadFilter();
    warmth.type = 'lowshelf';
    warmth.frequency.value = 300;
    warmth.gain.value = 3;
    warmth.connect(limiter);

    // Presence/high-end air
    const air = ctx.createBiquadFilter();
    air.type = 'highshelf';
    air.frequency.value = 6000;
    air.gain.value = -4;
    air.connect(warmth);

    masterGain = ctx.createGain();
    masterGain.gain.value = muted ? 0 : volume;
    masterGain.connect(air);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// --- MIDI to Frequency ---

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// --- Rich Note Player with ADSR + Filter ---

function playNote(
  c: AudioContext,
  dest: AudioNode,
  freq: number,
  startTime: number,
  duration: number,
  vol: number,
  type: OscillatorType,
  detune: number = 0,
  filterFreq: number = 0,
  filterQ: number = 1,
): void {
  const osc = c.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  osc.detune.setValueAtTime(detune, startTime);

  const gain = c.createGain();
  const attack = Math.min(0.06, duration * 0.2);
  const decay = Math.min(0.1, duration * 0.15);
  const sustain = vol * 0.7;
  const release = Math.min(0.15, duration * 0.3);
  const totalEnvTime = attack + decay + release;

  gain.gain.setValueAtTime(0.001, startTime);
  gain.gain.linearRampToValueAtTime(vol, startTime + attack);
  gain.gain.linearRampToValueAtTime(sustain, startTime + attack + decay);
  gain.gain.setValueAtTime(sustain, startTime + duration - release);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  // Optional filter for tonal shaping
  if (filterFreq > 0) {
    const filter = c.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(filterFreq, startTime);
    filter.Q.value = filterQ;
    // Slight filter sweep for movement
    filter.frequency.linearRampToValueAtTime(
      filterFreq * 1.3,
      startTime + duration,
    );
    osc.connect(filter);
    filter.connect(gain);
  } else {
    osc.connect(gain);
  }

  gain.connect(dest);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

// --- Layered Loop Scheduler ---

function startLayeredLoop(
  c: AudioContext,
  dest: AudioNode,
  layers: Layer[],
  chords: ChordBlock[],
  bass: NoteDef[],
  tempo: number,
  bassVol: number,
  chordVol: number,
): () => void {
  let stopped = false;
  let timeouts: ReturnType<typeof setTimeout>[] = [];
  let nextStart = c.currentTime + 0.1;
  const spb = 60 / tempo;

  function scheduleAll() {
    if (stopped) return;

    // 1. Melody layers
    for (const layer of layers) {
      const layerDelay = (layer.delay || 0) * spb;
      let beatOffset = layerDelay;

      for (const note of layer.notes) {
        if (note.midi > 0 && !stopped) {
          const t = nextStart + beatOffset;
          const d = note.duration * spb;
          playNote(
            c, dest,
            midiToFreq(note.midi), t, d,
            layer.volume * (note.velocity || 1),
            layer.type, layer.detune,
            layer.filterFreq || 0,
            layer.filterQ || 1,
          );
        }
        beatOffset += note.duration;
      }
    }

    // 2. Bass line
    let bassOffset = 0;
    for (const note of bass) {
      if (note.midi > 0 && !stopped) {
        const t = nextStart + bassOffset * spb;
        const d = note.duration * spb;
        playNote(c, dest, midiToFreq(note.midi), t, d, bassVol, 'sine', -5);
      }
      bassOffset += note.duration;
    }

    // 3. Chord pads
    let chordOffset = 0;
    for (const chord of chords) {
      if (!stopped) {
        const t = nextStart + chordOffset * spb;
        const d = chord.beats * spb;
        for (const midi of chord.notes) {
          playNote(c, dest, midiToFreq(midi), t, d, chordVol, 'triangle', 3, 1200, 0.8);
        }
      }
      chordOffset += chord.beats;
    }

    // Calculate loop length (max of all layers)
    let maxBeats = 0;
    for (const layer of layers) {
      let b = layer.delay || 0;
      for (const note of layer.notes) b += note.duration;
      if (b > maxBeats) maxBeats = b;
    }
    let bb = 0;
    for (const note of bass) bb += note.duration;
    if (bb > maxBeats) maxBeats = bb;
    let cb = 0;
    for (const chord of chords) cb += chord.beats;
    if (cb > maxBeats) maxBeats = cb;

    const loopSec = maxBeats * spb;
    nextStart += loopSec;

    const ms = Math.max((loopSec - 0.4) * 1000, 50);
    const tid = setTimeout(scheduleAll, ms);
    timeouts.push(tid);
  }

  scheduleAll();

  return () => {
    stopped = true;
    timeouts.forEach(clearTimeout);
    timeouts = [];
  };
}

// ============================================
// TRACK DATA — Rich layered compositions
// ============================================
//
// MIDI reference:
//   C3=48, D3=50, E3=52, F3=53, G3=55, A3=57, Bb3=58, B3=59
//   C4=60, D4=62, E4=64, F4=65, G4=67, A4=69, Bb4=70, B4=71
//   C5=72, D5=74, E5=76, F5=77, G5=79, A5=81, Bb5=82, B5=83
//   C6=84, D6=86

// --- Menu: Warm, welcoming ambient loop. 75 BPM ---

const MENU_DATA: TrackData = {
  tempo: 75,
  bassVol: 0.18,
  chordVol: 0.07,
  layers: [
    // Lead melody — warm triangle
    {
      notes: [
        { midi: 72, duration: 1.5 },  { midi: 0, duration: 0.5 },
        { midi: 76, duration: 1 },    { midi: 79, duration: 1.5 },
        { midi: 0, duration: 0.5 },   { midi: 77, duration: 1 },
        { midi: 74, duration: 2 },
        { midi: 72, duration: 1 },    { midi: 71, duration: 1 },
        { midi: 72, duration: 2 },
        { midi: 74, duration: 1 },    { midi: 76, duration: 1 },
        { midi: 79, duration: 1.5 },  { midi: 81, duration: 1.5 },
        { midi: 79, duration: 1 },    { midi: 76, duration: 1 },
        { midi: 74, duration: 2 },
      ],
      type: 'triangle',
      volume: 0.3,
      detune: 4,
      filterFreq: 3000,
      filterQ: 0.5,
    },
    // Sparkle layer — high sine arpeggios (delayed start for stagger)
    {
      notes: [
        { midi: 0, duration: 2 },
        { midi: 84, duration: 0.5 },  { midi: 0, duration: 0.5 },
        { midi: 86, duration: 0.5 },  { midi: 0, duration: 0.5 },
        { midi: 84, duration: 0.5 },  { midi: 0, duration: 0.5 },
        { midi: 81, duration: 1 },
        { midi: 79, duration: 0.5 },  { midi: 0, duration: 0.5 },
        { midi: 77, duration: 0.5 },  { midi: 0, duration: 0.5 },
        { midi: 79, duration: 1 },
      ],
      type: 'sine',
      volume: 0.1,
      detune: -7,
      delay: 4,
      filterFreq: 4000,
      filterQ: 0.3,
    },
  ],
  bass: [
    { midi: 48, duration: 4 },  // C3
    { midi: 53, duration: 4 },  // F3
    { midi: 55, duration: 4 },  // G3
    { midi: 48, duration: 4 },  // C3
  ],
  chords: [
    { notes: [60, 64, 67], beats: 4 },  // C
    { notes: [65, 69, 72], beats: 4 },  // F
    { notes: [67, 71, 74], beats: 4 },  // G
    { notes: [60, 64, 67], beats: 4 },  // C
  ],
};

// --- Ambient: Dreamy, spacious. 55 BPM ---

const AMBIENT_DATA: TrackData = {
  tempo: 55,
  bassVol: 0.15,
  chordVol: 0.06,
  layers: [
    // Slow ethereal melody
    {
      notes: [
        { midi: 67, duration: 3 },   { midi: 0, duration: 1 },
        { midi: 71, duration: 2 },   { midi: 74, duration: 4 },
        { midi: 0, duration: 1 },    { midi: 72, duration: 2 },
        { midi: 69, duration: 4 },
        { midi: 67, duration: 3 },   { midi: 65, duration: 1 },
        { midi: 64, duration: 2 },   { midi: 0, duration: 2 },
      ],
      type: 'sine',
      volume: 0.25,
      detune: 6,
      filterFreq: 2500,
      filterQ: 0.4,
    },
    // Ambient pad texture — long sustained notes
    {
      notes: [
        { midi: 55, duration: 8 },   // G3
        { midi: 62, duration: 8 },   // D4
        { midi: 59, duration: 8 },   // B3
        { midi: 55, duration: 8 },   // G3
      ],
      type: 'triangle',
      volume: 0.08,
      detune: 12,
      filterFreq: 800,
      filterQ: 0.6,
    },
  ],
  bass: [
    { midi: 43, duration: 8 },  // G2
    { midi: 50, duration: 8 },  // D3
    { midi: 47, duration: 8 },  // B2
    { midi: 43, duration: 8 },  // G2
  ],
  chords: [
    { notes: [55, 59, 62], beats: 8 },  // G
    { notes: [50, 54, 57], beats: 8 },  // D
    { notes: [47, 51, 55], beats: 8 },  // Bm/G
    { notes: [55, 59, 62], beats: 8 },  // G
  ],
};

// --- Active: Energetic, driving. 95 BPM ---

const ACTIVE_DATA: TrackData = {
  tempo: 95,
  bassVol: 0.2,
  chordVol: 0.09,
  layers: [
    // Driving lead
    {
      notes: [
        { midi: 72, duration: 0.5 }, { midi: 76, duration: 0.5 },
        { midi: 79, duration: 1 },   { midi: 84, duration: 0.5 },
        { midi: 83, duration: 0.5 }, { midi: 79, duration: 1 },
        { midi: 76, duration: 0.5 }, { midi: 74, duration: 0.5 },
        { midi: 72, duration: 1 },
        { midi: 74, duration: 0.5 }, { midi: 76, duration: 0.5 },
        { midi: 79, duration: 0.5 }, { midi: 81, duration: 0.5 },
        { midi: 79, duration: 0.5 }, { midi: 76, duration: 0.5 },
        { midi: 72, duration: 1 },   { midi: 71, duration: 0.5 },
        { midi: 72, duration: 0.5 },
      ],
      type: 'triangle',
      volume: 0.3,
      detune: -3,
      filterFreq: 3500,
      filterQ: 0.5,
    },
    // Rhythm counter-melody
    {
      notes: [
        { midi: 60, duration: 1 },   { midi: 0, duration: 1 },
        { midi: 64, duration: 0.5 }, { midi: 67, duration: 0.5 },
        { midi: 0, duration: 1 },    { midi: 65, duration: 1 },
        { midi: 0, duration: 1 },    { midi: 62, duration: 1 },
        { midi: 60, duration: 0.5 }, { midi: 0, duration: 0.5 },
        { midi: 67, duration: 0.5 }, { midi: 0, duration: 0.5 },
        { midi: 65, duration: 0.5 }, { midi: 64, duration: 0.5 },
        { midi: 62, duration: 1 },   { midi: 0, duration: 1 },
      ],
      type: 'sine',
      volume: 0.12,
      detune: 8,
      filterFreq: 2000,
      filterQ: 0.7,
      delay: 2,
    },
  ],
  bass: [
    { midi: 48, duration: 2 },  { midi: 0, duration: 2 },
    { midi: 53, duration: 2 },  { midi: 48, duration: 2 },
    { midi: 55, duration: 2 },  { midi: 0, duration: 2 },
    { midi: 53, duration: 2 },  { midi: 48, duration: 2 },
  ],
  chords: [
    { notes: [60, 64, 67], beats: 4 },
    { notes: [65, 69, 72], beats: 4 },
    { notes: [67, 71, 74], beats: 4 },
    { notes: [60, 64, 67], beats: 4 },
  ],
};

// --- Tension: Mysterious, slightly dark. 65 BPM ---

const TENSION_DATA: TrackData = {
  tempo: 65,
  bassVol: 0.22,
  chordVol: 0.08,
  layers: [
    // Slow descending melody
    {
      notes: [
        { midi: 69, duration: 2 },   { midi: 0, duration: 1 },
        { midi: 72, duration: 2 },   { midi: 76, duration: 2 },
        { midi: 74, duration: 1 },   { midi: 72, duration: 1 },
        { midi: 69, duration: 2 },   { midi: 0, duration: 1 },
        { midi: 67, duration: 2 },   { midi: 0, duration: 1 },
        { midi: 65, duration: 1.5 }, { midi: 64, duration: 0.5 },
        { midi: 62, duration: 2 },
      ],
      type: 'sawtooth',
      volume: 0.12,
      detune: -5,
      filterFreq: 1500,
      filterQ: 1.2,
    },
    // Ominous counter
    {
      notes: [
        { midi: 57, duration: 4 },   { midi: 0, duration: 4 },
        { midi: 52, duration: 4 },   { midi: 0, duration: 4 },
        { midi: 55, duration: 4 },   { midi: 0, duration: 4 },
        { midi: 52, duration: 4 },   { midi: 0, duration: 4 },
      ],
      type: 'triangle',
      volume: 0.1,
      detune: 10,
      filterFreq: 900,
      filterQ: 0.8,
      delay: 4,
    },
  ],
  bass: [
    { midi: 45, duration: 4 },  { midi: 0, duration: 4 },
    { midi: 40, duration: 4 },  { midi: 0, duration: 4 },
    { midi: 43, duration: 4 },  { midi: 0, duration: 4 },
    { midi: 40, duration: 4 },  { midi: 0, duration: 4 },
  ],
  chords: [
    { notes: [57, 60, 64], beats: 8 },  // Am
    { notes: [52, 55, 59], beats: 8 },  // Em
  ],
};

// --- Celebration: Joyful, triumphant. 105 BPM ---

const CELEBRATION_DATA: TrackData = {
  tempo: 105,
  bassVol: 0.2,
  chordVol: 0.1,
  layers: [
    // Triumphant lead arpeggio
    {
      notes: [
        { midi: 77, duration: 0.5 }, { midi: 81, duration: 0.5 },
        { midi: 84, duration: 1 },   { midi: 81, duration: 0.5 },
        { midi: 77, duration: 0.5 }, { midi: 79, duration: 0.5 },
        { midi: 81, duration: 0.5 }, { midi: 77, duration: 1 },
        { midi: 72, duration: 0.5 }, { midi: 77, duration: 0.5 },
        { midi: 81, duration: 0.5 }, { midi: 84, duration: 1 },
        { midi: 86, duration: 0.5 }, { midi: 84, duration: 0.5 },
        { midi: 81, duration: 1 },   { midi: 77, duration: 1 },
      ],
      type: 'triangle',
      volume: 0.35,
      detune: 3,
      filterFreq: 4000,
      filterQ: 0.4,
    },
    // Sparkle celebration layer
    {
      notes: [
        { midi: 93, duration: 0.25, velocity: 0.6 }, { midi: 0, duration: 0.25 },
        { midi: 89, duration: 0.25, velocity: 0.6 }, { midi: 0, duration: 0.25 },
        { midi: 93, duration: 0.25, velocity: 0.6 }, { midi: 0, duration: 0.25 },
        { midi: 96, duration: 0.5, velocity: 0.6 },  { midi: 0, duration: 0.5 },
        { midi: 89, duration: 0.25, velocity: 0.6 }, { midi: 0, duration: 0.25 },
        { midi: 91, duration: 0.25, velocity: 0.6 }, { midi: 0, duration: 0.25 },
        { midi: 89, duration: 0.5, velocity: 0.6 },  { midi: 0, duration: 0.5 },
        { midi: 96, duration: 0.25, velocity: 0.6 }, { midi: 0, duration: 0.25 },
        { midi: 93, duration: 0.5, velocity: 0.6 },  { midi: 0, duration: 0.5 },
      ],
      type: 'sine',
      volume: 0.08,
      detune: -10,
      filterFreq: 5000,
      filterQ: 0.3,
      delay: 2,
    },
  ],
  bass: [
    { midi: 53, duration: 2 },  { midi: 0, duration: 2 },
    { midi: 53, duration: 2 },  { midi: 48, duration: 2 },
    { midi: 58, duration: 2 },  { midi: 0, duration: 2 },
    { midi: 55, duration: 2 },  { midi: 53, duration: 2 },
  ],
  chords: [
    { notes: [65, 69, 72], beats: 4 },  // F
    { notes: [70, 74, 77], beats: 4 },  // Bb
    { notes: [72, 76, 79], beats: 4 },  // C
    { notes: [65, 69, 72], beats: 4 },  // F
  ],
};

const TRACK_DATA: Record<TrackName, TrackData> = {
  menu: MENU_DATA,
  ambient: AMBIENT_DATA,
  active: ACTIVE_DATA,
  tension: TENSION_DATA,
  celebration: CELEBRATION_DATA,
};

// --- Create a Track Instance ---

function createTrack(name: TrackName): TrackInstance {
  const c = getContext();
  if (!masterGain) throw new Error('Audio not initialized');
  const data = TRACK_DATA[name];

  const trackGain = c.createGain();
  trackGain.gain.value = 0; // fade in
  trackGain.connect(masterGain);

  const cleanup = startLayeredLoop(
    c, trackGain,
    data.layers, data.chords, data.bass,
    data.tempo, data.bassVol, data.chordVol,
  );

  return { name, gainNode: trackGain, active: true, cleanup };
}

function stopCurrentTrack(fadeMs: number = 800): void {
  if (!currentTrack) return;
  try {
    const now = ctx ? ctx.currentTime : 0;
    const track = currentTrack;
    track.active = false;
    track.gainNode.gain.cancelScheduledValues(now);
    track.gainNode.gain.setValueAtTime(track.gainNode.gain.value, now);
    track.gainNode.gain.linearRampToValueAtTime(0, now + fadeMs / 1000);
    setTimeout(() => {
      try { track.cleanup(); } catch { /* ok */ }
    }, fadeMs + 100);
  } catch { /* ok */ }
  currentTrack = null;
}

// ============================================
// PUBLIC API
// ============================================

export const music = {
  init(): void {
    if (initialized) return;
    initialized = true;
    getContext();
  },

  play(track: TrackName): void {
    if (!initialized) this.init();
    if (currentTrack?.name === track && currentTrack.active) return;

    stopCurrentTrack(500);

    const c = getContext();
    if (!masterGain) return;

    currentTrack = createTrack(track);

    try {
      const now = c.currentTime;
      currentTrack.gainNode.gain.setValueAtTime(0, now);
      currentTrack.gainNode.gain.linearRampToValueAtTime(muted ? 0 : 1, now + 2.5);
    } catch { /* ok */ }
  },

  stop(): void {
    stopCurrentTrack(500);
  },

  fadeIn(ms?: number): void {
    if (!currentTrack || !ctx) return;
    try {
      const now = ctx.currentTime;
      currentTrack.gainNode.gain.cancelScheduledValues(now);
      currentTrack.gainNode.gain.setValueAtTime(currentTrack.gainNode.gain.value, now);
      currentTrack.gainNode.gain.linearRampToValueAtTime(muted ? 0 : 1, now + (ms || 1000) / 1000);
    } catch { /* ok */ }
  },

  fadeOut(ms?: number): void {
    if (!currentTrack || !ctx) return;
    try {
      const now = ctx.currentTime;
      currentTrack.gainNode.gain.cancelScheduledValues(now);
      currentTrack.gainNode.gain.setValueAtTime(currentTrack.gainNode.gain.value, now);
      currentTrack.gainNode.gain.linearRampToValueAtTime(0, now + (ms || 600) / 1000);
    } catch { /* ok */ }
  },

  setVolume(v: number): void {
    const clamped = Math.max(0, Math.min(1, v));
    volume = 0.003 + clamped * 0.025;
    if (masterGain && !muted) {
      masterGain.gain.value = volume;
    }
  },

  setMuted(m: boolean): void {
    muted = m;
    if (masterGain) {
      masterGain.gain.value = m ? 0 : volume;
    }
  },

  getMuted(): boolean {
    return muted;
  },
};
