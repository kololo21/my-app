/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Transaction } from '../types';

// 本番ビルドではフロントエンドとバックエンドが別ドメインにデプロイされるため、
// VITE_API_BASE_URL（例: https://kakeibo-backend.onrender.com）でバックエンドの絶対URLを指定する。
// 未設定の場合は相対パスのままとなり、ローカル開発ではvite.config.tsのproxy経由でbackendに届く。
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

export interface ReferenceData {
  categoryNameToId: Record<string, string>;
  categoryIdToName: Record<string, string>;
  paymentMethodNameToId: Record<string, string>;
  paymentMethodIdToName: Record<string, string>;
  userNameToId: Record<string, string>;
  userIdToName: Record<string, string>;
}

interface BackendTransaction {
  id: string;
  amount: number;
  date: string;
  type: 'EXPENSE' | 'INCOME' | 'NISA';
  memo: string | null;
  categoryId: string;
  paymentMethodId: string;
  userId: string;
}

async function parseJson(response: Response) {
  const data = await response.json();
  if (!response.ok || data.success === false) {
    throw new Error(data.error || `リクエストに失敗しました (status: ${response.status})`);
  }
  return data;
}

// カテゴリ・支払い方法・ユーザーのマスタを取得し、name⇄id変換表を組み立てる
export async function fetchReferenceData(): Promise<ReferenceData> {
  const [categoriesRes, paymentMethodsRes, usersRes] = await Promise.all([
    fetch(apiUrl('/categories')),
    fetch(apiUrl('/payment-methods')),
    fetch(apiUrl('/users')),
  ]);

  const [categoriesData, paymentMethodsData, usersData] = await Promise.all([
    parseJson(categoriesRes),
    parseJson(paymentMethodsRes),
    parseJson(usersRes),
  ]);

  const categoryNameToId: Record<string, string> = {};
  const categoryIdToName: Record<string, string> = {};
  for (const c of categoriesData.categories as { id: string; name: string }[]) {
    categoryNameToId[c.name] = c.id;
    categoryIdToName[c.id] = c.name;
  }

  const paymentMethodNameToId: Record<string, string> = {};
  const paymentMethodIdToName: Record<string, string> = {};
  for (const p of paymentMethodsData.paymentMethods as { id: string; name: string }[]) {
    paymentMethodNameToId[p.name] = p.id;
    paymentMethodIdToName[p.id] = p.name;
  }

  const userNameToId: Record<string, string> = {};
  const userIdToName: Record<string, string> = {};
  for (const u of usersData.users as { id: string; name: string }[]) {
    userNameToId[u.name] = u.id;
    userIdToName[u.id] = u.name;
  }

  return {
    categoryNameToId,
    categoryIdToName,
    paymentMethodNameToId,
    paymentMethodIdToName,
    userNameToId,
    userIdToName,
  };
}

// バックエンド形式(categoryId/paymentMethodId/userId/type)をフロントエンドのTransaction型に変換する。
// 注: バックエンドにitemName相当のカラムが無いため、memoをitemNameとして扱う。
// purposeは今回のDB永続化の対象外で、新規追加直後のみ画面上に一時的に表示される。
function toFrontendTransaction(tx: BackendTransaction, ref: ReferenceData): Transaction {
  return {
    id: tx.id,
    date: tx.date.split('T')[0],
    itemName: tx.memo || '（メモなし）',
    amount: tx.amount,
    isIncome: tx.type === 'INCOME',
    category: ref.categoryIdToName[tx.categoryId] || 'その他',
    purpose: '',
    paymentMethod: ref.paymentMethodIdToName[tx.paymentMethodId] || '現金',
    payer: ref.userIdToName[tx.userId] || '自分',
  };
}

export async function fetchTransactions(ref: ReferenceData): Promise<Transaction[]> {
  const response = await fetch(apiUrl('/transactions?pageSize=100'));
  const data = await parseJson(response);
  return (data.transactions as BackendTransaction[]).map((tx) => toFrontendTransaction(tx, ref));
}

export async function createTransaction(
  tx: Omit<Transaction, 'id'>,
  ref: ReferenceData,
): Promise<Transaction> {
  const type = tx.category === 'NISA積立' ? 'NISA' : tx.isIncome ? 'INCOME' : 'EXPENSE';

  const response = await fetch(apiUrl('/transactions'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: tx.amount,
      date: tx.date,
      type,
      memo: tx.itemName,
      categoryId: ref.categoryNameToId[tx.category],
      paymentMethodId: ref.paymentMethodNameToId[tx.paymentMethod],
      userId: ref.userNameToId[tx.payer] || ref.userNameToId['自分'],
    }),
  });

  const data = await parseJson(response);
  return toFrontendTransaction(data.transaction as BackendTransaction, ref);
}

export async function deleteTransaction(id: string): Promise<void> {
  const response = await fetch(apiUrl(`/transactions/${id}`), { method: 'DELETE' });
  if (!response.ok && response.status !== 204) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || '取引の削除に失敗しました。');
  }
}
