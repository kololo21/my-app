import { Router } from "express";
import {
  listCategoriesHandler,
  listPaymentMethodsHandler,
  listUsersHandler,
} from "../controllers/reference.controller";

export const referenceRouter = Router();

// GET /categories - カテゴリ一覧(name⇄id変換用マスタ)
referenceRouter.get("/categories", listCategoriesHandler);

// GET /payment-methods - 支払い方法一覧(name⇄id変換用マスタ)
referenceRouter.get("/payment-methods", listPaymentMethodsHandler);

// GET /users - ユーザー一覧(payer名⇄userId変換用マスタ)
referenceRouter.get("/users", listUsersHandler);
