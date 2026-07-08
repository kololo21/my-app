/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PlusCircle, Calendar, MessageSquare, DollarSign, User, ShieldCheck } from 'lucide-react';
import { CATEGORIES, PAYMENT_METHODS, MEMBERS } from '../data';
import { Transaction } from '../types';

interface TransactionFormProps {
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
  activeMember: string;
}

export default function TransactionForm({ onAddTransaction, activeMember }: TransactionFormProps) {
  const [itemName, setItemName] = useState('');
  const [amount, setAmount] = useState('');
  const [isIncome, setIsIncome] = useState(false);
  const [category, setCategory] = useState('食費');
  const [purpose, setPurpose] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('現金');
  const [payer, setPayer] = useState(activeMember === '全員' ? '自分' : activeMember);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || !amount) return;

    onAddTransaction({
      itemName: itemName.trim(),
      amount: parseInt(amount) || 0,
      isIncome,
      category: isIncome ? 'その他' : category, // Income usually categorized in Others or can be custom
      purpose: purpose.trim(),
      paymentMethod,
      payer,
      date
    });

    // Reset some state
    setItemName('');
    setAmount('');
    setPurpose('');
  };

  // When activeMember changes, sync the default payer dropdown selection
  React.useEffect(() => {
    if (activeMember !== '全員') {
      setPayer(activeMember);
    }
  }, [activeMember]);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-6" id="add-record-form">
      <div className="flex items-center gap-3.5 mb-5">
        <div className="bg-indigo-50 text-indigo-600 p-2 rounded-xl">
          <PlusCircle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-gray-900">収支・収入・区分記入</h3>
          <p className="text-xs text-gray-400 font-medium">個人の出費または家族の共同出費・NISA積立を手動記録</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Is Income / Expense toggle */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-gray-50 rounded-xl border border-gray-200/50">
          <button
            type="button"
            onClick={() => setIsIncome(false)}
            className={`py-2 rounded-lg text-xs font-bold tracking-tight transition-all cursor-pointer ${
              !isIncome 
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100' 
                : 'text-gray-500 hover:text-gray-950 hover:bg-white/50'
            }`}
          >
            💸 支出として記入
          </button>
          <button
            type="button"
            onClick={() => setIsIncome(true)}
            className={`py-2 rounded-lg text-xs font-bold tracking-tight transition-all cursor-pointer ${
              isIncome 
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100' 
                : 'text-gray-500 hover:text-gray-950 hover:bg-white/50'
            }`}
          >
            💰 収入として記入
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Item Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-500">
              項目名 / 商品名（必須）
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="例: スーパーお惣菜、光熱費、給与"
                className="w-full pl-3 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-505 placeholder:text-gray-300 font-medium"
              />
            </div>
          </div>

          {/* Amount JPY */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-500">
              金額（¥、必須）
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-gray-400 font-bold text-sm">¥</span>
              <input
                type="number"
                required
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="金額を入力"
                className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-indigo-505 placeholder:text-gray-300"
              />
            </div>
          </div>

          {/* Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-gray-400" /> 日時 / 記録日
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-505 font-medium text-gray-750"
            />
          </div>

          {/* Category tags (Only if Expense) */}
          {!isIncome && (
            <div className="flex flex-col gap-1.5 animate-fadeIn">
              <label className="text-[11px] font-bold text-gray-500">
                出費区分 / ジャンル
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-505 font-medium text-gray-700 bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}

          {/* Payment Method */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-500">
              支払い方法
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-505 font-medium text-gray-750 bg-white"
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>

          {/* Payer / Member */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-500 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-gray-450" /> 記録メンバー
            </label>
            <select
              value={payer}
              onChange={(e) => setPayer(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-505 font-medium text-gray-750 bg-white"
            >
              {MEMBERS.map((mem) => (
                <option key={mem} value={mem}>{mem}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Purpose / Notes Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-gray-500 flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5 text-gray-400" /> 用途・詳細（メモ）
          </label>
          <input
            type="text"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="例: 夕食のごちそう、今冬のガス代、全世界オルカン積立など"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-550 placeholder:text-gray-300 font-medium"
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            id="btn-add-transaction"
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs tracking-tight px-6 py-3 rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-100 transition-all hover:translate-y-[-1px] active:translate-y-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>このレコードを登録</span>
          </button>
        </div>
      </form>
    </div>
  );
}
