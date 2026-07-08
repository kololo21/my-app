import { z } from "zod";

// POST /coaching のリクエストボディ検証スキーマ
// transactions/subscriptions はGeminiへのプロンプト組み立てにそのまま使うため、
// 個々のフィールドの厳密な検証はせず配列/オブジェクトの形のみ確認する。
export const coachingRequestSchema = z.object({
  transactions: z.array(z.record(z.any())).default([]),
  subscriptions: z.array(z.record(z.any())).default([]),
  goal: z.record(z.any()).optional(),
  activeMember: z.string().optional(),
});

export type CoachingRequestDto = z.infer<typeof coachingRequestSchema>;
