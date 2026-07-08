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
    { name: '全員', value: '全員', icon: Users },
    { name: '自分 (Me)', value: '自分', icon: User },
    { name: '父 (Dad)', value: '父', icon: User },
    { name: '母 (Mom)', value: '母', icon: User },
    { name: '共通 (Shared)', value: '共通', icon: Wallet },
  ];

  const mainTabs = [
    { id: 'dashboard', label: 'ダッシュボード', icon: Smartphone, desc: '収支＆統計' },
    { id: 'scan', label: 'スマートスキャン', icon: Receipt, desc: 'レシート＆JANバーコード' },
    { id: 'goal', label: '貯金＆NISAアシスト', icon: Goal, desc: '目標とAIコーチング' },
    { id: 'sub', label: 'サブスク', icon: HelpCircle, desc: '定額一覧' },
  ];

  return (
    <header className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-500 rounded-3xl p-6 mb-6 shadow-lg shadow-indigo-500/25 lg:flex lg:items-center lg:justify-between">
      {/* Ambient glow accents */}
      <div className="absolute -top-16 -right-10 w-56 h-56 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-10 w-56 h-56 bg-fuchsia-400/20 rounded-full blur-3xl pointer-events-none" />

      {/* App branding */}
      <div className="relative flex items-center gap-3.5 mb-5 lg:mb-0">
        <div className="w-11 h-11 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center ring-1 ring-white/20 transition-transform hover:scale-[1.03]">
          <BrainCircuit className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Kakeibo.ai
            <span className="text-[10px] font-bold bg-white/20 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Gemini AI
            </span>
          </h1>
          <p className="text-xs text-indigo-100 font-medium">複数人統合・自動レシートOCR・収支予測</p>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="relative flex flex-col md:flex-row gap-5 items-stretch md:items-center">
        {/* Main tabs selection */}
        <div className="flex flex-wrap gap-1 p-1 bg-white/10 rounded-xl backdrop-blur-sm">
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
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-indigo-50 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 transition-transform ${isActive ? 'scale-110 text-indigo-600' : 'text-indigo-100'}`} />
                <span className="shrink-0">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Vertical divider on desktop */}
        <div className="hidden md:block w-px h-8 bg-white/20" />

        {/* Member selector */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] uppercase font-bold text-indigo-100/80 tracking-wider font-mono">
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
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'bg-white/10 text-indigo-50 hover:bg-white/20'
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
