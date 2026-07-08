/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Transaction } from '../types';
import { CATEGORY_COLORS } from '../data';
import { CreditCard, Wallet, Milestone, TrendingUp } from 'lucide-react';

interface AnalyticsChartsProps {
  transactions: Transaction[];
  activeMember: string;
}

export default function AnalyticsCharts({ transactions, activeMember }: AnalyticsChartsProps) {
  // Filter based on activeMember
  const filteredTx = transactions.filter(tx => 
    activeMember === '全員' ? true : tx.payer === activeMember
  );

  const expensesOnly = filteredTx.filter(tx => !tx.isIncome && tx.category !== "NISA積立");

  // 1. Prepare Category Pie Data
  const categoryMap: Record<string, number> = {};
  expensesOnly.forEach(tx => {
    categoryMap[tx.category] = (categoryMap[tx.category] || 0) + tx.amount;
  });

  const pieData = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value,
    color: CATEGORY_COLORS[name] || '#868E96'
  })).sort((a, b) => b.value - a.value);

  // 2. Prepare Payment Method Data
  const payMap: Record<string, number> = {};
  expensesOnly.forEach(tx => {
    payMap[tx.paymentMethod] = (payMap[tx.paymentMethod] || 0) + tx.amount;
  });

  const payData = Object.entries(payMap).map(([name, value]) => ({
    name,
    value
  })).sort((a, b) => b.value - a.value);

  // 3. Prepare Last 7 Days Burn Velocity
  const dailyMap: Record<string, number> = {};
  // let's grab days and sum them
  expensesOnly.forEach(tx => {
    const rawDate = tx.date; // YYYY-MM-DD
    const dayLabel = rawDate.split('-')[2] ? `${parseInt(rawDate.split('-')[2])}日` : rawDate;
    dailyMap[dayLabel] = (dailyMap[dayLabel] || 0) + tx.amount;
  });

  // Sort daily keys
  const dailyData = Object.entries(dailyMap)
    .map(([date, amount]) => ({ date, amount }))
    .slice(-7); // take last 7 distinct entries

  const formatYen = (num: number) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(num);
  };

  const totalExpenseSum = expensesOnly.reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-6 gap-y-8 mb-10 pb-8 border-b-2 border-indigo-100/70" id="analytics-section">

      {/* 1. Category Pie Chart */}
      <div className="border-l-4 border-rose-400 pl-4 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-neutral-800 flex items-center gap-2 mb-1">
            <Milestone className="w-4 h-4 text-rose-500" />
            ジャンル別出費割合
          </h3>
          <p className="text-xs text-neutral-400 font-medium mb-3">今月の出費の多いジャンルを割り出し</p>
        </div>

        {totalExpenseSum === 0 ? (
          <div className="h-56 flex flex-col items-center justify-center text-neutral-400">
            <p className="text-xs font-semibold">支出データがありません</p>
            <p className="text-[10px] mt-1">下のフォームから支出を追加してください</p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
            <div className="w-full sm:w-1/2 h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatYen(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend grid */}
            <div className="w-full sm:w-1/2 flex flex-col gap-2">
              {pieData.slice(0, 4).map((item, idx) => {
                const pct = ((item.value / totalExpenseSum) * 100).toFixed(0);
                return (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="font-semibold text-neutral-700 truncate max-w-[80px]">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-neutral-800">{formatYen(item.value)}</span>
                      <span className="text-[10px] text-neutral-400 ml-1.5">&#40;{pct}%&#41;</span>
                    </div>
                  </div>
                );
              })}
              {pieData.length > 4 && (
                <p className="text-[10px] text-neutral-400 text-right font-medium">他 {pieData.length - 4} ジャンル</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. Last Days Expense Trends */}
      <div className="border-l-4 border-emerald-400 pl-4">
        <h3 className="text-sm font-bold text-neutral-800 flex items-center gap-2 mb-1">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          日別支出の推移
        </h3>
        <p className="text-xs text-neutral-400 font-medium mb-4">最近の支出の多い日を特定してセーブ</p>

        {dailyData.length === 0 ? (
          <div className="h-44 flex items-center justify-center text-neutral-400 text-xs font-semibold">
            時系列データが不足しています
          </div>
        ) : (
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={10} tick={{ fill: '#a3a3a3' }} />
                <YAxis hide tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip formatter={(value: any) => formatYen(value)} cursor={{ fill: '#f5f5f5', radius: 8 }} />
                <Bar dataKey="amount" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 3. Payment Method Breakdown */}
      <div className="border-l-4 border-indigo-400 pl-4 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-neutral-800 flex items-center gap-2 mb-1">
            <CreditCard className="w-4 h-4 text-indigo-500" />
            決済手段別の割合
          </h3>
          <p className="text-xs text-neutral-400 font-medium mb-3">カード・QR決済の使いすぎを防止</p>
        </div>

        {payData.length === 0 ? (
          <div className="h-44 flex items-center justify-center text-neutral-400 text-xs font-semibold">
            決済データがありません
          </div>
        ) : (
          <div className="flex flex-col gap-3.5 my-1">
            {payData.map((item) => {
              const maxVal = Math.max(...payData.map(p => p.value));
              const pct = maxVal > 0 ? (item.value / maxVal) * 100 : 0;
              return (
                <div key={item.name} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-neutral-600 flex items-center gap-1.5">
                      {item.name === "クレジットカード" || item.name === "電子マネー" || item.name === "QRコード" ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      )}
                      {item.name}
                    </span>
                    <span className="text-neutral-900">{formatYen(item.value)}</span>
                  </div>
                  <div className="w-full bg-indigo-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-600 to-violet-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
