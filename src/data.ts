/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Transaction, Subscription, SavingGoal } from "./types";

export const CATEGORIES = [
  "食費",
  "日用品",
  "娯楽・交際",
  "光熱費・通信",
  "住宅・家賃",
  "NISA積立",
  "その他"
];

export const CATEGORY_COLORS: Record<string, string> = {
  "食費": "#FF6B6B",
  "日用品": "#4DABF7",
  "娯楽・交際": "#FFD43B",
  "光熱費・通信": "#66D9E8",
  "住宅・家賃": "#94D82D",
  "NISA積立": "#AE3EC9",
  "その他": "#868E96"
};

export const PAYMENT_METHODS = [
  "現金",
  "クレジットカード",
  "電子マネー",
  "QRコード",
  "口座引落"
];

export const MEMBERS = [
  "自分",
  "父",
  "母",
  "共通"
];

// Presets for Demo Receipts
export const DEMO_RECEIPTS = [
  {
    name: "マツモトキヨシ (ドラッグストア)",
    text: "ドラッグストア マツモトキヨシ\n2026/06/15\nシャンプー  ¥680\n歯磨き粉    ¥220\nトイレットペーパー ¥398\n合計金額   ¥1,298\n支払い: クレジットカード",
    imagePlaceholder: "shampoo_toothbrush_toiletpaper",
    data: {
      itemName: "マツモトキヨシ",
      amount: 1298,
      category: "日用品",
      paymentMethod: "クレジットカード",
      date: "2026-06-15",
      rawItems: [
        { name: "シャンプー", price: 680 },
        { name: "歯磨き粉", price: 220 },
        { name: "トイレットペーパー", price: 398 }
      ]
    }
  },
  {
    name: "セブンイレブン (軽食)",
    text: "セブン-イレブン 渋谷店\n2026/06/16\nおにぎり(鮭)  ¥150\nサラダチキン   ¥260\n緑茶 500ml     ¥160\n合計金額     ¥570\n支払い: 電子マネー(Suica)",
    imagePlaceholder: "onigiri_chicken_greentea",
    data: {
      itemName: "セブンイレブン",
      amount: 570,
      category: "食費",
      paymentMethod: "電子マネー",
      date: "2026-06-16",
      rawItems: [
        { name: "おにぎり(鮭)", price: 150 },
        { name: "サラダチキン", price: 260 },
        { name: "緑茶 500ml", price: 160 }
      ]
    }
  },
  {
    name: "デニーズ (ディナー)",
    text: "ファミリーレストラン デニーズ\n2026/06/14\nハンバーグカツ膳  ¥1,180\nドリンクバー    ¥320\n合計金額      ¥1,500\n支払い: QRコード(PayPay)",
    imagePlaceholder: "hamburg_drinkbar_dinner",
    data: {
      itemName: "デニーズ",
      amount: 1500,
      category: "食費",
      paymentMethod: "QRコード",
      date: "2026-06-14",
      rawItems: [
        { name: "ハンバーグカツ膳", price: 1180 },
        { name: "ドリンクバー", price: 320 }
      ]
    }
  }
];

// Presets for Demo Barcodes
export const DEMO_BARCODES = [
  { barcode: "4902102072618", label: "コカ・コーラ 500ml", guessedName: "コカ・コーラ 500ml PET", price: 160 },
  { barcode: "4901330512354", label: "カルビー ポテトチップス うすしお", guessedName: "カルビー ポテトチップス Utsushio", price: 148 },
  { barcode: "4901085089347", label: "お〜いお茶 525ml", guessedName: "伊藤園 お〜いお茶 緑茶", price: 150 },
  { barcode: "4902777302232", label: "明治 おいしい牛乳 900ml", guessedName: "明治 おいしい牛乳", price: 278 }
];

// Initial preloaded transactions
export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "t1",
    date: "2026-06-01",
    itemName: "家賃",
    amount: 75000,
    isIncome: false,
    category: "住宅・家賃",
    purpose: "6月分アパート賃料",
    paymentMethod: "口座引落",
    payer: "共通"
  },
  {
    id: "t2",
    date: "2026-06-05",
    itemName: "給与支給",
    amount: 280000,
    isIncome: true,
    category: "その他",
    purpose: "6月度基本給与",
    paymentMethod: "口座引落",
    payer: "自分"
  },
  {
    id: "t3",
    date: "2026-06-06",
    itemName: "スーパーライフ (食材買い出し)",
    amount: 5420,
    isIncome: false,
    category: "食費",
    purpose: "一週間分の食材・調味料",
    paymentMethod: "クレジットカード",
    payer: "母"
  },
  {
    id: "t4",
    date: "2026-06-08",
    itemName: "電気料金",
    amount: 8900,
    isIncome: false,
    category: "光熱費・通信",
    purpose: "5月分電気代",
    paymentMethod: "口座引落",
    payer: "共通"
  },
  {
    id: "t5",
    date: "2026-06-10",
    itemName: "おこづかい（副収入）",
    amount: 15000,
    isIncome: true,
    category: "その他",
    purpose: "不用品メルカリ売却",
    paymentMethod: "クレジットカード",
    payer: "自分"
  },
  {
    id: "t6",
    date: "2026-06-12",
    itemName: "ドラッグストアウエルシア",
    amount: 2450,
    isIncome: false,
    category: "日用品",
    purpose: "洗剤、トイレットペーパー他",
    paymentMethod: "QRコード",
    payer: "母"
  },
  {
    id: "t7",
    date: "2026-06-13",
    itemName: "映画館2名分チケット",
    amount: 3800,
    isIncome: false,
    category: "娯楽・交際",
    purpose: "週末の映画鑑賞",
    paymentMethod: "クレジットカード",
    payer: "父"
  },
  {
    id: "t8",
    date: "2026-06-14",
    itemName: "NISA（積立投資）",
    amount: 33333,
    isIncome: false,
    category: "NISA積立",
    purpose: "eMAXIS Slim 全世界株式",
    paymentMethod: "クレジットカード",
    payer: "自分"
  },
  {
    id: "t9",
    date: "2026-06-15",
    itemName: "コメダ珈琲店",
    amount: 1240,
    isIncome: false,
    category: "食費",
    purpose: "カフェ休日の朝活",
    paymentMethod: "現金",
    payer: "自分"
  }
];

export const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  {
    id: "s1",
    name: "Netflix Premium",
    amount: 1980,
    period: "monthly",
    category: "娯楽・交際",
    paymentMethod: "クレジットカード",
    payer: "自分",
    nextPaymentDate: "2026-07-01"
  },
  {
    id: "s2",
    name: "ファミリー光回線 (Wi-Fi)",
    amount: 5200,
    period: "monthly",
    category: "光熱費・通信",
    paymentMethod: "口座引落",
    payer: "共通",
    nextPaymentDate: "2026-07-05"
  },
  {
    id: "s3",
    name: "Amazon Prime Family",
    amount: 5900,
    period: "yearly",
    category: "日用品",
    paymentMethod: "クレジットカード",
    payer: "父",
    nextPaymentDate: "2026-12-15"
  }
];

export const INITIAL_GOAL: SavingGoal = {
  title: "来春の家族旅行 & 新PC購入",
  targetAmount: 120000,
  deadline: "2026-12-31",
  nisaMonthlyAmount: 33333
};
