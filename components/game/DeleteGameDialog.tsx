'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ============================================
// Delete All Cookies Helper
// ============================================
function deleteAllCookies() {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=' + window.location.hostname;
  }
}

// ============================================
// Game Stats (from localStorage)
// ============================================
interface GameStats {
  schoolName: string;
  week: number;
  students: number;
  money: number;
  currency: string;
}

function getGameStats(): GameStats {
  try {
    const raw = localStorage.getItem('school-tycoon-storage');
    if (raw) {
      const parsed = JSON.parse(raw);
      const data = parsed?.state || parsed;
      return {
        schoolName: data.schoolName || 'Desconocida',
        week: data.currentWeek || 0,
        students: data.activeStudents || 0,
        money: data.money || 0,
        currency: data.currency || '$',
      };
    }
  } catch {
    // ignore
  }
  return { schoolName: 'Desconocida', week: 0, students: 0, money: 0, currency: '$' };
}

// ============================================
// Step Indicator
// ============================================
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5 justify-center mb-6">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className="h-1.5 flex-1 rounded-full transition-all duration-500"
          style={{
            backgroundColor: i <= current ? '#ff4444' : '#222222',
            boxShadow: i <= current ? '0 0 8px rgba(255, 68, 68, 0.5)' : 'none',
          }}
        />
      ))}
    </div>
  );
}

// ============================================
// Main Component
// ============================================
interface DeleteGameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DeleteGameDialog({ open, onOpenChange }: DeleteGameDialogProps) {
  const [step, setStep] = useState(0);
  const [deleteInput, setDeleteInput] = useState('');
  const [progressValue, setProgressValue] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const deletionFiredRef = useRef(false);

  const stats = getGameStats();
  const totalSteps = 5;

  // Auto-focus input on step 2
  useEffect(() => {
    if (step === 2 && inputRef.current) {
      const t = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(t);
    }
  }, [step]);

  // Progress bar animation for step 3
  useEffect(() => {
    if (step !== 3) return;
    deletionFiredRef.current = false;
    const timer = setInterval(() => {
      setProgressValue(prev => {
        const next = prev + 2;
        if (next >= 100) {
          clearInterval(timer);
          if (!deletionFiredRef.current) {
            deletionFiredRef.current = true;
            try { localStorage.clear(); } catch { /* ignore */ }
            deleteAllCookies();
          }
          setTimeout(() => setStep(4), 400);
          return 100;
        }
        return next;
      });
    }, 60);
    progressTimerRef.current = timer;
    return () => clearInterval(timer);
  }, [step]);

  const handleClose = useCallback(() => {
    setStep(0);
    setDeleteInput('');
    setProgressValue(0);
    onOpenChange(false);
  }, [onOpenChange]);

  const handleConfirmTyping = useCallback(() => {
    if (deleteInput.trim().toUpperCase() === 'BORRAR') {
      setStep(3);
    }
  }, [deleteInput]);

  if (!open) return null;

