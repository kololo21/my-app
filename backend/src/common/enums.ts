// SQLiteはPrismaのネイティブenumをサポートしないため、DB上は type/period を String で保持する。
// 値の妥当性はアプリケーション層(zod)で担保する。このファイルはPresentation/Application/Data
// いずれの層からも参照される共有定義のため、層をまたいだ依存の起点として置いている。

export const TRANSACTION_TYPES = ["EXPENSE", "INCOME", "NISA"] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const SUBSCRIPTION_PERIODS = ["MONTHLY", "YEARLY"] as const;
export type SubscriptionPeriod = (typeof SUBSCRIPTION_PERIODS)[number];
