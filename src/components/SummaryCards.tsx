/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowDownLeft, ArrowUpRight, TrendingUp } from 'lucide-react';
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
  const progressPercent = Math.min(100, Math.max(0, (currentBalance / (goal.targetAmount || 1)) * 100));

  const formatYen = (num: number) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(num);
  };

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-7 mb-10 pb-8 border-b-2 border-indigo-100/70"
      id="summary-section"
    >
      {/* Income */}
      <div className="border-l-4 border-emerald-500 pl-4">
        <div className="flex items-center gap-1.5 mb-1.5">
          <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-bold text-gray-500">総収入額 ({activeMember})</span>
        </div>
        <p className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight leading-none">
          {formatYen(totalIncome)}
        </p>
        <p className="text-[11px] text-gray-400 mt-2">臨時収入・給与控除等を含む合計</p>
      </div>

      {/* Expense */}
      <div className="border-l-4 border-rose-500 pl-4">
        <div className="flex items-center gap-1.5 mb-1.5">
          <ArrowUpRight className="w-4 h-4 text-rose-500" />
          <span className="text-xs font-bold text-gray-500">今月の支出 ({activeMember})</span>
        </div>
        <p className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight leading-none">
          {formatYen(totalExpense)}
        </p>
        <p className="text-[11px] text-gray-400 mt-2">生活必需・交際費 (NISA積立除く)</p>
      </div>

      {/* NISA */}
      <div className="border-l-4 border-indigo-500 pl-4">
        <div className="flex items-center gap-1.5 mb-1.5">
          <TrendingUp className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-bold text-gray-500">NISA積立履歴 ({activeMember})</span>
        </div>
        <p className="text-3xl lg:text-4xl font-extrabold text-indigo-600 tracking-tight leading-none">
          {formatYen(totalNisa)}
        </p>
        <p className="text-[11px] text-gray-400 mt-2">
          毎月設定: <span className="text-indigo-600 font-bold">{formatYen(goal.nisaMonthlyAmount)}</span>
        </p>
      </div>

      {/* Goal progress */}
      <div className="border-l-4 border-fuchsia-500 pl-4">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-xs font-bold text-gray-500 truncate uppercase tracking-wide">
            🎯 {goal.title || "貯金目標"}
          </span>
          <span className="text-xs font-black text-fuchsia-600 shrink-0">{progressPercent.toFixed(0)}%</span>
        </div>
        <p className="text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent tracking-tight leading-none">
          {formatYen(currentBalance)}
        </p>
        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-3 mb-1.5">
          <div
            className="bg-gradient-to-r from-emerald-400 to-teal-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-[11px] text-gray-400">目標 {formatYen(goal.targetAmount)} ・ 期日 {goal.deadline}</p>
      </div>
    </div>
  );
}
