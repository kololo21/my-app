/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calendar, HelpCircle, Plus, Trash2, ShieldCheck, CreditCard, User } from 'lucide-react';
import { Subscription } from '../types';
import { MEMBERS } from '../data';

interface SubscriptionListProps {
  subscriptions: Subscription[];
  onAddSubscription: (sub: Omit<Subscription, 'id'>) => void;
  onDeleteSubscription: (id: string) => void;
}

export default function SubscriptionList({ subscriptions, onAddSubscription, onDeleteSubscription }: SubscriptionListProps) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [category, setCategory] = useState('その他');
  const [paymentMethod, setPaymentMethod] = useState('クレジットカード');
  const [payer, setPayer] = useState('自分');
  const [nextPaymentDate, setNextPaymentDate] = useState(new Date().toISOString().split('T')[0]);

  const [showForm, setShowForm] = useState(false);

  // Compute stats
  const totalMonthlyBurdens = subscriptions.reduce((sum, sub) => {
    if (sub.period === 'monthly') {
      return sum + sub.amount;
    } else {
      // Annualized
      return sum + Math.floor(sub.amount / 12);
    }
  }, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !amount) return;

    onAddSubscription({
      name: name.trim(),
      amount: parseInt(amount) || 0,
      period,
      category,
      paymentMethod,
      payer,
      nextPaymentDate
    });

    // Reset
    setName('');
    setAmount('');
    setShowForm(false);
  };

  const formatYen = (num: number) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(num);
  };

  return (
    <div className="mb-6" id="subscription-module">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b-2 border-indigo-100/70">
        <div>
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-cyan-600" />
            <div>
              <h3 className="text-sm font-extrabold text-gray-950">登録サブスクリプション＆定額支出</h3>
              <p className="text-xs text-gray-400 font-medium font-sans">月契約・年契約の固定支出（漏れ出費）を徹底防御</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block font-mono">月換算のサブスク総額:</span>
            <span className="text-base font-black text-cyan-600 block leading-tight">{formatYen(totalMonthlyBurdens)}</span>
          </div>
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-full px-4 py-2 text-xs font-bold hover:brightness-110 flex items-center gap-1 cursor-pointer transition-all shadow-md shadow-cyan-200"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            <span>定額を追加</span>
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="pb-5 mb-5 border-b-2 border-cyan-100 space-y-3.5 animate-fadeIn">
          <p className="text-xs font-bold text-neutral-800">📌 定額支払い（サブスク）の新規登録</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-neutral-500 font-bold">サービス名称 / 項目</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: Netflix, クラウドサーバー, ジム会費"
                className="bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900 font-medium"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-neutral-500 font-bold">金額</label>
              <input
                type="number"
                required
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="金額"
                className="bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900 font-bold"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-neutral-500 font-bold">支払サイクル</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as 'monthly' | 'yearly')}
                className="bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900 font-semibold"
              >
                <option value="monthly">毎月支払 (Monthly)</option>
                <option value="yearly">毎月支払 (Yearly/年額)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-neutral-500 font-bold">支払い方法</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:outline-none bg-no-repeat text-neutral-700"
              >
                <option value="クレジットカード">クレジットカード</option>
                <option value="口座引落">口座引落</option>
                <option value="電子マネー">電子マネー</option>
                <option value="現金">現金</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-neutral-500 font-bold">負担メンバー</label>
              <select
                value={payer}
                onChange={(e) => setPayer(e.target.value)}
                className="bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-700"
              >
                {MEMBERS.map((mem) => (
                  <option key={mem} value={mem}>{mem}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-neutral-500 font-bold">次回決済予定日</label>
              <input
                type="date"
                required
                value={nextPaymentDate}
                onChange={(e) => setNextPaymentDate(e.target.value)}
                className="bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-700"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1.5">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3.5 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-100 cursor-pointer"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="bg-gradient-to-r from-cyan-600 to-indigo-600 hover:brightness-110 text-white px-4 py-2 rounded-full text-xs font-bold shadow-md shadow-cyan-200 cursor-pointer"
            >
              サブスクとして登録
            </button>
          </div>
        </form>
      )}

      {subscriptions.length === 0 ? (
        <div className="py-8 text-center text-gray-400">
          <p className="text-xs font-semibold text-gray-500">現在登録されているサブスクリプションはありません</p>
          <p className="text-[10px] mt-1 font-mono">「定額を追加」ボタンから毎月・毎年の契約支払いを記録できます</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {subscriptions.map((sub) => (
            <div
              key={sub.id}
              id={`sub-item-${sub.id}`}
              className="py-4 pl-4 border-l-4 border-cyan-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2 group"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] bg-cyan-100 text-cyan-700 rounded-full px-2 py-0.5 font-extrabold font-mono shrink-0">
                    {sub.period === 'monthly' ? '月額' : '年額'}
                  </span>
                  <h4 className="font-extrabold text-gray-900 text-sm truncate">{sub.name}</h4>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-gray-500 font-semibold font-mono">
                  <span className="flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 opacity-60 text-indigo-600" /> {sub.paymentMethod}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 opacity-60 text-indigo-600" /> {sub.payer}負担
                  </span>
                  <span>支払予定: {sub.nextPaymentDate}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 pl-4">
                <p className="text-lg font-black text-gray-950 leading-none">
                  {formatYen(sub.amount)}
                  <span className="text-[10px] text-gray-400 font-mono font-normal">/回</span>
                </p>
                <button
                  type="button"
                  onClick={() => onDeleteSubscription(sub.id)}
                  className="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg transition-colors cursor-pointer"
                  title="サブスクを解除"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
