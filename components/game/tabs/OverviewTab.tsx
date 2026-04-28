'use client';
import React, { useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { getWeatherEmoji } from '@/lib/weather-system';
import type { GameNotification, MonthlyReport, FinancialRecord } from '@/lib/game-types';

interface TabProps {
  schoolName: string;
  currentWeek: number;
  activeStudents: number;
  maxStudents: number;
  activeTeachers: number;
  reputation: number;
  studentSatisfaction: number;
  academicPerformance: number;
  parentSatisfaction: number;
  money: number;
  currency: string;
  weeklyIncome: number;
  weeklyExpenses: number;
  monthlyExpenses: number;
  weather: { current: import('@/lib/game-types').WeatherType; temperature: number; humidity: number; forecast: any[] };
  buildingSize: string;
  monthlyReports: MonthlyReport[];
  financialHistory: FinancialRecord[];
  morale: number;
  loans: any[];
  notifications: GameNotification[];
}

const OverviewTab = React.memo(function OverviewTab({
  schoolName,
  currentWeek,
  activeStudents,
  maxStudents,
  activeTeachers,
  reputation,
  studentSatisfaction,
  academicPerformance,
  parentSatisfaction,
  money,
  currency,
  weeklyIncome,
  weeklyExpenses,
  monthlyExpenses,
  weather,
  buildingSize,
  monthlyReports,
  financialHistory,
  morale,
  loans,
  notifications,
}: TabProps) {
  const chartData = useMemo(() => financialHistory.slice(-10), [financialHistory]);
  const maxChartValue = useMemo(() => {
    if (chartData.length === 0) return 1000;
    return Math.max(...chartData.map(d => Math.max(Math.abs(d.income), Math.abs(d.expense), 1)));
  }, [chartData]);

  const latestReport = monthlyReports.length > 0 ? monthlyReports[monthlyReports.length - 1] : null;

  const barMeter = (value: number, max: number, width: number = 10) => {
    const filled = Math.round((value / Math.max(1, max)) * width);
    return '\u2593'.repeat(filled) + '\u2591'.repeat(Math.max(0, width - filled));
  };

  const sizeLabel = buildingSize === 'small' ? '\ud83c\udfe0 Peq' : buildingSize === 'medium' ? '\ud83c\udfeb Med' : buildingSize === 'large' ? '\ud83c\udfe2 Grande' : '\ud83d\udff0 MEGA';
  const weatherEmoji = getWeatherEmoji(weather.current);

  return (
    <div className="space-y-4">
      {/* Pseudo-3D School Status Widget */}
      <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-4">
        <pre className="text-[#00ff88] text-[11px] leading-[14px] overflow-hidden select-none font-mono whitespace-pre bg-[#111111] border border-[#222222] rounded-lg p-4">{`\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
\u2551  \ud83c\udfeb ${schoolName.slice(0, 26).padEnd(26)} \u2551
\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563
\u2551 Edificio: ${sizeLabel.padEnd(28)}\u2551
\u2551 Semana:   S${String(currentWeek).padEnd(27)}\u2551
\u2551 ${weatherEmoji} Clima:  ${weather.current.padEnd(28)}\u2551
\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563
\u2551 \ud83d\udc69\u200d\ud83c\udf93 ${barMeter(activeStudents, maxStudents, 15)} ${String(activeStudents).padStart(3)}/${String(maxStudents).padEnd(3)}  \u2551
\u2551 \ud83d\udc68\u200d\ud83c\udfeb ${barMeter(activeTeachers, 20, 15)} ${String(activeTeachers).padStart(3)}/20  \u2551
\u2551 \ud83c\udfc6 ${barMeter(Math.round(reputation), 100, 15)} ${String(Math.round(reputation)).padStart(3)}/100  \u2551
\u2551 \ud83d\ude0a ${barMeter(Math.round(studentSatisfaction), 100, 15)} ${String(Math.round(studentSatisfaction)).padStart(3)}/100 \u2551
\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563
\u2551 \ud83d\udcb0 ${currency}${money.toLocaleString().padEnd(30)}\u2551
\u2551 ${weeklyIncome - weeklyExpenses >= 0 ? '\ud83d\udcc8' : '\ud83d\udcc9'} Semanal: ${currency}${(weeklyIncome - weeklyExpenses).toLocaleString().padEnd(24)}\u2551
\u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d`}</pre>
      </div>

      {/* Monthly Report Card */}
      {latestReport && (
        <div className="bg-[#0d0d0d] border border-[#ffcc00]/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">📊</span>
            <h3 className="text-sm text-[#ffcc00] font-bold">Reporte Mensual - Mes {latestReport.month}/{latestReport.year}</h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <div className="text-[10px] text-[#aaaaaa]">Ingresos</div>
              <div className="text-sm font-bold text-[#00ff88]">+{currency}{latestReport.income.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-[10px] text-[#aaaaaa]">Gastos</div>
              <div className="text-sm font-bold text-[#ff4444]">-{currency}{latestReport.expenses.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-[10px] text-[#aaaaaa]">Nuevos alumnos</div>
              <div className="text-sm font-bold text-[#4488ff]">+{latestReport.newStudents}</div>
            </div>
            <div>
              <div className="text-[10px] text-[#aaaaaa]">Rep. cambio</div>
              <div className={`text-sm font-bold ${latestReport.reputationChange >= 0 ? 'text-[#00ff88]' : 'text-[#ff4444]'}`}>
                {latestReport.reputationChange >= 0 ? '+' : ''}{latestReport.reputationChange}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Financial Chart - improved */}
      <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-4">
        <h3 className="text-sm text-[#aaaaaa] mb-3 font-bold">Historial financiero (ultimos {chartData.length} registros)</h3>
        {chartData.length > 0 ? (
          <div className="flex items-end gap-1 h-36">
            {chartData.map((d, i) => {
              const incomeHeight = maxChartValue > 0 ? (Math.abs(d.income) / maxChartValue) * 100 : 0;
              const expenseHeight = maxChartValue > 0 ? (Math.abs(d.expense) / maxChartValue) * 100 : 0;
              const netHeight = maxChartValue > 0 ? (Math.abs(d.balance) / maxChartValue) * 100 : 0;
              const isPositive = d.balance >= 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group relative">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1a1a1a] border border-[#333] rounded px-2 py-1 text-[9px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                    <div className="text-[#00ff88]">In: {currency}{d.income.toLocaleString()}</div>
                    <div className="text-[#ff4444]">Out: {currency}{d.expense.toLocaleString()}</div>
                    <div className={isPositive ? 'text-[#00ff88]' : 'text-[#ff4444]'}>Bal: {currency}{d.balance.toLocaleString()}</div>
                  </div>
                  <div className="w-full flex gap-px items-end h-28">
                    <div className="flex-1 flex flex-col justify-end h-full">
                      <div className="bg-[#00ff88]/80 rounded-t transition-all duration-300 hover:bg-[#00ff88]" style={{ height: `${Math.min(100, incomeHeight)}%` }} />
                    </div>
                    <div className="flex-1 flex flex-col justify-end h-full">
                      <div className="bg-[#ff4444]/80 rounded-t transition-all duration-300 hover:bg-[#ff4444]" style={{ height: `${Math.min(100, expenseHeight)}%` }} />
                    </div>
                  </div>
                  <span className="text-[8px] text-[#aaaaaa]">S{Math.floor(d.day / 7)}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-[#aaaaaa] text-sm py-8">
            No hay datos financieros aun. Los datos se registran cada 4 semanas.
          </div>
        )}
        <div className="flex gap-4 mt-3 text-[10px] text-[#aaaaaa]">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#00ff88]" /> Ingreso</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ff4444]" /> Gasto</span>
          <span className="text-[#555555] ml-auto">Pasa el cursor para detalles</span>
        </div>
      </div>

      {/* Multi-Metric Performance Graph */}
      {monthlyReports.length >= 2 && (
        <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-4 mt-3">
          <h3 className="text-sm text-[#aaaaaa] mb-3 font-bold">Rendimiento Multivariable</h3>
          <div className="flex items-end gap-1 h-24">
            {monthlyReports.slice(-8).map((r, i) => (
              <div key={i} className="flex-1 flex gap-px items-end h-full group relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#1a1a1a] border border-[#333] rounded px-1 py-0.5 text-[8px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                  Mes {r.month}/{r.year}
                </div>
                <div className="flex-1 flex flex-col justify-end gap-px h-full">
                  <div className="bg-[#00ff88]/60 rounded-t flex-1 min-h-[2px]" title={`Rep: ${reputation}`} />
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-2 text-[9px] text-[#aaaaaa]">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#00ff88]/60" /> Indice compuesto</span>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-3">
          <div className="text-xs text-[#aaaaaa]">Balance neto semanal</div>
          <div className={`text-lg font-bold ${weeklyIncome - weeklyExpenses >= 0 ? 'text-[#00ff88]' : 'text-[#ff4444]'}`}>
            {weeklyIncome - weeklyExpenses >= 0 ? '+' : ''}{currency}{(weeklyIncome - weeklyExpenses).toLocaleString()}
          </div>
        </div>
        <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-3">
          <div className="text-xs text-[#aaaaaa]">Gastos mensuales</div>
          <div className="text-lg font-bold text-[#ff4444]">-{currency}{monthlyExpenses.toLocaleString()}</div>
        </div>
        <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-3">
          <div className="text-xs text-[#aaaaaa]">Prestamos activos</div>
          <div className="text-lg font-bold text-[#ffcc00]">{loans.length}</div>
        </div>
        <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-3">
          <div className="text-xs text-[#aaaaaa]">Semana actual</div>
          <div className="text-lg font-bold text-white">S{currentWeek}</div>
        </div>
      </div>

      {/* Recent Notifications */}
      <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-4">
        <h3 className="text-sm text-[#aaaaaa] mb-3 font-bold">Notificaciones recientes</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-[#aaaaaa] text-xs text-center py-4">Sin notificaciones</p>
          ) : (
            notifications.slice(0, 8).map((n) => (
              <div key={n.id} className={`bg-[#111111] border ${n.read ? 'border-[#222222]' : 'border-[#4488ff]'} rounded px-3 py-2 text-xs flex items-start gap-2`}>
                <span>{n.emoji}</span>
                <span className="text-[#cccccc] flex-1">{n.message}</span>
                <span className="text-[#555555] shrink-0">S{Math.floor(n.day / 7)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
});

export default OverviewTab;
