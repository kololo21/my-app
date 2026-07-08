import { Request, Response } from "express";
import {
  createTransactionSchema,
  deleteTransactionParamsSchema,
  listTransactionsQuerySchema,
} from "../../application/dto/transaction.dto";
import { transactionService } from "../../application/services/transaction.service";

/**
 * Presentation層: HTTPリクエスト/レスポンスの整形のみを担当。
 * バリデーションはDTOスキーマに、実際の保存処理はService/Repositoryに委譲する。
 */
export async function createTransactionHandler(req: Request, res: Response) {
  const parsed = createTransactionSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const transaction = await transactionService.createTransaction(parsed.data);
    return res.status(201).json({ success: true, transaction });
  } catch (err) {
    console.error("[POST /transactions] failed to save transaction:", err);
    return res.status(500).json({
      success: false,
      error: "取引の保存に失敗しました。時間をおいてもう一度お試しください。",
    });
  }
}

/**
 * GET /transactions
 * フィルタ(userId/groupId/categoryId/paymentMethodId/type/tagId/期間)とページネーション付きの一覧取得。
 */
export async function listTransactionsHandler(req: Request, res: Response) {
  const parsed = listTransactionsQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const { items, meta } = await transactionService.listTransactions(parsed.data);
    return res.status(200).json({ success: true, transactions: items, meta });
  } catch (err) {
    console.error("[GET /transactions] failed to fetch transactions:", err);
    return res.status(500).json({
      success: false,
      error: "取引の取得に失敗しました。時間をおいてもう一度お試しください。",
    });
  }
}

/**
 * DELETE /transactions/:id
 */
export async function deleteTransactionHandler(req: Request, res: Response) {
  const parsed = deleteTransactionParamsSchema.safeParse(req.params);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const deleted = await transactionService.deleteTransaction(parsed.data.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: "指定された取引が見つかりません。",
      });
    }

    return res.status(204).send();
  } catch (err) {
    console.error("[DELETE /transactions/:id] failed to delete transaction:", err);
    return res.status(500).json({
      success: false,
      error: "取引の削除に失敗しました。時間をおいてもう一度お試しください。",
    });
  }
}
