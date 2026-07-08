import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 既存フロントエンド(src/data.ts)のCATEGORIES / PAYMENT_METHODSと揃えた初期データ
const CATEGORIES = [
  "食費",
  "日用品",
  "娯楽・交際",
  "光熱費・通信",
  "住宅・家賃",
  "NISA積立",
  "その他",
];

const PAYMENT_METHODS = ["現金", "クレジットカード", "電子マネー", "QRコード", "口座引落"];

// フロントエンドのメンバー切替UI(Navigation.tsx)の4名分と対応させた暫定ユーザー。
// 認証機能が無いため、名前ベースでpayerと突き合わせるための仮アカウント。
const USERS = [
  { name: "自分", email: "self@kakeibo.local" },
  { name: "父", email: "dad@kakeibo.local" },
  { name: "母", email: "mom@kakeibo.local" },
  { name: "共通", email: "shared@kakeibo.local" },
];

async function main() {
  for (const name of CATEGORIES) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  for (const name of PAYMENT_METHODS) {
    await prisma.paymentMethod.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  for (const user of USERS) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: { name: user.name, email: user.email },
    });
  }

  console.log("Seed完了: カテゴリ・支払い方法・ユーザーを登録しました。");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
