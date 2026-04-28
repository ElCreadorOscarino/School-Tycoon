'use client';
import React from 'react';
import { getWeatherEmoji, getSeasonName } from '@/lib/weather-system';

interface TabProps {
  weather: { current: import('@/lib/game-types').WeatherType; temperature: number; humidity: number; forecast: any[] };
  currentMonth: number;
}

const WeatherTab = React.memo(function WeatherTab({ weather, currentMonth }: TabProps) {
  const w = weather || { current: 'sunny' as const, temperature: 28, humidity: 60, forecast: [] };
  const weatherNames: Record<string, string> = { sunny: 'Soleado', rainy: 'Lluvioso', stormy: 'Tormenta', hot: 'Caluroso', cloudy: 'Nublado', windy: 'Ventoso', hurricane: 'Huracan' };
  return (
    <div className="space-y-4">
      <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-4">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">{getWeatherEmoji(w.current)}</span>
          <div>
            <h3 className="text-sm font-bold text-white">{weatherNames[w.current] || w.current}</h3>
            <p className="text-xs text-[#aaaaaa]">{w.temperature}°C | Humedad: {w.humidity}% | {getSeasonName(currentMonth)}</p>
          </div>
        </div>
        {(w.forecast || []).length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {(w.forecast || []).map((f: any, i: number) => (
              <div key={i} className="bg-[#111111] rounded p-2 text-center">
                <div className="text-lg">{getWeatherEmoji(f.weather)}</div>
                <div className="text-[10px] text-[#aaaaaa]">Dia {f.day}</div>
                <div className="text-sm font-bold text-white">{f.temperature}°C</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-4">
        <h3 className="text-xs text-[#aaaaaa] mb-2">Efectos del clima</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-[#111111] rounded p-2"><span className="text-[#aaaaaa]">Asistencia:</span> <span className={w.current === 'stormy' || w.current === 'hurricane' ? 'text-[#ff4444]' : 'text-[#00ff88]'}>{w.current === 'stormy' || w.current === 'hurricane' ? '-20%' : w.current === 'rainy' ? '-10%' : '+5%'}</span></div>
          <div className="bg-[#111111] rounded p-2"><span className="text-[#aaaaaa]">Eventos:</span> <span className="text-white">{w.current === 'stormy' ? 'Alto riesgo' : w.current === 'rainy' ? 'Moderado' : 'Normal'}</span></div>
        </div>
      </div>
    </div>
  );
});

export default WeatherTab;
