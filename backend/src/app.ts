import cors from "cors";
import express from "express";
import { analysisRouter } from "./presentation/routes/analysis.routes";
import { coachingRouter } from "./presentation/routes/coaching.routes";
import { ocrRouter } from "./presentation/routes/ocr.routes";
import { referenceRouter } from "./presentation/routes/reference.routes";
import { transactionRouter } from "./presentation/routes/transaction.routes";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "20mb" })); // レシート画像のBase64送信を許容

  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  // 三層構成: ここではルーティング(Presentation)の組み立てのみ行う
  app.use("/transactions", transactionRouter);
  app.use("/analysis", analysisRouter);
  app.use("/ocr", ocrRouter);
  app.use("/coaching", coachingRouter);
  app.use(referenceRouter);

  return app;
}
