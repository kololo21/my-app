import { Router } from "express";
import { parseBarcodeHandler, scanReceiptHandler } from "../controllers/ocr.controller";

export const ocrRouter = Router();

// POST /ocr/receipt - レシート画像解析(Gemini OCR)
ocrRouter.post("/receipt", scanReceiptHandler);

// POST /ocr/barcode - JANバーコードからの平均価格予測(Gemini)
ocrRouter.post("/barcode", parseBarcodeHandler);
