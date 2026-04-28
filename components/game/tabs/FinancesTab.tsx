'use client';
import React from 'react';
import type { Loan, Teacher } from '@/lib/game-types';

interface StoreData {
  staffMembers: Array<{ salary: number }>;
  officeStaff: { subdirectors: number; secretaries: number; receptionists: number; security: number };
  cafeteriaBuilt: boolean;
  cafeteriaStaff: { cooks: number; cashiers: number; waiters: number };
  bathroomCleaners: number;
  libraryEnabled: boolean;
  libraryHasLibrarian: boolean;
  internetType: string;
  buildingSize: string;
}

interface TabProps {
  money: number;
  currency: string;
  loans: Loan[];
  teachers: Teacher[];
  weeklyIncome: number;
  weeklyExpenses: number;
  monthlyExpenses: number;
  monthlyFee: number;
  activeStudents: number;
  storeData: StoreData;
}

const FinancesTab = React.memo(function FinancesTab({
  money,
  currency,
  loans,
  teachers,
  weeklyIncome,
  weeklyExpenses,
  monthlyExpenses,
  monthlyFee,
  activeStudents,
  storeData,
}: TabProps) {
  const hiredTeachers = teachers.filter(t => t.hired);
  const teacherSalaries = hiredTeachers.reduce((s, t) => s + t.salary, 0);
  const staffSalaries = storeData.staffMembers.reduce((s, m) => s + m.salary, 0);
  const officeCosts = storeData.officeStaff.subdirectors * 1500 + storeData.officeStaff.secretaries * 800 + storeData.officeStaff.receptionists * 600 + storeData.officeStaff.security * 700;
  const cafeteriaCosts = storeData.cafeteriaBuilt ? storeData.cafeteriaStaff.cooks * 700 + storeData.cafeteriaStaff.cashiers * 500 + storeData.cafeteriaStaff.waiters * 450 : 0;
  const cleanerCosts = storeData.bathroomCleaners * 500;
  const libraryCosts = storeData.libraryEnabled && storeData.libraryHasLibrarian ? 800 : 0;
  const internetCosts: Record<string, number> = { none: 0, open: 50, password: 100, fiber: 300 };
  const internetMonthly = (internetCosts[storeData.internetType] || 0) * 4;
  const maintenanceCosts: Record<string, number> = { small: 500, medium: 1000, large: 2000, mega: 4000 };
  const maintenanceMonthly = maintenanceCosts[storeData.buildingSize] || 1000;
  const loanWeeklyPayments = loans.reduce((s, l) => s + l.weeklyPayment, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#0a1a10] border border-[#00ff88]/30 rounded-lg p-4">
          <div className="text-xs text-[#aaaaaa] mb-1">Ingresos semanales</div>
          <div className="text-xl font-bold text-[#00ff88]">+{currency}{weeklyIncome.toLocaleString()}</div>
          <div className="text-[10px] text-[#aaaaaa] mt-1">Cuota: {currency}{monthlyFee} x {activeStudents} / 4 sem</div>
        </div>
        <div className="bg-[#1a0a0a] border border-[#ff4444]/30 rounded-lg p-4">
          <div className="text-xs text-[#aaaaaa] mb-1">Gastos semanales</div>
          <div className="text-xl font-bold text-[#ff4444]">-{currency}{weeklyExpenses.toLocaleString()}</div>
          {loanWeeklyPayments > 0 && (
            <div className="text-[10px] text-[#ffcc00] mt-1">Prestamos: -{currency}{loanWeeklyPayments}/sem</div>
          )}
        </div>
      </div>

      <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-4">
        <h3 className="text-sm text-[#aaaaaa] mb-3 font-bold">Desglose de gastos mensuales</h3>
        <div className="space-y-2">
          {[
            { label: '👨‍🏫 Salarios profesores', amount: teacherSalaries },
            { label: '👥 Salarios personal', amount: staffSalaries + officeCosts },
            { label: '🍽️ Cafeteria', amount: cafeteriaCosts },
            { label: '🧹 Limpieza', amount: cleanerCosts },
            { label: '📚 Biblioteca', amount: libraryCosts },
            { label: '🌐 Internet', amount: internetMonthly },
            { label: '🔧 Mantenimiento', amount: maintenanceMonthly },
          ].filter(item => item.amount > 0).map((item) => (
            <div key={item.label} className="flex justify-between items-center text-xs bg-[#111111] rounded px-3 py-2">
              <span className="text-[#cccccc]">{item.label}</span>
              <span className="text-[#ff4444] font-bold">{currency}{item.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Active loans in finances */}
      {loans.length > 0 && (
        <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-4">
          <h3 className="text-sm text-[#aaaaaa] mb-3 font-bold">🏦 Pagos de prestamos (semanal)</h3>
          <div className="space-y-2">
            {loans.map(loan => (
              <div key={loan.id} className="flex justify-between items-center text-xs bg-[#111111] rounded px-3 py-2">
                <div className="text-[#cccccc]">Prestamo {currency}{loan.amount.toLocaleString()}</div>
                <span className="text-[#ffcc00] font-bold">-{currency}{loan.weeklyPayment}/sem</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export default FinancesTab;
