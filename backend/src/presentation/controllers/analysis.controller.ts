import { Request, Response } from "express";
import { analysisSummaryQuerySchema } from "../../application/dto/analysis.dto";
import { analysisService } from "../../application/services/analysis.service";

/**
 * GET /analysis/summary
 * カテゴリ別・支払い方法別の集計を返す。
 */
export async function getSummaryHandler(req: Request, res: Response) {
  const parsed = analysisSummaryQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const summary = await analysisService.getSummary(parsed.data);
    return res.status(200).json({ success: true, ...summary });
  } catch (err) {
    console.error("[GET /analysis/summary] failed to build summary:", err);
    return res.status(500).json({
      success: false,
      error: "集計の取得に失敗しました。時間をおいてもう一度お試しください。",
    });
  }
}
