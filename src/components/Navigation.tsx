/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Wallet, Smartphone, Users, User, BrainCircuit, Goal, HelpCircle, Receipt } from 'lucide-react';

interface NavigationProps {
  activeMember: string;
  setActiveMember: (member: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navigation({ activeMember, setActiveMember, activeTab, setActiveTab }: NavigationProps) {
  const members = [
    { name: '全員', value: '全員', icon: Users, bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
    { name: '自分 (Me)', value: '自分', icon: User, bg: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
    { name: '父 (Dad)', value: '父', icon: User, bg: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' },
    { name: '母 (Mom)', value: '母', icon: User, bg: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
    { name: '共通 (Shared)', value: '共通', icon: Wallet, bg: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  ];

  const mainTabs = [
    { id: 'dashboard', label: 'ダッシュボード', icon: Smartphone, desc: '収支＆統計' },
    { id: 'scan', label: 'スマートスキャン', icon: Receipt, desc: 'レシート＆JANバーコード' },
    { id: 'goal', label: '貯金＆NISAアシスト', icon: Goal, desc: '目標とAIコーチング' },
    { id: 'sub', label: 'サブスク', icon: HelpCircle, desc: '定額一覧' },
  ];

  return (
    <header className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm lg:flex lg:items-center lg:justify-between transition-all duration-300">
      {/* App branding */}
      <div className="flex items-center gap-3.5 mb-5 lg:mb-0">
        <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100 transition-transform hover:scale-[1.03]">
          <BrainCircuit className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-gray-900 flex items-center gap-2">
            Kakeibo.ai
            <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Gemini AI
            </span>
          </h1>
          <p className="text-xs text-gray-500 font-medium">複数人統合・自動レシートOCR・収支予測</p>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex flex-col md:flex-row gap-5 items-stretch md:items-center">
        {/* Main tabs selection */}
        <div className="flex flex-wrap gap-1 p-1 bg-gray-50 rounded-xl border border-gray-200/50">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-tight transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-100/40 shadow-sm'
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/20'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 transition-transform ${isActive ? 'scale-110 text-indigo-600 animate-pulse' : 'text-gray-400'}`} />
                <span className="shrink-0">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Vertical divider on desktop */}
        <div className="hidden md:block w-px h-8 bg-gray-200" />

        {/* Member selector */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider font-mono">
            表示メンバー切替:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {members.map((m) => {
              const Icon = m.icon;
              const isSelected = activeMember === m.value;
              return (
                <button
                  key={m.value}
                  id={`member-${m.value}`}
                  onClick={() => setActiveMember(m.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? `bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-100`
                      : 'bg-white border-gray-255 text-gray-600 hover:border-indigo-400 hover:bg-indigo-50/10'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 opacity-85" />
                  <span>{m.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
