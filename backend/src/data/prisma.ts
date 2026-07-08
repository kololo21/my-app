import { PrismaClient } from "@prisma/client";

// 開発時のホットリロードでPrismaClientが多重生成されるのを防ぐため、
// グローバルにインスタンスをキャッシュする定番パターン。
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
