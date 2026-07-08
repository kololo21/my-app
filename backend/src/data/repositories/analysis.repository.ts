import { Prisma } from "@prisma/client";
import { TransactionType } from "../../common/enums";
import { prisma } from "../prisma";

export interface AnalysisSummaryFilter {
  userId?: string;
  groupId?: string;
  type?: TransactionType;
  dateFrom?: Date;
  dateTo?: Date;
}

function buildWhere(filter: AnalysisSummaryFilter): Prisma.TransactionWhereInput {
  return {
    userId: filter.userId,
    groupId: filter.groupId,
    type: filter.type,
    date:
      filter.dateFrom || filter.dateTo
        ? {
            gte: filter.dateFrom,
            lte: filter.dateTo,
          }
        : undefined,
  };
}

/**
 * Data層: 分析用の集計クエリを担う。
 * groupByはリレーション先の名前を直接取得できないため、id一覧を取得したうえで
 * Category/PaymentMethodのマスタと突き合わせる。
 */
export const analysisRepository = {
  async groupByCategory(filter: AnalysisSummaryFilter) {
    const where = buildWhere(filter);
    const [groups, categories] = await Promise.all([
      prisma.transaction.groupBy({
        by: ["categoryId"],
        where,
        _sum: { amount: true },
        _count: { _all: true },
      }),
      prisma.category.findMany(),
    ]);

    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    return groups.map((g) => ({
      categoryId: g.categoryId,
      categoryName: categoryMap.get(g.categoryId)?.name ?? "不明なカテゴリ",
      totalAmount: g._sum.amount ?? 0,
      count: g._count._all,
    }));
  },

  async groupByPaymentMethod(filter: AnalysisSummaryFilter) {
    const where = buildWhere(filter);
    const [groups, paymentMethods] = await Promise.all([
      prisma.transaction.groupBy({
        by: ["paymentMethodId"],
        where,
        _sum: { amount: true },
        _count: { _all: true },
      }),
      prisma.paymentMethod.findMany(),
    ]);

    const paymentMethodMap = new Map(paymentMethods.map((p) => [p.id, p]));

    return groups.map((g) => ({
      paymentMethodId: g.paymentMethodId,
      paymentMethodName: paymentMethodMap.get(g.paymentMethodId)?.name ?? "不明な支払い方法",
      totalAmount: g._sum.amount ?? 0,
      count: g._count._all,
    }));
  },

  async totalAmount(filter: AnalysisSummaryFilter) {
    const where = buildWhere(filter);
    const agg = await prisma.transaction.aggregate({
      where,
      _sum: { amount: true },
      _count: { _all: true },
    });

    return {
      totalAmount: agg._sum.amount ?? 0,
      count: agg._count._all,
    };
  },
};
