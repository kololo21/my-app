import { z } from "zod";
import { TRANSACTION_TYPES } from "../../common/enums";

// GET /analysis/summary のクエリパラメータ検証スキーマ
// 集計対象の絞り込み条件。ページネーションは不要（集計結果を返すため）。
export const analysisSummaryQuerySchema = z.object({
  userId: z.string().min(1).optional(),
  groupId: z.string().min(1).optional(),
  type: z
    .enum(TRANSACTION_TYPES, {
      errorMap: () => ({ message: "typeはEXPENSE / INCOME / NISAのいずれかです" }),
    })
    .optional(),
  dateFrom: z
    .string()
    .refine((v) => !Number.isNaN(Date.parse(v)), {
      message: "dateFromはISO8601形式の日付文字列で指定してください",
    })
    .optional(),
  dateTo: z
    .string()
    .refine((v) => !Number.isNaN(Date.parse(v)), {
      message: "dateToはISO8601形式の日付文字列で指定してください",
    })
    .optional(),
});

export type AnalysisSummaryQueryDto = z.infer<typeof analysisSummaryQuerySchema>;
