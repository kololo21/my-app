import { analysisRepository } from "../../data/repositories/analysis.repository";
import { AnalysisSummaryQueryDto } from "../dto/analysis.dto";

/**
 * Application層: 分析ロジックの置き場所。
 * 現時点ではカテゴリ別・支払い方法別の集計のみだが、今後
 * 予算超過の警告や前月比較などのルールをここに追加していく。
 */
export const analysisService = {
  async getSummary(query: AnalysisSummaryQueryDto) {
    const filter = {
      userId: query.userId,
      groupId: query.groupId,
      type: query.type,
      dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
      dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
    };

    const [byCategory, byPaymentMethod, overall] = await Promise.all([
      analysisRepository.groupByCategory(filter),
      analysisRepository.groupByPaymentMethod(filter),
      analysisRepository.totalAmount(filter),
    ]);

    return {
      overall,
      byCategory: [...byCategory].sort((a, b) => b.totalAmount - a.totalAmount),
      byPaymentMethod: [...byPaymentMethod].sort((a, b) => b.totalAmount - a.totalAmount),
    };
  },
};
