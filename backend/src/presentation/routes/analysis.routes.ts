import { Router } from "express";
import { getSummaryHandler } from "../controllers/analysis.controller";

export const analysisRouter = Router();

// GET /analysis/summary - カテゴリ別・支払い方法別の集計
analysisRouter.get("/summary", getSummaryHandler);

// TODO: GET /analysis/forecast (過去データに基づく将来の収支推移予測)
