import { Prisma } from "@prisma/client";
import { TransactionType } from "../../common/enums";
import { prisma } from "../prisma";

export interface CreateTransactionInput {
  amount: number;
  date: Date;
  type: TransactionType;
  memo?: string;
  categoryId: string;
  paymentMethodId: string;
  userId: string;
  groupId?: string;
}

export interface FindManyTransactionsFilter {
  userId?: string;
  groupId?: string;
  categoryId?: string;
  paymentMethodId?: string;
  type?: TransactionType;
  tagId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page: number;
  pageSize: number;
}

/**
 * Data層: Transactionテーブルへの実際のアクセスを担う。
 * Prisma呼び出しはこのファイルに閉じ込め、上位層(Application)はこのインターフェースだけに依存する。
 */
export const transactionRepository = {
  create(data: CreateTransactionInput) {
    return prisma.transaction.create({
      data,
      include: {
        category: true,
        paymentMethod: true,
      },
    });
  },

  async findMany(filter: FindManyTransactionsFilter) {
    const where: Prisma.TransactionWhereInput = {
      userId: filter.userId,
      groupId: filter.groupId,
      categoryId: filter.categoryId,
      paymentMethodId: filter.paymentMethodId,
      type: filter.type,
      tags: filter.tagId ? { some: { tagId: filter.tagId } } : undefined,
      date:
        filter.dateFrom || filter.dateTo
          ? {
              gte: filter.dateFrom,
              lte: filter.dateTo,
            }
          : undefined,
    };

    const [items, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          category: true,
          paymentMethod: true,
          tags: { include: { tag: true } },
        },
        orderBy: { date: "desc" },
        skip: (filter.page - 1) * filter.pageSize,
        take: filter.pageSize,
      }),
      prisma.transaction.count({ where }),
    ]);

    return { items, total };
  },

  async deleteById(id: string) {
    try {
      return await prisma.transaction.delete({ where: { id } });
    } catch (err) {
      // P2025: レコードが見つからない場合。呼び出し元(Service)でnullとして扱えるようにする。
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
        return null;
      }
      throw err;
    }
  },
};
