import { prisma } from "../prisma";

/**
 * Data層: フロントエンドが名前⇄ID変換に使うマスタデータ(カテゴリ/支払い方法/ユーザー)の参照。
 */
export const referenceRepository = {
  findAllCategories() {
    return prisma.category.findMany({ orderBy: { name: "asc" } });
  },

  findAllPaymentMethods() {
    return prisma.paymentMethod.findMany({ orderBy: { name: "asc" } });
  },

  findAllUsers() {
    return prisma.user.findMany({ orderBy: { name: "asc" } });
  },
};
