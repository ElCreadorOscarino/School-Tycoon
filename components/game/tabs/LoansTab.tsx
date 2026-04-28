'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LOAN_OPTIONS } from '@/lib/game-types';
import type { Loan, GameNotification } from '@/lib/game-types';

interface TabProps {
  loans: Loan[];
  money: number;
  currency: string;
  currentDay: number;
  addLoan: (loan: Loan) => void;
  makeLoanPayment: (loanId: string) => void;
  addNotification: (n: GameNotification) => void;
  sounds: { success: () => void };
}

const LoansTab = React.memo(function LoansTab({
  loans,
  money,
  currency,
  currentDay,
  addLoan,
  makeLoanPayment,
  addNotification,
  sounds,
}: TabProps) {
  return (
    <div className="space-y-4">
      {loans.length > 0 && (
        <div>
          <h3 className="text-sm text-[#ffcc00] font-bold mb-3">🏦 Prestamos activos ({loans.length})</h3>
          <div className="space-y-2">
            {loans.map(loan => (
              <div key={loan.id} className="bg-[#0d0d0d] border border-[#ffcc00]/20 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white">Prestamo {currency}{loan.amount.toLocaleString()}</span>
                  <span className="text-xs text-[#ff4444]">Tasa: {loan.interestRate}%</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <div>
                    <span className="text-[#aaaaaa]">Saldo</span>
                    <div className="text-[#ff4444] font-bold">{currency}{loan.remaining.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-[#aaaaaa]">Pago/sem</span>
                    <div className="text-[#ffcc00] font-bold">{currency}{loan.weeklyPayment.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-[#aaaaaa]">Semanas</span>
                    <div className="text-white font-bold">{loan.weeksRemaining}</div>
                  </div>
                </div>
                <Progress value={((loan.amount - loan.remaining) / loan.amount) * 100} className="h-1.5 mt-2 [&>div]:bg-[#ffcc00]" />
                <div className="mt-2 text-[10px] text-[#555555]">💳 Se descuenta automaticamente cada semana</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm text-[#aaaaaa] font-bold mb-3">Opciones de prestamo</h3>
        <div className="space-y-2">
          {LOAN_OPTIONS.map((opt, i) => {
            const totalRepay = opt.amount + opt.amount * (opt.interestRate / 100);
            const weeklyPay = Math.round(totalRepay / opt.weeksToPay);
            return (
              <div key={i} className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-white">{currency}{opt.amount.toLocaleString()}</div>
                  <div className="text-[10px] text-[#aaaaaa] mt-1">
                    Tasa: {opt.interestRate}% | {opt.weeksToPay} sem | Pago: {currency}{weeklyPay}/sem | Total: {currency}{Math.round(totalRepay).toLocaleString()}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    addLoan({
                      id: `loan-${Date.now()}`,
                      amount: opt.amount,
                      remaining: totalRepay,
                      interestRate: opt.interestRate,
                      weeklyPayment: weeklyPay,
                      weeksRemaining: opt.weeksToPay,
                      takenAtDay: currentDay,
                    });
                    sounds.success();
                    addNotification({
                      id: `notif-loan-${Date.now()}`,
                      day: currentDay,
                      message: `🏦 Prestamo de ${currency}${opt.amount.toLocaleString()} aprobado`,
                      emoji: '🏦',
                      read: false,
                    });
                  }}
                  className="text-[10px] h-8 bg-[#ffcc00] hover:bg-[#ffdd33] text-black font-bold"
                >Pedir</Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default LoansTab;
