import { z } from "zod";

// POST /ocr/receipt のリクエストボディ検証スキーマ
export const scanReceiptSchema = z.object({
  image: z.string().nullable().optional(),
  mimeType: z.string().nullable().optional(),
  textFallback: z.string().nullable().optional(),
});

export type ScanReceiptDto = z.infer<typeof scanReceiptSchema>;

// POST /ocr/barcode のリクエストボディ検証スキーマ
export const parseBarcodeSchema = z.object({
  barcode: z.string().min(1, "barcodeは必須です"),
});

export type ParseBarcodeDto = z.infer<typeof parseBarcodeSchema>;
