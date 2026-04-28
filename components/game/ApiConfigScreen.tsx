'use client';

import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '@/lib/game-store';
import { sounds } from '@/lib/sounds';
import { Button } from '@/components/ui/button';
import { SCREEN_ORDER } from '@/lib/game-types';

export default function ApiConfigScreen() {
  const { nextScreen } = useGameStore();
  const [testing, setTesting] = useState(true);
  const [zaiWorks, setZaiWorks] = useState<boolean | null>(null);
  const autoContinued = useRef(false);

  const stepIndex = SCREEN_ORDER.indexOf('api-config');
  const totalSteps = 14;

  // Auto-test Z.ai on mount
  useEffect(() => {
    const testZAI = async () => {
      try {
        const res = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: 'Responde con una sola palabra: Hola' }],
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.choices && data.choices.length > 0) {
            setZaiWorks(true);
            sounds.success();
            // Auto-continue after 2 seconds
            setTimeout(() => {
              if (!autoContinued.current) {
                autoContinued.current = true;
                nextScreen();
              }
            }, 2000);
            return;
          }
        }
        setZaiWorks(false);
        sounds.error();
      } catch {
        setZaiWorks(false);
        sounds.error();
      } finally {
        setTesting(false);
      }
    };
    testZAI();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-mono flex flex-col">
      {/* Progress */}
      <div className="w-full px-4 pt-4">
        <div className="flex items-center justify-between text-xs text-[#aaaaaa] mb-1">
          <span>Paso {stepIndex + 1} de {totalSteps}</span>
          <span>{Math.round(((stepIndex + 1) / totalSteps) * 100)}%</span>
        </div>
        <div className="w-full h-2 bg-[#111111] rounded-full overflow-hidden border border-[#222222]">
          <div className="h-full bg-[#00ff88] transition-all duration-500 rounded-full"
            style={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#0d0d0d] border border-[#222222] rounded-lg p-6">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">⚡</div>
            <h1 className="text-2xl font-bold text-[#00ff88] mb-1">IA Integrada de Z.ai</h1>
            <p className="text-[#aaaaaa] text-sm">
              La IA de Z.ai ya esta integrada. No necesitas ninguna clave externa.
            </p>
          </div>

          <div className="bg-[#111111] border border-[#222222] rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🤖</span>
              <div className="flex-1">
                <div className="text-sm font-bold text-white mb-1">Todo listo</div>
                <p className="text-xs text-[#aaaaaa]">
                  La IA genera profesores, estudiantes, eventos, analisis y revisiones automaticamente.
                  Solo necesitas disfrutar del juego.
                </p>
              </div>
            </div>
          </div>

          {/* Status */}
          {testing && (
            <div className="text-center py-4">
              <div className="text-2xl animate-pulse">🔄</div>
              <div className="text-xs text-[#aaaaaa] mt-2">Verificando conexion con Z.ai...</div>
            </div>
          )}

          {zaiWorks === true && (
            <div className="space-y-4">
              <div className="bg-[#0a1a10] border border-[#00ff88]/30 rounded-lg p-3 text-[#00ff88] text-sm text-center">
                ✅ Z.ai funciona correctamente — Continuando automaticamente...
              </div>
            </div>
          )}

          {zaiWorks === false && (
            <div className="space-y-4">
              <div className="bg-[#1a0a0a] border border-[#ff4444]/30 rounded-lg p-3 text-[#ff4444] text-sm text-center">
                ⚠️ No se pudo conectar con Z.ai en este momento. Puedes continuar de todas formas.
              </div>
              <Button
                onClick={() => {
                  if (!autoContinued.current) {
                    autoContinued.current = true;
                    sounds.success();
                    nextScreen();
                  }
                }}
                className="w-full bg-[#00ff88] text-black font-bold hover:bg-[#00cc6e] h-12 text-base"
              >
                Continuar →
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
