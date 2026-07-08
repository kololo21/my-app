import cors from "cors";
import express from "express";
import { analysisRouter } from "./presentation/routes/analysis.routes";
import { transactionRouter } from "./presentation/routes/transaction.routes";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  // 三層構成: ここではルーティング(Presentation)の組み立てのみ行う
  app.use("/transactions", transactionRouter);
  app.use("/analysis", analysisRouter);

  return app;
}
