'use client';
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';

interface MiniGamesTabProps {
  sounds: { click: () => void; success: () => void; error: () => void };
  onEarnMoney?: (amount: number) => void;
}

type GameType = 'math' | 'trivia' | 'scramble' | 'memory' | null;
type Difficulty = 'easy' | 'medium' | 'hard';

interface MathQ {
  q: string;
  a: string;
  options: string[];
  difficulty: Difficulty;
}

interface TriviaQ {
  q: string;
  a: string;
  options: string[];
  category: string;
}

interface ScrambleWord {
  scrambled: string;
  answer: string;
  hint: string;
}

// ── Question banks ──────────────────────────────────────────────

const MATH_QUESTIONS: MathQ[] = [
  // Easy (5)
  { q: '3 + 5 = ?', a: '8', options: ['6', '8', '10', '7'], difficulty: 'easy' },
  { q: '12 - 7 = ?', a: '5', options: ['4', '6', '5', '3'], difficulty: 'easy' },
  { q: '9 + 6 = ?', a: '15', options: ['13', '15', '14', '16'], difficulty: 'easy' },
  { q: '20 - 8 = ?', a: '12', options: ['11', '13', '12', '10'], difficulty: 'easy' },
  { q: '7 + 9 = ?', a: '16', options: ['15', '17', '14', '16'], difficulty: 'easy' },
  // Medium (5)
  { q: '12 × 8 = ?', a: '96', options: ['94', '96', '98', '100'], difficulty: 'medium' },
  { q: '25 × 4 = ?', a: '100', options: ['90', '95', '100', '105'], difficulty: 'medium' },
  { q: '56 + 89 = ?', a: '145', options: ['135', '140', '145', '150'], difficulty: 'medium' },
  { q: '144 ÷ 12 = ?', a: '12', options: ['10', '11', '12', '13'], difficulty: 'medium' },
  { q: '√169 = ?', a: '13', options: ['11', '12', '13', '14'], difficulty: 'medium' },
  // Hard (5)
  { q: '15% de 200 = ?', a: '30', options: ['25', '30', '35', '20'], difficulty: 'hard' },
  { q: '234 ÷ 9 = ?', a: '26', options: ['24', '26', '28', '25'], difficulty: 'hard' },
  { q: '7³ = ?', a: '343', options: ['243', '343', '443', '334'], difficulty: 'hard' },
  { q: '¿Cual es 3/8 de 96?', a: '36', options: ['32', '36', '38', '34'], difficulty: 'hard' },
  { q: '45² - 20² = ?', a: '1625', options: ['1525', '1625', '1725', '1825'], difficulty: 'hard' },
];

