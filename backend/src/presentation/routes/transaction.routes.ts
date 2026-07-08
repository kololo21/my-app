import { Router } from "express";
import {
  createTransactionHandler,
  deleteTransactionHandler,
  listTransactionsHandler,
} from "../controllers/transaction.controller";

export const transactionRouter = Router();

// POST /transactions - 収支記録の登録
transactionRouter.post("/", createTransactionHandler);

// GET /transactions - フィルタ・ページネーション付き一覧
transactionRouter.get("/", listTransactionsHandler);

// DELETE /transactions/:id - 記録の削除
transactionRouter.delete("/:id", deleteTransactionHandler);