  // ==========================================
  // Step 0: Initial Warning with Stats
  // ==========================================
  if (step === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleClose} />
        <div className="relative w-full max-w-md bg-[#0d0d0d] border border-[#333333] rounded-xl p-6 shadow-2xl shadow-red-900/20">
          <StepIndicator current={0} total={totalSteps} />
          <div className="text-center mb-6">
            <span className="text-4xl block mb-3">⚠️</span>
            <h2 className="text-lg font-bold text-white">¿Seguro que quieres borrar tu partida?</h2>
          </div>
          <div className="bg-[#111111] border border-[#222222] rounded-lg p-4 mb-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#aaaaaa]">🏫 Escuela</span>
              <span className="text-white font-bold">{stats.schoolName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#aaaaaa]">📅 Semana</span>
              <span className="text-white font-bold">{stats.week}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#aaaaaa]">👩‍🎓 Estudiantes</span>
              <span className="text-white font-bold">{stats.students}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#aaaaaa]">💰 Dinero</span>
              <span className="text-[#00ff88] font-bold">{stats.currency}{stats.money.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleClose} className="flex-1 h-10 font-bold text-sm" style={{ backgroundColor: '#00ff88', color: '#0d0d0d', border: 'none' }}>
              No, mantener partida
            </Button>
            <Button onClick={() => setStep(1)} className="flex-1 h-10 font-bold text-sm" style={{ backgroundColor: '#ff4444', color: '#ffffff', border: 'none' }}>
              Sí, quiero borrar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // Step 1: Warning About Data Loss
  // ==========================================
  if (step === 1) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleClose} />
        <div className="relative w-full max-w-md bg-[#0d0d0d] border border-[#ff4444]/30 rounded-xl p-6 shadow-2xl shadow-red-900/30">
          <StepIndicator current={1} total={totalSteps} />
          <div className="text-center mb-6">
            <span className="text-4xl block mb-3">🔴</span>
            <h2 className="text-lg font-bold text-[#ff4444]">ADVERTENCIA: Se eliminará TODO tu progreso</h2>
          </div>
          <div className="bg-[#ff4444]/5 border border-[#ff4444]/20 rounded-lg p-4 mb-6 space-y-3">
            <div className="flex items-start gap-2">
              <span className="text-[#ffcc00] text-sm mt-0.5">⚡</span>
              <p className="text-sm text-[#cccccc]">Se perderá todo el progreso de <span className="text-white font-bold">{stats.schoolName}</span></p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#ffcc00] text-sm mt-0.5">⚡</span>
              <p className="text-sm text-[#cccccc]">Todos los logros y desbloqueos serán eliminados permanentemente</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#ffcc00] text-sm mt-0.5">⚡</span>
              <p className="text-sm text-[#cccccc]">Las {stats.week} semanas jugadas y todos los datos serán borrados</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#ffcc00] text-sm mt-0.5">⚡</span>
              <p className="text-sm text-[#cccccc]">Todas las partidas guardadas serán eliminadas</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#ffcc00] text-sm mt-0.5">⚡</span>
              <p className="text-sm text-[#cccccc]">Se borrarán las cookies y datos de localStorage del navegador</p>
            </div>
          </div>
          <p className="text-xs text-[#ffcc00] text-center mb-6">⚠️ Esta acción no se puede deshacer</p>
          <Button onClick={() => setStep(2)} className="w-full h-10 font-bold text-sm" style={{ backgroundColor: 'transparent', color: '#ff4444', border: '2px solid #ff4444' }}>
            Entiendo los riesgos, continuar
          </Button>
        </div>
      </div>
    );
  }

  // ==========================================
  // Step 2: Type BORRAR to Confirm
  // ==========================================
  if (step === 2) {
    const isValid = deleteInput.trim().toUpperCase() === 'BORRAR';
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleClose} />
        <div className="relative w-full max-w-md bg-[#0d0d0d] border border-[#ff4444]/50 rounded-xl p-6 shadow-2xl shadow-red-900/40">
          <StepIndicator current={2} total={totalSteps} />
          <div className="text-center mb-6">
            <span className="text-4xl block mb-3">🚨</span>
            <h2 className="text-lg font-bold text-[#ffcc00]">ÚLTIMA OPORTUNIDAD</h2>
          </div>
          <div className="bg-[#111111] border border-[#333333] rounded-lg p-4 mb-6 text-center">
            <p className="text-sm text-[#cccccc] mb-4">
              Escribe <span className="font-bold text-[#ff4444] font-mono text-base">BORRAR</span> para confirmar
            </p>
            <Input
              ref={inputRef}
              type="text"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && isValid) handleConfirmTyping(); }}
              placeholder="Escribe BORRAR aquí..."
              className="h-12 text-center text-lg font-mono font-bold tracking-widest"
              style={{
                backgroundColor: '#0a0a0a',
                borderColor: isValid ? '#00ff88' : '#ff4444',
                color: isValid ? '#00ff88' : '#ff4444',
                caretColor: '#ff4444',
                boxShadow: isValid ? '0 0 12px rgba(0, 255, 136, 0.3)' : '0 0 12px rgba(255, 68, 68, 0.3)',
              }}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <div className="flex gap-3">
            <Button onClick={handleClose} className="flex-1 h-10 font-bold text-sm" style={{ backgroundColor: '#222222', color: '#aaaaaa', border: '1px solid #333333' }}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmTyping} disabled={!isValid} className="flex-1 h-10 font-bold text-sm" style={{ backgroundColor: isValid ? '#ff4444' : '#1a1a1a', color: isValid ? '#ffffff' : '#444444', border: isValid ? 'none' : '1px solid #333333', opacity: isValid ? 1 : 0.5 }}>
              Confirmar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // Step 3: Deletion in Progress
  // ==========================================
  if (step === 3) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />
        <div className="relative w-full max-w-md bg-[#0d0d0d] border border-[#ff4444]/30 rounded-xl p-6 shadow-2xl shadow-red-900/50">
          <StepIndicator current={3} total={totalSteps} />
          <div className="text-center mb-8">
            <span className="text-5xl block mb-4 animate-bounce">💀</span>
            <h2 className="text-lg font-bold text-[#ff4444]">Eliminando datos...</h2>
          </div>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-xs">
              <span className="text-[#aaaaaa]">Progreso</span>
              <span className="text-[#ff4444] font-mono font-bold">{Math.round(progressValue)}%</span>
            </div>
            <div className="w-full h-3 bg-[#111111] rounded-full overflow-hidden border border-[#222222]">
              <div className="h-full rounded-full transition-all duration-100 ease-linear" style={{ width: `${progressValue}%`, background: 'linear-gradient(90deg, #ff4444, #ff6666)', boxShadow: '0 0 12px rgba(255, 68, 68, 0.5)' }} />
            </div>
          </div>
          <div className="space-y-2 text-xs text-center font-mono">
            <p className={progressValue > 0 ? 'text-[#aaaaaa]' : 'text-[#333333]'}>
              {progressValue > 0 ? '✓' : '○'} Limpiando localStorage...
            </p>
            <p className={progressValue > 33 ? 'text-[#aaaaaa]' : 'text-[#333333]'}>
              {progressValue > 33 ? '✓' : '○'} Eliminando cookies del navegador...
            </p>
            <p className={progressValue > 66 ? 'text-[#aaaaaa]' : 'text-[#333333]'}>
              {progressValue > 66 ? '✓' : '○'} Borrando datos de la partida...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // Step 4: Deletion Complete
  // ==========================================
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative w-full max-w-md bg-[#0d0d0d] border border-[#00ff88]/30 rounded-xl p-6 shadow-2xl shadow-green-900/20">
        <StepIndicator current={4} total={totalSteps} />
        <div className="text-center mb-6">
          <span className="text-5xl block mb-4">✅</span>
          <h2 className="text-lg font-bold text-[#00ff88]">Datos eliminados</h2>
        </div>
        <div className="bg-[#00ff88]/5 border border-[#00ff88]/20 rounded-lg p-4 mb-6 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[#00ff88] text-sm">✓</span>
            <p className="text-sm text-[#cccccc]">localStorage limpiado correctamente</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#00ff88] text-sm">✓</span>
            <p className="text-sm text-[#cccccc]">Cookies del navegador eliminadas</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#00ff88] text-sm">✓</span>
            <p className="text-sm text-[#cccccc]">Todos los datos de la partida han sido borrados</p>
          </div>
        </div>
        <p className="text-sm text-[#aaaaaa] text-center mb-6">
          Se han borrado todas las cookies y datos del navegador. Por favor recarga la página para empezar de nuevo.
        </p>
        <Button onClick={() => window.location.reload()} className="w-full h-11 font-bold text-sm" style={{ backgroundColor: '#00ff88', color: '#0d0d0d', border: 'none' }}>
          🔄 Recargar Página
        </Button>
      </div>
    </div>
  );
}