const TRIVIA_QUESTIONS: TriviaQ[] = [
  { q: 'Capital de Francia?', a: 'Paris', options: ['Londres', 'Paris', 'Madrid', 'Roma'], category: 'Geografía' },
  { q: 'Planeta mas grande del sistema solar?', a: 'Jupiter', options: ['Saturno', 'Jupiter', 'Urano', 'Neptuno'], category: 'Ciencia' },
  { q: 'H2O es químicamente...?', a: 'Agua', options: ['Oxigeno', 'Agua', 'Hidrogeno', 'Carbono'], category: 'Ciencia' },
  { q: 'Autor de Cien Anos de Soledad?', a: 'Garcia Marquez', options: ['Borges', 'Neruda', 'Garcia Marquez', 'Allende'], category: 'Literatura' },
  { q: 'Cuanto es PI (3 decimales)?', a: '3.141', options: ['3.142', '3.141', '3.140', '3.139'], category: 'Matemáticas' },
  { q: 'Rio mas largo del mundo?', a: 'Nilo', options: ['Amazonas', 'Nilo', 'Misisipi', 'Yangtse'], category: 'Geografía' },
  { q: 'Quien pinto la Mona Lisa?', a: 'Da Vinci', options: ['Miguel Angel', 'Da Vinci', 'Rafael', 'Picasso'], category: 'Historia' },
  { q: 'Cuanto es 15% de 300?', a: '45', options: ['35', '40', '45', '50'], category: 'Matemáticas' },
  { q: 'Gas que respiramos?', a: 'Oxigeno', options: ['Nitrogeno', 'Oxigeno', 'CO2', 'Helio'], category: 'Ciencia' },
  { q: 'Continente mas grande?', a: 'Asia', options: ['Africa', 'Europa', 'Asia', 'America'], category: 'Geografía' },
  { q: 'En que ano llego Cristobal Colon a America?', a: '1492', options: ['1492', '1500', '1488', '1510'], category: 'Historia' },
  { q: 'Sistema solar tiene cuantos planetas?', a: '8', options: ['7', '8', '9', '10'], category: 'Ciencia' },
  { q: 'Moneda de Japon?', a: 'Yen', options: ['Yuan', 'Won', 'Yen', 'Rublo'], category: 'Geografía' },
  { q: 'Quien escribio Don Quijote?', a: 'Cervantes', options: ['Cervantes', 'Quevedo', 'Lope de Vega', 'Gongora'], category: 'Literatura' },
  { q: 'Organo del cuerpo que bombea sangre?', a: 'Corazon', options: ['Pulmon', 'Higado', 'Corazon', 'Cerebro'], category: 'Ciencia' },
];

const SCRAMBLE_WORDS: ScrambleWord[] = [
  { scrambled: 'ACLAES', answer: 'escuela', hint: 'Lugar donde aprendes' },
  { scrambled: 'ORAFEB', answer: 'forbidden', hint: 'No permitido (en ingles)' },
  { scrambled: 'ROBARTA', answer: 'tablero', hint: 'Donde escribe el profesor' },
  { scrambled: 'EBRIOET', answer: 'libreta', hint: 'Para tomar apuntes' },
  { scrambled: 'ACULC', answer: 'calculadora', hint: 'Para hacer matematicas' },
  { scrambled: 'LOEGRA', answer: 'globo', hint: 'Objeto esferico de latex' },
  { scrambled: 'IRCNOC', answer: 'cronica', hint: 'Relato de eventos' },
  { scrambled: 'AVELTO', answer: 'tovalla', hint: 'Para secarte las manos' },
  { scrambled: 'LENGUAJ', answer: 'lenguaje', hint: 'Sistema de comunicacion' },
  { scrambled: 'EREGNI', answer: 'regnine', hint: 'Nombre propio inventado' },
];

const MEMORY_EMOJI_POOL = [
  '🍎', '🍌', '🍊', '🍇', '🍓', '🍒', '🥝', '🍑',
  '🐶', '🐱', '🐰', '🦊', '🐻', '🐼', '🐨', '🦁',
  '🌟', '⭐', '🌙', '☀️', '🌈', '🔥', '💧', '❄️',
  '⚽', '🏀', '🎨', '🎵', '📚', '✏️', '🎒', '🏫',
];

// ── Helpers ─────────────────────────────────────────────────────

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateMemoryRound(round: number) {
  const seqLen = Math.min(3 + Math.floor(round / 2), 6);
  const pool = shuffleArray(MEMORY_EMOJI_POOL);
  const sequence = pool.slice(0, seqLen);

  // Build a grid of options: sequence + distractors (total = 12 or min seqLen*2)
  const gridSize = Math.max(seqLen * 2, 12);
  const distractors = pool.slice(seqLen, gridSize);
  const grid = shuffleArray([...sequence, ...distractors]);

  return { sequence, grid, seqLen };
}

// ── Difficulty badge ────────────────────────────────────────────

