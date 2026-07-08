import { Request, Response } from "express";
import { parseBarcodeSchema, scanReceiptSchema } from "../../application/dto/ocr.dto";
import { ocrService } from "../../application/services/ocr.service";

export async function scanReceiptHandler(req: Request, res: Response) {
  const parsed = scanReceiptSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const result = await ocrService.scanReceipt(parsed.data);
    return res.status(200).json(result);
  } catch (err) {
    console.error("[POST /ocr/receipt] failed to scan receipt:", err);
    return res.status(500).json({
      success: false,
      error: "レシートの解析に失敗しました。時間をおいてもう一度お試しください。",
    });
  }
}

export async function parseBarcodeHandler(req: Request, res: Response) {
  const parsed = parseBarcodeSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const result = await ocrService.parseBarcode(parsed.data);
    return res.status(200).json(result);
  } catch (err) {
    console.error("[POST /ocr/barcode] failed to parse barcode:", err);
    return res.status(500).json({
      success: false,
      error: "バーコードの解析に失敗しました。",
    });
  }
}
