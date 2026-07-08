import { transactionRepository } from "../../data/repositories/transaction.repository";
import { CreateTransactionDto, ListTransactionsQueryDto } from "../dto/transaction.dto";

/**
 * Application層: ビジネスロジックの置き場所。
 * 現時点では単純な受け渡しだが、今後「重複取引の検知」「予算超過アラート」等の
 * ルールをここに追加していく。
 */
export const transactionService = {
  async createTransaction(dto: CreateTransactionDto) {
    return transactionRepository.create({
      amount: dto.amount,
      date: new Date(dto.date),
      type: dto.type,
      memo: dto.memo,
      categoryId: dto.categoryId,
      paymentMethodId: dto.paymentMethodId,
      userId: dto.userId,
      groupId: dto.groupId,
    });
  },

  async listTransactions(query: ListTransactionsQueryDto) {
    const { items, total } = await transactionRepository.findMany({
      userId: query.userId,
      groupId: query.groupId,
      categoryId: query.categoryId,
      paymentMethodId: query.paymentMethodId,
      type: query.type,
      tagId: query.tagId,
      dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
      dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
      page: query.page,
      pageSize: query.pageSize,
    });

    return {
      items,
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
      },
    };
  },

  // 削除できた場合は削除済みレコード、対象が存在しなかった場合はnullを返す。
  async deleteTransaction(id: string) {
    return transactionRepository.deleteById(id);
  },
};
