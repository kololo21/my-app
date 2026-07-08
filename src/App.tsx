/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  INITIAL_SUBSCRIPTIONS,
  INITIAL_GOAL,
  CATEGORY_COLORS
} from './data';
import { Transaction, Subscription, SavingGoal } from './types';
import {
  ReferenceData,
  createTransaction as apiCreateTransaction,
  deleteTransaction as apiDeleteTransaction,
  fetchReferenceData,
  fetchTransactions,
} from './lib/api';

// Components
import Navigation from './components/Navigation';
import SummaryCards from './components/SummaryCards';
import AnalyticsCharts from './components/AnalyticsCharts';
import TransactionForm from './components/TransactionForm';
import ScannerTools from './components/ScannerTools';
import SubscriptionList from './components/SubscriptionList';
import GoalAssistant from './components/GoalAssistant';

// Icons
import { Trash2, AlertCircle, RefreshCw, FileSpreadsheet, Search } from 'lucide-react';

export default function App() {
  // Transactions are persisted in the backend DB (Prisma). Loaded on mount below.
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refData, setRefData] = useState<ReferenceData | null>(null);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);

  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    const local = localStorage.getItem('kakeibo_subscriptions');
    return local ? JSON.parse(local) : INITIAL_SUBSCRIPTIONS;
  });

  const [goal, setGoal] = useState<SavingGoal>(() => {
    const local = localStorage.getItem('kakeibo_goal');
    return local ? JSON.parse(local) : INITIAL_GOAL;
  });

  const [activeMember, setActiveMember] = useState<string>('全員');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Load reference data (categories/payment methods/users) and transactions from the backend on mount
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setIsLoadingTransactions(true);
        const ref = await fetchReferenceData();
        const txs = await fetchTransactions(ref);
        if (!cancelled) {
          setRefData(ref);
          setTransactions(txs);
          setTransactionsError(null);
        }
      } catch (err) {
        console.error('Failed to load transactions from backend:', err);
        if (!cancelled) {
          setTransactionsError('取引データの読み込みに失敗しました。バックエンドサーバーが起動しているか確認してください。');
        }
      } finally {
        if (!cancelled) setIsLoadingTransactions(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Trigger cache writes on state changes
  useEffect(() => {
    localStorage.setItem('kakeibo_subscriptions', JSON.stringify(subscriptions));
  }, [subscriptions]);

  useEffect(() => {
    localStorage.setItem('kakeibo_goal', JSON.stringify(goal));
  }, [goal]);

  // Handler: Add a normal transaction
  const handleAddTransaction = async (newTx: Omit<Transaction, 'id'>) => {
    if (!refData) return;
    try {
      const saved = await apiCreateTransaction(newTx, refData);
      setTransactions((prev) => [{ ...saved, purpose: newTx.purpose }, ...prev]);
    } catch (err) {
      console.error('Failed to save transaction:', err);
      alert('取引の保存に失敗しました。');
    }
  };

  // Handler: Add from scan / barcode
  const handleAddFromScanner = async (scannedTx: {
    itemName: string;
    amount: number;
    isIncome: boolean;
    category: string;
    paymentMethod: string;
    date: string;
    purpose: string;
  }) => {
    if (!refData) return;
    const newTx: Omit<Transaction, 'id'> = {
      itemName: scannedTx.itemName,
      amount: scannedTx.amount,
      isIncome: scannedTx.isIncome,
      category: scannedTx.category,
      purpose: scannedTx.purpose,
      paymentMethod: scannedTx.paymentMethod,
      payer: activeMember === '全員' ? '自分' : activeMember,
      date: scannedTx.date
    };
    try {
      const saved = await apiCreateTransaction(newTx, refData);
      setTransactions((prev) => [{ ...saved, purpose: newTx.purpose }, ...prev]);
      // Send standard alert to UX (not windows alert) and switch to dashboard
      setActiveTab('dashboard');
    } catch (err) {
      console.error('Failed to save scanned transaction:', err);
      alert('取引の保存に失敗しました。');
    }
  };

  // Handler: Delete transaction
  const handleDeleteTransaction = async (id: string) => {
    try {
      await apiDeleteTransaction(id);
      setTransactions((prev) => prev.filter((tx) => tx.id !== id));
    } catch (err) {
      console.error('Failed to delete transaction:', err);
      alert('取引の削除に失敗しました。');
    }
  };

  // Handler: Add Subscription
  const handleAddSubscription = (newSub: Omit<Subscription, 'id'>) => {
    const subObject: Subscription = {
      ...newSub,
      id: `sub-${Date.now()}`
    };
    setSubscriptions((prev) => [...prev, subObject]);
  };

  // Handler: Delete Subscription
  const handleDeleteSubscription = (id: string) => {
    setSubscriptions((prev) => prev.filter((sub) => sub.id !== id));
  };

  // Reset demo datasets (transactions are stored in the backend DB and are not reset here)
  const handleResetData = () => {
    if (confirm('サブスク・貯金目標を初期サンプル状態に戻しますか？（家計簿の取引記録はDBに保存されているためリセットされません）')) {
      setSubscriptions(INITIAL_SUBSCRIPTIONS);
      setGoal(INITIAL_GOAL);
      setActiveMember('全員');
    }
  };

  // Filter transactions based on selected member & search query
  const filteredTransactions = transactions.filter((tx) => {
    const memberMatch = activeMember === '全員' ? true : tx.payer === activeMember;
    const categoryMatch = categoryFilter === 'all' ? true : tx.category === categoryFilter;
    const searchLower = searchTerm.toLowerCase();
    const searchMatch = 
      tx.itemName.toLowerCase().includes(searchLower) || 
      tx.purpose.toLowerCase().includes(searchLower) ||
      tx.category.toLowerCase().includes(searchLower) ||
      tx.paymentMethod.toLowerCase().includes(searchLower);

    return memberMatch && categoryMatch && searchMatch;
  });

  const formatYen = (num: number) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-8 px-4 sm:px-6 lg:px-8 font-sans selection:bg-indigo-600 selection:text-white antialiased">
      <div className="max-w-7xl mx-auto">
        
        {/* Navigation Core */}
        <Navigation 
          activeMember={activeMember} 
          setActiveMember={setActiveMember} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />

        {/* Global Summary Cards (Visible across tabs to keep tracking anchored) */}
        <SummaryCards 
          transactions={transactions} 
          goal={goal} 
          activeMember={activeMember} 
        />

        {/* Primary View Router */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fadeIn pb-16">
            
            {/* Visual Analytics */}
            <AnalyticsCharts 
              transactions={transactions} 
              activeMember={activeMember} 
            />

            {/* Insertion Form & Transaction Table in a neat two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Form */}
              <div className="lg:col-span-1">
                <TransactionForm 
                  onAddTransaction={handleAddTransaction} 
                  activeMember={activeMember} 
                />

                {/* Reset helper */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center justify-between text-xs mb-6">
                  <div className="flex gap-2.5 items-center">
                    <AlertCircle className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500 font-semibold">デバッグ・お試し用</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetData}
                    className="text-rose-600 hover:text-rose-800 underline underline-offset-4 font-bold cursor-pointer"
                  >
                    初期設定に戻す
                  </button>
                </div>
              </div>

              {/* Right Column: Interactive Ledger Table */}
              <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between" id="transactions-ledger">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-gray-100">
                    <div>
                      <h3 className="text-sm font-extrabold text-gray-950 flex items-center gap-2">
                        <FileSpreadsheet className="w-4.5 h-4.5 text-indigo-600" />
                        家計簿明細・レコード一覧
                      </h3>
                      <p className="text-xs text-gray-400 font-medium">日時・決済手段・負担メンバーで精密フィルタリング</p>
                    </div>

                    {/* Filter Utilities */}
                    <div className="flex flex-wrap gap-2">
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-450">
                          <Search className="w-3.5 h-3.5" />
                        </span>
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="取引を曖昧検索..."
                          className="bg-gray-50 border border-gray-200 pl-8 pr-3 py-1.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-gray-450 text-gray-700 font-sans"
                        />
                      </div>

                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-650 outline-none"
                      >
                        <option value="all">全区分</option>
                        <option value="食費">食費</option>
                        <option value="日用品">日用品</option>
                        <option value="娯楽・交際">娯楽・交際</option>
                        <option value="光熱費・通信">光熱費・通信</option>
                        <option value="住宅・家賃">住宅・家賃</option>
                        <option value="NISA積立">NISA積立</option>
                        <option value="その他">その他</option>
                      </select>
                    </div>
                  </div>

                  {transactionsError ? (
                    <div className="py-20 text-center text-rose-500 font-medium">
                      <p className="text-xs">{transactionsError}</p>
                    </div>
                  ) : isLoadingTransactions ? (
                    <div className="py-20 text-center text-neutral-400 font-medium">
                      <p className="text-xs">読み込み中...</p>
                    </div>
                  ) : filteredTransactions.length === 0 ? (
                    <div className="py-20 text-center text-neutral-400 font-medium">
                      <p className="text-xs">条件に合致するレコードがありません</p>
                      <p className="text-[10px] mt-1 text-neutral-300">表示メンバーや検索条件を変更するか、新しい収支を追加してください</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider border-b border-neutral-100 pb-2">
                            <th className="py-3 font-medium">日時</th>
                            <th className="py-3 font-medium">項目 / 内容</th>
                            <th className="py-3 font-medium">ジャンル</th>
                            <th className="py-3 font-medium">決済方法</th>
                            <th className="py-3 font-medium text-center">負担者</th>
                            <th className="py-3 font-medium text-right">金額 (JPY)</th>
                            <th className="py-3 text-center">削除</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 text-xs font-medium text-neutral-700">
                          {filteredTransactions.map((tx) => (
                            <tr key={tx.id} id={`tx-row-${tx.id}`} className="hover:bg-neutral-50/50 transition-colors">
                              <td className="py-3.5 whitespace-nowrap text-neutral-400 font-mono font-bold text-[11px]">{tx.date}</td>
                              <td className="py-3.5">
                                <span className="font-extrabold text-neutral-800">{tx.itemName}</span>
                                {tx.purpose && (
                                  <span className="block text-[10px] text-neutral-400 mt-0.5">{tx.purpose}</span>
                                )}
                              </td>
                              <td className="py-3.5 whitespace-nowrap">
                                <span 
                                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold"
                                  style={{ 
                                    borderColor: `${CATEGORY_COLORS[tx.category]}20`,
                                    color: CATEGORY_COLORS[tx.category] || '#4B5563',
                                    backgroundColor: `${CATEGORY_COLORS[tx.category]}08`
                                  }}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[tx.category] }} />
                                  {tx.category}
                                </span>
                              </td>
                              <td className="py-3.5 whitespace-nowrap font-sans font-semibold text-neutral-600">{tx.paymentMethod}</td>
                              <td className="py-3.5 whitespace-nowrap text-center">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                  tx.payer === '自分' 
                                    ? 'bg-blue-50 text-blue-700 border border-blue-100/50' 
                                    : tx.payer === '共通' 
                                      ? 'bg-amber-50 text-amber-700 border border-amber-100/50'
                                      : 'bg-indigo-50 text-indigo-700'
                                }`}>
                                  {tx.payer}
                                </span>
                              </td>
                              <td className="py-3.5 whitespace-nowrap text-right">
                                <span className={`font-black tracking-tight ${tx.isIncome ? 'text-emerald-600' : 'text-neutral-800'}`}>
                                  {tx.isIncome ? '+' : '-'}{formatYen(tx.amount)}
                                </span>
                              </td>
                              <td className="py-3.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTransaction(tx.id)}
                                  className="text-neutral-300 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50/50 transition-all cursor-pointer"
                                  title="削除"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-neutral-100 text-[11px] text-neutral-400 font-medium flex justify-between items-center column">
                  <span>合計 {filteredTransactions.length} 件のレコード表示中</span>
                  <span className="hidden sm:inline">NISA積立履歴やレシート取得データも連動して統計に反映されます</span>
                </div>
              </div>

            </div>

          </div>
        )}

        {activeTab === 'scan' && (
          <div className="space-y-6 animate-fadeIn pb-16">
            <ScannerTools onAddFromScanner={handleAddFromScanner} />
          </div>
        )}

        {activeTab === 'goal' && (
          <div className="space-y-6 animate-fadeIn pb-16">
            <GoalAssistant 
              goal={goal} 
              transactions={transactions} 
              subscriptions={subscriptions} 
              onChangeGoal={(g) => setGoal(g)} 
              activeMember={activeMember}
            />
          </div>
        )}

        {activeTab === 'sub' && (
          <div className="space-y-6 animate-fadeIn pb-16">
            <SubscriptionList 
              subscriptions={subscriptions} 
              onAddSubscription={handleAddSubscription}
              onDeleteSubscription={handleDeleteSubscription} 
            />
          </div>
        )}

      </div>
    </div>
  );
}