function DiffBadge({ diff }: { diff: Difficulty }) {
  const colors: Record<Difficulty, string> = {
    easy: 'text-[#00ff88] border-[#00ff88]/40 bg-[#00ff88]/10',
    medium: 'text-[#ffcc00] border-[#ffcc00]/40 bg-[#ffcc00]/10',
    hard: 'text-[#ff4444] border-[#ff4444]/40 bg-[#ff4444]/10',
  };
  const labels: Record<Difficulty, string> = { easy: 'Facil', medium: 'Medio', hard: 'Dificil' };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${colors[diff]}`}>{labels[diff]}</span>
  );
}

// ── Category badge ──────────────────────────────────────────────

function CatBadge({ cat }: { cat: string }) {
  return (
    <span className="text-[10px] px-2 py-0.5 rounded-full border border-[#00ccff]/40 text-[#00ccff] bg-[#00ccff]/10">{cat}</span>
  );
}

// ── Score row ───────────────────────────────────────────────────

function ScoreRow({ correct, total, earnings }: { correct: number; total: number; earnings: number }) {
  return (
    <div className="flex items-center justify-between text-xs text-[#aaaaaa] mb-1">
      <span>✅ {correct}/{total}</span>
      <span className="text-[#00ff88]">💰 ${earnings}</span>
    </div>
  );
}

// ── Results screen ──────────────────────────────────────────────

function ResultsScreen({
  title,
  emoji,
  correct,
  total,
  earnings,
  onPlayAgain,
  onBack,
}: {
  title: string;
  emoji: string;
  correct: number;
  total: number;
  earnings: number;
  onPlayAgain: () => void;
  onBack: () => void;
}) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const grade = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 60 ? 'C' : pct >= 50 ? 'D' : 'F';
  const gradeColor = pct >= 70 ? 'text-[#00ff88]' : pct >= 50 ? 'text-[#ffcc00]' : 'text-[#ff4444]';

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-xs text-[#aaaaaa] hover:text-white transition-colors">← Volver al menu</button>
      <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-6 text-center space-y-4">
        <div className="text-4xl">{emoji}</div>
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <div className="flex justify-center gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{correct}/{total}</div>
            <div className="text-xs text-[#aaaaaa]">Correctas</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{pct}%</div>
            <div className="text-xs text-[#aaaaaa]">Precision</div>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold ${gradeColor}`}>{grade}</div>
            <div className="text-xs text-[#aaaaaa]">Calificacion</div>
          </div>
        </div>
        <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-3 inline-block">
          <span className="text-xs text-[#aaaaaa]">Ganancias totales:</span>{' '}
          <span className="text-xl font-bold text-[#00ff88]">${earnings}</span>
        </div>
        <div className="flex gap-3 justify-center pt-2">
          <button
            onClick={onPlayAgain}
            className="bg-[#00ff88]/20 border border-[#00ff88]/50 rounded-lg px-5 py-2.5 text-sm font-bold text-[#00ff88] hover:bg-[#00ff88]/30 transition-all"
          >
            🔄 Jugar de nuevo
          </button>
          <button
            onClick={onBack}
            className="bg-[#1a1a1a] border border-[#333] rounded-lg px-5 py-2.5 text-sm text-[#aaaaaa] hover:bg-[#252525] hover:text-white transition-all"
          >
            Menu
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Math Quiz Game ──────────────────────────────────────────────

