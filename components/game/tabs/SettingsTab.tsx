'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { music } from '@/lib/music';
import { sounds } from '@/lib/sounds';

interface TabProps {
  soundVolume: number;
  musicVolume: number;
  musicMuted: boolean;
  timeSpeed: number;
  currentMusicTrack: string;
  setSoundVolume: (v: number) => void;
  setMusicVolume: (v: number) => void;
  setMusicMuted: (v: boolean) => void;
  setCurrentMusicTrack: (t: string) => void;
  saveSlots: Array<{ id: string; name: string; week: number; timestamp: number }>;
  createSaveSlot: (name: string) => void;
  deleteSaveSlot: (id: string) => void;
  setDeleteDialogOpen: (v: boolean) => void;
  startNewGame: () => void;
}

const speedLabels: Record<number, string> = {
  0: '⏸️',
  1: '▶️',
  2: '⏩',
  5: '⏩⏩',
  10: '⏩⏩⏩',
  50: '🔥',
};

const speedNames: Record<number, string> = {
  1: 'Normal',
  2: 'Rapido',
  5: 'Muy rapido',
  10: 'Ultra',
  50: 'TURBO 🔥',
};

const SettingsTab = React.memo(function SettingsTab({
  soundVolume,
  musicVolume,
  musicMuted,
  timeSpeed,
  currentMusicTrack,
  setSoundVolume,
  setMusicVolume,
  setMusicMuted,
  setCurrentMusicTrack,
  saveSlots,
  createSaveSlot,
  deleteSaveSlot,
  setDeleteDialogOpen,
  startNewGame,
}: TabProps) {
  return (
    <div className="space-y-4">
      {/* Volume */}
      <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-4">
        <h3 className="text-sm text-[#aaaaaa] mb-3 font-bold">🔊 Efectos de Sonido</h3>
        <div className="flex items-center gap-3">
          <span className="text-lg">🔈</span>
          <input type="range" min="0" max="1" step="0.05" value={soundVolume}
            onChange={(e) => { setSoundVolume(parseFloat(e.target.value)); sounds.click(); }}
            className="flex-1 h-2 bg-[#111111] rounded-full appearance-none cursor-pointer accent-[#00ff88]" />
          <span className="text-lg">🔊</span>
          <span className="text-xs text-white font-bold w-8 text-right">{Math.round(soundVolume * 100)}%</span>
        </div>
      </div>

      {/* Music */}
      <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-4">
        <h3 className="text-sm text-[#aaaaaa] mb-3 font-bold">🎵 Musica</h3>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-lg">🔈</span>
          <input type="range" min="0" max="1" step="0.05" value={musicVolume || 0.3}
            onChange={(e) => { const v = parseFloat(e.target.value); setMusicVolume(v); music.setVolume(v); }}
            className="flex-1 h-2 bg-[#111111] rounded-full appearance-none cursor-pointer accent-[#ffcc00]" />
          <span className="text-lg">🎵</span>
          <span className="text-xs text-white font-bold w-8 text-right">{Math.round((musicVolume || 0.3) * 100)}%</span>
        </div>
        <div className="flex gap-2 mt-2">
          {(['ambient', 'active', 'tension', 'celebration', 'menu'] as const).map(track => (
            <button key={track} onClick={() => { music.play(track); setCurrentMusicTrack(track); sounds.click(); }}
              className={`px-2 py-1 rounded text-[10px] border transition-all ${currentMusicTrack === track ? 'bg-[#ffcc00]/20 border-[#ffcc00]/30 text-[#ffcc00]' : 'bg-[#111111] border-[#333] text-[#555555] hover:text-white'}`}>
              {{ ambient: '🌿', active: '⚡', tension: '🔴', celebration: '🎉', menu: '🏠' }[track]} {track.charAt(0).toUpperCase() + track.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Game Speed Info */}
      <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-4">
        <h3 className="text-sm text-[#aaaaaa] mb-3 font-bold">⏱️ Velocidad del juego</h3>
        <div className="space-y-2">
          {([1, 2, 5, 10, 50] as const).map(speed => (
            <div key={speed} className={`flex items-center justify-between px-3 py-2 rounded text-xs ${timeSpeed === speed ? 'bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88]' : 'bg-[#111111] text-[#aaaaaa]'}`}>
              <span>{speedLabels[speed]} {speedNames[speed]}</span>
              <span>1 semana = {speed === 1 ? '3s' : speed === 2 ? '1.5s' : speed === 5 ? '0.6s' : speed === 10 ? '0.3s' : '0.05s'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Save/Load */}
      <div className="bg-[#0a0a10] border border-[#1e1e2e] rounded-lg p-3 space-y-2">
        <h4 className="text-xs font-bold text-white">💾 Guardar / Cargar</h4>
        <div className="grid grid-cols-3 gap-2">
          <Button onClick={() => {
            const name = prompt('Nombre del guardado:') || `Guardado ${saveSlots.length + 1}`;
            createSaveSlot(name);
            sounds.success();
          }} variant="outline" className="text-[10px] border-[#00ff88]/30 text-[#00ff88] hover:bg-[#00ff88]/10">
            💾 Guardar
          </Button>
          <Button onClick={() => { startNewGame(); sounds.click(); }} variant="outline" className="text-[10px] border-[#ffcc00]/30 text-[#ffcc00] hover:bg-[#ffcc00]/10">
            🔄 Nueva
          </Button>
          <Button onClick={() => { setDeleteDialogOpen(true); sounds.click(); }} variant="outline" className="text-[10px] border-[#ff4444]/30 text-[#ff4444] hover:bg-[#ff4444]/10">
            🗑️ Borrar
          </Button>
        </div>
        {saveSlots.length > 0 && (
          <div className="space-y-1 max-h-32 overflow-y-auto">
            <div className="text-[9px] text-[#888899]">Guardados:</div>
            {saveSlots.map(slot => (
              <div key={slot.id} className="flex justify-between items-center bg-[#111111] rounded p-2">
                <button onClick={() => {
                  if (confirm(`¿Cargar "${slot.name}"? El juego se recargara con el ultimo estado guardado.`)) {
                    window.location.reload();
                  }
                }} className="flex-1 text-left">
                  <div className="text-[10px] text-white hover:text-[#00ff88] transition-colors">{slot.name}</div>
                  <div className="text-[9px] text-[#555555]">Semana {slot.week} · {new Date(slot.timestamp).toLocaleDateString('es')}</div>
                </button>
                <button onClick={() => { deleteSaveSlot(slot.id); sounds.click(); }} className="text-[9px] text-[#ff4444] hover:text-[#ff6666] ml-2">🗑️</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Credits */}
      <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-4">
        <h3 className="text-sm text-[#aaaaaa] mb-2 font-bold">ℹ️ Creditos</h3>
        <p className="text-[10px] text-[#555555]">School Tycoon v2.0 - Potenciado por <span className="text-[#4488ff]">Z.ai</span></p>
        <p className="text-[10px] text-[#444444] mt-1">Asesor IA proporcionado por Z.ai SDK</p>
      </div>
    </div>
  );
});

export default SettingsTab;
