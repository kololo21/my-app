import { z } from "zod";
import { TRANSACTION_TYPES } from "../../common/enums";

// POST /transactions のリクエストボディ検証スキーマ
export const createTransactionSchema = z.object({
  amount: z
    .number({ invalid_type_error: "amountは数値で指定してください" })
    .int("amountは整数で指定してください")
    .positive("amountは正の値で指定してください"),
  date: z
    .string({ required_error: "dateは必須です" })
    .refine((v) => !Number.isNaN(Date.parse(v)), {
      message: "dateはISO8601形式の日付文字列で指定してください (例: 2026-07-01)",
    }),
  type: z.enum(TRANSACTION_TYPES, {
    errorMap: () => ({ message: "typeはEXPENSE / INCOME / NISAのいずれかです" }),
  }),
  memo: z.string().max(500, "memoは500文字以内で指定してください").optional(),
  categoryId: z.string().min(1, "categoryIdは必須です"),
  paymentMethodId: z.string().min(1, "paymentMethodIdは必須です"),
  userId: z.string().min(1, "userIdは必須です"),
  groupId: z.string().min(1).optional(),
});

export type CreateTransactionDto = z.infer<typeof createTransactionSchema>;

// GET /transactions のクエリパラメータ検証スキーマ
// クエリはすべて文字列で届くため z.coerce で数値/日付に変換する
export const listTransactionsQuerySchema = z.object({
  userId: z.string().min(1).optional(),
  groupId: z.string().min(1).optional(),
  categoryId: z.string().min(1).optional(),
  paymentMethodId: z.string().min(1).optional(),
  type: z
    .enum(TRANSACTION_TYPES, {
      errorMap: () => ({ message: "typeはEXPENSE / INCOME / NISAのいずれかです" }),
    })
    .optional(),
  tagId: z.string().min(1).optional(),
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
  page: z.coerce
    .number({ invalid_type_error: "pageは数値で指定してください" })
    .int()
    .positive()
    .default(1),
  pageSize: z.coerce
    .number({ invalid_type_error: "pageSizeは数値で指定してください" })
    .int()
    .positive()
    .max(100, "pageSizeは100以下で指定してください")
    .default(20),
});

export type ListTransactionsQueryDto = z.infer<typeof listTransactionsQuerySchema>;

// DELETE /transactions/:id のパスパラメータ検証スキーマ
export const deleteTransactionParamsSchema = z.object({
  id: z.string().min(1, "idは必須です"),
});

export type DeleteTransactionParamsDto = z.infer<typeof deleteTransactionParamsSchema>;
