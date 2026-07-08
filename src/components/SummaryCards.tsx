/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowDownLeft, ArrowUpRight, Coins, Compass, Percent, TrendingUp } from 'lucide-react';
import { SavingGoal, Transaction } from '../types';

interface SummaryCardsProps {
  transactions: Transaction[];
  goal: SavingGoal;
  activeMember: string;
}

export default function SummaryCards({ transactions, goal, activeMember }: SummaryCardsProps) {
  // Filter based on activeMember
  const filteredTx = transactions.filter(tx => 
    activeMember === '全員' ? true : tx.payer === activeMember
  );

  // Math
  const totalIncome = filteredTx
    .filter(tx => tx.isIncome)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpense = filteredTx
    .filter(tx => !tx.isIncome && tx.category !== "NISA積立")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalNisa = filteredTx
    .filter(tx => tx.category === "NISA積立")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const currentBalance = totalIncome - totalExpense - totalNisa;

  // Let's compute actual savings toward goal. Savings toward target consists of:
  // (Incomes - Expenses) or we can look at Net Balance.
  // Let's show saving progress matching the saving goal setup.
  const progressPercent = Math.min(100, Math.max(0, (currentBalance / (goal.targetAmount || 1)) * 100));

  const formatYen = (num: number) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(num);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" id="summary-section">
      
      {/* CARD 1: Total Income */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm transition-all duration-300 hover:shadow hover:border-indigo-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-gray-500">総収入額 ({activeMember})</span>
          <div className="bg-emerald-50 text-emerald-600 p-2 rounded-xl">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        </div>
        <p className="text-3xl font-extrabold text-gray-900 tracking-tight">
          {formatYen(totalIncome)}
        </p>
        <p className="text-xs text-gray-400 mt-3 font-medium">臨時収入・給与控除等を含む合計</p>
      </div>

      {/* CARD 2: Total Expense */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm transition-all duration-300 hover:shadow hover:border-indigo-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-gray-500">今月の支出 ({activeMember})</span>
          <div className="bg-rose-50 text-rose-600 p-2 rounded-xl">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>
        <p className="text-3xl font-extrabold text-gray-900 tracking-tight">
          {formatYen(totalExpense)}
        </p>
        <p className="text-xs text-gray-400 mt-3 font-medium">生活必需・交際費 (NISA積立除く)</p>
      </div>

      {/* CARD 3: NISA Savings */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm transition-all duration-300 hover:shadow hover:border-indigo-150">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-gray-500">NISA積立履歴 ({activeMember})</span>
          <div className="bg-indigo-50 text-indigo-600 p-2 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <p className="text-3xl font-extrabold text-indigo-600 tracking-tight">
          {formatYen(totalNisa)}
        </p>
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-3">
          <span>毎月設定: <span className="text-indigo-600 font-bold">{formatYen(goal.nisaMonthlyAmount)}</span></span>
        </div>
      </div>

      {/* CARD 4: Goals Progress */}
      <div className="bg-indigo-900 text-white rounded-2xl p-6 shadow-md shadow-indigo-100 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/15 rounded-full blur-3xl -mr-10 -mt-10" />
        
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-indigo-200 font-bold truncate max-w-[170px] uppercase tracking-wider font-mono">
              🎯 {goal.title || "貯金目標"}
            </span>
            <span className="text-xs font-black bg-white/10 text-indigo-200 px-2 py-0.5 rounded-md font-mono">
              {progressPercent.toFixed(0)}%
            </span>
          </div>
          
          <div className="flex items-baseline gap-1 mt-1">
            <p className="text-3xl font-extrabold text-white leading-none tracking-tight">
              {formatYen(currentBalance)}
            </p>
          </div>
          <span className="text-[10px] text-indigo-200 block mt-1 tracking-tight">目標 {formatYen(goal.targetAmount)}</span>
        </div>

        <div className="mt-4 relative">
          <div className="w-full bg-white/15 h-1.5 rounded-full overflow-hidden mb-2">
            <div 
              className="bg-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-indigo-200 font-medium font-mono">期日: {goal.deadline}</span>
        </div>
      </div>

    </div>
  );
}