function MathQuizGame({
  sounds,
  onEarnMoney,
  onBack,
}: {
  sounds: MiniGamesTabProps['sounds'];
  onEarnMoney?: (amount: number) => void;
  onBack: () => void;
}) {
  const [qIndex, setQIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [earnings, setEarnings] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  const questions = useMemo(() => shuffleArray(MATH_QUESTIONS), []);
  const current = questions[qIndex];
  const total = questions.length;

  const rewardMap: Record<Difficulty, number> = { easy: 50, medium: 100, hard: 200 };

  const handleAnswer = useCallback((opt: string) => {
    if (selected !== null) return;
    sounds.click();
    setSelected(opt);

    const isCorrect = opt === current.a;
    if (isCorrect) {
      const reward = rewardMap[current.difficulty];
      setCorrect(c => c + 1);
      setEarnings(e => e + reward);
      sounds.success();
      onEarnMoney?.(reward);
    } else {
      sounds.error();
    }

    setTimeout(() => {
      if (qIndex + 1 >= total) {
        setFinished(true);
      } else {
        setQIndex(i => i + 1);
        setSelected(null);
      }
    }, 600);
  }, [selected, current, sounds, onEarnMoney, qIndex, total]);

  if (finished) {
    return (
      <ResultsScreen
        title="Quiz Matematico"
        emoji="🧮"
        correct={correct}
        total={total}
        earnings={earnings}
        onPlayAgain={() => { setQIndex(0); setCorrect(0); setEarnings(0); setSelected(null); setFinished(false); }}
        onBack={onBack}
      />
    );
  }

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-xs text-[#aaaaaa] hover:text-white transition-colors">← Volver al menu</button>
      <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm text-[#ffcc00] font-bold">🧮 Quiz Matematico</h3>
          <DiffBadge diff={current.difficulty} />
        </div>
        <ScoreRow correct={correct} total={qIndex} earnings={earnings} />
        {/* Progress bar */}
        <div className="w-full h-1 bg-[#1a1a1a] rounded-full mb-4 overflow-hidden">
          <div className="h-full bg-[#00ff88] transition-all duration-300" style={{ width: `${((qIndex) / total) * 100}%` }} />
        </div>
        <div className="text-center py-6">
          <div className="text-xs text-[#666] mb-2">Pregunta {qIndex + 1} de {total}</div>
          <div className="text-2xl font-bold text-white mb-6">{current.q}</div>
          <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto">
            {current.options.map(opt => {
              let btnClass = 'bg-[#1a1a1a] border-[#333] hover:bg-[#252525] hover:border-[#00ff88]/50';
              if (selected) {
                if (opt === current.a) btnClass = 'bg-[#00ff88]/20 border-[#00ff88]/70';
                else if (opt === selected) btnClass = 'bg-[#ff4444]/20 border-[#ff4444]/70';
                else btnClass = 'bg-[#1a1a1a] border-[#222] opacity-50';
              }
              return (
                <button
                  key={opt}
                  onClick={() => handleAnswer(opt)}
                  disabled={selected !== null}
                  className={`border rounded-lg px-4 py-3 text-sm text-white transition-all ${btnClass}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {selected && (
            <div className={`mt-4 text-sm font-bold ${selected === current.a ? 'text-[#00ff88]' : 'text-[#ff4444]'}`}>
              {selected === current.a ? '✓ Correcto!' : `✗ Incorrecto. Respuesta: ${current.a}`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Trivia Quiz Game ────────────────────────────────────────────

function TriviaQuizGame({
  sounds,
  onEarnMoney,
  onBack,
}: {
  sounds: MiniGamesTabProps['sounds'];
  onEarnMoney?: (amount: number) => void;
  onBack: () => void;
}) {
  const [qIndex, setQIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [earnings, setEarnings] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  const questions = useMemo(() => shuffleArray(TRIVIA_QUESTIONS), []);
  const current = questions[qIndex];
  const total = questions.length;

  const handleAnswer = useCallback((opt: string) => {
    if (selected !== null) return;
    sounds.click();
    setSelected(opt);

    const isCorrect = opt === current.a;
    const reward = isCorrect ? 75 : 0;
    if (isCorrect) {
      setCorrect(c => c + 1);
      setEarnings(e => e + reward);
      sounds.success();
      onEarnMoney?.(reward);
    } else {
      sounds.error();
    }

    setTimeout(() => {
      if (qIndex + 1 >= total) {
        setFinished(true);
      } else {
        setQIndex(i => i + 1);
        setSelected(null);
      }
    }, 600);
  }, [selected, current, sounds, onEarnMoney, qIndex, total]);

  if (finished) {
    return (
      <ResultsScreen
        title="Trivia Cultural"
        emoji="🧠"
        correct={correct}
        total={total}
        earnings={earnings}
        onPlayAgain={() => { setQIndex(0); setCorrect(0); setEarnings(0); setSelected(null); setFinished(false); }}
        onBack={onBack}
      />
    );
  }

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-xs text-[#aaaaaa] hover:text-white transition-colors">← Volver al menu</button>
      <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm text-[#ffcc00] font-bold">🧠 Trivia Cultural</h3>
          <CatBadge cat={current.category} />
        </div>
        <ScoreRow correct={correct} total={qIndex} earnings={earnings} />
        <div className="w-full h-1 bg-[#1a1a1a] rounded-full mb-4 overflow-hidden">
          <div className="h-full bg-[#00ccff] transition-all duration-300" style={{ width: `${((qIndex) / total) * 100}%` }} />
        </div>
        <div className="text-center py-6">
          <div className="text-xs text-[#666] mb-2">Pregunta {qIndex + 1} de {total}</div>
          <div className="text-xl font-bold text-white mb-6">{current.q}</div>
          <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto">
            {current.options.map(opt => {
              let btnClass = 'bg-[#1a1a1a] border-[#333] hover:bg-[#252525] hover:border-[#00ccff]/50';
              if (selected) {
                if (opt === current.a) btnClass = 'bg-[#00ff88]/20 border-[#00ff88]/70';
                else if (opt === selected) btnClass = 'bg-[#ff4444]/20 border-[#ff4444]/70';
                else btnClass = 'bg-[#1a1a1a] border-[#222] opacity-50';
              }
              return (
                <button
                  key={opt}
                  onClick={() => handleAnswer(opt)}
                  disabled={selected !== null}
                  className={`border rounded-lg px-4 py-3 text-sm text-white transition-all ${btnClass}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {selected && (
            <div className={`mt-4 text-sm font-bold ${selected === current.a ? 'text-[#00ff88]' : 'text-[#ff4444]'}`}>
              {selected === current.a ? '✓ Correcto!' : `✗ Incorrecto. Respuesta: ${current.a}`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Word Scramble Game ──────────────────────────────────────────

function WordScrambleGame({
  sounds,
  onEarnMoney,
  onBack,
}: {
  sounds: MiniGamesTabProps['sounds'];
  onEarnMoney?: (amount: number) => void;
  onBack: () => void;
}) {
  const [wIndex, setWIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [earnings, setEarnings] = useState(0);
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [finished, setFinished] = useState(false);

  const words = useMemo(() => shuffleArray(SCRAMBLE_WORDS), []);
  const current = words[wIndex];
  const total = words.length;

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!guess.trim() || feedback) return;

    sounds.click();
    const isCorrect = guess.trim().toLowerCase() === current.answer.toLowerCase();
    if (isCorrect) {
      setCorrect(c => c + 1);
      setEarnings(ev => ev + 150);
      setFeedback('correct');
      sounds.success();
      onEarnMoney?.(150);
    } else {
      setFeedback('wrong');
      sounds.error();
    }

    setTimeout(() => {
      if (wIndex + 1 >= total) {
        setFinished(true);
      } else {
        setWIndex(i => i + 1);
        setGuess('');
        setFeedback(null);
      }
    }, 1000);
  }, [guess, feedback, current, sounds, onEarnMoney, wIndex, total]);

  if (finished) {
    return (
      <ResultsScreen
        title="Anagrama de Palabras"
        emoji="🔤"
        correct={correct}
        total={total}
        earnings={earnings}
        onPlayAgain={() => { setWIndex(0); setCorrect(0); setEarnings(0); setGuess(''); setFeedback(null); setFinished(false); }}
        onBack={onBack}
      />
    );
  }

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-xs text-[#aaaaaa] hover:text-white transition-colors">← Volver al menu</button>
      <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm text-[#ffcc00] font-bold">🔤 Anagrama de Palabras</h3>
        </div>
        <ScoreRow correct={correct} total={wIndex} earnings={earnings} />
        <div className="w-full h-1 bg-[#1a1a1a] rounded-full mb-4 overflow-hidden">
          <div className="h-full bg-[#ff88ff] transition-all duration-300" style={{ width: `${((wIndex) / total) * 100}%` }} />
        </div>
        <div className="text-center py-6 space-y-4">
          <div className="text-xs text-[#666]">Palabra {wIndex + 1} de {total}</div>
          <div className="text-xs text-[#aaaaaa]">💡 Pista: <span className="text-[#ffcc00]">{current.hint}</span></div>
          <div className="my-4">
            <div className="text-xs text-[#666] mb-2">Descifra la palabra:</div>
            <div className="text-3xl font-bold tracking-[0.3em] text-[#ff88ff]">{current.scrambled}</div>
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-xs mx-auto">
            <input
              type="text"
              value={guess}
              onChange={e => setGuess(e.target.value)}
              disabled={feedback !== null}
              placeholder="Escribe aqui..."
              autoComplete="off"
              className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#ff88ff]/60 transition-colors"
            />
            <button
              type="submit"
              disabled={!guess.trim() || feedback !== null}
              className="bg-[#ff88ff]/20 border border-[#ff88ff]/50 rounded-lg px-4 py-3 text-sm font-bold text-[#ff88ff] hover:bg-[#ff88ff]/30 disabled:opacity-40 transition-all"
            >
              ✓
            </button>
          </form>
          {feedback && (
            <div className={`text-sm font-bold ${feedback === 'correct' ? 'text-[#00ff88]' : 'text-[#ff4444]'}`}>
              {feedback === 'correct' ? '✓ Correcto!' : `✗ Era "${current.answer}"`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Memory Challenge Game ───────────────────────────────────────

function MemoryChallengeGame({
  sounds,
  onEarnMoney,
  onBack,
}: {
  sounds: MiniGamesTabProps['sounds'];
  onEarnMoney?: (amount: number) => void;
  onBack: () => void;
}) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [earnings, setEarnings] = useState(0);
  const [phase, setPhase] = useState<'showing' | 'input' | 'result' | 'finished'>('showing');
  const [roundData, setRoundData] = useState(() => generateMemoryRound(0));
  const [playerInput, setPlayerInput] = useState<string[]>([]);
  const [roundCorrect, setRoundCorrect] = useState(false);
  const [lives, setLives] = useState(3);

  const totalRounds = 5;

  // Start initial round's showing timer
  useEffect(() => {
    const delay = 2000 + round * 300;
    const id = setTimeout(() => {
      setPhase('input');
    }, delay);
    return () => clearTimeout(id);
  }, [round]);

  const startNewRound = useCallback((r: number) => {
    setRoundData(generateMemoryRound(r));
    setPlayerInput([]);
    setRoundCorrect(false);
    setPhase('showing');
  }, []);

  const handleEmojiTap = useCallback((emoji: string) => {
    if (phase !== 'input') return;
    sounds.click();

    const newInput = [...playerInput, emoji];
    setPlayerInput(newInput);

    const idx = newInput.length - 1;
    if (newInput[idx] !== roundData.sequence[idx]) {
      // Wrong
      sounds.error();
      setRoundCorrect(false);
      setPhase('result');
      setLives(l => {
        const newLives = l - 1;
        if (newLives <= 0) {
          setTimeout(() => setPhase('finished'), 600);
        }
        return newLives;
      });
      return;
    }

    // Check if complete
    if (newInput.length === roundData.sequence.length) {
      sounds.success();
      setRoundCorrect(true);
      setScore(s => s + 1);
      const reward = 300;
      setEarnings(e => e + reward);
      onEarnMoney?.(reward);
      setPhase('result');
    }
  }, [phase, playerInput, roundData, sounds, onEarnMoney]);

  const handleNextRound = useCallback(() => {
    if (lives <= 0) {
      setPhase('finished');
      return;
    }
    if (round + 1 >= totalRounds) {
      setPhase('finished');
      return;
    }
    const nextR = round + 1;
    setRound(nextR);
    startNewRound(nextR);
  }, [round, lives, startNewRound]);

  const handleRestart = useCallback(() => {
    setRound(0);
    setScore(0);
    setEarnings(0);
    setLives(3);
    startNewRound(0);
  }, [startNewRound]);

  if (phase === 'finished') {
    return (
      <ResultsScreen
        title="Desafio de Memoria"
        emoji="🧩"
        correct={score}
        total={totalRounds}
        earnings={earnings}
        onPlayAgain={handleRestart}
        onBack={onBack}
      />
    );
  }

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-xs text-[#aaaaaa] hover:text-white transition-colors">← Volver al menu</button>
      <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm text-[#ffcc00] font-bold">🧩 Desafio de Memoria</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#aaaaaa]">Ronda {round + 1}/{totalRounds}</span>
            <span className="text-xs">{'❤️'.repeat(lives)}{'🖤'.repeat(3 - lives)}</span>
          </div>
        </div>
        <ScoreRow correct={score} total={round} earnings={earnings} />
        <div className="w-full h-1 bg-[#1a1a1a] rounded-full mb-4 overflow-hidden">
          <div className="h-full bg-[#ff8844] transition-all duration-300" style={{ width: `${((round) / totalRounds) * 100}%` }} />
        </div>

        <div className="text-center py-4 space-y-4">
          {/* Sequence length indicator */}
          <div className="text-xs text-[#666]">
            Secuencia de {roundData.seqLen} emojis {phase === 'showing' ? '— Memoriza!' : '— Repite el orden!'}
          </div>

          {/* Show sequence */}
          {phase === 'showing' && (
            <div className="flex justify-center gap-3 py-4">
              {roundData.sequence.map((e, i) => (
                <span
                  key={i}
                  className="text-3xl animate-pulse"
                  style={{ animationDelay: `${i * 200}ms` }}
                >
                  {e}
                </span>
              ))}
            </div>
          )}

          {/* Input phase: show grid */}
          {phase === 'input' && (
            <>
              {/* Player's progress */}
              <div className="flex justify-center gap-2 mb-2">
                {roundData.sequence.map((_, i) => (
                  <div
                    key={i}
                    className={`w-10 h-10 rounded-lg border flex items-center justify-center text-xl ${
                      i < playerInput.length
                        ? 'border-[#00ff88]/60 bg-[#00ff88]/10'
                        : 'border-[#333] bg-[#1a1a1a]'
                    }`}
                  >
                    {i < playerInput.length ? playerInput[i] : ''}
                  </div>
                ))}
              </div>
              <div className="text-xs text-[#555] mb-2">Toca los emojis en el orden correcto:</div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-w-md mx-auto">
                {roundData.grid.map((emoji, i) => (
                  <button
                    key={`${emoji}-${i}`}
                    onClick={() => handleEmojiTap(emoji)}
                    className="w-14 h-14 rounded-lg border border-[#333] bg-[#1a1a1a] text-2xl hover:bg-[#252525] hover:border-[#ff8844]/50 active:scale-95 transition-all flex items-center justify-center"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Result phase */}
          {phase === 'result' && (
            <div className="space-y-4">
              <div className={`text-lg font-bold ${roundCorrect ? 'text-[#00ff88]' : 'text-[#ff4444]'}`}>
                {roundCorrect ? '✓ Secuencia correcta! +$300' : '✗ Secuencia incorrecta'}
              </div>
              {!roundCorrect && (
                <div className="text-xs text-[#aaaaaa]">
                  La secuencia era: {roundData.sequence.join(' ')}
                </div>
              )}
              <button
                onClick={handleNextRound}
                className="bg-[#ff8844]/20 border border-[#ff8844]/50 rounded-lg px-5 py-2.5 text-sm font-bold text-[#ff8844] hover:bg-[#ff8844]/30 transition-all"
              >
                {lives <= 0 ? 'Ver resultados' : round + 1 >= totalRounds ? 'Ver resultados' : 'Siguiente ronda →'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Game menu card data ─────────────────────────────────────────

interface GameCard {
  id: GameType;
  emoji: string;
  title: string;
  desc: string;
  reward: string;
}

const GAME_CARDS: GameCard[] = [
  { id: 'math', emoji: '🧮', title: 'Quiz Matematico', desc: '15 preguntas con dificultad creciente', reward: '+$50 ~ $200 por respuesta' },
  { id: 'trivia', emoji: '🧠', title: 'Trivia Cultural', desc: '15 preguntas de cultura general', reward: '+$75 por respuesta correcta' },
  { id: 'scramble', emoji: '🔤', title: 'Anagrama de Palabras', desc: '10 palabras para descifrar', reward: '+$150 por palabra' },
  { id: 'memory', emoji: '🧩', title: 'Desafio de Memoria', desc: 'Recuerda secuencias de emojis', reward: '+$300 por ronda' },
];

// ── Main Component ──────────────────────────────────────────────

const MiniGamesTab = React.memo(function MiniGamesTab({ sounds, onEarnMoney }: MiniGamesTabProps) {
  const [activeGame, setActiveGame] = useState<GameType>(null);

  const handleBack = useCallback(() => {
    setActiveGame(null);
    sounds.click();
  }, [sounds]);

  const handleSelectGame = useCallback((game: GameType) => {
    setActiveGame(game);
    sounds.click();
  }, [sounds]);

  return (
    <div className="space-y-4">
      {!activeGame && (
        <>
          {/* Header */}
          <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
              <h3 className="text-sm text-[#00ff88] font-bold font-mono">$ mini-games</h3>
            </div>
            <p className="text-xs text-[#666666] mb-4">
              Juega para ganar dinero extra. Cada juego tiene recompensas por dificultad.
            </p>

            {/* Game cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {GAME_CARDS.map(game => (
                <button
                  key={game.id}
                  onClick={() => handleSelectGame(game.id)}
                  className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4 text-left hover:bg-[#252525] hover:border-[#00ff88]/50 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl group-hover:scale-110 transition-transform">{game.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-white mb-0.5">{game.title}</div>
                      <div className="text-xs text-[#aaaaaa]">{game.desc}</div>
                      <div className="text-[10px] text-[#00ff88] mt-1">{game.reward}</div>
                    </div>
                    <div className="text-[#333] group-hover:text-[#00ff88] transition-colors text-lg">›</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Stats footer */}
          <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] text-[#666] font-mono">const GAMES =</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <div className="text-lg font-bold text-[#ffcc00]">4</div>
                <div className="text-[10px] text-[#666]">Juegos</div>
              </div>
              <div>
                <div className="text-lg font-bold text-[#00ff88]">50</div>
                <div className="text-[10px] text-[#666]">Preguntas</div>
              </div>
              <div>
                <div className="text-lg font-bold text-[#ff88ff]">10</div>
                <div className="text-[10px] text-[#666]">Anagramas</div>
              </div>
              <div>
                <div className="text-lg font-bold text-[#ff8844]">5</div>
                <div className="text-[10px] text-[#666]">Rondas Mem.</div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeGame === 'math' && <MathQuizGame sounds={sounds} onEarnMoney={onEarnMoney} onBack={handleBack} />}
      {activeGame === 'trivia' && <TriviaQuizGame sounds={sounds} onEarnMoney={onEarnMoney} onBack={handleBack} />}
      {activeGame === 'scramble' && <WordScrambleGame sounds={sounds} onEarnMoney={onEarnMoney} onBack={handleBack} />}
      {activeGame === 'memory' && <MemoryChallengeGame sounds={sounds} onEarnMoney={onEarnMoney} onBack={handleBack} />}
    </div>
  );
});

export default MiniGamesTab;
