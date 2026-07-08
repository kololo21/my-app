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

  console.log("Seed完了: カテゴリ・支払い方法を登録しました。");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
