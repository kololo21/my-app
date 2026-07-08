/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Goal, Sparkles, TrendingUp, RefreshCw, Calendar, Award, ShieldAlert, LineChart } from 'lucide-react';
import { SavingGoal, Transaction, Subscription } from '../types';
import { API_BASE_URL } from '../lib/api';

interface GoalAssistantProps {
  goal: SavingGoal;
  transactions: Transaction[];
  subscriptions: Subscription[];
  onChangeGoal: (updatedGoal: SavingGoal) => void;
  activeMember: string;
}

export default function GoalAssistant({ goal, transactions, subscriptions, onChangeGoal, activeMember }: GoalAssistantProps) {
  // Goal Edit State
  const [title, setTitle] = useState(goal.title);
  const [targetAmount, setTargetAmount] = useState(goal.targetAmount.toString());
  const [deadline, setDeadline] = useState(goal.deadline);
  const [nisaMonthlyAmount, setNisaMonthlyAmount] = useState(goal.nisaMonthlyAmount.toString());

  const [isEditing, setIsEditing] = useState(false);

  // AI Coaching Response State
  const [isCoaching, setIsCoaching] = useState(false);
  const [aiAdvices, setAiAdvices] = useState<string[]>([
    "食費の上昇が認められます。週末の大型買い物の割合を数%抑えるだけでも目標達成率が大幅に改善されます。",
    "不要または使用していないサブスクリプションを検出し、契約解除することで固定費を確実にカットできます。",
    "NISA積立(現在 ¥33,333/月)が最良、かつ最も賢い「先取り貯蓄」として有効に機能しています。"
  ]);
  const [aiForecast, setAiForecast] = useState(
    "現在のペース（月平均 +¥45,000）を継続した場合、12ヶ月後には ¥540,000 前後の純金融資産となり、来春の目標を十分にクリアできる見込みです。"
  );

  const fetchAiCoaching = async () => {
    setIsCoaching(true);
    try {
      const response = await fetch(`${API_BASE_URL}/coaching`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactions,
          subscriptions,
          goal,
          activeMember
        })
      });
      const data = await response.json();

      if (data.success) {
        if (data.advices) setAiAdvices(data.advices);
        if (data.forecast) setAiForecast(data.forecast);
      }
    } catch (err) {
      console.error("AI Coach Fetch Failed:", err);
    } finally {
      setIsCoaching(false);
    }
  };

  // Fetch initial advice or refresh automatically when goal or transactions change
  useEffect(() => {
    fetchAiCoaching();
  }, [goal.targetAmount, activeMember]);

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    onChangeGoal({
      title: title.trim(),
      targetAmount: parseInt(targetAmount) || 0,
      deadline,
      nisaMonthlyAmount: parseInt(nisaMonthlyAmount) || 0
    });
    setIsEditing(false);
  };

  const formatYen = (num: number) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(num);
  };

  // Math regarding future predictions
  const monthlyInflow = transactions
    .filter(t => t.isIncome && (activeMember === '全員' ? true : t.payer === activeMember))
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyOutflow = transactions
    .filter(t => !t.isIncome && (activeMember === '全員' ? true : t.payer === activeMember))
    .reduce((sum, t) => sum + t.amount, 0);

  const subBurdens = subscriptions
    .filter(s => (activeMember === '全員' ? true : s.payer === activeMember))
    .reduce((sum, s) => {
      return sum + (s.period === 'monthly' ? s.amount : Math.floor(s.amount / 12));
    }, 0);

  const netMonthlySurplus = Math.max(-50000, monthlyInflow - (monthlyOutflow + subBurdens));

  // Future Forecasting Values
  const forecast3Months = netMonthlySurplus * 3;
  const forecast6Months = netMonthlySurplus * 6;
  const forecast12Months = netMonthlySurplus * 12;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 font-sans" id="goal-ai-assistant-sec">
      
      {/* 1. Goal Setting & Customization */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3.5 mb-3">
            <div className="bg-indigo-50 text-indigo-600 p-2 rounded-xl">
              <Goal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-gray-950">目標貯金額とNISAの設定</h3>
              <p className="text-xs text-gray-400 font-medium font-sans">達成目標と新NISA（積立投資）を管理</p>
            </div>
          </div>

          {!isEditing ? (
            <div className="space-y-4 my-2">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200/50">
                <span className="text-[10px] text-gray-405 font-bold uppercase tracking-wider block mb-1 font-mono">
                  現在の貯金目標:
                </span>
                <p className="font-extrabold text-gray-900 text-sm flex items-center gap-1">
                  <Award className="w-4 h-4 text-amber-500 shrink-0" />
                  {goal.title || "未設定"}
                </p>
                <p className="text-2xl font-black text-gray-950 mt-2">
                  {formatYen(goal.targetAmount)}
                </p>
                <div className="flex items-center justify-between text-[11px] text-gray-500 font-semibold mt-3 pt-2.5 border-t border-gray-200">
                  <span className="font-mono">期日: {goal.deadline}</span>
                  <span className="text-indigo-600 font-bold">順調にアシスト中</span>
                </div>
              </div>

              <div className="bg-indigo-50/20 border border-indigo-100 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-indigo-605 font-bold uppercase tracking-wider block mb-0.5 font-mono">
                    新NISA 積立額設定:
                  </span>
                  <p className="text-sm font-black text-indigo-900">
                    {formatYen(goal.nisaMonthlyAmount)} <span className="text-xs font-semibold text-indigo-400">/ 月</span>
                  </p>
                </div>
                <div className="bg-indigo-50 text-indigo-600 p-2 rounded-xl">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2.5 text-xs font-bold shadow-md shadow-indigo-100 cursor-pointer transition-colors"
              >
                目標設定を変更する
              </button>
            </div>
          ) : (
            <form onSubmit={handleSaveGoal} className="space-y-3.5 my-2 animate-fadeIn">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-450 font-bold">目標のタイトル</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-450 font-bold font-sans">目標貯金額（¥）</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none font-bold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-450 font-bold">目標デッドライン（期日）</label>
                <input
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none font-medium text-gray-700 font-mono"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-450 font-bold">毎月のNISA積立目標額（¥）</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={nisaMonthlyAmount}
                  onChange={(e) => setNisaMonthlyAmount(e.target.value)}
                  className="bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none font-bold text-indigo-700"
                />
              </div>

              <div className="flex gap-2 pt-1.5 font-mono">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="w-1/2 py-2 border border-gray-200 hover:bg-gray-100 rounded-lg text-xs font-semibold text-gray-600 transition-colors cursor-pointer"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm shadow-indigo-100"
                >
                  設定を適用
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* 2. AI Savings Coaching Panel */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between col-span-1 lg:col-span-2">
        <div>
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3.5">
              <div className="bg-indigo-50 text-indigo-600 p-2 rounded-xl">
                <Sparkles className="w-4.5 h-4.5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-gray-950 flex items-center gap-1.5">
                  AI貯金アシストコーチ
                </h3>
                <p className="text-xs text-gray-400 font-medium">Gemini AIが現在の家計バランスを読み解き節約コーチ</p>
              </div>
            </div>
            <button
              type="button"
              onClick={fetchAiCoaching}
              disabled={isCoaching}
              id="btn-ai-coach"
              className="bg-gray-50 hover:bg-indigo-50/10 border border-gray-200 text-gray-700 p-2 px-3 rounded-lg text-xs font-bold shrink-0 cursor-pointer flex items-center gap-1.5 transition-all font-mono"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCoaching ? 'animate-spin text-indigo-650' : 'text-gray-400'}`} />
              <span className="hidden sm:inline">AI再診断</span>
            </button>
          </div>

          <div className="space-y-3.5 my-2">
            {/* AI Advices bullets */}
            <div className="bg-gray-50 hover:bg-indigo-50/5 border border-gray-255 rounded-xl p-4 transition-all">
              <span className="text-[9px] bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded font-black uppercase tracking-widest block mb-2 w-fit font-mono">
                AI SMART ADVICES FOR {activeMember.toUpperCase()}
              </span>
              
              {isCoaching ? (
                <div className="space-y-3 py-2 animate-pulse">
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-5/6" />
                  <div className="h-3 bg-gray-200 rounded w-4/5" />
                </div>
              ) : (
                <ul className="space-y-2 text-xs font-semibold text-gray-700 leading-relaxed list-none pl-0">
                  {aiAdvices.map((adv, idx) => (
                    <li key={idx} className="flex gap-2 items-start text-[11px]">
                      <span className="text-indigo-600 font-extrabold select-none">•</span>
                      <span>{adv}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Simulated Future Forecast */}
            <div className="bg-indigo-900 text-white rounded-xl p-5 relative overflow-hidden flex flex-col justify-between shadow-md shadow-indigo-100">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/15 rounded-full blur-2xl" />
              
              <div className="relative">
                <span className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider block mb-1 font-mono">
                  🔮 AIの今後の収支予測と目標マイルストーン:
                </span>
                
                {isCoaching ? (
                  <div className="space-y-2 py-1 animate-pulse">
                    <div className="h-3 bg-white/20 rounded w-11/12" />
                    <div className="h-3 bg-white/20 rounded w-2/3" />
                  </div>
                ) : (
                  <p className="text-xs font-medium leading-relaxed pr-2 text-indigo-100">
                    {aiForecast}
                  </p>
                )}
              </div>

              {/* Graphical Future Estimation bars */}
              <div className="mt-4 pt-3.5 border-t border-white/10 relative">
                <span className="text-[9px] text-indigo-205 font-bold block mb-2 flex items-center gap-1 font-mono">
                  <LineChart className="w-3 h-3 text-indigo-300" /> 財産推移予測 (現状維持時)
                </span>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                  <div className="bg-white/5 p-2 rounded-lg hover:bg-white/10 transition-colors">
                    <span className="text-[9px] text-indigo-350 block mb-0.5">3ヶ月後</span>
                    <span className="font-extrabold text-white text-[11px]">
                      {formatYen(Math.max(0, forecast3Months))}
                    </span>
                  </div>
                  <div className="bg-white/5 p-2 rounded-lg hover:bg-white/10 transition-colors">
                    <span className="text-[9px] text-indigo-350 block mb-0.5">6ヶ月後</span>
                    <span className="font-extrabold text-emerald-300 text-[11px]">
                      {formatYen(Math.max(0, forecast6Months))}
                    </span>
                  </div>
                  <div className="bg-white/5 p-2 rounded-lg bg-gradient-to-b from-indigo-950/20 to-indigo-900/30 border border-indigo-500/20">
                    <span className="text-[9px] text-indigo-200 block mb-0.5">12ヶ月後</span>
                    <span className="font-black text-indigo-200 text-[11px]">
                      {formatYen(Math.max(0, forecast12Months))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
