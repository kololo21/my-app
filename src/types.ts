/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  itemName: string;
  amount: number;
  isIncome: boolean;
  category: string; // '食費' | '日用品' | '娯楽・交際' | '光熱費・通信' | '住宅・家賃' | 'NISA積立' | 'その他'
  purpose: string;
  paymentMethod: string; // '現金' | 'クレジットカード' | '電子マネー' | 'QRコード' | '口座引落'
  payer: string; // '自分' | '父' | '母' | '共通'
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  period: 'monthly' | 'yearly';
  category: string;
  paymentMethod: string;
  payer: string;
  nextPaymentDate: string; // YYYY-MM-DD
}

export interface SavingGoal {
  title: string;
  targetAmount: number;
  deadline: string; // YYYY-MM-DD
  nisaMonthlyAmount: number; // Monthly NISA contribution
}

export interface ReceiptScanResult {
  success: boolean;
  itemName: string;
  amount: number;
  category: string;
  paymentMethod: string;
  date: string;
  rawItems?: { name: string; price: number }[];
}

export interface BarcodeResult {
  success: boolean;
  itemName: string;
  predictedPrice: number;
  description: string;
}

export type CategoryKey = '食費' | '日用品' | '娯楽・交際' | '光熱費・通信' | '住宅・家賃' | 'NISA積立' | 'その他';
